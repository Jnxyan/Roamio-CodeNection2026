import React from 'react';
import { Bell, AlertTriangle, ArrowRight, Eye } from 'lucide-react';
import { PlanBAlert } from '../../types';

interface PlanBNotificationBannerProps {
  alert: PlanBAlert;
  destinationName: string;
  onViewPlanB: () => void;
}

export const PlanBNotificationBanner: React.FC<PlanBNotificationBannerProps> = ({
  alert,
  destinationName,
  onViewPlanB
}) => {
  const dest = destinationName.split(',')[0].trim();
  const dayNumber = alert.affected_day_index + 1;

  if (alert.status === 'applied') {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-800">
                Plan B Active
              </span>
              <span className="text-xs text-emerald-700">Trip in {alert.days_until_trip} days</span>
            </div>
            <p className="text-xs font-medium text-emerald-800 mt-0.5">
              Alternative activity applied: <strong>{alert.suggested_plan_b.place_name}</strong> is scheduled for Day {dayNumber}.
            </p>
          </div>
        </div>
        <button
          onClick={onViewPlanB}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review Details</span>
        </button>
      </div>
    );
  }

  if (alert.status === 'dismissed') {
    return null; // Kept current plan, don't nag user with persistent banner
  }

  return (
    <div
      id="plan-b-notification-banner"
      className="mb-6 p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 relative">
            <Bell className="w-5 h-5 text-amber-800 animate-bounce" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF6B4A] rounded-full ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-amber-900">
                🔔 Your {dest} trip is in {alert.days_until_trip} day{alert.days_until_trip === 1 ? '' : 's'}.
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-800">
                ⚠️ Weather Alert
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-0.5 font-medium">
              Rain is expected during your outdoor activity ({alert.affected_item_name}) on Day {dayNumber}.
            </p>
          </div>
        </div>

        <button
          id="btn-banner-view-plan-b"
          onClick={onViewPlanB}
          className="px-4 py-2 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>View Plan B</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
