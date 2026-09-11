import React, { useState } from 'react';
import { Trip, Destination, User } from '../types';
import { db } from '../services/db';
import {
  MapPin,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  Trash2,
  Users,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { TripDetail } from './details/TripDetail';
import { getTripCoverImage } from '../utils/tripImageUtils';

interface MyPlansPageProps {
  trips: Trip[];
  activeTripId?: string;
  currentUser?: User | null;
  onOpenTrip: (trip: Trip) => void;
  onCreateNew: () => void;
  onDeleteTrip: (tripId: string) => void;
  onUpdateTrip?: (trip: Trip) => void;
  onViewPlace?: (destination: Destination) => void;
}

export const MyPlansPage: React.FC<MyPlansPageProps> = ({
  trips = [],
  activeTripId,
  currentUser,
  onOpenTrip,
  onCreateNew,
  onDeleteTrip,
  onUpdateTrip,
  onViewPlace
}) => {
  // Synchronized state with props and db
  const [localTrips, setLocalTrips] = useState<Trip[]>(() => {
    return Array.isArray(trips) && trips.length > 0 ? trips : db.getTripsForUser(currentUser);
  });

  // Keep localTrips in sync whenever trips prop updates
  React.useEffect(() => {
    if (Array.isArray(trips)) {
      setLocalTrips(trips);
    }
  }, [trips]);

  // Manage selected trip for the detail page view
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // If a trip is selected, find the trip object
  const selectedTrip = selectedTripId ? localTrips.find(t => t.id === selectedTripId) || null : null;

  const handleDelete = (e: React.MouseEvent, tripId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // 1. Immediately remove from local list for instantaneous UI removal
    setLocalTrips(prev => prev.filter(t => t.id !== tripId));
    // 2. Persist deletion in db and localStorage
    db.deleteTrip(tripId);
    // 3. Notify parent app state
    onDeleteTrip(tripId);
    // 4. If selected trip was this one, clear detail view
    if (selectedTripId === tripId) {
      setSelectedTripId(null);
    }
  };

  // If a plan is selected, render the dedicated Trip Detail Page
  if (selectedTrip) {
    return (
      <TripDetail
        trip={selectedTrip}
        onBack={() => setSelectedTripId(null)}
        onOpenTimeline={(trip) => onOpenTrip(trip)}
        onDeleteTrip={(tripId) => {
          setLocalTrips(prev => prev.filter(t => t.id !== tripId));
          db.deleteTrip(tripId);
          onDeleteTrip(tripId);
          setSelectedTripId(null);
        }}
        onUpdateTrip={onUpdateTrip}
        onViewPlace={onViewPlace}
      />
    );
  }

  // Otherwise, render the My Plans Grid where each plan is displayed like a post
  return (
    <div id="my-plans-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-display flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-[#0EA5A5]" />
            <span>My Trips & Itineraries</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#374151] mt-1">
            Manage your personal travel itineraries, budgets, packing lists, and day-by-day schedules.
          </p>
        </div>

        <button
          id="btn-create-new-trip-myplans"
          onClick={onCreateNew}
          className="px-5 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {localTrips.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-[#D9CFC2] max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#1F2937] font-display">No trips created yet</h3>
          <p className="text-xs text-[#374151] mt-1 mb-6 leading-relaxed">
            Ready to embark on an adventure? Launch the trip planner wizard to build your personalized itinerary.
          </p>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-xl bg-[#FF6B4A] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer hover:bg-[#E85837] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Planning</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {localTrips.map((trip) => {
            const coverPhoto = getTripCoverImage(trip);
            const totalEstimatedSpend =
              (trip.combined_package?.total_combined_price || 0) +
              (trip.days || 1) * (trip.budget_amount || 150);

            return (
              <motion.div
                key={trip.id}
                id={`plan-card-${trip.id}`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedTripId(trip.id)}
                className="group relative bg-white rounded-2xl border border-[#D9CFC2]/80 overflow-hidden shadow-sm hover:shadow-md hover:border-[#0EA5A5]/60 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Top Image Container */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-[#EFEAE2]">
                  <img
                    src={coverPhoto}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badges: Category & Delete Button */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span
                      id={`badge-cat-${trip.id}`}
                      className="text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm border bg-[#FF6B4A] text-white border-[#FF6B4A]"
                    >
                      Trip Plan
                    </span>

                    {/* Delete button: Immediate selective removal */}
                    <button
                      id={`btn-delete-trip-${trip.id}`}
                      onClick={(e) => handleDelete(e, trip.id)}
                      aria-label="Delete trip plan"
                      title="Delete trip"
                      className="p-2 rounded-xl bg-white/95 text-[#374151] hover:bg-rose-50 hover:text-red-500 transition-all shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Floating Stats over Image: Days & Total Budget */}
                  <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white z-10 pointer-events-none">
                    <div className="flex items-center gap-1.5 text-xs font-semibold bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                      <span>{trip.days} Days</span>
                    </div>

                    <div
                      id={`budget-badge-${trip.id}`}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 bg-[#FF6B4A] text-white"
                    >
                      <span>${totalEstimatedSpend.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Location & Traveler count */}
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <span className="flex items-center gap-1 text-[#374151] font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#0EA5A5]" />
                        <span className="truncate">
                          {(trip.destinations && trip.destinations[0]) || 'Destination'}
                        </span>
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#1F2937] shrink-0 bg-[#FBF7F2] px-2 py-0.5 rounded-md border border-[#D9CFC2]/50">
                        <Users className="w-3 h-3 text-[#0EA5A5]" />
                        <span>
                          {trip.travelers?.length || 1}{' '}
                          {trip.travelers?.length === 1 ? 'Traveler' : 'Travelers'}
                        </span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-[#1F2937] text-base leading-snug group-hover:text-[#0EA5A5] transition-colors line-clamp-2">
                      {trip.title}
                    </h3>

                    {/* Subtitle / Dates */}
                    <p className="mt-1 text-xs text-[#374151]/80 line-clamp-1">
                      {trip.start_date} → {trip.end_date}
                      {trip.origin?.city ? ` • From ${trip.origin.city}` : ''}
                    </p>

                    {/* Shared / Co-Planning Indicators */}
                    {(() => {
                      const userEmail = currentUser?.email?.toLowerCase();
                      const userId = currentUser?.id;
                      const isSharedWithMe = Boolean(
                        userEmail && (
                          (trip.invited_users?.some(u => u.email.toLowerCase() === userEmail || u.id === userId)) ||
                          (trip.collaborator_emails?.some(e => e.toLowerCase() === userEmail))
                        ) &&
                        (trip.user_id !== userId && trip.owner_email?.toLowerCase() !== userEmail)
                      );

                      if (isSharedWithMe) {
                        return (
                          <div className="mt-2.5 p-2 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#086666] font-bold">
                              <Users className="w-3.5 h-3.5 text-[#0EA5A5] shrink-0" />
                              <span className="truncate">Shared Plan • Co-editor</span>
                            </div>
                            <span className="text-[10px] text-[#374151]/70 truncate shrink-0">
                              By {trip.owner_name || 'Alex'}
                            </span>
                          </div>
                        );
                      }

                      if (trip.invited_users && trip.invited_users.length > 0) {
                        return (
                          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs pt-1">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center -space-x-1.5">
                                {trip.invited_users.slice(0, 3).map((u, i) => (
                                  <img
                                    key={u.email || i}
                                    src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                                    alt={u.name}
                                    title={`${u.name} (Co-editor)`}
                                    className="w-5 h-5 rounded-full border border-white object-cover shadow-2xs"
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-[#374151]/80 font-semibold">
                                {trip.invited_users.length} co-planner{trip.invited_users.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#0EA5A5] bg-[#0EA5A5]/10 px-2 py-0.5 rounded-md">
                              Co-editing
                            </span>
                          </div>
                        );
                      }

                      return null;
                    })()}
                  </div>

                  {/* Bottom Section: Scheduled Activities & View Details */}
                  <div className="mt-4 pt-3 border-t border-[#EFEAE2] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-[#374151]/80">
                      {trip.itinerary?.length || 0} scheduled activities
                    </span>

                    <span className="text-xs font-bold text-[#0EA5A5] group-hover:text-[#086666] flex items-center gap-1 transition-colors">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
