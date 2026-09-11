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
  Review,
  TripCollaborator
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
  DESTINATION_REVIEWS: 'roamio_dest_reviews'
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
            const parsed = JSON.parse(storedUser);
            this.currentUser = {
              ...DEMO_USERS[0],
              ...parsed,
              interests: Array.isArray(parsed?.interests) && parsed.interests.length > 0
                ? parsed.interests
                : (DEMO_USERS[0].interests || ['Culture', 'Food & Dining', 'Photography']),
              password: parsed?.password || DEMO_USERS[0].password || 'roamio2026',
              bio: parsed?.bio !== undefined ? parsed.bio : DEMO_USERS[0].bio,
              homeLocation: parsed?.homeLocation !== undefined ? parsed.homeLocation : DEMO_USERS[0].homeLocation,
              joinedDate: parsed?.joinedDate || DEMO_USERS[0].joinedDate || 'March 2025'
            };
          } catch {
            this.currentUser = { ...DEMO_USERS[0] };
          }
        } else {
          this.currentUser = { ...DEMO_USERS[0] };
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
          } catch {
            // Ignore quota / private mode storage error
          }
        }

        // Load trips
        const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
        if (storedTrips !== null) {
          try {
            const parsed = JSON.parse(storedTrips);
            this.trips = Array.isArray(parsed) ? parsed : [];
            // Ensure invited_users and owner information are normalized
            this.trips.forEach(t => {
              if (!Array.isArray(t.invited_users)) {
                t.invited_users = [];
              }
              if (!Array.isArray(t.collaborator_emails)) {
                t.collaborator_emails = [];
              }
              if (!t.owner_name) {
                t.owner_name = t.user_id === 'user-alex' ? 'Alex Rivera' : 'Trip Creator';
                t.owner_email = t.user_id === 'user-alex' ? 'alex@roamio.travel' : 'creator@roamio.travel';
              }
            });

            // Ensure the demo Kyoto plan has Janice Ng invited if not already
            const kyotoTrip = this.trips.find(t => t.id === 'trip-my-kyoto-autumn');
            if (kyotoTrip && (!kyotoTrip.invited_users || kyotoTrip.invited_users.length === 0)) {
              kyotoTrip.owner_name = 'Alex Rivera';
              kyotoTrip.owner_email = 'alex@roamio.travel';
              kyotoTrip.invited_users = [
                {
                  id: 'user-janice',
                  name: 'Janice Ng',
                  email: 'janiceng040803@gmail.com',
                  username: 'janiceng',
                  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
                  role: 'editor',
                  invited_at: '2026-09-10T12:00:00.000Z',
                  accepted: true
                }
              ];
              kyotoTrip.collaborator_emails = ['janiceng040803@gmail.com'];
            }
          } catch {
            this.trips = [];
          }
        } else {
          this.trips = [this.createDefaultSampleTrip()];
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
            this.plans = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PLANS;
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
      } else {
        // Fallback when localStorage is not available
        this.currentUser = DEMO_USERS[0];
        this.trips = [this.createDefaultSampleTrip()];
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
      this.trips = [this.createDefaultSampleTrip()];
    }
  }

  private createDefaultSampleTrip(): Trip {
    const kyoto = INITIAL_DESTINATIONS[0];
    return {
      id: 'trip-my-kyoto-autumn',
      user_id: 'user-alex',
      owner_name: 'Alex Rivera',
      owner_email: 'alex@roamio.travel',
      invited_users: [
        {
          id: 'user-janice',
          name: 'Janice Ng',
          email: 'janiceng040803@gmail.com',
          username: 'janiceng',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
          role: 'editor',
          invited_at: '2026-09-10T12:00:00.000Z',
          accepted: true
        }
      ],
      collaborator_emails: ['janiceng040803@gmail.com'],
      title: 'Autumn in Kyoto Cultural Adventure',
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

  // --- Auth Methods ---
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      this.registerKnownUser(user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  getKnownUsers(): User[] {
    const defaultList: User[] = [...DEMO_USERS];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach(u => {
              if (u && u.email && !defaultList.some(d => d.email.toLowerCase() === u.email.toLowerCase())) {
                defaultList.push(u);
              }
            });
          }
        }
      }
    } catch {
      // Ignore
    }
    return defaultList;
  }

  registerKnownUser(user: User): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const currentList = this.getKnownUsers();
        const exists = currentList.some(u => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
        if (!exists) {
          const updated = [...currentList, user];
          localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
        }
      }
    } catch {
      // Ignore
    }
  }

  findUserByEmailOrUsername(query: string): User | null {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    const all = this.getKnownUsers();
    return all.find(u =>
      u.email.toLowerCase() === clean ||
      u.name.toLowerCase() === clean ||
      u.name.toLowerCase().replace(/\s+/g, '') === clean.replace(/\s+/g, '') ||
      (u.id && u.id.toLowerCase() === clean)
    ) || null;
  }

  login(emailOrUsername: string, password?: string): User {
    const clean = (emailOrUsername || '').trim().toLowerCase();
    const known = this.findUserByEmailOrUsername(clean);
    
    if (known) {
      const loggedInUser: User = {
        ...known,
        password: password || known.password || 'roamio2026'
      };
      this.setCurrentUser(loggedInUser);
      return loggedInUser;
    }

    const isDemo = clean.includes('alex') || clean === 'alex@roamio.travel';
    const existing = this.currentUser;
    const user: User = {
      id: isDemo ? 'user-alex' : (existing?.id || `user-${Date.now()}`),
      name: isDemo ? 'Alex Rivera' : (emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername),
      email: isDemo ? 'alex@roamio.travel' : (emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@roamio.travel`),
      phone: isDemo ? (existing?.phone || '+1 415-555-0192') : (existing?.phone || ''),
      avatar: isDemo
        ? (existing?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80')
        : (existing?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
      bio: existing?.bio || 'Passionate traveler exploring culture, scenic nature and culinary discoveries.',
      homeLocation: existing?.homeLocation || 'San Francisco, United States',
      interests: (existing?.interests && existing.interests.length > 0)
        ? existing.interests
        : ['Culture', 'Food & Dining', 'Photography', 'Architecture'],
      password: password || existing?.password || 'roamio2026',
      joinedDate: existing?.joinedDate || 'March 2025'
    };
    this.setCurrentUser(user);
    return user;
  }

  signUp(email: string, password?: string, name?: string, phone?: string): User {
    const user: User = {
      id: `user-${Date.now()}`,
      name: name || (email.includes('@') ? email.split('@')[0] : 'Traveler'),
      email,
      phone: phone || '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      bio: 'New Roamio explorer planning exciting adventures.',
      homeLocation: '',
      interests: ['Culture', 'Food & Dining', 'Photography'],
      password: password || 'roamio2026',
      joinedDate: 'Just joined'
    };
    this.setCurrentUser(user);
    return user;
  }

  updateUserProfile(updates: Partial<User>): User {
    if (!this.currentUser) {
      this.currentUser = { ...DEMO_USERS[0], ...updates };
    } else {
      this.currentUser = {
        ...this.currentUser,
        ...updates
      };
    }
    this.setCurrentUser(this.currentUser);
    return this.currentUser;
  }

  changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    if (!this.currentUser) {
      return { success: false, error: 'No user is currently signed in.' };
    }
    const currentActualPassword = this.currentUser.password || 'roamio2026';
    if (currentPassword !== currentActualPassword) {
      return { success: false, error: 'The current password you entered is incorrect.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }
    this.currentUser = {
      ...this.currentUser,
      password: newPassword
    };
    this.setCurrentUser(this.currentUser);
    return { success: true };
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
    if (!id) return undefined;
    const cleanId = id.trim().toLowerCase();
    // 1. Direct ID match
    const byId = this.destinations.find(d => d.id.toLowerCase() === cleanId);
    if (byId) return byId;

    // 2. Direct name match
    const byName = this.destinations.find(d => d.name.toLowerCase() === cleanId);
    if (byName) return byName;

    // 3. Substring / fuzzy match
    const byFuzzy = this.destinations.find(d => 
      cleanId.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(cleanId) ||
      d.id.toLowerCase().includes(cleanId)
    );
    return byFuzzy;
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
    if (!Array.isArray(this.trips)) {
      this.trips = [];
    }
    return [...this.trips];
  }

  getTripsForUser(user?: User | null): Trip[] {
    const all = this.getTrips();
    if (!user) {
      return all;
    }

    const userEmail = (user.email || '').toLowerCase().trim();
    const userName = (user.name || '').toLowerCase().trim();
    const userId = user.id;

    return all.filter(t => {
      // 1. Owner match
      if (t.user_id === userId) return true;
      if (t.owner_email && t.owner_email.toLowerCase() === userEmail) return true;

      // 2. Invited collaborator match
      if (Array.isArray(t.invited_users)) {
        const isInvited = t.invited_users.some(inv =>
          (inv.email && inv.email.toLowerCase() === userEmail) ||
          (inv.username && inv.username.toLowerCase() === userName) ||
          (inv.name && inv.name.toLowerCase() === userName) ||
          (inv.id && inv.id === userId)
        );
        if (isInvited) return true;
      }

      if (Array.isArray(t.collaborator_emails)) {
        if (t.collaborator_emails.some(em => em.toLowerCase() === userEmail)) return true;
      }

      // 3. Fallback for demo user 'user-alex' if trip has no explicit owner
      if (userId === 'user-alex' && (!t.user_id || t.user_id === 'user-alex')) {
        return true;
      }

      return false;
    });
  }

  inviteUserToTrip(
    tripId: string,
    emailOrUsername: string,
    role: 'editor' | 'viewer' = 'editor'
  ): { success: boolean; trip: Trip; collaborator: TripCollaborator; message: string; isNewUser?: boolean } {
    const trip = this.getTripById(tripId);
    if (!trip) {
      throw new Error(`Trip not found with id: ${tripId}`);
    }

    if (!Array.isArray(trip.invited_users)) {
      trip.invited_users = [];
    }
    if (!Array.isArray(trip.collaborator_emails)) {
      trip.collaborator_emails = [];
    }

    const cleanInput = emailOrUsername.trim();
    if (!cleanInput) {
      throw new Error('Please enter a valid email address or username');
    }

    // Find if user is in known users (DEMO_USERS or USERS_LIST)
    const knownUser = this.findUserByEmailOrUsername(cleanInput);

    // Check if already invited
    const existingIndex = trip.invited_users.findIndex(
      u => (u.email && u.email.toLowerCase() === cleanInput.toLowerCase()) ||
           (u.username && u.username.toLowerCase() === cleanInput.toLowerCase()) ||
           (knownUser && u.id === knownUser.id)
    );

    let collaborator: TripCollaborator;

    if (existingIndex >= 0) {
      // Update existing role
      trip.invited_users[existingIndex].role = role;
      collaborator = trip.invited_users[existingIndex];
      this.saveTrip(trip);
      return {
        success: true,
        trip,
        collaborator,
        message: `${collaborator.name} is already a member (access confirmed as ${role === 'editor' ? 'co-editor' : 'viewer'}).`
      };
    }

    if (knownUser) {
      collaborator = {
        id: knownUser.id,
        email: knownUser.email,
        username: knownUser.name.toLowerCase().replace(/\s+/g, ''),
        name: knownUser.name,
        avatar: knownUser.avatar,
        role,
        invited_at: new Date().toISOString(),
        accepted: true
      };
    } else {
      const isEmail = cleanInput.includes('@');
      const cleanName = isEmail ? cleanInput.split('@')[0] : cleanInput;
      const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      const generatedEmail = isEmail ? cleanInput : `${cleanInput.toLowerCase()}@roamio.travel`;

      collaborator = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email: generatedEmail,
        username: cleanInput.toLowerCase(),
        name: formattedName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        role,
        invited_at: new Date().toISOString(),
        accepted: true
      };

      // Register this new user in known users list so they can log in
      this.registerKnownUser({
        id: collaborator.id!,
        name: collaborator.name,
        email: collaborator.email,
        avatar: collaborator.avatar,
        interests: ['Culture', 'Food & Dining', 'Photography'],
        joinedDate: 'Joined recently'
      });
    }

    trip.invited_users.push(collaborator);
    const emailLower = collaborator.email.toLowerCase();
    if (!trip.collaborator_emails.includes(emailLower)) {
      trip.collaborator_emails.push(emailLower);
    }

    this.saveTrip(trip);
    return {
      success: true,
      trip,
      collaborator,
      message: `Invited ${collaborator.name} (${collaborator.email}). This plan is now in their My Plans and they can edit together.`
    };
  }

  removeCollaboratorFromTrip(tripId: string, emailOrId: string): Trip {
    const trip = this.getTripById(tripId);
    if (!trip) return trip!;

    const target = emailOrId.toLowerCase().trim();
    if (Array.isArray(trip.invited_users)) {
      trip.invited_users = trip.invited_users.filter(
        u => u.email?.toLowerCase() !== target && u.id !== emailOrId && u.username?.toLowerCase() !== target
      );
    }
    if (Array.isArray(trip.collaborator_emails)) {
      trip.collaborator_emails = trip.collaborator_emails.filter(e => e.toLowerCase() !== target);
    }
    this.saveTrip(trip);
    return trip;
  }

  getTripById(id: string): Trip | undefined {
    return this.trips.find(t => t.id === id);
  }

  saveTrip(trip: Trip): Trip[] {
    if (!trip) return this.getTrips();
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
