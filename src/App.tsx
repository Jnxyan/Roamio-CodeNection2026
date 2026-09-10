import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { SavedPage } from './components/SavedPage';
import { MyPlansPage } from './components/MyPlansPage';
import { CreatePlanWizard } from './components/wizard/CreatePlanWizard';
import { ItineraryBuilder } from './components/itinerary/ItineraryBuilder';
import { DestinationDetail } from './components/details/DestinationDetail';
import { HotelDetail } from './components/details/HotelDetail';
import { RestaurantDetail } from './components/details/RestaurantDetail';
import { PlanDetail } from './components/details/PlanDetail';
import { AuthModal } from './components/auth/AuthModal';
import { PostCardItem } from './components/PostCard';
import { db } from './services/db';
import { User, Trip, Destination, Hotel, Restaurant, Plan } from './types';

type ViewMode =
  | 'home'
  | 'saved'
  | 'my-plans'
  | 'create-trip'
  | 'itinerary'
  | 'detail-destination'
  | 'detail-hotel'
  | 'detail-restaurant'
  | 'detail-plan';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getCurrentUser());
  const [view, setView] = useState<ViewMode>('home');
  const [previousView, setPreviousView] = useState<ViewMode>('home');
  const [savedItems, setSavedItems] = useState<PostCardItem[]>(() => db.getSavedItems());
  const [trips, setTrips] = useState<Trip[]>(() => db.getTrips());
  const [activeTrip, setActiveTrip] = useState<Trip | null>(() => trips[0] || null);

  // Detail item states
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);
  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);

  // Wizard pre-fill states
  const [wizardPrefillDest, setWizardPrefillDest] = useState<Destination | null>(null);
  const [wizardPrefillPlan, setWizardPrefillPlan] = useState<Plan | null>(null);

  // Liked items IDs state
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(() => {
    const list = db.getAllPostCardItems().filter(p => db.isLiked(p.id)).map(p => p.id);
    return new Set(list);
  });

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Convert all items from mock/db to unified PostCardItem array
  const [allPostCards, setAllPostCards] = useState<PostCardItem[]>(() => db.getAllPostCardItems());

  // Saved IDs set for O(1) checks
  const savedIdsSet = new Set(savedItems.map(item => item.id));

  // Sync state changes with localStorage
  useEffect(() => {
    setAllPostCards(db.getAllPostCardItems());
  }, []);

  // Save/Unsave toggle
  const handleToggleSave = (item: PostCardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = db.toggleSaveItem(item);
    setSavedItems(updated);
  };

  // Open detail page based on item category
  const handleOpenDetail = (item: PostCardItem) => {
    setPreviousView(view);
    if (item.type === 'destinations') {
      const dest = db.getDestinationById(item.id);
      if (dest) {
        setActiveDestination(dest);
        setView('detail-destination');
      }
    } else if (item.type === 'hotels') {
      const hotel = db.getHotelById(item.id);
      if (hotel) {
        setActiveHotel(hotel);
        setView('detail-hotel');
      }
    } else if (item.type === 'restaurants') {
      const rest = db.getRestaurantById(item.id);
      if (rest) {
        setActiveRestaurant(rest);
        setView('detail-restaurant');
      }
    } else if (item.type === 'plans') {
      const plan = db.getPlanById(item.id);
      if (plan) {
        setActivePlan(plan);
        setView('detail-plan');
      }
    }
  };

  // Launch wizard from destination ("Plan trip here")
  const handlePlanTripHere = (destination: Destination) => {
    setWizardPrefillDest(destination);
    setWizardPrefillPlan(null);
    setView('create-trip');
  };

  // Launch wizard from plan ("Use as template")
  const handleUseAsTemplate = (plan: Plan) => {
    setWizardPrefillPlan(plan);
    setWizardPrefillDest(null);
    setView('create-trip');
  };

  // Complete wizard flow
  const handleCompleteWizard = (newTrip: Trip) => {
    const updatedTrips = db.saveTrip(newTrip);
    setTrips(updatedTrips);
    setActiveTrip(newTrip);
    setWizardPrefillDest(null);
    setWizardPrefillPlan(null);
    setView('itinerary');
  };

  // Update trip from builder
  const handleUpdateTrip = (updatedTrip: Trip) => {
    const updated = db.saveTrip(updatedTrip);
    setTrips(updated);
    setActiveTrip(updatedTrip);
  };

  // Delete trip
  const handleDeleteTrip = (tripId: string) => {
    const updated = db.deleteTrip(tripId);
    const safeUpdated = updated || db.getTrips();
    setTrips(safeUpdated);
    if (activeTrip?.id === tripId) {
      setActiveTrip(safeUpdated[0] || null);
    }
  };

  // Toggle like on any post item (destinations, hotels, restaurants, plans)
  const handleToggleLikeItem = (item: PostCardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = db.toggleLike(item.id);
    const updated = new Set(likedItemIds);
    if (result.liked) {
      updated.add(item.id);
    } else {
      updated.delete(item.id);
    }
    setLikedItemIds(updated);
    setAllPostCards(db.getAllPostCardItems());
  };

  const handleToggleLikePlan = (planId: string) => {
    const result = db.toggleLike(planId);
    const updated = new Set(likedItemIds);
    if (result.liked) {
      updated.add(planId);
    } else {
      updated.delete(planId);
    }
    setLikedItemIds(updated);
    if (activePlan && activePlan.id === planId) {
      activePlan.likes = result.count;
    }
    setAllPostCards(db.getAllPostCardItems());
  };

  return (
    <div className="min-h-screen bg-[#FBF7F2] text-[#1F2937] flex flex-col font-sans selection:bg-[#0EA5A5]/20 selection:text-[#086666]">
      {/* Global Navbar */}
      <Header
        currentUser={currentUser}
        savedCount={savedItems?.length || 0}
        plansCount={trips?.length || 0}
        activeTab={view === 'detail-destination' || view === 'detail-hotel' || view === 'detail-restaurant' || view === 'detail-plan' ? 'home' : view}
        onNavigate={(tab) => {
          if (tab === 'login') {
            setAuthModalOpen(true);
          } else {
            setView(tab);
          }
        }}
        onLogout={() => {
          db.logout();
          setCurrentUser(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: Home Feed */}
        {view === 'home' && (
          <HomePage
            postCards={allPostCards}
            savedIds={savedIdsSet}
            likedIds={likedItemIds}
            onToggleSave={handleToggleSave}
            onToggleLike={handleToggleLikeItem}
            onOpenDetail={handleOpenDetail}
            onLaunchCreateTrip={() => {
              setWizardPrefillDest(null);
              setWizardPrefillPlan(null);
              setView('create-trip');
            }}
          />
        )}

        {/* VIEW 2: Saved Grid */}
        {view === 'saved' && (
          <SavedPage
            savedItems={savedItems}
            likedIds={likedItemIds}
            onToggleSave={handleToggleSave}
            onToggleLike={handleToggleLikeItem}
            onItemClick={handleOpenDetail}
            onExploreClick={() => setView('home')}
          />
        )}

        {/* VIEW 3: My Plans */}
        {view === 'my-plans' && (
          <MyPlansPage
            trips={trips}
            onOpenTrip={(trip) => {
              setActiveTrip(trip);
              setView('itinerary');
            }}
            onCreateNew={() => {
              setWizardPrefillDest(null);
              setWizardPrefillPlan(null);
              setView('create-trip');
            }}
            onDeleteTrip={handleDeleteTrip}
          />
        )}

        {/* VIEW 4: Create-Plan Wizard */}
        {view === 'create-trip' && (
          <CreatePlanWizard
            initialDestination={wizardPrefillDest}
            templatePlan={wizardPrefillPlan}
            onCancel={() => setView('home')}
            onFinish={handleCompleteWizard}
          />
        )}

        {/* VIEW 5: Itinerary Builder (24h Timeline) */}
        {view === 'itinerary' && activeTrip && (
          <ItineraryBuilder
            trip={activeTrip}
            onSaveTrip={handleUpdateTrip}
            onFinish={(updatedTrip) => {
              handleUpdateTrip(updatedTrip);
              setView('my-plans');
            }}
            onBack={() => setView('my-plans')}
          />
        )}

        {/* VIEW 6: Destination Detail */}
        {view === 'detail-destination' && activeDestination && (
          <DestinationDetail
            destination={activeDestination}
            isSaved={savedIdsSet.has(activeDestination.id)}
            onBack={() => setView(previousView || 'home')}
            onToggleSave={() =>
              handleToggleSave({
                id: activeDestination.id,
                type: 'destinations',
                title: activeDestination.name,
                coverPhoto: activeDestination.cover_photo,
                daysOfStay: '',
                budget: activeDestination.ticket_price || (activeDestination.is_free ? 'Free' : 'Free'),
                ticketPrice: activeDestination.ticket_price || (activeDestination.is_free ? 'Free' : 'Free'),
                isFree: activeDestination.is_free || (activeDestination.ticket_price?.toLowerCase() === 'free'),
                rating: activeDestination.rating,
                reviewsCount: activeDestination.reviews_count,
                locationName: `${activeDestination.city}, ${activeDestination.country}`,
                mapsUrl: activeDestination.maps_url,
                operatingHours: activeDestination.operating_hours,
                energyLevel: activeDestination.energy_level,
                subtitle: activeDestination.short_description
              })
            }
            onPlanTripHere={handlePlanTripHere}
            onDestinationUpdated={(updated) => {
              setActiveDestination(updated);
              setAllPostCards(db.getAllPostCardItems());
            }}
          />
        )}

        {/* VIEW 7: Hotel Detail */}
        {view === 'detail-hotel' && activeHotel && (
          <HotelDetail
            hotel={activeHotel}
            isSaved={savedIdsSet.has(activeHotel.id)}
            onBack={() => setView(previousView || 'home')}
            onToggleSave={() =>
              handleToggleSave({
                id: activeHotel.id,
                type: 'hotels',
                title: activeHotel.name,
                coverPhoto: activeHotel.image,
                daysOfStay: 'Nightly Stay',
                budget: `$${activeHotel.pricing.per_night}/nt`,
                rating: activeHotel.rating,
                reviewsCount: activeHotel.reviews_count,
                locationName: activeHotel.destination_name,
                mapsUrl: activeHotel.maps_url,
                operatingHours: activeHotel.operating_hours,
                subtitle: `${activeHotel.room_types.join(', ')}`
              })
            }
          />
        )}

        {/* VIEW 8: Restaurant Detail */}
        {view === 'detail-restaurant' && activeRestaurant && (
          <RestaurantDetail
            restaurant={activeRestaurant}
            isSaved={savedIdsSet.has(activeRestaurant.id)}
            onBack={() => setView(previousView || 'home')}
            onToggleSave={() =>
              handleToggleSave({
                id: activeRestaurant.id,
                type: 'restaurants',
                title: activeRestaurant.name,
                coverPhoto: activeRestaurant.image,
                daysOfStay: 'Dining',
                budget: `~${restaurantPriceText(activeRestaurant.price_level, activeRestaurant.avg_budget)}`,
                rating: activeRestaurant.rating,
                reviewsCount: activeRestaurant.reviews ? activeRestaurant.reviews.length : 0,
                locationName: activeRestaurant.destination_name,
                mapsUrl: activeRestaurant.maps_url,
                operatingHours: activeRestaurant.operating_hours,
                subtitle: `${activeRestaurant.cuisine} • ${activeRestaurant.price_level}`
              })
            }
          />
        )}

        {/* VIEW 9: Plan Detail */}
        {view === 'detail-plan' && activePlan && (
          <PlanDetail
            plan={activePlan}
            isSaved={savedIdsSet.has(activePlan.id)}
            isLiked={likedItemIds.has(activePlan.id)}
            onBack={() => setView(previousView || 'home')}
            onToggleSave={() =>
              handleToggleSave({
                id: activePlan.id,
                type: 'plans',
                title: activePlan.title,
                coverPhoto: activePlan.cover_photo,
                daysOfStay: `${activePlan.days} Days`,
                budget: `$${activePlan.total_spend.toLocaleString()}`,
                rating: 4.95,
                locationName: activePlan.destination_name,
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activePlan.destination_name)}`,
                authorName: activePlan.author_name,
                authorAvatar: activePlan.author_avatar,
                subtitle: activePlan.description
              })
            }
            onToggleLike={() => handleToggleLikePlan(activePlan.id)}
            onUseAsTemplate={handleUseAsTemplate}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-[#D9CFC2]/70 bg-white py-6 mt-12 text-center text-xs text-[#374151]/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Roamio Travel Planner. Designed with precision 15-minute scheduling.</p>
          <div className="flex items-center gap-4 text-[11px] font-medium text-[#374151]">
            <span className="text-[#0EA5A5]">Teal #0EA5A5</span>
            <span className="text-[#FF6B4A]">Coral #FF6B4A</span>
            <span className="text-[#2FBF71]">Verified Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function restaurantPriceText(priceLevel: string, avg: number): string {
  return `${priceLevel} ($${avg}/pp)`;
}
