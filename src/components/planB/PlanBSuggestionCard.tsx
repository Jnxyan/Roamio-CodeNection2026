import React, { useState } from 'react';
import { Trip, Destination } from '../../types';
import { db } from '../../services/db';
import {
  getPlanBSuggestion,
  isPlanBActive,
  applyPlanBToTrip,
  revertPlanB,
  PlanBSuggestion
} from './planBData';
import {
  AlertTriangle,
  CloudRain,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  X,
  Clock,
  Info
} from 'lucide-react';

interface PlanBSuggestionCardProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onViewPlace?: (destination: Destination) => void;
}

export const PlanBSuggestionCard: React.FC<PlanBSuggestionCardProps> = ({
  trip,
  onUpdateTrip,
  onViewPlace
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Check if Plan B is currently applied
  const activePlanB = isPlanBActive(trip);

  // Get suggestion based on existing itinerary
  const suggestion: PlanBSuggestion | null = getPlanBSuggestion(trip);

  // If no suggestion exists and Plan B is not active, render nothing
  if (!suggestion && !activePlanB) {
    return null;
  }

  // If dismissed by user and Plan B is not active, render nothing
  if (isDismissed && !activePlanB) {
    return null;
  }

  // Fallback suggestion placeholder if activePlanB is true but suggestion was transformed
  const activeSuggestion = suggestion || {
    id: `planb-${trip.id}-fushimi`,
    tripId: trip.id,
    affectedItemId: 'item-1',
    reason: 'Rain is expected during your outdoor activity.',
    conditionBadge: 'Morning Rain Alert',
    conditionDetail: 'Rain showers forecast during morning hours.',
    original: {
      id: 'item-1',
      name: 'Fushimi Inari Taisha',
      startTime: '08:30',
      endTime: '10:30',
      timeFormatted: '08:30 AM – 10:30 AM',
      category: 'Attraction'
    },
    suggested: {
      placeId: 'place-kyoto-railway-museum',
      name: 'Kyoto Railway Museum',
      category: 'Indoor Attraction / Museum',
      startTime: '10:00',
      endTime: '12:00',
      timeFormatted: '10:00 AM – 12:00 PM',
      durationMins: 120,
      costDiff: 10,
      costLabel: '$10 admission (¥1,500)',
      image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kyoto+Railway+Museum',
      notes: 'Sheltered indoor rail & cultural exhibits — substituted via Plan B due to morning rain',
      highlights: [
        'Fully indoor & climate-controlled',
        'Historic steam engines & bullet train simulators',
        'Covered observation cafe',
        'Only 10 minutes from Kyoto Station'
      ],
      indoorSheltered: true
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Directly redirect to place details page for suggested Plan B location
  const handleViewPlace = () => {
    if (!onViewPlace || !activeSuggestion) return;
    const dest = db.getDestinationById(activeSuggestion.suggested.placeId) ||
                 db.getDestinationById(activeSuggestion.suggested.name);
    if (dest) {
      onViewPlace(dest);
    }
  };

  const handleApplyPlanB = () => {
    if (!activeSuggestion) return;
    const updated = applyPlanBToTrip(trip, activeSuggestion);
    onUpdateTrip(updated);
    showToast(`Plan B Applied: ${activeSuggestion.suggested.name} scheduled.`);
  };

  const handleRevert = () => {
    if (!activeSuggestion) return;
    const reverted = revertPlanB(trip, activeSuggestion);
    onUpdateTrip(reverted);
    showToast(`Reverted to original plan: ${activeSuggestion.original.name}`);
  };

  return (
    <div id="plan-b-suggestion-container" className="my-4">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-[#0EA5A5] text-white text-xs font-semibold shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{feedbackToast}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-white/80 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* STATE 1: Plan B is already applied */}
      {activePlanB ? (
        <div
          id="plan-b-active-card"
          className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/70 shadow-2xs transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-900 tracking-wide uppercase">
                    Plan B Active
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800">
                    Indoor Alternative
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                  <strong>{activeSuggestion.suggested.name}</strong> substituted for {activeSuggestion.original.name} due to rain forecast.
                </p>
                <p className="text-[11px] text-emerald-700/80 mt-0.5">
                  Scheduled: {activeSuggestion.suggested.timeFormatted} • Rest of itinerary remains unchanged.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                id="btn-view-active-plan-b"
                onClick={handleViewPlace}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                View Details
              </button>
              <button
                id="btn-revert-plan-b"
                onClick={handleRevert}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Revert back to original outdoor plan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert to Original</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 2: Plan B Suggestion available */
        <div
          id="plan-b-suggestion-card"
          className="p-4 sm:p-5 rounded-2xl border border-amber-300 bg-amber-50/60 shadow-2xs transition-all space-y-3.5"
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base" role="img" aria-label="warning">⚠️</span>
              <h4 className="text-sm font-extrabold text-[#1F2937] tracking-tight">
                Plan B Suggestion
              </h4>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 border border-amber-300/80">
                <CloudRain className="w-3 h-3 text-amber-800" />
                <span>Weather Alert</span>
              </span>
            </div>

            <button
              id="btn-dismiss-plan-b"
              onClick={() => setIsDismissed(true)}
              className="text-[#374151]/50 hover:text-[#1F2937] p-1 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
              title="Dismiss suggestion (keeps original itinerary)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Reason */}
          <p className="text-xs text-[#374151] font-medium leading-relaxed">
            {activeSuggestion.reason}
          </p>

          {/* Comparison Grid: Original vs Suggested Plan B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Original Box */}
            <div className="p-3 rounded-xl bg-white/90 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-bold text-[#374151]/70 uppercase tracking-wider block">
                Original
              </span>
              <div className="font-bold text-xs text-[#1F2937] truncate" title={activeSuggestion.original.name}>
                {activeSuggestion.original.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#374151] font-mono font-medium">
                <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                <span>{activeSuggestion.original.timeFormatted}</span>
              </div>
            </div>

            {/* Suggested Plan B Box */}
            <div className="p-3 rounded-xl bg-white/90 border-2 border-[#0EA5A5]/60 shadow-2xs space-y-1 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#0EA5A5] uppercase tracking-wider">
                  Suggested Plan B
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#0EA5A5]/10 text-[#086666]">
                  Indoor
                </span>
              </div>
              <div className="font-bold text-xs text-[#1F2937] truncate" title={activeSuggestion.suggested.name}>
                {activeSuggestion.suggested.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#0EA5A5] font-mono font-bold">
                <Clock className="w-3 h-3 text-[#0EA5A5] shrink-0" />
                <span>{activeSuggestion.suggested.timeFormatted}</span>
              </div>
            </div>
          </div>

          {/* Card Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
            <span className="text-[11px] text-[#374151]/70 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>Replaces only this activity; keeps rest of schedule intact.</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                id="btn-view-plan-b"
                type="button"
                onClick={handleViewPlace}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D9CFC2] hover:border-[#0EA5A5] text-[#1F2937] hover:text-[#0EA5A5] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                View Plan B
              </button>

              <button
                id="btn-use-plan-b"
                type="button"
                onClick={handleApplyPlanB}
                className="px-4 py-1.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Use Plan B</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
