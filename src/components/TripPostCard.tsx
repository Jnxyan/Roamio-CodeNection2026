import React from 'react';
import { Trip } from '../types';
import { getTripCoverPhoto } from '../services/db';
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Trash2,
  ArrowRight,
  CheckSquare,
  Users,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';

interface TripPostCardProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
}

export const TripPostCard: React.FC<TripPostCardProps> = ({
  trip,
  onClick,
  onDelete
}) => {
  const coverPhoto = getTripCoverPhoto(trip);
  const primaryDest = trip.destinations?.[0] || 'Destination';

  // Calculate budget vs spend
  const targetBudget = (trip.days || 1) * (trip.budget_amount || 150) * (trip.travelers?.length || 1);
  const estimatedSpend =
    (trip.combined_package?.total_combined_price || 0) +
    (trip.days || 1) * (trip.budget_amount || 150);

  const totalPacking = trip.packing_checklist?.length || 0;
  const packedCount = trip.packing_checklist?.filter(i => i.completed).length || 0;
  const activitiesCount = trip.itinerary?.length || 0;

  return (
    <motion.div
      id={`trip-card-${trip.id}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(trip)}
      className="group relative bg-white rounded-2xl border border-[#D9CFC2]/80 overflow-hidden shadow-xs hover:shadow-md hover:border-[#0EA5A5]/60 transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Top Cover Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#EFEAE2]">
        <img
          src={coverPhoto}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Badges: Category & Delete Quick-Action */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <span
            id={`badge-trip-category-${trip.id}`}
            className="text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm border bg-[#0EA5A5] text-white border-[#0EA5A5] flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>My Plan</span>
          </span>

          <button
            id={`btn-delete-trip-${trip.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete "${trip.title}"?`)) {
                onDelete(trip.id);
              }
            }}
            aria-label="Delete trip"
            title="Delete this trip"
            className="p-2 rounded-xl bg-white/90 text-[#374151] hover:bg-rose-500 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Floating Stats over Image */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
            <span>{trip.days} Days / {Math.max(1, trip.days - 1)} Nights</span>
          </div>

          <div
            id={`badge-trip-spend-${trip.id}`}
            className="text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm bg-[#FF6B4A] text-white flex items-center gap-1"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>${estimatedSpend.toLocaleString()} est.</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location & Traveler Count */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <span className="flex items-center gap-1 text-[#086666] font-bold truncate">
              <MapPin className="w-3.5 h-3.5 text-[#0EA5A5] shrink-0" />
              <span className="truncate">{primaryDest}</span>
            </span>

            <div className="flex items-center gap-1 text-[#374151] font-medium shrink-0 bg-[#FBF7F2] px-2 py-0.5 rounded-md border border-[#D9CFC2]/50 text-[11px]">
              <Users className="w-3 h-3 text-[#0EA5A5]" />
              <span>
                {trip.travelers?.length || 1} {trip.travelers?.length === 1 ? 'Traveler' : 'Travelers'}
              </span>
            </div>
          </div>

          {/* Trip Title */}
          <h3 className="font-extrabold text-[#1F2937] text-base sm:text-lg font-display line-clamp-1 group-hover:text-[#0EA5A5] transition-colors">
            {trip.title}
          </h3>

          {/* Dates */}
          <div className="flex items-center gap-1.5 text-xs text-[#374151] mt-1">
            <Calendar className="w-3.5 h-3.5 text-[#0EA5A5]/80 shrink-0" />
            <span>{trip.start_date} → {trip.end_date}</span>
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#D9CFC2]/50 text-xs">
            <div className="bg-[#FBF7F2] p-2 rounded-xl border border-[#D9CFC2]/40">
              <span className="text-[10px] uppercase font-bold text-[#374151]/70 block">Schedule</span>
              <span className="font-extrabold text-[#1F2937] text-xs mt-0.5 block">
                {activitiesCount} {activitiesCount === 1 ? 'activity' : 'activities'}
              </span>
            </div>

            <div className="bg-[#FBF7F2] p-2 rounded-xl border border-[#D9CFC2]/40">
              <span className="text-[10px] uppercase font-bold text-[#374151]/70 block flex items-center gap-1">
                <CheckSquare className="w-2.5 h-2.5 text-[#2FBF71]" />
                <span>Packing</span>
              </span>
              <span className="font-extrabold text-[#1F2937] text-xs mt-0.5 block">
                {totalPacking > 0 ? `${packedCount}/${totalPacking} packed` : 'Checklist ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer: Action */}
        <div className="pt-2 border-t border-[#D9CFC2]/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#374151]/80 font-medium">
            Origin: {trip.origin.city}
          </span>
          <span className="font-bold text-[#0EA5A5] group-hover:text-[#086666] flex items-center gap-1 transition-colors">
            <span>View Plan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
