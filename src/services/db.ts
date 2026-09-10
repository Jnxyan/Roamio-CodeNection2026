import {
  User,
  Destination,
  Hotel,
  Restaurant,
  Plan,
  Trip,
  Traveler,
  ItineraryItem,
  DiscoverablePlace,
  Review
} from '../types';
import {
  INITIAL_DESTINATIONS,
  INITIAL_HOTELS,
  INITIAL_RESTAURANTS,
  INITIAL_PLANS,
  DISCOVERABLE_PLACES,
  DEMO_USERS
} from '../data/mockData';
import { snapMinutesTo15, minutesToTime, timeToMinutes, generateTransportEstimate } from '../utils/timeUtils';
import { PostCardItem } from '../components/PostCard';

const STORAGE_KEYS = {
  USER: 'roamio_current_user',
  USERS_LIST: 'roamio_registered_users',
  TRIPS: 'roamio_trips_data',
  SAVES: 'roamio_saved_items',
  LIKES: 'roamio_liked_plans',
  PLANS: 'roamio_plans_list',
  DESTINATION_REVIEWS: 'roamio_dest_reviews',
  HOTEL_REVIEWS: 'roamio_hotel_reviews',
  RESTAURANT_REVIEWS: 'roamio_restaurant_reviews',
  PLAN_REVIEWS: 'roamio_plan_reviews'
};

export interface SavedItemRecord {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'destinations' | 'hotels' | 'restaurants' | 'plans';
  savedAt: string;
}

class RoamioDataStore {
  private currentUser: User | null = null;
  private destinations: Destination[] = INITIAL_DESTINATIONS;
  private hotels: Hotel[] = INITIAL_HOTELS;
  private restaurants: Restaurant[] = INITIAL_RESTAURANTS;
  private plans: Plan[] = INITIAL_PLANS;
  private discoverablePlaces: DiscoverablePlace[] = DISCOVERABLE_PLACES;
  private trips: Trip[] = [];
  private saves: SavedItemRecord[] = [];
  private likes: string[] = []; // item IDs liked by current user
  private itemLikesCounts: Record<string, number> = {};

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Load user
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          try {
            this.currentUser = JSON.parse(storedUser);
          } catch {
            this.currentUser = DEMO_USERS[0];
          }
        } else {
          this.currentUser = DEMO_USERS[0];
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
          } catch {
            // Ignore quota / private mode storage error
          }
        }

        // Load trips
        const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
        if (storedTrips) {
          try {
            const parsed = JSON.parse(storedTrips);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.trips = parsed;
              // Ensure our rich sample trips are present in the list
              const defaultTrips = this.createDefaultSampleTrips();
              defaultTrips.forEach(defaultTrip => {
                if (!this.trips.some(t => t.id === defaultTrip.id || t.title === defaultTrip.title)) {
                  this.trips.push(defaultTrip);
                }
              });
              try {
                localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(this.trips));
              } catch {}
            } else {
              this.trips = this.createDefaultSampleTrips();
              try {
                localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(this.trips));
              } catch {}
            }
          } catch {
            this.trips = this.createDefaultSampleTrips();
          }
        } else {
          this.trips = this.createDefaultSampleTrips();
          try {
            localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(this.trips));
          } catch {
            // Ignore storage error
          }
        }

        // Load saves
        const storedSaves = localStorage.getItem(STORAGE_KEYS.SAVES);
        if (storedSaves) {
          try {
            const parsed = JSON.parse(storedSaves);
            this.saves = Array.isArray(parsed) ? parsed : [];
          } catch {
            this.saves = [];
          }
        } else {
          this.saves = [
            {
              id: 'save-1',
              userId: this.currentUser?.id || 'user-alex',
              itemId: 'dest-kyoto',
              itemType: 'destinations',
              savedAt: new Date().toISOString()
            },
            {
              id: 'save-2',
              userId: this.currentUser?.id || 'user-alex',
              itemId: 'plan-kyoto-5d',
              itemType: 'plans',
              savedAt: new Date().toISOString()
            }
          ];
          try {
            localStorage.setItem(STORAGE_KEYS.SAVES, JSON.stringify(this.saves));
          } catch {
            // Ignore storage error
          }
        }

        // Load likes
        const storedLikes = localStorage.getItem(STORAGE_KEYS.LIKES);
        if (storedLikes) {
          try {
            const parsed = JSON.parse(storedLikes);
            this.likes = Array.isArray(parsed) ? parsed : [];
          } catch {
            this.likes = [];
          }
        }

        // Load custom item likes counts
        const storedItemLikes = localStorage.getItem('roamio_item_likes_counts');
        if (storedItemLikes) {
          try {
            this.itemLikesCounts = JSON.parse(storedItemLikes);
          } catch {
            this.itemLikesCounts = {};
          }
        }

        // Load custom plans if any
        const storedPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
        if (storedPlans) {
          try {
            const parsed = JSON.parse(storedPlans);
            this.plans = Array.isArray(parsed) && parsed.length > 0
              ? parsed.map((p: any) => {
                  const initial = INITIAL_PLANS.find((ip) => ip.id === p.id);
                  return {
                    ...p,
                    gallery: p.gallery || initial?.gallery || [p.cover_photo]
                  };
                })
              : INITIAL_PLANS;
          } catch {
            this.plans = INITIAL_PLANS;
          }
        }

        // Load stored destination reviews if any
        const storedDestReviews = localStorage.getItem(STORAGE_KEYS.DESTINATION_REVIEWS);
        if (storedDestReviews) {
          try {
            const reviewsMap: Record<string, any[]> = JSON.parse(storedDestReviews);
            Object.keys(reviewsMap).forEach((destId) => {
              const dest = this.destinations.find((d) => d.id === destId);
              if (dest && Array.isArray(reviewsMap[destId]) && reviewsMap[destId].length > 0) {
                dest.reviews = reviewsMap[destId];
                dest.reviews_count = dest.reviews.length;
                const total = dest.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
                dest.rating = Number((total / dest.reviews.length).toFixed(2));
              }
            });
          } catch {
            // Ignore parse error
          }
        }

        // Load stored hotel reviews if any
        const storedHotelReviews = localStorage.getItem(STORAGE_KEYS.HOTEL_REVIEWS);
        if (storedHotelReviews) {
          try {
            const reviewsMap: Record<string, any[]> = JSON.parse(storedHotelReviews);
            Object.keys(reviewsMap).forEach((hotelId) => {
              const hotel = this.hotels.find((h) => h.id === hotelId);
              if (hotel && Array.isArray(reviewsMap[hotelId]) && reviewsMap[hotelId].length > 0) {
                hotel.reviews = reviewsMap[hotelId];
                hotel.reviews_count = hotel.reviews.length;
                const total = hotel.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
                hotel.rating = Number((total / hotel.reviews.length).toFixed(2));
              }
            });
          } catch {}
        }

        // Load stored restaurant reviews if any
        const storedRestReviews = localStorage.getItem(STORAGE_KEYS.RESTAURANT_REVIEWS);
        if (storedRestReviews) {
          try {
            const reviewsMap: Record<string, any[]> = JSON.parse(storedRestReviews);
            Object.keys(reviewsMap).forEach((restId) => {
              const rest = this.restaurants.find((r) => r.id === restId);
              if (rest && Array.isArray(reviewsMap[restId]) && reviewsMap[restId].length > 0) {
                rest.reviews = reviewsMap[restId];
                rest.reviews_count = rest.reviews.length;
                const total = rest.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
                rest.rating = Number((total / rest.reviews.length).toFixed(2));
              }
            });
          } catch {}
        }

        // Load stored plan reviews if any
        const storedPlanReviews = localStorage.getItem(STORAGE_KEYS.PLAN_REVIEWS);
        if (storedPlanReviews) {
          try {
            const reviewsMap: Record<string, any[]> = JSON.parse(storedPlanReviews);
            Object.keys(reviewsMap).forEach((planId) => {
              const plan = this.plans.find((p) => p.id === planId);
              if (plan && Array.isArray(reviewsMap[planId]) && reviewsMap[planId].length > 0) {
                plan.reviews = reviewsMap[planId];
                plan.reviews_count = plan.reviews.length;
                const total = plan.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
                plan.rating = Number((total / plan.reviews.length).toFixed(2));
              }
            });
          } catch {}
        }
      } else {
        // Fallback when localStorage is not available
        this.currentUser = DEMO_USERS[0];
        this.trips = this.createDefaultSampleTrips();
        this.saves = [
          {
            id: 'save-1',
            userId: 'user-alex',
            itemId: 'dest-kyoto',
            itemType: 'destinations',
            savedAt: new Date().toISOString()
          },
          {
            id: 'save-2',
            userId: 'user-alex',
            itemId: 'plan-kyoto-5d',
            itemType: 'plans',
            savedAt: new Date().toISOString()
          }
        ];
      }
    } catch (err) {
      console.warn('Error loading localStorage data:', err);
      this.currentUser = DEMO_USERS[0];
      this.trips = this.createDefaultSampleTrips();
    }
  }

  public createDefaultSampleTrips(): Trip[] {
    return [
      this.createSampleKyotoTrip(),
      this.createSampleAmalfiTrip(),
      this.createSampleParisTrip()
    ];
  }

  public createSampleKyotoTrip(): Trip {
    return {
      id: 'trip-my-kyoto-autumn',
      user_id: 'user-alex',
      title: 'Autumn in Kyoto Cultural Adventure',
      cover_photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'A 5-day cultural journey through Kyoto, spanning historic mountain temples, the bamboo forest, and evening lantern walks.',
      origin: { country: 'United States', city: 'San Francisco' },
      destinations: ['Kyoto, Japan'],
      start_date: '2026-10-12',
      end_date: '2026-10-17',
      days: 5,
      budget_tier: 'balanced',
      budget_amount: 175,
      travelers: [
        { id: 'trav-1', name: 'Alex Rivera', age: 29, interests: ['Culture', 'Food', 'Photography'] }
      ],
      is_group: false,
      mode: 'auto',
      combined_package: {
        flight: {
          airline: 'All Nippon Airways',
          flight_no: 'NH007',
          departure_time: '2026-10-12 11:15',
          arrival_time: '2026-10-13 14:45',
          departure_airport: 'SFO',
          arrival_airport: 'KIX',
          duration: '11h 30m',
          price: 780,
          booking_url: 'https://www.ana.co.jp'
        },
        hotel: {
          hotel_name: 'Kyoto Ryokan Gion Sano',
          room_type: 'Traditional Tatami Courtyard Room',
          price_per_night: 185,
          total_hotel_price: 925,
          rating: 4.93,
          image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          booking_url: 'https://www.booking.com'
        },
        total_combined_price: 1705,
        savings_amount: 195
      },
      itinerary: [
        {
          id: 'item-1',
          trip_id: 'trip-my-kyoto-autumn',
          day_index: 0,
          place_id: 'place-fushimi',
          place_name: 'Fushimi Inari Taisha',
          place_type: 'attraction',
          start_time: '08:30',
          end_time: '10:30',
          duration_mins: 120,
          image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
          category: 'Attraction',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Kyoto',
          notes: 'Ascend the vermilion torii gates at crisp morning air',
          transport_to_next: {
            mode: 'subway',
            duration_mins: 18,
            detail: 'Keihan Main Line to Gion-Shijo'
          }
        },
        {
          id: 'item-2',
          trip_id: 'trip-my-kyoto-autumn',
          day_index: 0,
          place_id: 'place-lunch-menbaka',
          place_name: 'Menbaka Fire Ramen Feast',
          place_type: 'restaurant',
          start_time: '12:30',
          end_time: '13:30',
          duration_mins: 60,
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          category: 'Food & Drink',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Menbaka+Fire+Ramen+Kyoto',
          notes: 'Authentic lunch - hot green onion fire broth',
          transport_to_next: {
            mode: 'walk',
            duration_mins: 12,
            detail: 'Short stroll into central temples'
          }
        },
        {
          id: 'item-3',
          trip_id: 'trip-my-kyoto-autumn',
          day_index: 0,
          place_id: 'place-kiyomizu',
          place_name: 'Kiyomizu-dera Temple',
          place_type: 'attraction',
          start_time: '14:30',
          end_time: '16:00',
          duration_mins: 90,
          image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
          category: 'Attraction',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Kiyomizu-dera+Kyoto',
          notes: 'Spectacular terrace views over Kyoto and hillside pagodas',
          transport_to_next: {
            mode: 'walk',
            duration_mins: 15,
            detail: 'Walk down Ninenzaka and Sannenzaka historic slopes'
          }
        },
        {
          id: 'item-4',
          trip_id: 'trip-my-kyoto-autumn',
          day_index: 0,
          place_id: 'place-dinner-karyo',
          place_name: 'Gion Karyo Seasonal Kaiseki',
          place_type: 'restaurant',
          start_time: '18:30',
          end_time: '20:30',
          duration_mins: 120,
          image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=600&q=80',
          category: 'Food & Drink',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Gion+Karyo+Kyoto',
          notes: 'Refined 9-course seasonal tasting dinner in historic Gion'
        }
      ],
      packing_checklist: [
        { id: 'pk-1', text: 'Comfortable slip-on walking shoes', completed: true },
        { id: 'pk-2', text: 'Clean dress socks for temple visits', completed: true },
        { id: 'pk-3', text: 'Japan Rail Pass / Suica IC card', completed: false },
        { id: 'pk-4', text: 'Type A electrical adapter', completed: false },
        { id: 'pk-5', text: 'Coin pouch for local vending machines & temples', completed: true }
      ],
      cautions: [
        'Geisha district photography ban applies to private alleyways with 10,000 JPY fines.',
        'Stand left on escalators in Kansai / Kyoto (contrary to Tokyo which stands on the right).',
        'Carry trash with you as public receptacles are extremely rare.'
      ],
      created_at: new Date().toISOString()
    };
  }

  public createSampleAmalfiTrip(): Trip {
    return {
      id: 'trip-my-amalfi-scenic',
      user_id: 'user-alex',
      title: 'Amalfi Coast & Roman Wonders',
      cover_photo: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'A 6-day Mediterranean journey starting with the ancient Roman Colosseum and winding along the dramatic pastel cliffside villages of Positano.',
      origin: { country: 'United States', city: 'New York' },
      destinations: ['Rome, Italy', 'Positano, Italy'],
      start_date: '2026-09-18',
      end_date: '2026-09-24',
      days: 6,
      budget_tier: 'balanced',
      budget_amount: 220,
      travelers: [
        { id: 'trav-1', name: 'Alex Rivera', age: 29, interests: ['History', 'Scenic Views', 'Gastronomy'] },
        { id: 'trav-2', name: 'Elena Rostova', age: 27, interests: ['Photography', 'Beaches', 'Architecture'] }
      ],
      is_group: true,
      mode: 'auto',
      combined_package: {
        flight: {
          airline: 'ITA Airways',
          flight_no: 'AZ611',
          departure_time: '2026-09-18 17:30',
          arrival_time: '2026-09-19 07:55',
          departure_airport: 'JFK',
          arrival_airport: 'FCO',
          duration: '8h 25m',
          price: 640,
          booking_url: 'https://www.ita-airways.com'
        },
        hotel: {
          hotel_name: 'Hotel Marincanto Cliffside Suites',
          room_type: 'Sea View Balcony Suite',
          price_per_night: 260,
          total_hotel_price: 1300,
          rating: 4.91,
          image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
          booking_url: 'https://www.booking.com'
        },
        total_combined_price: 2580,
        savings_amount: 320
      },
      itinerary: [
        {
          id: 'item-it-1',
          trip_id: 'trip-my-amalfi-scenic',
          day_index: 0,
          place_id: 'place-colosseum',
          place_name: 'Colosseum Arena Floor & Roman Forum',
          place_type: 'attraction',
          start_time: '09:00',
          end_time: '12:00',
          duration_mins: 180,
          image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
          category: 'Attraction',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Colosseum+Rome+Italy',
          notes: 'Gladiator arena floor entrance and Palatine Hill panoramic ruins',
          transport_to_next: {
            mode: 'walk',
            duration_mins: 15,
            detail: 'Walk across Via dei Fori Imperiali into Monti'
          }
        },
        {
          id: 'item-it-2',
          trip_id: 'trip-my-amalfi-scenic',
          day_index: 0,
          place_id: 'place-lunch-monti',
          place_name: 'Trattoria Vecchia Roma Cacio e Pepe',
          place_type: 'restaurant',
          start_time: '12:30',
          end_time: '14:00',
          duration_mins: 90,
          image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
          category: 'Food & Drink',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Trattoria+Vecchia+Roma',
          notes: 'Handmade fresh tonnarelli tossed in flamed pecorino cheese wheel',
          transport_to_next: {
            mode: 'subway',
            duration_mins: 20,
            detail: 'Metro Line B to Termini Station'
          }
        },
        {
          id: 'item-it-3',
          trip_id: 'trip-my-amalfi-scenic',
          day_index: 1,
          place_id: 'place-positano-beach',
          place_name: 'Spiaggia Grande & Positano Cliffs',
          place_type: 'attraction',
          start_time: '10:00',
          end_time: '13:30',
          duration_mins: 210,
          image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Spiaggia+Grande+Positano',
          notes: 'Coastal ferry arrival, swim in emerald waters under cascade of colorful villas',
          transport_to_next: {
            mode: 'walk',
            duration_mins: 10,
            detail: 'Stroll along steep bougainvillea stairways'
          }
        },
        {
          id: 'item-it-4',
          trip_id: 'trip-my-amalfi-scenic',
          day_index: 1,
          place_id: 'place-positano-spritz',
          place_name: 'Franco’s Bar Sunset Aperitivo',
          place_type: 'restaurant',
          start_time: '18:30',
          end_time: '20:30',
          duration_mins: 120,
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
          category: 'Nightlife',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Franco+Bar+Positano',
          notes: 'Panoramic coastal terrace, signature Amalfi lemon spritz and olives'
        }
      ],
      packing_checklist: [
        { id: 'pki-1', text: 'European Type C/F power adapter', completed: true },
        { id: 'pki-2', text: 'Polarized sunglasses & reef-safe sunblock', completed: true },
        { id: 'pki-3', text: 'Sturdy deck shoes for ferries and cobblestones', completed: false },
        { id: 'pki-4', text: 'Light breathable linen shirts and pants', completed: true },
        { id: 'pki-5', text: 'Swimwear and quick-dry beach towel', completed: false },
        { id: 'pki-6', text: 'Printed ferry tickets & digital vouchers', completed: true }
      ],
      cautions: [
        'Ferries along the Amalfi Coast can be canceled on short notice in rough sea conditions.',
        'Cobblestone steps in Positano are unsuitable for heavy rolling luggage; travel light.',
        'Pre-booking for Colosseum and Vatican museums is mandatory to avoid multi-hour queues.'
      ],
      created_at: new Date().toISOString()
    };
  }

  public createSampleParisTrip(): Trip {
    return {
      id: 'trip-my-paris-art',
      user_id: 'user-alex',
      title: 'Paris Art, Seine & Gastronomy Escape',
      cover_photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520939817895-060bdef4d1b3?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'A 4-day romantic escape exploring the Louvre masterpieces, authentic Saint-Germain bakeries, and sunset Seine river cruises.',
      origin: { country: 'United Kingdom', city: 'London' },
      destinations: ['Paris, France'],
      start_date: '2026-11-05',
      end_date: '2026-11-09',
      days: 4,
      budget_tier: 'balanced',
      budget_amount: 195,
      travelers: [
        { id: 'trav-1', name: 'Alex Rivera', age: 29, interests: ['Art', 'Museums', 'Pastries', 'Architecture'] }
      ],
      is_group: false,
      mode: 'auto',
      combined_package: {
        flight: {
          airline: 'Eurostar Express',
          flight_no: 'ES9024',
          departure_time: '2026-11-05 09:31',
          arrival_time: '2026-11-05 12:47',
          departure_airport: 'London St Pancras',
          arrival_airport: 'Paris Gare du Nord',
          duration: '2h 16m',
          price: 180,
          booking_url: 'https://www.eurostar.com'
        },
        hotel: {
          hotel_name: 'Hôtel D’Aubusson Saint-Germain',
          room_type: 'Classic Courtyard King',
          price_per_night: 210,
          total_hotel_price: 840,
          rating: 4.88,
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
          booking_url: 'https://www.booking.com'
        },
        total_combined_price: 1020,
        savings_amount: 140
      },
      itinerary: [
        {
          id: 'item-fr-1',
          trip_id: 'trip-my-paris-art',
          day_index: 0,
          place_id: 'place-louvre',
          place_name: 'The Louvre Museum & Glass Pyramid',
          place_type: 'attraction',
          start_time: '10:00',
          end_time: '13:30',
          duration_mins: 210,
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
          category: 'Attraction',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris',
          notes: 'Mona Lisa, Winged Victory, and Napoleon III apartments',
          transport_to_next: {
            mode: 'walk',
            duration_mins: 12,
            detail: 'Cross Pont des Arts pedestrian bridge'
          }
        },
        {
          id: 'item-fr-2',
          trip_id: 'trip-my-paris-art',
          day_index: 0,
          place_id: 'place-lunch-bistrot',
          place_name: 'Café de Flore Saint-Germain',
          place_type: 'restaurant',
          start_time: '14:00',
          end_time: '15:30',
          duration_mins: 90,
          image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
          category: 'Food & Drink',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Cafe+de+Flore+Paris',
          notes: 'Classic Croque Monsieur and café crème outdoors',
          transport_to_next: {
            mode: 'subway',
            duration_mins: 15,
            detail: 'Metro Line 4 to Cité'
          }
        },
        {
          id: 'item-fr-3',
          trip_id: 'trip-my-paris-art',
          day_index: 1,
          place_id: 'place-seine-cruise',
          place_name: 'Vedettes du Pont Neuf Seine Cruise',
          place_type: 'attraction',
          start_time: '19:00',
          end_time: '20:15',
          duration_mins: 75,
          image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
          category: 'Attraction',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Vedettes+du+Pont+Neuf+Paris',
          notes: 'Sunset boat tour watching the Eiffel Tower sparkle on the hour'
        }
      ],
      packing_checklist: [
        { id: 'pkf-1', text: 'Paris Visite / Navigo Easy Metro Card', completed: true },
        { id: 'pkf-2', text: 'Compact umbrella & lightweight trench coat', completed: true },
        { id: 'pkf-3', text: 'Museum Pass barcode printout/app', completed: true },
        { id: 'pkf-4', text: 'Crossbody anti-theft bag for metro rides', completed: false }
      ],
      cautions: [
        'Beware of distraction scams around the Eiffel Tower and Louvre pyramid.',
        'Many Parisian bistros and small museums are closed on Sundays or Mondays.',
        'Taxis must charge fixed flat rates between CDG Airport and Central Paris.'
      ],
      created_at: new Date().toISOString()
    };
  }

  public createSampleBaliTrip(): Trip {
    return {
      id: 'trip-my-bali-wellness',
      user_id: 'user-alex',
      title: 'Bali Tropical Wellness & Temple Trail',
      cover_photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'A 5-day rejuvenating journey through Ubud emerald rice terraces, sacred water temples, and cliffside sunsets at Uluwatu.',
      origin: { country: 'Australia', city: 'Sydney' },
      destinations: ['Bali, Indonesia'],
      start_date: '2026-08-10',
      end_date: '2026-08-15',
      days: 5,
      budget_tier: 'balanced',
      budget_amount: 140,
      travelers: [
        { id: 'trav-1', name: 'Alex Rivera', age: 29, interests: ['Wellness', 'Nature', 'Photography', 'Temples'] }
      ],
      is_group: false,
      mode: 'auto',
      combined_package: {
        flight: {
          airline: 'Garuda Indonesia',
          flight_no: 'GA715',
          departure_time: '2026-08-10 10:00',
          arrival_time: '2026-08-10 14:40',
          departure_airport: 'SYD',
          arrival_airport: 'DPS',
          duration: '6h 40m',
          price: 520,
          booking_url: 'https://www.garuda-indonesia.com'
        },
        hotel: {
          hotel_name: 'Kamandalu Ubud Rainforest Resort',
          room_type: 'Valley Pool Villa',
          price_per_night: 175,
          total_hotel_price: 875,
          rating: 4.92,
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
          booking_url: 'https://www.booking.com'
        },
        total_combined_price: 1395,
        savings_amount: 180
      },
      itinerary: [
        {
          id: 'item-b-1',
          trip_id: 'trip-my-bali-wellness',
          day_index: 0,
          place_id: 'place-tegallalang',
          place_name: 'Tegallalang Emerald Rice Terraces',
          place_type: 'attraction',
          start_time: '07:30',
          end_time: '10:00',
          duration_mins: 150,
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
          category: 'Nature',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Tegallalang+Rice+Terrace+Bali',
          notes: 'Early morning light on cascading rice terraces and giant swing',
          transport_to_next: {
            mode: 'taxi',
            duration_mins: 25,
            detail: 'Private driver towards central Ubud'
          }
        },
        {
          id: 'item-b-2',
          trip_id: 'trip-my-bali-wellness',
          day_index: 0,
          place_id: 'place-lunch-clear-cafe',
          place_name: 'Clear Café Ubud Organic Feast',
          place_type: 'restaurant',
          start_time: '12:00',
          end_time: '13:30',
          duration_mins: 90,
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
          category: 'Food & Drink',
          maps_url: 'https://www.google.com/maps/search/?api=1&query=Clear+Cafe+Ubud',
          notes: 'Fresh dragon fruit bowls and Balinese cashew curry'
        }
      ],
      packing_checklist: [
        { id: 'pkb-1', text: 'Temple sarong & sash', completed: true },
        { id: 'pkb-2', text: 'Biodegradable bug spray & sunscreen', completed: true },
        { id: 'pkb-3', text: 'Water-resistant dry bag for waterfalls', completed: false },
        { id: 'pkb-4', text: 'Type C / F European plug adapter', completed: false }
      ],
      cautions: [
        'Dress respectfully with covered shoulders and knees at all sacred Balinese temples.',
        'Beware of cheeky macaque monkeys at Ubud Monkey Forest and Uluwatu; secure sunglasses and phones.',
        'Drink only bottled or filtered water to prevent Bali belly.'
      ],
      created_at: new Date().toISOString()
    };
  }

  public addSampleTrip(templateKey?: string): Trip {
    let newTrip: Trip;
    const existingIds = new Set(this.trips.map(t => t.id));

    if (templateKey === 'amalfi' || (!existingIds.has('trip-my-amalfi-scenic') && !templateKey)) {
      newTrip = this.createSampleAmalfiTrip();
    } else if (templateKey === 'paris' || (!existingIds.has('trip-my-paris-art') && !templateKey)) {
      newTrip = this.createSampleParisTrip();
    } else if (templateKey === 'bali' || (!existingIds.has('trip-my-bali-wellness') && !templateKey)) {
      newTrip = this.createSampleBaliTrip();
    } else if (templateKey === 'kyoto' || (!existingIds.has('trip-my-kyoto-autumn') && !templateKey)) {
      newTrip = this.createSampleKyotoTrip();
    } else {
      // Create a fresh unique copy of Amalfi or Bali
      const base = this.createSampleBaliTrip();
      newTrip = {
        ...base,
        id: `trip-sample-${Date.now()}`,
        title: `${base.title} (Explore)`,
        created_at: new Date().toISOString()
      };
    }

    this.saveTrip(newTrip);
    return newTrip;
  }

  // --- Auth Methods ---
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  login(emailOrUsername: string, _password?: string): User {
    const user: User = {
      id: `user-${Date.now()}`,
      name: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@roamio.travel`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };
    this.setCurrentUser(user);
    return user;
  }

  signUp(email: string, _password?: string, name?: string, phone?: string): User {
    const user: User = {
      id: `user-${Date.now()}`,
      name: name || (email.includes('@') ? email.split('@')[0] : 'Traveler'),
      email,
      phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };
    this.setCurrentUser(user);
    return user;
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  // --- PostCard Items & Saved Queries ---
  getItemLikesCount(itemId: string, fallback: number = 850): number {
    if (this.itemLikesCounts[itemId] !== undefined) {
      return this.itemLikesCounts[itemId];
    }
    // Baseline likes count based on specific presets or calculation
    const presets: Record<string, number> = {
      'dest-klcc-park': 3840,
      'dest-kyoto': 2480,
      'dest-paris': 3120,
      'dest-rome': 2890,
      'dest-tokyo': 3740,
      'dest-bali': 2150,
      'dest-santorini': 2630,
      'hotel-kyoto-1': 1140,
      'hotel-kyoto-2': 890,
      'hotel-paris-1': 1420,
      'hotel-paris-2': 980,
      'rest-kyoto-1': 1250,
      'rest-kyoto-2': 820,
      'rest-kyoto-3': 910,
      'rest-paris-1': 1360,
      'plan-1': 1420,
      'plan-2': 890,
      'plan-3': 1120
    };
    if (presets[itemId]) {
      this.itemLikesCounts[itemId] = presets[itemId];
      return presets[itemId];
    }
    this.itemLikesCounts[itemId] = fallback;
    return fallback;
  }

  getAllPostCardItems(): PostCardItem[] {
    const destItems: PostCardItem[] = this.destinations.map(d => ({
      id: d.id,
      type: 'destinations',
      title: d.name,
      coverPhoto: d.cover_photo,
      daysOfStay: '',
      budget: d.ticket_price || (d.is_free ? 'Free' : 'Free'),
      ticketPrice: d.ticket_price || (d.is_free ? 'Free' : 'Free'),
      isFree: d.is_free || (d.ticket_price?.toLowerCase() === 'free'),
      rating: d.rating,
      reviewsCount: d.reviews_count,
      locationName: `${d.city}, ${d.country}`,
      mapsUrl: d.maps_url,
      operatingHours: d.operating_hours,
      likesCount: this.getItemLikesCount(d.id, Math.round((d.reviews_count || 500) * 1.6)),
      subtitle: d.short_description
    }));

    const hotelItems: PostCardItem[] = this.hotels.map(h => ({
      id: h.id,
      type: 'hotels',
      title: h.name,
      coverPhoto: h.image,
      daysOfStay: 'Nightly Stay',
      budget: `$${h.pricing.per_night}/nt`,
      rating: h.rating,
      reviewsCount: h.reviews_count,
      locationName: h.destination_name,
      mapsUrl: h.maps_url,
      operatingHours: h.operating_hours,
      likesCount: this.getItemLikesCount(h.id, Math.round((h.reviews_count || 300) * 1.3)),
      subtitle: h.room_types.join(', ')
    }));

    const restItems: PostCardItem[] = this.restaurants.map(r => ({
      id: r.id,
      type: 'restaurants',
      title: r.name,
      coverPhoto: r.image,
      daysOfStay: 'Dining',
      budget: `~${r.price_level} ($${r.avg_budget})`,
      rating: r.rating,
      reviewsCount: r.reviews ? r.reviews.length : 0,
      locationName: r.destination_name,
      mapsUrl: r.maps_url,
      operatingHours: r.operating_hours,
      likesCount: this.getItemLikesCount(r.id, 650 + (r.reviews ? r.reviews.length * 110 : 0)),
      subtitle: `${r.cuisine} • ${r.price_level}`
    }));

    const planItems: PostCardItem[] = this.plans.map(p => ({
      id: p.id,
      type: 'plans',
      title: p.title,
      coverPhoto: p.cover_photo,
      daysOfStay: `${p.days} Days`,
      budget: `$${p.total_spend.toLocaleString()}`,
      rating: 4.95,
      locationName: p.destination_name,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.destination_name)}`,
      authorName: p.author_name,
      authorAvatar: p.author_avatar,
      likesCount: this.getItemLikesCount(p.id, p.likes || 890),
      subtitle: p.description
    }));

    return [...destItems, ...hotelItems, ...restItems, ...planItems];
  }

  getSavedItems(): PostCardItem[] {
    const all = this.getAllPostCardItems();
    const savesList = Array.isArray(this.saves) ? this.saves : [];
    const savedIds = new Set(savesList.map(s => s.itemId));
    return all.filter(item => savedIds.has(item.id));
  }

  toggleSaveItem(item: PostCardItem): PostCardItem[] {
    this.toggleSave(item.id, item.type);
    return this.getSavedItems();
  }

  // --- Queries ---
  getDestinations(): Destination[] {
    return this.destinations;
  }

  getDestinationById(id: string): Destination | undefined {
    return this.destinations.find(d => d.id === id);
  }

  addDestinationReview(
    destinationId: string,
    reviewData: {
      user?: string;
      avatar?: string;
      rating: number;
      comment: string;
    }
  ): Destination | undefined {
    const dest = this.destinations.find(d => d.id === destinationId);
    if (!dest) return undefined;

    const current = this.currentUser;
    const authorName = (reviewData.user && reviewData.user.trim()) || current?.name || 'Traveler';
    const authorAvatar = reviewData.avatar || current?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user: authorName,
      avatar: authorAvatar,
      rating: Math.max(1, Math.min(5, Math.round(Number(reviewData.rating) || 5))),
      date: 'Just now',
      comment: reviewData.comment.trim()
    };

    const existingReviews = Array.isArray(dest.reviews) ? dest.reviews : [];
    dest.reviews = [newReview, ...existingReviews];
    dest.reviews_count = (dest.reviews_count || existingReviews.length) + 1;
    
    // Recalculate average rating
    const totalScore = dest.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    dest.rating = Number((totalScore / dest.reviews.length).toFixed(2));

    this.saveDestinationReviewsToStorage();
    return { ...dest };
  }

  private saveDestinationReviewsToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const reviewsMap: Record<string, Review[]> = {};
      this.destinations.forEach(d => {
        if (d.reviews && d.reviews.length > 0) {
          reviewsMap[d.id] = d.reviews;
        }
      });
      localStorage.setItem(STORAGE_KEYS.DESTINATION_REVIEWS, JSON.stringify(reviewsMap));
    } catch {
      // Ignore storage error
    }
  }

  addHotelReview(hotelId: string, reviewData: { rating: number; comment: string; user?: string; avatar?: string }): Hotel | null {
    const hotel = this.hotels.find(h => h.id === hotelId);
    if (!hotel) return null;

    const user = this.currentUser;
    const newReview: Review = {
      id: `rev-hotel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user: reviewData.user || user?.name || 'Verified Traveler',
      avatar: reviewData.avatar || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: reviewData.rating,
      date: 'Just now',
      comment: reviewData.comment.trim()
    };

    const existingReviews = Array.isArray(hotel.reviews) ? hotel.reviews : [];
    hotel.reviews = [newReview, ...existingReviews];
    hotel.reviews_count = (hotel.reviews_count || existingReviews.length) + 1;
    
    // Recalculate average rating
    const totalScore = hotel.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    hotel.rating = Number((totalScore / hotel.reviews.length).toFixed(2));

    this.saveHotelReviewsToStorage();
    return { ...hotel };
  }

  private saveHotelReviewsToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const reviewsMap: Record<string, Review[]> = {};
      this.hotels.forEach(h => {
        if (h.reviews && h.reviews.length > 0) {
          reviewsMap[h.id] = h.reviews;
        }
      });
      localStorage.setItem(STORAGE_KEYS.HOTEL_REVIEWS, JSON.stringify(reviewsMap));
    } catch {}
  }

  addRestaurantReview(restaurantId: string, reviewData: { rating: number; comment: string; user?: string; avatar?: string }): Restaurant | null {
    const rest = this.restaurants.find(r => r.id === restaurantId);
    if (!rest) return null;

    const user = this.currentUser;
    const newReview: Review = {
      id: `rev-rest-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user: reviewData.user || user?.name || 'Verified Traveler',
      avatar: reviewData.avatar || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: reviewData.rating,
      date: 'Just now',
      comment: reviewData.comment.trim()
    };

    const existingReviews = Array.isArray(rest.reviews) ? rest.reviews : [];
    rest.reviews = [newReview, ...existingReviews];
    rest.reviews_count = (rest.reviews_count || existingReviews.length) + 1;
    
    // Recalculate average rating
    const totalScore = rest.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    rest.rating = Number((totalScore / rest.reviews.length).toFixed(2));

    this.saveRestaurantReviewsToStorage();
    return { ...rest };
  }

  private saveRestaurantReviewsToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const reviewsMap: Record<string, Review[]> = {};
      this.restaurants.forEach(r => {
        if (r.reviews && r.reviews.length > 0) {
          reviewsMap[r.id] = r.reviews;
        }
      });
      localStorage.setItem(STORAGE_KEYS.RESTAURANT_REVIEWS, JSON.stringify(reviewsMap));
    } catch {}
  }

  addPlanReview(planId: string, reviewData: { rating: number; comment: string; user?: string; avatar?: string }): Plan | null {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) return null;

    const user = this.currentUser;
    const newReview: Review = {
      id: `rev-plan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user: reviewData.user || user?.name || 'Verified Traveler',
      avatar: reviewData.avatar || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: reviewData.rating,
      date: 'Just now',
      comment: reviewData.comment.trim()
    };

    const existingReviews = Array.isArray(plan.reviews) ? plan.reviews : [];
    plan.reviews = [newReview, ...existingReviews];
    plan.reviews_count = (plan.reviews_count || existingReviews.length) + 1;
    
    // Recalculate average rating
    const totalScore = plan.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    plan.rating = Number((totalScore / plan.reviews.length).toFixed(2));

    this.savePlanReviewsToStorage();
    return { ...plan };
  }

  private savePlanReviewsToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const reviewsMap: Record<string, Review[]> = {};
      this.plans.forEach(p => {
        if (p.reviews && p.reviews.length > 0) {
          reviewsMap[p.id] = p.reviews;
        }
      });
      localStorage.setItem(STORAGE_KEYS.PLAN_REVIEWS, JSON.stringify(reviewsMap));
    } catch {}
  }

  getHotels(destinationId?: string): Hotel[] {
    if (!destinationId) return this.hotels;
    return this.hotels.filter(h => h.destination_id === destinationId);
  }

  getHotelById(id: string): Hotel | undefined {
    return this.hotels.find(h => h.id === id);
  }

  getRestaurants(destinationId?: string): Restaurant[] {
    if (!destinationId) return this.restaurants;
    return this.restaurants.filter(r => r.destination_id === destinationId);
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurants.find(r => r.id === id);
  }

  getPlans(): Plan[] {
    return this.plans;
  }

  getPlanById(id: string): Plan | undefined {
    return this.plans.find(p => p.id === id);
  }

  getDiscoverablePlaces(destinationId?: string): DiscoverablePlace[] {
    if (!destinationId) return this.discoverablePlaces;
    return this.discoverablePlaces.filter(p => p.destination_id === destinationId);
  }

  // --- Saves & Likes ---
  isSaved(itemId: string): boolean {
    return this.saves.some(s => s.itemId === itemId);
  }

  toggleSave(itemId: string, itemType: 'destinations' | 'hotels' | 'restaurants' | 'plans'): boolean {
    const idx = this.saves.findIndex(s => s.itemId === itemId);
    if (idx >= 0) {
      this.saves.splice(idx, 1);
      localStorage.setItem(STORAGE_KEYS.SAVES, JSON.stringify(this.saves));
      return false;
    } else {
      this.saves.push({
        id: `save-${Date.now()}`,
        userId: this.currentUser?.id || 'guest',
        itemId,
        itemType,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.SAVES, JSON.stringify(this.saves));
      return true;
    }
  }

  getSavedRecords(): SavedItemRecord[] {
    return [...this.saves];
  }

  isLiked(itemId: string): boolean {
    return this.likes.includes(itemId);
  }

  toggleLike(itemId: string): { liked: boolean; count: number } {
    const isCurrentlyLiked = this.likes.includes(itemId);
    let liked = false;
    const currentCount = this.getItemLikesCount(itemId);

    if (isCurrentlyLiked) {
      this.likes = this.likes.filter(id => id !== itemId);
      this.itemLikesCounts[itemId] = Math.max(0, currentCount - 1);
      liked = false;
    } else {
      this.likes.push(itemId);
      this.itemLikesCounts[itemId] = currentCount + 1;
      liked = true;
    }

    // Keep plan in sync if it's a plan
    const plan = this.plans.find(p => p.id === itemId);
    if (plan) {
      plan.likes = this.itemLikesCounts[itemId];
      try {
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(this.plans));
      } catch {}
    }

    try {
      localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(this.likes));
      localStorage.setItem('roamio_item_likes_counts', JSON.stringify(this.itemLikesCounts));
    } catch {}

    return { liked, count: this.itemLikesCounts[itemId] };
  }

  // --- Trips & Itinerary ---
  getTrips(): Trip[] {
    if (!this.trips || this.trips.length === 0) {
      this.trips = this.createDefaultSampleTrips();
    }
    return [...this.trips];
  }

  getTripById(id: string): Trip | undefined {
    return this.trips.find(t => t.id === id);
  }

  saveTrip(trip: Trip): Trip[] {
    if (!trip) return [...this.trips];
    if (!Array.isArray(this.trips)) {
      this.trips = [];
    }
    const index = this.trips.findIndex(t => t.id === trip.id);
    if (index >= 0) {
      this.trips[index] = trip;
    } else {
      this.trips.unshift(trip);
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(this.trips));
      }
    } catch {
      // Ignore storage errors
    }
    return [...this.trips];
  }

  deleteTrip(tripId: string): Trip[] {
    this.trips = this.trips.filter(t => t.id !== tripId);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(this.trips));
      }
    } catch {
      // Ignore
    }
    return [...this.trips];
  }

  updateTripPackingChecklist(tripId: string, checklist: { id: string; text: string; completed: boolean }[]): void {
    const trip = this.getTripById(tripId);
    if (trip) {
      trip.packing_checklist = checklist;
      this.saveTrip(trip);
    }
  }

  // --- Auto-Generation Logic ("Help me plan") ---
  generateFullItinerary(
    destinationId: string,
    days: number,
    travelers: Traveler[]
  ): ItineraryItem[] {
    const rawPlaces = this.getDiscoverablePlaces(destinationId);
    const places = rawPlaces && rawPlaces.length > 0 ? rawPlaces : this.getDiscoverablePlaces('dest-kyoto');
    const destination = this.getDestinationById(destinationId) || this.getDestinationById('dest-kyoto');
    const destName = destination ? destination.name : 'Destination';

    const items: ItineraryItem[] = [];

    // Traveler interests for weighting
    const allInterests = new Set<string>();
    (travelers || []).forEach(t => (t?.interests || []).forEach(i => allInterests.add(i.toLowerCase())));

    // Candidate pools with guaranteed non-empty fallbacks
    const rawAttractions = places.filter(p => !p.is_meal && (p.category === 'Attraction' || p.category === 'Suggested' || p.category === 'Culture' || p.category === 'Nature'));
    const attractions = rawAttractions.length > 0 ? rawAttractions : places;

    const rawLunches = places.filter(p => p.is_meal === 'lunch' || (p.category === 'Food & Drink' && p.avg_duration_mins <= 90));
    const lunches = rawLunches.length > 0 ? rawLunches : places;

    const rawDinners = places.filter(p => p.is_meal === 'dinner' || p.category === 'Food & Drink');
    const dinners = rawDinners.length > 0 ? rawDinners : places;

    const rawEvenings = places.filter(p => p.category === 'Nightlife' || p.category === 'Relaxation');
    const eveningNights = rawEvenings.length > 0 ? rawEvenings : places;

    const safeDays = Math.max(1, days || 1);
    for (let day = 0; day < safeDays; day++) {
      // 1. Morning activity (09:00 - 11:30 snapped to 15m)
      const morningPlace = attractions[(day * 2) % attractions.length] || places[0];
      const morningStart = '09:00';
      const morningDuration = snapMinutesTo15(morningPlace.avg_duration_mins || 90);
      const morningEnd = minutesToTime(timeToMinutes(morningStart) + morningDuration);

      items.push({
        id: `item-${day}-morning-${Date.now()}`,
        trip_id: 'temp',
        day_index: day,
        place_id: morningPlace.id,
        place_name: morningPlace.name,
        place_type: 'attraction',
        start_time: morningStart,
        end_time: morningEnd,
        duration_mins: morningDuration,
        image: morningPlace.image,
        category: morningPlace.category,
        maps_url: morningPlace.maps_url,
        notes: `Morning exploration matched to your interest in ${allInterests.size > 0 ? Array.from(allInterests).slice(0, 2).join(', ') : 'sightseeing'}`,
        transport_to_next: {
          mode: 'walk',
          duration_mins: 15,
          detail: '15 min scenic stroll to lunch'
        }
      });

      // 2. Mandatory Lunch between 12:00 – 14:00 (Rule 3.9)
      const lunchPlace = lunches[day % lunches.length] || places[1];
      const lunchStart = '12:30';
      const lunchDuration = snapMinutesTo15(lunchPlace.avg_duration_mins || 60);
      const lunchEnd = minutesToTime(timeToMinutes(lunchStart) + lunchDuration);

      items.push({
        id: `item-${day}-lunch-${Date.now()}`,
        trip_id: 'temp',
        day_index: day,
        place_id: lunchPlace.id,
        place_name: lunchPlace.name,
        place_type: 'restaurant',
        start_time: lunchStart,
        end_time: lunchEnd,
        duration_mins: lunchDuration,
        image: lunchPlace.image,
        category: 'Food & Drink',
        maps_url: lunchPlace.maps_url,
        notes: 'Hand-picked lunch curated for the travel group',
        transport_to_next: {
          mode: 'subway',
          duration_mins: 15,
          detail: 'Direct transit to afternoon site'
        }
      });

      // 3. Afternoon activity (14:30 – 17:00)
      const afternoonPlace = attractions[(day * 2 + 1) % attractions.length] || places[2];
      const afternoonStart = '14:45';
      const afternoonDuration = snapMinutesTo15(afternoonPlace.avg_duration_mins || 90);
      const afternoonEnd = minutesToTime(timeToMinutes(afternoonStart) + afternoonDuration);

      items.push({
        id: `item-${day}-afternoon-${Date.now()}`,
        trip_id: 'temp',
        day_index: day,
        place_id: afternoonPlace.id,
        place_name: afternoonPlace.name,
        place_type: 'attraction',
        start_time: afternoonStart,
        end_time: afternoonEnd,
        duration_mins: afternoonDuration,
        image: afternoonPlace.image,
        category: afternoonPlace.category,
        maps_url: afternoonPlace.maps_url,
        notes: `Afternoon immersion at ${destName}`,
        transport_to_next: {
          mode: 'walk',
          duration_mins: 15,
          detail: 'Stroll through evening quarters'
        }
      });

      // 4. Mandatory Dinner between 18:00 – 20:00 (Rule 3.9)
      const dinnerPlace = dinners[(day + 1) % dinners.length] || places[3];
      const dinnerStart = '18:30';
      const dinnerDuration = snapMinutesTo15(dinnerPlace.avg_duration_mins || 90);
      const dinnerEnd = minutesToTime(timeToMinutes(dinnerStart) + dinnerDuration);

      items.push({
        id: `item-${day}-dinner-${Date.now()}`,
        trip_id: 'temp',
        day_index: day,
        place_id: dinnerPlace.id,
        place_name: dinnerPlace.name,
        place_type: 'restaurant',
        start_time: dinnerStart,
        end_time: dinnerEnd,
        duration_mins: dinnerDuration,
        image: dinnerPlace.image,
        category: 'Food & Drink',
        maps_url: dinnerPlace.maps_url,
        notes: 'Evening dinner experience featuring signature local gastronomy'
      });
    }

    return items;
  }

  // --- "Help me fill the free time" (Section 3.7) ---
  fillFreeTimeForDay(
    currentDayItems: ItineraryItem[],
    destinationId: string,
    dayIndex: number
  ): ItineraryItem[] {
    const places = this.getDiscoverablePlaces(destinationId);
    const existingPlaceIds = new Set(currentDayItems.map(i => i.place_id));
    const candidates = places.filter(p => !existingPlaceIds.has(p.id));

    if (candidates.length === 0) return currentDayItems;

    // Sort existing items by start time
    const sorted = [...currentDayItems].sort(
      (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
    );

    // Active day window: 08:30 (510 min) to 22:00 (1320 min)
    const dayStart = 510;
    const dayEnd = 1320;
    const updatedItems = [...sorted];

    let candidateIdx = 0;

    // Check gap before first item
    if (sorted.length > 0) {
      const firstStart = timeToMinutes(sorted[0].start_time);
      if (firstStart - dayStart >= 60 && candidateIdx < candidates.length) {
        const place = candidates[candidateIdx++];
        const startMin = snapMinutesTo15(dayStart);
        const duration = snapMinutesTo15(Math.min(place.avg_duration_mins || 60, firstStart - startMin - 15));
        if (duration >= 30) {
          updatedItems.push({
            id: `fill-pre-${Date.now()}-${candidateIdx}`,
            trip_id: sorted[0].trip_id,
            day_index: dayIndex,
            place_id: place.id,
            place_name: place.name,
            place_type: 'attraction',
            start_time: minutesToTime(startMin),
            end_time: minutesToTime(startMin + duration),
            duration_mins: duration,
            image: place.image,
            category: place.category,
            maps_url: place.maps_url,
            notes: 'Auto-filled free time discovery'
          });
        }
      }
    }

    // Check gaps between consecutive items
    for (let i = 0; i < sorted.length - 1; i++) {
      if (candidateIdx >= candidates.length) break;
      const currentEnd = timeToMinutes(sorted[i].end_time);
      const nextStart = timeToMinutes(sorted[i + 1].start_time);
      const gap = nextStart - currentEnd;

      if (gap >= 60) {
        const place = candidates[candidateIdx++];
        const startMin = snapMinutesTo15(currentEnd + 15);
        const available = nextStart - startMin - 15;
        const duration = snapMinutesTo15(Math.min(place.avg_duration_mins || 60, available));

        if (duration >= 30) {
          updatedItems.push({
            id: `fill-mid-${Date.now()}-${candidateIdx}`,
            trip_id: sorted[i].trip_id,
            day_index: dayIndex,
            place_id: place.id,
            place_name: place.name,
            place_type: 'attraction',
            start_time: minutesToTime(startMin),
            end_time: minutesToTime(startMin + duration),
            duration_mins: duration,
            image: place.image,
            category: place.category,
            maps_url: place.maps_url,
            notes: 'Auto-filled slot between activities'
          });
        }
      }
    }

    // Check gap after last item before dayEnd
    if (sorted.length > 0 && candidateIdx < candidates.length) {
      const lastEnd = timeToMinutes(sorted[sorted.length - 1].end_time);
      if (dayEnd - lastEnd >= 60) {
        const place = candidates[candidateIdx++];
        const startMin = snapMinutesTo15(lastEnd + 15);
        const duration = snapMinutesTo15(Math.min(place.avg_duration_mins || 60, dayEnd - startMin));
        if (duration >= 30) {
          updatedItems.push({
            id: `fill-post-${Date.now()}-${candidateIdx}`,
            trip_id: sorted[0].trip_id,
            day_index: dayIndex,
            place_id: place.id,
            place_name: place.name,
            place_type: 'activity',
            start_time: minutesToTime(startMin),
            end_time: minutesToTime(startMin + duration),
            duration_mins: duration,
            image: place.image,
            category: place.category,
            maps_url: place.maps_url,
            notes: 'Auto-filled evening relaxation'
          });
        }
      }
    }

    // Re-sort and recompute transports
    updatedItems.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
    for (let k = 0; k < updatedItems.length - 1; k++) {
      const endMins = timeToMinutes(updatedItems[k].end_time);
      const startNextMins = timeToMinutes(updatedItems[k + 1].start_time);
      updatedItems[k].transport_to_next = generateTransportEstimate(startNextMins, endMins);
    }

    return updatedItems;
  }
}

export const db = new RoamioDataStore();

export function getTripCoverPhoto(trip: Trip): string {
  if (trip.cover_photo) return trip.cover_photo;

  // Try matching destination
  const destName = trip.destinations?.[0];
  if (destName) {
    const allDest = db.getDestinations();
    const match = allDest.find(d =>
      destName.toLowerCase().includes(d.name.toLowerCase()) ||
      destName.toLowerCase().includes(d.city.toLowerCase()) ||
      d.name.toLowerCase().includes(destName.toLowerCase())
    );
    if (match && match.cover_photo) return match.cover_photo;
  }

  // Try matching first itinerary item with an image
  const firstItemWithImage = trip.itinerary?.find(item => item.image);
  if (firstItemWithImage && firstItemWithImage.image) return firstItemWithImage.image;

  return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80';
}

export function getTripGallery(trip: Trip): string[] {
  if (trip.gallery && trip.gallery.length > 0) return trip.gallery;

  const destName = trip.destinations?.[0];
  if (destName) {
    const allDest = db.getDestinations();
    const match = allDest.find(d =>
      destName.toLowerCase().includes(d.name.toLowerCase()) ||
      destName.toLowerCase().includes(d.city.toLowerCase()) ||
      d.name.toLowerCase().includes(destName.toLowerCase())
    );
    if (match && match.gallery && match.gallery.length > 0) return match.gallery;
  }

  const itineraryImages = (trip.itinerary || [])
    .map(i => i.image)
    .filter((img): img is string => Boolean(img));

  if (itineraryImages.length > 0) {
    const unique = Array.from(new Set([getTripCoverPhoto(trip), ...itineraryImages]));
    return unique;
  }

  return [
    getTripCoverPhoto(trip),
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=80'
  ];
}
