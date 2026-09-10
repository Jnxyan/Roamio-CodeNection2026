import React, { useState } from 'react';
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
  Trash2,
  CloudRain,
  RotateCcw,
  CheckCircle2,
  Zap,
  Check
} from 'lucide-react';
import { PlanBNotificationBanner } from './planB/PlanBNotificationBanner';
import { PlanBComparisonCard } from './planB/PlanBComparisonCard';
import { PlanBDetailModal } from './planB/PlanBDetailModal';
import {
  calculateDaysUntilTrip,
  isTripClose,
  getOrGeneratePlanBAlert,
  applyPlanB,
  dismissPlanB
} from '../services/planBService';

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
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(safeTrips[0] || null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isPlanBDetailModalOpen, setIsPlanBDetailModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'all'>('itinerary');

  // Keep selected trip in sync with changes
  const activeTrip = safeTrips.find(t => t.id === selectedTrip?.id) || safeTrips[0] || null;

  // Plan B & Timing calculation
  const daysUntil = activeTrip ? calculateDaysUntilTrip(activeTrip) : 30;
  const isClose = isTripClose(daysUntil);
  const planBAlert = activeTrip ? getOrGeneratePlanBAlert(activeTrip) : null;

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
    if (onUpdateTrip) onUpdateTrip(updatedTrip);
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
    if (onUpdateTrip) onUpdateTrip(updatedTrip);
    setNewChecklistText('');
  };

  // Plan B Handlers (Section 5 User Controls)
  const handleUsePlanB = () => {
    if (!activeTrip || !planBAlert) return;
    const updatedTrip = applyPlanB(activeTrip, planBAlert);
    db.saveTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
    if (onUpdateTrip) onUpdateTrip(updatedTrip);

    setToastMessage(
      `Plan B Applied: ${planBAlert.affected_item_name} replaced with ${planBAlert.suggested_plan_b.place_name}. Timeline updated!`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleKeepCurrentPlan = () => {
    if (!activeTrip || !planBAlert) return;
    const updatedTrip = dismissPlanB(activeTrip, planBAlert);
    db.saveTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
    if (onUpdateTrip) onUpdateTrip(updatedTrip);

    setToastMessage(
      `Current Plan Kept: You chose to keep ${planBAlert.affected_item_name} despite the rain forecast.`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetPlanB = () => {
    if (!activeTrip) return;
    // Restore original Kyoto sample item if it was replaced
    const originalFushimi = {
      id: 'item-1',
      trip_id: activeTrip.id,
      day_index: 0,
      place_id: 'place-fushimi',
      place_name: 'Fushimi Inari Taisha',
      place_type: 'attraction' as const,
      start_time: '08:30',
      end_time: '10:30',
      duration_mins: 120,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      category: 'Attraction',
      maps_url: 'https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Kyoto',
      notes: 'Ascend the vermilion torii gates at crisp morning air',
      transport_to_next: {
        mode: 'subway' as const,
        duration_mins: 18,
        detail: 'Keihan Main Line to Gion-Shijo'
      }
    };

    const updatedItinerary = (activeTrip.itinerary || []).map(item =>
      item.place_name === 'Kyoto Railway Museum' || item.id === 'item-1' ? originalFushimi : item
    );

    const updatedTrip: Trip = {
      ...activeTrip,
      itinerary: updatedItinerary,
      plan_b_alert: undefined
    };

    db.saveTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
    if (onUpdateTrip) onUpdateTrip(updatedTrip);

    setToastMessage('Plan B simulation reset: Original itinerary restored.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Change simulated trip proximity (for testing Requirement 2)
  const handleSetProximity = (days: number | null) => {
    if (!activeTrip) return;
    const updatedTrip: Trip = {
      ...activeTrip,
      simulated_days_until: days
    };
    db.saveTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
    if (onUpdateTrip) onUpdateTrip(updatedTrip);

    if (days === null) {
      setToastMessage('Proximity reset to actual trip calendar dates (far away).');
    } else {
      setToastMessage(`Trip proximity simulated to: ${days} day${days === 1 ? '' : 's'} before trip.`);
    }
    setTimeout(() => setToastMessage(null), 3500);
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
    <div id="my-plans-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-[#1F2937] text-white text-xs font-semibold shadow-2xl flex items-center gap-3 border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-display flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-[#0EA5A5]" />
            <span>My Trips & Itineraries</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#374151] mt-1">
            Manage your saved itineraries, unexpected changes (Plan B), budgets, and daily schedules.
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

            {safeTrips.map(trip => {
              const tripDaysUntil = calculateDaysUntilTrip(trip);
              const tripIsClose = isTripClose(tripDaysUntil);
              const hasActivePlanB = trip.plan_b_alert?.status === 'applied';

              return (
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0EA5A5]/10 text-[#086666]">
                          {trip.days} Days • {(trip.destinations || [])[0] || 'Destination'}
                        </span>
                        {tripIsClose && !hasActivePlanB && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                            ⚠️ In {tripDaysUntil}d
                          </span>
                        )}
                        {hasActivePlanB && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            Plan B Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#1F2937] mt-1.5 line-clamp-1">
                        {trip.title}
                      </h4>
                      <p className="text-xs text-[#374151] mt-0.5">
                        {trip.start_date} → {trip.end_date}
                      </p>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this trip plan?')) {
                          onDeleteTrip(trip.id);
                        }
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
                      <span>Full Itinerary</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full Trip Plan & Saved Itinerary */}
          {activeTrip && (
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-xs space-y-6">
              {/* Trip Title & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EFEAE2]">
                <div>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-semibold text-[#0EA5A5] bg-[#0EA5A5]/10 px-2 py-0.5 rounded-md">
                      Active Saved Trip
                    </span>
                    <span className="text-[#374151]/50">•</span>
                    <span className="text-[#374151] font-medium">{activeTrip.destinations.join(' • ')}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1F2937] font-display">
                    {activeTrip.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-edit-timeline-builder"
                    onClick={() => onOpenTrip(activeTrip)}
                    className="px-4 py-2.5 rounded-xl border border-[#0EA5A5] text-[#0EA5A5] hover:bg-[#0EA5A5]/5 font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                    title="Open Timeline Builder"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Customize Timeline</span>
                  </button>
                </div>
              </div>

              {/* Requirement 2: Proximity Status & Simulator Controls */}
              <div
                id="trip-proximity-control"
                className="p-3.5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Calendar className="w-4 h-4 text-[#0EA5A5] shrink-0" />
                  <span className="font-bold text-[#1F2937]">Trip Proximity:</span>
                  {isClose ? (
                    <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                      <span>Trip in {daysUntil} day{daysUntil === 1 ? '' : 's'}</span>
                      <span>• ⚠️ Weather Alert Active</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-[#086666] bg-[#0EA5A5]/10 px-2 py-0.5 rounded-md">
                      Trip is in {daysUntil} days • All clear (Alerts activate 1–3 days before trip)
                    </span>
                  )}
                </div>

                {/* Simulation toggle buttons for instant prototype testing */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                  <span className="text-[#374151]/70 font-semibold mr-1">Proximity Test:</span>
                  <button
                    id="btn-simulate-3-days"
                    onClick={() => handleSetProximity(3)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      daysUntil === 3
                        ? 'bg-[#0EA5A5] text-white shadow-xs'
                        : 'bg-white border border-[#D9CFC2] text-[#374151] hover:bg-gray-50'
                    }`}
                  >
                    ⚡ In 3 Days (Show Alert)
                  </button>
                  <button
                    id="btn-simulate-1-day"
                    onClick={() => handleSetProximity(1)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      daysUntil === 1
                        ? 'bg-[#0EA5A5] text-white shadow-xs'
                        : 'bg-white border border-[#D9CFC2] text-[#374151] hover:bg-gray-50'
                    }`}
                  >
                    ⚡ In 1 Day
                  </button>
                  <button
                    id="btn-simulate-normal"
                    onClick={() => handleSetProximity(null)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeTrip.simulated_days_until === null || activeTrip.simulated_days_until === undefined
                        ? 'bg-[#374151] text-white'
                        : 'bg-white border border-[#D9CFC2] text-[#374151] hover:bg-gray-50'
                    }`}
                    title="Simulate trip when far away (e.g., months ahead)"
                  >
                    📅 Far Away (No Alerts)
                  </button>
                </div>
              </div>

              {/* Requirement 3: Notification Banner (Only shows when trip is close) */}
              {isClose && planBAlert && (
                <PlanBNotificationBanner
                  alert={planBAlert}
                  destinationName={activeTrip.destinations[0] || 'Trip'}
                  onViewPlanB={() => {
                    setIsPlanBDetailModalOpen(true);
                    const el = document.getElementById('full-itinerary-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              )}

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-[#EFEAE2] pb-3">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'itinerary'
                      ? 'bg-[#0EA5A5] text-white shadow-xs'
                      : 'bg-[#FBF7F2] text-[#374151] hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Full Itinerary (Plan B)</span>
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-[#0EA5A5] text-white shadow-xs'
                      : 'bg-[#FBF7F2] text-[#374151] hover:bg-gray-100'
                  }`}
                >
                  <span>All Details (Budget & Bookings)</span>
                </button>
              </div>

              {/* SECTION: Full Itinerary & Plan B (Requirements 1, 4, 5) */}
              <div id="full-itinerary-section" className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#1F2937] font-display flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0EA5A5]" />
                    <span>Full Itinerary — Day-by-Day Schedule</span>
                  </h3>
                  <span className="text-xs font-semibold text-[#374151]">
                    {activeTrip.itinerary?.length || 0} scheduled activities
                  </span>
                </div>

                {/* Requirement 5: Plan B Unexpected Change Card inside Full Itinerary */}
                {isClose && planBAlert && (
                  <PlanBComparisonCard
                    alert={planBAlert}
                    onUsePlanB={handleUsePlanB}
                    onKeepCurrentPlan={handleKeepCurrentPlan}
                    onViewPlanBDetails={() => setIsPlanBDetailModalOpen(true)}
                    onResetPlanB={handleResetPlanB}
                  />
                )}

                {/* Day-by-Day Activities List */}
                {(!activeTrip.itinerary || activeTrip.itinerary.length === 0) ? (
                  <p className="text-xs text-[#374151] italic bg-[#FBF7F2] p-4 rounded-xl border border-[#D9CFC2]/60">
                    No timeline items added yet. Click "Customize Timeline" to schedule places.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Array.from({ length: activeTrip.days || 1 }).map((_, dIdx) => {
                      const dayItems = (activeTrip.itinerary || []).filter(i => i.day_index === dIdx);
                      const isAffectedDay = isClose && planBAlert && planBAlert.affected_day_index === dIdx;

                      return (
                        <div
                          key={dIdx}
                          className={`rounded-2xl border overflow-hidden transition-all ${
                            isAffectedDay
                              ? 'border-amber-300 ring-2 ring-amber-200/50'
                              : 'border-[#D9CFC2]'
                          }`}
                        >
                          <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
                            isAffectedDay ? 'bg-amber-50/70 border-amber-200' : 'bg-[#FBF7F2] border-[#D9CFC2]'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-[#0EA5A5]">
                                Day {dIdx + 1}
                              </span>
                              {isAffectedDay && planBAlert?.status === 'pending' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 flex items-center gap-1">
                                  <CloudRain className="w-3 h-3" />
                                  <span>Rain Forecast (Plan B Available)</span>
                                </span>
                              )}
                              {isAffectedDay && planBAlert?.status === 'applied' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Plan B Applied (Sheltered Indoor)</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#374151] font-semibold">
                              {dayItems.length} activities
                            </span>
                          </div>

                          <div className="p-3 space-y-2">
                            {dayItems.length === 0 ? (
                              <p className="text-xs text-[#374151]/70 italic py-1">Free day / open schedule.</p>
                            ) : (
                              dayItems.map(item => {
                                const isTargetItem =
                                  isClose &&
                                  planBAlert &&
                                  item.id === planBAlert.affected_item_id;
                                const isReplacementItem =
                                  planBAlert &&
                                  planBAlert.status === 'applied' &&
                                  item.place_name === planBAlert.suggested_plan_b.place_name;

                                return (
                                  <div
                                    key={item.id}
                                    className={`flex items-start justify-between gap-3 text-xs p-3 rounded-xl border transition-all ${
                                      isTargetItem && planBAlert?.status === 'pending'
                                        ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                                        : isReplacementItem
                                        ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300'
                                        : 'bg-white border-[#EFEAE2]'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <span className="font-mono font-bold text-[#0EA5A5] w-24 shrink-0 mt-0.5">
                                        {item.start_time} - {item.end_time}
                                      </span>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className="font-bold text-[#1F2937] text-sm">
                                            {item.place_name}
                                          </p>
                                          {isTargetItem && planBAlert?.status === 'pending' && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 flex items-center gap-1">
                                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                                              <span>Rain Impacted</span>
                                            </span>
                                          )}
                                          {isReplacementItem && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900 flex items-center gap-1">
                                              <Sparkles className="w-3 h-3 text-emerald-700" />
                                              <span>Plan B (Indoor)</span>
                                            </span>
                                          )}
                                        </div>

                                        {item.notes && (
                                          <p className="text-[11px] text-[#374151]/80 mt-0.5 line-clamp-1">
                                            {item.notes}
                                          </p>
                                        )}

                                        {item.transport_to_next && (
                                          <p className="text-[10px] text-[#0EA5A5] mt-1 font-semibold">
                                            → {item.transport_to_next.detail}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {isTargetItem && planBAlert?.status === 'pending' && (
                                        <button
                                          onClick={() => setIsPlanBDetailModalOpen(true)}
                                          className="text-[11px] font-bold text-[#FF6B4A] hover:underline"
                                        >
                                          View Plan B
                                        </button>
                                      )}
                                      {item.maps_url && (
                                        <a
                                          href={item.maps_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[#0EA5A5] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                                        >
                                          <MapPin className="w-3 h-3" />
                                          <span>Map</span>
                                        </a>
                                      )}
                                    </div>
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

              {/* Requirement: Budget vs. actual spend tracker (shown in full details tab) */}
              {(activeTab === 'all' || activeTab === 'itinerary') && (
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
              )}

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

      {/* Plan B Detail Modal */}
      {planBAlert && (
        <PlanBDetailModal
          isOpen={isPlanBDetailModalOpen}
          onClose={() => setIsPlanBDetailModalOpen(false)}
          alert={planBAlert}
          onUsePlanB={handleUsePlanB}
          onKeepCurrentPlan={handleKeepCurrentPlan}
        />
      )}
    </div>
  );
};
