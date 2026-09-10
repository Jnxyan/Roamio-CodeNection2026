import React, { useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  ShieldCheck,
  Check,
  X,
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { PlanBAlert } from '../../types';

interface PlanBComparisonCardProps {
  alert: PlanBAlert;
  onUsePlanB: () => void;
  onKeepCurrentPlan: () => void;
  onViewPlanBDetails: () => void;
  onResetPlanB?: () => void;
}

export const PlanBComparisonCard: React.FC<PlanBComparisonCardProps> = ({
  alert,
  onUsePlanB,
  onKeepCurrentPlan,
  onViewPlanBDetails,
  onResetPlanB
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dayNumber = alert.affected_day_index + 1;
  const original = {
    name: alert.affected_item_name,
    time: alert.affected_time,
    isIndoor: false,
    type: 'Outdoor Attraction'
  };

  const planB = alert.suggested_plan_b;

  // Case 1: Plan B already applied
  if (alert.status === 'applied') {
    return (
      <div
        id="plan-b-status-applied"
        className="mb-6 p-4 sm:p-5 rounded-3xl bg-emerald-50/90 border-2 border-emerald-300 text-emerald-950 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Plan B Applied
              </span>
              <h4 className="text-sm font-extrabold text-emerald-950">
                {planB.place_name} is now on your Day {dayNumber} schedule
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewPlanBDetails}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Compare Details</span>
            </button>
            {onResetPlanB && (
              <button
                onClick={onResetPlanB}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                title="Reset simulation to re-test choices"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Choice</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-emerald-900/80">
          <span>Replaced: <strong className="line-through">{original.name}</strong></span>
          <span>•</span>
          <span>Time: <strong>{planB.start_time} – {planB.end_time}</strong></span>
          <span>•</span>
          <span>Location: <strong>{planB.distance_from_next}</strong></span>
          <span>•</span>
          <span>Status: <strong>100% Sheltered Indoor</strong></span>
        </div>
      </div>
    );
  }

  // Case 2: User chose to keep current plan
  if (alert.status === 'dismissed') {
    return (
      <div
        id="plan-b-status-dismissed"
        className="mb-6 p-4 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] text-[#374151] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#374151]/10 text-[#374151] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1F2937]">
              Current Plan Kept: {original.name} on Day {dayNumber}
            </p>
            <p className="text-[11px] text-[#374151]/70">
              You chose to stick with your original outdoor itinerary. Rain gear recommended.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewPlanBDetails}
            className="text-xs font-bold text-[#0EA5A5] hover:underline px-2 py-1 cursor-pointer"
          >
            Review Plan B Again
          </button>
          {onResetPlanB && (
            <button
              onClick={onResetPlanB}
              className="px-2.5 py-1 rounded-lg border border-[#D9CFC2] text-xs font-semibold hover:bg-white text-[#374151] cursor-pointer"
            >
              Re-open Plan B
            </button>
          )}
        </div>
      </div>
    );
  }

  // Case 3: Pending review (Active proposal)
  return (
    <div
      id="plan-b-comparison-card"
      className="mb-8 rounded-3xl border-2 border-amber-300 bg-white overflow-hidden shadow-sm transition-all animate-in fade-in duration-200"
    >
      {/* Alert Header */}
      <div className="bg-amber-50/90 px-5 sm:px-6 py-4 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-800">
                Unexpected Change
              </span>
              <span className="text-xs font-extrabold text-amber-900">
                Day {dayNumber} • Trip in {alert.days_until_trip} days
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-amber-950 mt-0.5">
              {alert.title}
            </h4>
          </div>
        </div>

        {alert.weather_details && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-amber-200/80 text-xs font-semibold text-amber-900 self-start sm:self-auto">
            <CloudRain className="w-4 h-4 text-[#0EA5A5] shrink-0" />
            <span>{alert.weather_details.forecast} ({alert.weather_details.precipitation_chance} rain)</span>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison: Original vs Plan B */}
      <div className="p-5 sm:p-6 space-y-5">
        <p className="text-xs text-[#374151] leading-relaxed">
          {alert.description} A smart indoor alternative has been prepared based on your location, schedule, and traveler group.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Original Activity */}
          <div className="p-4 rounded-2xl border border-red-200 bg-red-50/40 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                Original Activity
              </span>
              <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Rain Impacted</span>
              </span>
            </div>

            <div>
              <h5 className="text-base font-bold text-[#1F2937] font-display">
                {original.name}
              </h5>
              <div className="flex items-center gap-2 text-xs text-[#374151] mt-1 font-mono font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                <span>{original.time}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-red-200/60 text-xs text-[#374151] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#374151]/70">Setting:</span>
                <span className="font-semibold text-red-700">Outdoor mountain trail</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#374151]/70">Issue:</span>
                <span className="font-semibold text-red-700">Heavy rain, slippery steps</span>
              </div>
            </div>
          </div>

          {/* Card 2: Suggested Plan B */}
          <div className="p-4 rounded-2xl border-2 border-[#0EA5A5] bg-[#0EA5A5]/5 space-y-3 relative shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#086666] bg-[#0EA5A5]/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Suggested Plan B</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                100% Indoor
              </span>
            </div>

            <div>
              <h5 className="text-base font-bold text-[#1F2937] font-display">
                {planB.place_name}
              </h5>
              <div className="flex items-center gap-2 text-xs text-[#086666] mt-1 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                <span>{planB.start_time} – {planB.end_time}</span>
                <span className="text-[11px] font-normal text-[#374151]/70">({planB.duration_mins}m)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#0EA5A5]/20 text-xs text-[#374151] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#374151]/70">Location:</span>
                <span className="font-semibold text-[#086666] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{planB.distance_from_next}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#374151]/70">Cost:</span>
                <span className="font-semibold text-[#1F2937]">{planB.ticket_cost}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#374151]/70">Suitability:</span>
                <span className="font-semibold text-[#1F2937]">{planB.traveler_suitability}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan B Context Reason */}
        <div className="p-3.5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] text-xs space-y-1">
          <span className="font-bold text-[#1F2937] block">Why this Plan B works:</span>
          <p className="text-[#374151] leading-relaxed">
            {planB.reason}
          </p>
        </div>

        {/* Primary Action Buttons (Section 5 Requirement) */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#EFEAE2]">
          <button
            id="btn-view-plan-b-modal"
            type="button"
            onClick={onViewPlanBDetails}
            className="px-4 py-2.5 rounded-xl border border-[#D9CFC2] hover:bg-[#FBF7F2] text-[#1F2937] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-[#0EA5A5]" />
            <span>View Plan B</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-keep-current-plan"
              type="button"
              onClick={onKeepCurrentPlan}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#D9CFC2] hover:bg-gray-100 text-[#374151] text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Keep Current Plan
            </button>

            <button
              id="btn-use-plan-b"
              type="button"
              onClick={onUsePlanB}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Use Plan B</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
