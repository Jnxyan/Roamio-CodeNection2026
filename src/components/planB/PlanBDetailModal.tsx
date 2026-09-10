import React from 'react';
import {
  X,
  AlertTriangle,
  CloudRain,
  Check,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Compass,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PlanBAlert } from '../../types';

interface PlanBDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: PlanBAlert;
  onUsePlanB: () => void;
  onKeepCurrentPlan: () => void;
}

export const PlanBDetailModal: React.FC<PlanBDetailModalProps> = ({
  isOpen,
  onClose,
  alert,
  onUsePlanB,
  onKeepCurrentPlan
}) => {
  if (!isOpen) return null;

  const dayNumber = alert.affected_day_index + 1;
  const originalName = alert.affected_item_name;
  const planB = alert.suggested_plan_b;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-plan-b-details"
        className="bg-white rounded-3xl border border-[#D9CFC2] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-[#EFEAE2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-800">
                  Plan B Proposal
                </span>
                <span className="text-xs text-[#374151] font-semibold">
                  Trip in {alert.days_until_trip} days • Day {dayNumber}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#1F2937] font-display mt-0.5">
                Unexpected Weather Change: Plan B
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#374151]/60 hover:text-[#1F2937] hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Situation Brief */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <CloudRain className="w-4 h-4 text-[#0EA5A5]" />
              <span>Forecast: {alert.weather_details?.forecast} ({alert.weather_details?.precipitation_chance} chance of heavy rain)</span>
            </div>
            <p className="leading-relaxed text-amber-900/90">
              {alert.description} A recommended indoor Plan B has been matched to your original time slot, transit path, and travel group.
            </p>
          </div>

          {/* Visual Side-by-Side Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original */}
            <div className="rounded-2xl border border-red-200 overflow-hidden bg-red-50/30 flex flex-col">
              <div className="h-32 bg-gray-200 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80"
                  alt={originalName}
                  className="w-full h-full object-cover grayscale-30"
                />
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  Original Plan (Outdoor)
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-[#1F2937]">{originalName}</h4>
                  <p className="text-xs font-mono text-[#374151] mt-0.5">{alert.affected_time}</p>
                </div>

                <div className="text-[11px] text-[#374151] space-y-1.5 pt-2 border-t border-red-200/50">
                  <p className="flex items-center gap-1 text-red-700 font-semibold">
                    <span>⚠️ Wet mountain trails & stairs</span>
                  </p>
                  <p className="text-[#374151]/80">Outdoor walking experience</p>
                </div>
              </div>
            </div>

            {/* Suggested Plan B */}
            <div className="rounded-2xl border-2 border-[#0EA5A5] overflow-hidden bg-white shadow-xs flex flex-col">
              <div className="h-32 bg-gray-200 relative overflow-hidden">
                <img
                  src={planB.image}
                  alt={planB.place_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#0EA5A5] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Suggested Plan B</span>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  100% Sheltered Indoor
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-[#1F2937]">{planB.place_name}</h4>
                  <p className="text-xs font-mono text-[#086666] font-bold mt-0.5">
                    {planB.start_time} – {planB.end_time} ({planB.duration_mins}m)
                  </p>
                </div>

                <div className="text-[11px] text-[#374151] space-y-1.5 pt-2 border-t border-[#0EA5A5]/20">
                  <p className="flex items-center gap-1 text-[#086666] font-semibold">
                    <MapPin className="w-3 h-3 text-[#0EA5A5]" />
                    <span>{planB.distance_from_next}</span>
                  </p>
                  <p className="text-emerald-700 font-medium">Fully covered exhibition halls</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compatibility Breakdown (Requirement 4) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
              How Plan B Matches Your Trip Requirements
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/70 space-y-1">
                <span className="text-[11px] font-bold text-[#374151]/70 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>Location & Distance</span>
                </span>
                <p className="font-semibold text-[#1F2937]">{planB.distance_from_next}</p>
                <p className="text-[11px] text-[#374151]/80">Near Kyoto Station, keeping subsequent transport on time.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/70 space-y-1">
                <span className="text-[11px] font-bold text-[#374151]/70 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>Time & Duration</span>
                </span>
                <p className="font-semibold text-[#1F2937]">{planB.start_time} – {planB.end_time} ({planB.duration_mins} mins)</p>
                <p className="text-[11px] text-[#374151]/80">Seamlessly replaces the morning slot with zero overlap.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/70 space-y-1">
                <span className="text-[11px] font-bold text-[#374151]/70 block flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>Budget & Ticket</span>
                </span>
                <p className="font-semibold text-[#1F2937]">{planB.ticket_cost}</p>
                <p className="text-[11px] text-[#374151]/80">Easily accommodates typical daily budget allowance.</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/70 space-y-1">
                <span className="text-[11px] font-bold text-[#374151]/70 block flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>Traveller Age Suitability</span>
                </span>
                <p className="font-semibold text-[#1F2937]">{planB.traveler_suitability}</p>
                <p className="text-[11px] text-[#374151]/80">Barrier-free, accessible walkways and elevators throughout.</p>
              </div>
            </div>
          </div>

          {/* Reason Detailed */}
          <div className="p-4 rounded-2xl bg-[#0EA5A5]/5 border border-[#0EA5A5]/20 text-xs text-[#1F2937] space-y-1">
            <span className="font-bold text-[#086666] block">Summary of Recommendation:</span>
            <p className="text-[#374151] leading-relaxed">
              {planB.reason}
            </p>
          </div>
        </div>

        {/* Action Buttons (Requirement 5) */}
        <div className="p-5 sm:p-6 bg-[#FBF7F2] border-t border-[#EFEAE2] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#D9CFC2] hover:bg-white text-xs font-bold text-[#374151] transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2.5">
            <button
              id="modal-btn-keep-current-plan"
              onClick={() => {
                onKeepCurrentPlan();
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#D9CFC2] bg-white hover:bg-gray-50 text-xs font-bold text-[#374151] transition-colors cursor-pointer text-center"
            >
              Keep Current Plan
            </button>

            <button
              id="modal-btn-use-plan-b"
              onClick={() => {
                onUsePlanB();
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
