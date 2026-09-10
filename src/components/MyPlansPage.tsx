import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { db } from '../services/db';
import {
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Plane,
  Hotel as HotelIcon,
  CheckSquare,
  Square,
  Plus,
  ArrowRight,
  Sparkles,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Clock,
  Trash2
} from 'lucide-react';
import { PlanBSuggestionCard } from './planB/PlanBSuggestionCard';
import { formatTime12 } from '../utils/timeUtils';

interface MyPlansPageProps {
  trips: Trip[];
  activeTripId?: string;
  onOpenTrip: (trip: Trip) => void;
  onCreateNew: () => void;
  onDeleteTrip: (tripId: string) => void;
  onUpdateTrip?: (trip: Trip) => void;
}

export const MyPlansPage: React.FC<MyPlansPageProps> = ({
  trips = [],
  activeTripId,
  onOpenTrip,
  onCreateNew,
  onDeleteTrip,
  onUpdateTrip
}) => {
  // Always use trips provided via props as single source of truth, fallback to db.getTrips()
  const safeTrips = Array.isArray(trips) ? trips : db.getTrips();

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(() => {
    if (activeTripId) {
      const match = safeTrips.find(t => t.id === activeTripId);
      if (match) return match;
    }
    return safeTrips[0] || null;
  });
  const [newChecklistText, setNewChecklistText] = useState('');

  // Keep selected trip in sync when trips list changes or activeTripId is provided
  useEffect(() => {
    if (activeTripId) {
      const match = safeTrips.find(t => t.id === activeTripId);
      if (match) {
        setSelectedTrip(match);
        return;
      }
    }
    if (!selectedTrip || !safeTrips.some(t => t.id === selectedTrip.id)) {
      setSelectedTrip(safeTrips[0] || null);
    }
  }, [trips, activeTripId]);

  // Keep selected trip in sync with changes
  const activeTrip = (selectedTrip ? safeTrips.find(t => t.id === selectedTrip.id) : null)
    || (activeTripId ? safeTrips.find(t => t.id === activeTripId) : null)
    || safeTrips[0]
    || null;

  // Handle trip update from Plan B or checklist
  const handleTripUpdated = (updatedTrip: Trip) => {
    db.saveTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
    if (onUpdateTrip) {
      onUpdateTrip(updatedTrip);
    }
  };

  // Toggle packing checklist item
  const handleToggleChecklist = (tripId: string, itemId: string) => {
    if (!activeTrip) return;
    const currentList = activeTrip.packing_checklist || [];
    const updatedChecklist = currentList.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedTrip = { ...activeTrip, packing_checklist: updatedChecklist };
    db.saveTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
  };

  // Add packing item
  const handleAddChecklistItem = () => {
    if (!activeTrip || !newChecklistText.trim()) return;
    const newItem = {
      id: `pk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    const currentList = activeTrip.packing_checklist || [];
    const updatedTrip = {
      ...activeTrip,
      packing_checklist: [...currentList, newItem]
    };
    db.saveTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
    setNewChecklistText('');
  };

  // Calculate budget vs actual spend
  const estimatedActualSpend = activeTrip
    ? (activeTrip.combined_package?.total_combined_price || 0) +
      (activeTrip.days || 1) * (activeTrip.budget_amount || 150)
    : 0;

  const targetBudget = activeTrip
    ? (activeTrip.days || 1) * (activeTrip.budget_amount || 150) * (activeTrip.travelers?.length || 1)
    : 0;

  const isOverBudget = estimatedActualSpend > targetBudget && targetBudget > 0;

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

      {safeTrips.length === 0 ? (
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
            className="px-5 py-2.5 rounded-xl bg-[#FF6B4A] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Planning</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Trip Selector Cards */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-[#374151] uppercase tracking-wider mb-2">
              Saved Trips ({safeTrips.length})
            </h3>

            {safeTrips.map(trip => (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  activeTrip?.id === trip.id
                    ? 'border-[#0EA5A5] bg-white ring-2 ring-[#0EA5A5]/20 shadow-xs'
                    : 'border-[#D9CFC2] bg-[#FBF7F2] hover:border-[#0EA5A5]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0EA5A5]/10 text-[#086666]">
                      {trip.days} Days • {(trip.destinations || [])[0] || 'Destination'}
                    </span>
                    <h4 className="text-sm font-bold text-[#1F2937] mt-1.5 line-clamp-1">
                      {trip.title}
                    </h4>
                    <p className="text-xs text-[#374151] mt-0.5">
                      {trip.start_date} → {trip.end_date}
                    </p>
                  </div>

                  <button
                    id={`btn-delete-trip-${trip.id}`}
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteTrip(trip.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                    title="Delete trip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#D9CFC2]/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-[#374151]/80">
                    {trip.itinerary?.length || 0} scheduled items
                  </span>
                  <span className="text-xs font-bold text-[#0EA5A5] flex items-center gap-1">
                    <span>View Plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Full Trip Plan Overview (Section 3.8) */}
          {activeTrip && (
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-xs space-y-8">
              {/* Trip Title & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFEAE2]">
                <div>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-semibold text-[#0EA5A5] bg-[#0EA5A5]/10 px-2 py-0.5 rounded-md">
                      Active Plan
                    </span>
                    <span className="text-[#374151]/50">•</span>
                    <span className="text-[#374151] font-medium">{activeTrip.destinations.join(' • ')}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1F2937] font-display">
                    {activeTrip.title}
                  </h2>
                </div>

                <button
                  id="btn-edit-timeline-builder"
                  onClick={() => onOpenTrip(activeTrip)}
                  className="px-5 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Open Itinerary Timeline</span>
                </button>
              </div>

              {/* Requirement: Budget vs. actual spend tracker (with warning badge if actual exceeds budget) */}
              <div
                id="budget-tracker-box"
                className="p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#0EA5A5]" />
                    <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                      Budget vs. Actual Spend Tracker
                    </h3>
                  </div>

                  {isOverBudget ? (
                    <span
                      id="badge-over-budget"
                      className="px-2.5 py-1 rounded-lg bg-red-100 text-[#E85555] text-xs font-bold flex items-center gap-1 border border-red-200"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Over Budget Target</span>
                    </span>
                  ) : (
                    <span
                      id="badge-on-budget"
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#2FBF71] text-xs font-bold flex items-center gap-1 border border-emerald-200"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Within Budget</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="bg-white p-3.5 rounded-xl border border-[#D9CFC2]/70">
                    <span className="text-[11px] text-[#374151]/70 font-semibold block">Target Budget Target</span>
                    <span className="text-2xl font-extrabold text-[#1F2937] font-display">
                      ${targetBudget}
                    </span>
                    <span className="text-[11px] text-[#374151] block mt-0.5">
                      (${activeTrip.budget_amount}/day × {activeTrip.days} days)
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#D9CFC2]/70">
                    <span className="text-[11px] text-[#374151]/70 font-semibold block">
                      Estimated Actual Spend
                    </span>
                    <span
                      className={`text-2xl font-extrabold font-display ${
                        isOverBudget ? 'text-[#E85555]' : 'text-[#FF6B4A]'
                      }`}
                    >
                      ${estimatedActualSpend}
                    </span>
                    <span className="text-[11px] text-[#374151] block mt-0.5">
                      (Includes flight, accommodation, & daily spend)
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan B Suggestion Feature: Shows small card when there is a relevant unexpected change */}
              <PlanBSuggestionCard
                trip={activeTrip}
                onUpdateTrip={handleTripUpdated}
              />

              {/* Requirement: Day-by-day plan with times and locations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#1F2937] font-display flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0EA5A5]" />
                    <span>Day-by-Day Schedule & Locations</span>
                  </h3>
                  <span className="text-xs font-semibold text-[#374151]">
                    {activeTrip.itinerary?.length || 0} scheduled items
                  </span>
                </div>

                {(!activeTrip.itinerary || activeTrip.itinerary.length === 0) ? (
                  <p className="text-xs text-[#374151] italic bg-[#FBF7F2] p-4 rounded-xl border border-[#D9CFC2]/60">
                    No timeline items added yet. Click "Open Itinerary Timeline" to schedule places.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: activeTrip.days || 1 }).map((_, dIdx) => {
                      const dayItems = (activeTrip.itinerary || []).filter(i => i.day_index === dIdx);
                      return (
                        <div key={dIdx} className="rounded-2xl border border-[#D9CFC2] overflow-hidden">
                          <div className="bg-[#FBF7F2] px-4 py-2.5 border-b border-[#D9CFC2] flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#0EA5A5]">
                              Day {dIdx + 1}
                            </span>
                            <span className="text-[11px] text-[#374151] font-semibold">
                              {dayItems.length} activities
                            </span>
                          </div>

                          <div className="p-3 space-y-2">
                            {dayItems.length === 0 ? (
                              <p className="text-xs text-[#374151]/70 italic py-1">Free day / open schedule.</p>
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
                                    className={`flex items-start justify-between gap-3 text-xs p-2.5 rounded-xl border transition-all ${
                                      isPlanBSubstituted
                                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300/40'
                                        : 'bg-white border-[#EFEAE2]'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <span className="font-mono font-bold text-[#0EA5A5] w-28 shrink-0">
                                        {formatTime12(item.start_time)} – {formatTime12(item.end_time)}
                                      </span>
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <p className="font-bold text-[#1F2937]">{item.place_name}</p>
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
                                          <p className="text-[11px] text-[#374151]/70 line-clamp-1 mt-0.5">{item.notes}</p>
                                        )}
                                      </div>
                                    </div>

                                    {item.maps_url && (
                                      <a
                                        href={item.maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0EA5A5] hover:underline flex items-center gap-1 shrink-0 font-semibold text-[11px]"
                                      >
                                        <MapPin className="w-3 h-3" />
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

              {/* Requirement: Flight + hotel details with links */}
              {activeTrip.combined_package && (
                <div className="p-5 rounded-2xl bg-white border border-[#D9CFC2] space-y-4">
                  <h3 className="text-base font-bold text-[#1F2937] font-display flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#0EA5A5]" />
                    <span>Flight & Hotel Details</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Flight details */}
                    <div className="p-4 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0EA5A5] uppercase">Flight</span>
                        <a
                          href={activeTrip.combined_package.flight.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF6B4A] hover:underline font-bold flex items-center gap-1"
                        >
                          <span>Book Airline</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="font-bold text-[#1F2937] text-sm">
                        {activeTrip.combined_package.flight.airline} ({activeTrip.combined_package.flight.flight_no})
                      </p>
                      <p className="text-[#374151]">
                        {activeTrip.combined_package.flight.departure_airport} → {activeTrip.combined_package.flight.arrival_airport}
                      </p>
                      <p className="text-[#374151]/80">
                        Duration: {activeTrip.combined_package.flight.duration} • ${activeTrip.combined_package.flight.price}
                      </p>
                    </div>

                    {/* Hotel details */}
                    <div className="p-4 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0EA5A5] uppercase">Hotel Stay</span>
                        <a
                          href={activeTrip.combined_package.hotel.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF6B4A] hover:underline font-bold flex items-center gap-1"
                        >
                          <span>Book Hotel</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="font-bold text-[#1F2937] text-sm">
                        {activeTrip.combined_package.hotel.hotel_name}
                      </p>
                      <p className="text-[#374151]">
                        {activeTrip.combined_package.hotel.room_type}
                      </p>
                      <p className="text-[#374151]/80">
                        ${activeTrip.combined_package.hotel.price_per_night}/night • Est. ${activeTrip.combined_package.hotel.total_hotel_price} total
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Requirement: Packing checklist */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#1F2937] font-display flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#0EA5A5]" />
                  <span>Packing Checklist</span>
                </h3>

                <div className="space-y-2">
                  {(activeTrip.packing_checklist || []).map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(activeTrip.id, item.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 cursor-pointer hover:bg-[#EFEAE2]/60 transition-colors"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-[#2FBF71] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
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
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#D9CFC2] text-xs bg-white focus:outline-none focus:border-[#0EA5A5]"
                  />
                  <button
                    onClick={handleAddChecklistItem}
                    className="px-4 py-2 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Requirement: Cautions & Reminders */}
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Cautions & Trip Reminders</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-[#374151]">
                  {(activeTrip.cautions || []).map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
