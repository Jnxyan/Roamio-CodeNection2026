import React, { useState } from 'react';
import { Trip, Destination } from '../../types';
import { db } from '../../services/db';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Plane,
  Hotel as HotelIcon,
  CheckSquare,
  Square,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sliders,
  Trash2,
  Users,
  UserPlus
} from 'lucide-react';
import { PlanBSuggestionCard } from '../planB/PlanBSuggestionCard';
import { formatTime12 } from '../../utils/timeUtils';
import { getTripCoverImage } from '../../utils/tripImageUtils';

interface TripDetailProps {
  trip: Trip;
  onBack: () => void;
  onOpenTimeline: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onUpdateTrip?: (trip: Trip) => void;
  onViewPlace?: (destination: Destination) => void;
}

export const TripDetail: React.FC<TripDetailProps> = ({
  trip,
  onBack,
  onOpenTimeline,
  onDeleteTrip,
  onUpdateTrip,
  onViewPlace
}) => {
  const [currentTrip, setCurrentTrip] = useState<Trip>(trip);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Synchronize when prop changes
  React.useEffect(() => {
    setCurrentTrip(trip);
  }, [trip]);

  // Handle trip update from Plan B or checklist
  const handleTripUpdated = (updatedTrip: Trip) => {
    db.saveTrip(updatedTrip);
    setCurrentTrip(updatedTrip);
    if (onUpdateTrip) {
      onUpdateTrip(updatedTrip);
    }
  };

  // Toggle packing checklist item
  const handleToggleChecklist = (itemId: string) => {
    const currentList = currentTrip.packing_checklist || [];
    const updatedChecklist = currentList.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedTrip = { ...currentTrip, packing_checklist: updatedChecklist };
    handleTripUpdated(updatedTrip);
  };

  // Add packing item
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `pk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    const currentList = currentTrip.packing_checklist || [];
    const updatedTrip = {
      ...currentTrip,
      packing_checklist: [...currentList, newItem]
    };
    handleTripUpdated(updatedTrip);
    setNewChecklistText('');
  };

  // Calculate budget vs actual spend
  const estimatedActualSpend =
    (currentTrip.combined_package?.total_combined_price || 0) +
    (currentTrip.days || 1) * (currentTrip.budget_amount || 150);

  const targetBudget =
    (currentTrip.days || 1) *
    (currentTrip.budget_amount || 150) *
    (currentTrip.travelers?.length || 1);

  const isOverBudget = estimatedActualSpend > targetBudget && targetBudget > 0;
  const coverImage = getTripCoverImage(currentTrip);

  return (
    <div id="trip-detail-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EFEAE2]">
        <button
          id="btn-back-to-plans"
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1F2937] hover:text-[#0EA5A5] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D9CFC2] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Plans</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            id={`btn-delete-trip-detail-${currentTrip.id}`}
            onClick={() => {
              db.deleteTrip(currentTrip.id);
              onDeleteTrip(currentTrip.id);
              onBack();
            }}
            className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#E85555] font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Delete this trip plan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Plan</span>
          </button>

          <button
            id="btn-edit-timeline-builder"
            onClick={() => onOpenTimeline(currentTrip)}
            className="px-4 sm:px-5 py-2 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Itinerary Timeline</span>
          </button>
        </div>
      </div>

      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#D9CFC2] bg-[#1F2937] text-white min-h-[260px] sm:min-h-[300px] flex flex-col justify-end p-6 sm:p-8 shadow-sm">
        {/* Background Image */}
        <img
          src={coverImage}
          alt={currentTrip.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* Content on Image */}
        <div className="relative z-10 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-[#FF6B4A] text-white border border-[#FF6B4A]">
              Trip Plan
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-white">
              <MapPin className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <span>{currentTrip.destinations?.join(' • ') || 'Destination'}</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-white">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentTrip.days} Days</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-white">
              <Users className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {currentTrip.travelers?.length || 1} {currentTrip.travelers?.length === 1 ? 'Traveler' : 'Travelers'}
              </span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display leading-tight">
            {currentTrip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-200 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0EA5A5]" />
              <span>
                {currentTrip.start_date} → {currentTrip.end_date}
              </span>
            </div>
            {currentTrip.origin?.city && (
              <div className="flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-[#FF6B4A]" />
                <span>
                  Origin: {currentTrip.origin.city}, {currentTrip.origin.country}
                </span>
              </div>
            )}
            <div className="capitalize text-gray-300">
              Tier: <span className="font-semibold text-white">{currentTrip.budget_tier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Collaborative Planning Members Card */}
        <div
          id="collaborators-summary-box"
          className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D9CFC2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider">
                  Co-Planners & Collaborators
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#086666] border border-teal-200">
                  Shared Workshop
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs text-[#374151]">
                  Owner: <strong>{currentTrip.owner_name || 'Alex Rivera'}</strong>
                </span>
                {currentTrip.invited_users && currentTrip.invited_users.length > 0 ? (
                  <>
                    <span className="text-xs text-[#374151]/50">•</span>
                    <span className="text-xs text-[#374151]">
                      Co-editors: {currentTrip.invited_users.map(u => u.name).join(', ')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-[#374151]/50">•</span>
                    <span className="text-xs text-[#374151]/70 italic">
                      No other members yet. Invite friends in the workshop timeline!
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenTimeline(currentTrip)}
            className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#086666] border border-teal-200 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#0EA5A5]" />
            <span>Invite & Co-Edit in Workshop</span>
          </button>
        </div>

        {/* Budget vs. actual spend tracker */}
        <div
          id="budget-tracker-box"
          className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D9CFC2] shadow-xs space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#0EA5A5]" />
              <h3 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider">
                Budget vs. Actual Spend Tracker
              </h3>
            </div>

            {isOverBudget ? (
              <span
                id="badge-over-budget"
                className="px-3 py-1 rounded-lg bg-red-100 text-[#E85555] text-xs font-bold flex items-center gap-1.5 border border-red-200"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Over Budget Target</span>
              </span>
            ) : (
              <span
                id="badge-on-budget"
                className="px-3 py-1 rounded-lg bg-emerald-100 text-[#2FBF71] text-xs font-bold flex items-center gap-1.5 border border-emerald-200"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Within Budget</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FBF7F2] p-4 rounded-2xl border border-[#D9CFC2]/70">
              <span className="text-xs text-[#374151]/80 font-semibold block">Target Budget Target</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-display mt-0.5 block">
                ${targetBudget.toLocaleString()}
              </span>
              <span className="text-xs text-[#374151] block mt-1">
                (${currentTrip.budget_amount}/day × {currentTrip.days} days × {currentTrip.travelers?.length || 1} travelers)
              </span>
            </div>

            <div className="bg-[#FBF7F2] p-4 rounded-2xl border border-[#D9CFC2]/70">
              <span className="text-xs text-[#374151]/80 font-semibold block">
                Estimated Actual Spend
              </span>
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-display mt-0.5 block ${
                  isOverBudget ? 'text-[#E85555]' : 'text-[#FF6B4A]'
                }`}
              >
                ${estimatedActualSpend.toLocaleString()}
              </span>
              <span className="text-xs text-[#374151] block mt-1">
                (Includes flight, accommodation, & daily spend)
              </span>
            </div>
          </div>
        </div>

        {/* Plan B Suggestion Feature */}
        <PlanBSuggestionCard
          trip={currentTrip}
          onUpdateTrip={handleTripUpdated}
          onViewPlace={onViewPlace}
        />

        {/* Day-by-day plan with times and locations */}
        <div className="bg-white rounded-3xl border border-[#D9CFC2] p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0EA5A5]" />
              <span>Day-by-Day Schedule & Locations</span>
            </h3>
            <span className="text-xs font-semibold text-[#374151] bg-[#FBF7F2] px-2.5 py-1 rounded-lg border border-[#D9CFC2]/60">
              {currentTrip.itinerary?.length || 0} scheduled items
            </span>
          </div>

          {(!currentTrip.itinerary || currentTrip.itinerary.length === 0) ? (
            <div className="text-center py-8 px-4 bg-[#FBF7F2] rounded-2xl border border-[#D9CFC2]/60">
              <p className="text-xs sm:text-sm text-[#374151] italic mb-3">
                No timeline items added yet. Click "Open Itinerary Timeline" to schedule places with 15-minute precision.
              </p>
              <button
                onClick={() => onOpenTimeline(currentTrip)}
                className="px-4 py-2 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Timeline Builder</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: currentTrip.days || 1 }).map((_, dIdx) => {
                const dayItems = (currentTrip.itinerary || []).filter(i => i.day_index === dIdx);
                return (
                  <div key={dIdx} className="rounded-2xl border border-[#D9CFC2] overflow-hidden">
                    <div className="bg-[#FBF7F2] px-4 py-3 border-b border-[#D9CFC2] flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-[#0EA5A5]">
                        Day {dIdx + 1}
                      </span>
                      <span className="text-xs text-[#374151] font-semibold">
                        {dayItems.length} activities
                      </span>
                    </div>

                    <div className="p-3.5 space-y-2.5">
                      {dayItems.length === 0 ? (
                        <p className="text-xs text-[#374151]/70 italic py-1.5">Free day / open schedule.</p>
                      ) : (
                        dayItems.map(item => {
                          const isPlanBSubstituted =
                            item.place_name === 'Kyoto Railway Museum' ||
                            item.place_name === 'Kyoto International Manga Museum' ||
                            item.place_name === 'Mori Art Museum & Indoor Sky Deck';
                          const isRainAlertItem =
                            item.place_name.toLowerCase().includes('fushimi inari');

                          return (
                            <div
                              key={item.id}
                              className={`flex items-start justify-between gap-3 text-xs p-3 rounded-xl border transition-all ${
                                isPlanBSubstituted
                                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300/40'
                                  : 'bg-white border-[#EFEAE2]'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-mono font-bold text-[#0EA5A5] w-28 shrink-0">
                                  {formatTime12(item.start_time)} – {formatTime12(item.end_time)}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="font-bold text-[#1F2937] text-sm">{item.place_name}</p>
                                    {isPlanBSubstituted && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-200/80 text-emerald-800">
                                        Plan B Substituted
                                      </span>
                                    )}
                                    {isRainAlertItem && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                        Rain Alert
                                      </span>
                                    )}
                                  </div>
                                  {item.notes && (
                                    <p className="text-xs text-[#374151]/80 mt-1">{item.notes}</p>
                                  )}
                                </div>
                              </div>

                              {item.maps_url && (
                                <a
                                  href={item.maps_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0EA5A5] hover:underline flex items-center gap-1 shrink-0 font-semibold text-xs py-1"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>Map</span>
                                </a>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Flight + hotel details with links */}
        {currentTrip.combined_package && (
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#D9CFC2] shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] font-display flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#0EA5A5]" />
              <span>Flight & Hotel Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Flight details */}
              <div className="p-4 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0EA5A5] uppercase tracking-wider text-[11px]">Flight</span>
                  <a
                    href={currentTrip.combined_package.flight.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF6B4A] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Book Airline</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="font-bold text-[#1F2937] text-sm sm:text-base">
                  {currentTrip.combined_package.flight.airline} ({currentTrip.combined_package.flight.flight_no})
                </p>
                <p className="text-[#374151]">
                  {currentTrip.combined_package.flight.departure_airport} → {currentTrip.combined_package.flight.arrival_airport}
                </p>
                <p className="text-[#374151]/80">
                  Duration: {currentTrip.combined_package.flight.duration} • ${currentTrip.combined_package.flight.price}
                </p>
              </div>

              {/* Hotel details */}
              <div className="p-4 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0EA5A5] uppercase tracking-wider text-[11px]">Hotel Stay</span>
                  <a
                    href={currentTrip.combined_package.hotel.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF6B4A] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Book Hotel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="font-bold text-[#1F2937] text-sm sm:text-base">
                  {currentTrip.combined_package.hotel.hotel_name}
                </p>
                <p className="text-[#374151]">
                  {currentTrip.combined_package.hotel.room_type}
                </p>
                <p className="text-[#374151]/80">
                  ${currentTrip.combined_package.hotel.price_per_night}/night • Est. ${currentTrip.combined_package.hotel.total_hotel_price} total
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Packing checklist */}
        <div className="bg-white rounded-3xl border border-[#D9CFC2] p-5 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-[#1F2937] font-display flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#0EA5A5]" />
            <span>Packing Checklist</span>
          </h3>

          <div className="space-y-2">
            {(currentTrip.packing_checklist || []).map(item => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 cursor-pointer hover:bg-[#EFEAE2]/60 transition-colors"
              >
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-[#2FBF71] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <span
                  className={`text-xs sm:text-sm ${
                    item.completed ? 'line-through text-gray-400' : 'font-medium text-[#1F2937]'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Add new packing item */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add an item to pack..."
              value={newChecklistText}
              onChange={e => setNewChecklistText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D9CFC2] text-xs bg-white focus:outline-none focus:border-[#0EA5A5]"
            />
            <button
              onClick={handleAddChecklistItem}
              className="px-5 py-2.5 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold cursor-pointer hover:bg-[#0B8585] transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Cautions & Reminders */}
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-2.5 shadow-xs">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Cautions & Trip Reminders</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-[#374151]">
            {(currentTrip.cautions || []).map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
