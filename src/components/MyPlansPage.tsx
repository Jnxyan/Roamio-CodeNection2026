import React, { useState } from 'react';
import { Trip } from '../types';
import { TripPostCard } from './TripPostCard';
import { TripDetail } from './details/TripDetail';
import {
  Compass,
  Plus,
  Sparkles,
  Calendar
} from 'lucide-react';

interface MyPlansPageProps {
  trips: Trip[];
  onOpenTrip: (trip: Trip) => void;
  onCreateNew: () => void;
  onDeleteTrip: (tripId: string) => void;
  onUpdateTrip?: (trip: Trip) => void;
}

export const MyPlansPage: React.FC<MyPlansPageProps> = ({
  trips = [],
  onOpenTrip,
  onCreateNew,
  onDeleteTrip,
  onUpdateTrip
}) => {
  const safeTrips = Array.isArray(trips) ? trips : [];
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const selectedTrip = selectedTripId
    ? safeTrips.find(t => t.id === selectedTripId) || null
    : null;

  // If a plan is selected, show the new dedicated detail page!
  if (selectedTrip) {
    return (
      <TripDetail
        trip={selectedTrip}
        onBack={() => setSelectedTripId(null)}
        onOpenTimeline={(trip) => onOpenTrip(trip)}
        onDelete={(tripId) => {
          onDeleteTrip(tripId);
          setSelectedTripId(null);
        }}
        onTripUpdated={(updatedTrip) => {
          if (onUpdateTrip) onUpdateTrip(updatedTrip);
        }}
      />
    );
  }

  // Otherwise, show each plan like a post in a responsive grid
  return (
    <div id="my-plans-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-display flex items-center gap-2">
                <span>My Plans</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0EA5A5]/10 text-[#086666]">
                  {safeTrips.length} {safeTrips.length === 1 ? 'trip' : 'trips'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#374151] mt-0.5">
                Browse your custom travel plans, explore detailed schedules, and manage itineraries.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-create-new-trip-myplans"
          onClick={onCreateNew}
          className="px-5 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {safeTrips.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#D9CFC2] max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#1F2937] font-display">No plans created yet</h3>
          <p className="text-xs text-[#374151] mt-1.5 mb-6 leading-relaxed max-w-sm mx-auto">
            Ready to embark on an adventure? Launch the trip planner wizard to build your personalized itinerary.
          </p>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Planning</span>
          </button>
        </div>
      ) : (
        /* Responsive Grid of Plan Posts */
        <div
          id="my-plans-posts-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {safeTrips.map(trip => (
            <TripPostCard
              key={trip.id}
              trip={trip}
              onClick={(clickedTrip) => setSelectedTripId(clickedTrip.id)}
              onDelete={(tripId) => onDeleteTrip(tripId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
