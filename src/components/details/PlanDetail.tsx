import React, { useState } from 'react';
import { Plan } from '../../types';
import {
  ArrowLeft,
  Heart,
  Share2,
  Bookmark,
  Copy,
  Plane,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  DollarSign
} from 'lucide-react';

interface PlanDetailProps {
  plan: Plan;
  isSaved: boolean;
  isLiked: boolean;
  onBack: () => void;
  onToggleSave: () => void;
  onToggleLike: () => void;
  onUseAsTemplate: (plan: Plan) => void;
}

export const PlanDetail: React.FC<PlanDetailProps> = ({
  plan,
  isSaved,
  isLiked,
  onBack,
  onToggleSave,
  onToggleLike,
  onUseAsTemplate
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const spendCategories = [
    { label: 'Flights', amount: plan.spend_breakdown.flights, color: 'bg-teal-500', barColor: '#0EA5A5' },
    { label: 'Accommodation', amount: plan.spend_breakdown.accommodation, color: 'bg-indigo-500', barColor: '#6366F1' },
    { label: 'Food & Dining', amount: plan.spend_breakdown.food, color: 'bg-amber-500', barColor: '#F59E0B' },
    { label: 'Tickets & Activities', amount: plan.spend_breakdown.tickets, color: 'bg-emerald-500', barColor: '#10B981' },
    { label: 'Local Transport', amount: plan.spend_breakdown.transport, color: 'bg-blue-500', barColor: '#3B82F6' },
    { label: 'Other Essentials', amount: plan.spend_breakdown.other, color: 'bg-purple-500', barColor: '#8B5CF6' }
  ];

  return (
    <div id="plan-detail-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top back & action bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="btn-back-plan"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#1F2937] hover:text-[#0EA5A5] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D9CFC2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>

        {/* Like, Share, Save, and "Use as template" buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-like-plan"
            onClick={onToggleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-[#1F2937] border-[#D9CFC2] hover:border-rose-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{plan.likes}</span>
          </button>

          <button
            id="btn-share-plan"
            onClick={handleShare}
            className="p-2 rounded-xl border border-[#D9CFC2] bg-white hover:bg-[#EFEAE2] text-[#1F2937] transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Share trip plan"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            id="btn-save-plan"
            onClick={onToggleSave}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSaved
                ? 'bg-[#0EA5A5] text-white border-[#0EA5A5]'
                : 'bg-white text-[#1F2937] border-[#D9CFC2] hover:border-[#0EA5A5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Plus: "Use as template" button */}
          <button
            id="btn-use-as-template"
            onClick={() => onUseAsTemplate(plan)}
            className="px-4 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Use as template</span>
          </button>
        </div>
      </div>

      {/* Verified author header */}
      <div className="flex items-center gap-3 mb-4 text-xs">
        <img
          src={plan.author_avatar}
          alt={plan.author_name}
          className="w-9 h-9 rounded-full object-cover border border-[#0EA5A5]"
        />
        <div>
          <div className="flex items-center gap-1.5 font-bold text-[#1F2937]">
            <span>{plan.author_name}</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#2FBF71] bg-[#2FBF71]/10 px-2 py-0.2 rounded-md">
              <ShieldCheck className="w-3 h-3" />
              Completed & Verified Trip
            </span>
          </div>
          <span className="text-[#374151]/70">Posted on {plan.created_at} • {plan.destination_name}</span>
        </div>
      </div>

      {/* Strict Field Order on Page (3.4 d):
          1. Title
          2. Days of travel
          3. Total spend (headline number)
          4. Short description
          5. Total spend breakdown by category
          6. Flight details
          7. Day-by-day plan
          8. "What to bring" reminders and cautions
          9. Local cultural etiquette tips
      */}

      <div className="bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-xs space-y-8">
        {/* Field 1: Title */}
        <div>
          <h1 id="plan-field-1-title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F2937] font-display leading-tight">
            {plan.title}
          </h1>

          {/* Location link and operating info */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#374151]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <strong>Operating Time:</strong> All day curated route (08:00 – 22:30 daily)
            </span>
            <span className="text-[#D9CFC2]">•</span>
            <a
              id="link-google-maps-plan"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.destination_name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#FF6B4A] font-bold hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Location on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Field 2 & 3: Days of travel + Total spend (headline number) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/70">
          {/* Field 2: Days of travel */}
          <div id="plan-field-2-days" className="flex flex-col justify-center">
            <span className="text-xs font-bold text-[#0EA5A5] uppercase tracking-wider">Days of Travel</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-extrabold text-[#1F2937] font-display">{plan.days}</span>
              <span className="text-sm font-semibold text-[#374151]">Full Days / {plan.days - 1} Nights</span>
            </div>
          </div>

          {/* Field 3: Total spend (headline number) */}
          <div id="plan-field-3-spend" className="flex flex-col justify-center sm:border-l sm:border-[#D9CFC2] sm:pl-6">
            <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-wider">Total Actual Spend</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-extrabold text-[#FF6B4A] font-display">
                ${plan.total_spend.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-[#374151]">total per person</span>
            </div>
          </div>
        </div>

        {/* Field 4: Short description */}
        <div id="plan-field-4-description" className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]/70">Overview & Field Notes</h3>
          <p className="text-sm text-[#374151] leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Field 5: Total spend breakdown by category */}
        <div id="plan-field-5-breakdown" className="space-y-4">
          <h3 className="text-base font-bold text-[#1F2937] font-display flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#0EA5A5]" />
            <span>Total Spend Breakdown by Category</span>
          </h3>

          {/* Visual Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100 shadow-inner">
            {spendCategories.map((cat, idx) => {
              const pct = (cat.amount / plan.total_spend) * 100;
              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%`, backgroundColor: cat.barColor }}
                  title={`${cat.label}: $${cat.amount} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>

          {/* Breakdown Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {spendCategories.map((cat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.barColor }} />
                  <span className="text-[#374151] font-medium">{cat.label}</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-extrabold text-[#1F2937] text-sm">${cat.amount}</span>
                  <span className="text-[11px] text-[#374151]/70">
                    {((cat.amount / plan.total_spend) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field 6: Flight details — airline, and which airports were flown from/to */}
        <div id="plan-field-6-flights" className="p-5 rounded-2xl bg-[#0EA5A5]/5 border border-[#0EA5A5]/25 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A5] uppercase tracking-wider">
            <Plane className="w-4 h-4" />
            <span>Flight Details & Route Taken</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#1F2937]">{plan.flight_details.airline}</p>
              <div className="flex items-center gap-2 text-xs text-[#374151] mt-0.5">
                <span className="font-semibold text-[#086666]">{plan.flight_details.from_airport}</span>
                <span>→</span>
                <span className="font-semibold text-[#086666]">{plan.flight_details.to_airport}</span>
              </div>
            </div>

            {plan.flight_details.duration && (
              <div className="text-xs bg-white px-3 py-1.5 rounded-xl border border-[#0EA5A5]/20 font-semibold text-[#086666] shrink-0">
                {plan.flight_details.duration}
              </div>
            )}
          </div>
        </div>

        {/* Field 7: Day-by-day plan */}
        <div id="plan-field-7-daybyday" className="space-y-4">
          <h3 className="text-base font-bold text-[#1F2937] font-display">Day-by-Day Realized Itinerary</h3>

          <div className="space-y-4">
            {plan.day_by_day.map((day) => (
              <div key={day.day} className="rounded-2xl border border-[#D9CFC2] overflow-hidden">
                <div className="bg-[#FBF7F2] p-4 border-b border-[#D9CFC2] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#0EA5A5] text-white font-bold text-xs flex items-center justify-center">
                      D{day.day}
                    </span>
                    <h4 className="font-bold text-[#1F2937] text-sm">{day.title}</h4>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {day.highlights.map((h, i) => (
                      <span key={i} className="text-[11px] bg-teal-50 text-[#086666] px-2 py-0.5 rounded-md font-medium">
                        ✓ {h}
                      </span>
                    ))}
                  </div>

                  {/* Schedule items */}
                  {day.schedule.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs pl-2 border-l-2 border-[#0EA5A5]/40 py-1">
                      <span className="font-mono font-bold text-[#0EA5A5] w-12 shrink-0">{item.time}</span>
                      <div>
                        <p className="font-bold text-[#1F2937]">{item.activity}</p>
                        {item.notes && <p className="text-[#374151]/80 text-[11px] mt-0.5">{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field 8: "What to bring" reminders and cautions */}
        <div id="plan-field-8-packing-cautions" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What to bring */}
          <div className="p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/80 space-y-3">
            <h4 className="text-xs font-bold text-[#0EA5A5] uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4" />
              <span>What to Bring (Packing Checklist)</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#374151]">
              {plan.packing_list.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#0EA5A5] font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cautions */}
          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-3">
            <h4 className="text-xs font-bold text-[#E85555] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Cautions & Practical Reminders</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#374151]">
              {plan.cautions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#E85555] font-bold">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Field 9: Local cultural etiquette tips */}
        <div id="plan-field-9-etiquette" className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Local Cultural Etiquette Tips</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#374151]">
            {plan.etiquette_tips.map((tip, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/80 border border-amber-100 leading-relaxed">
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA to Use as Template */}
        <div className="pt-4 border-t border-[#EFEAE2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#1F2937]">Want to make this plan your own?</h4>
            <p className="text-xs text-[#374151]">Load these exact days, destination, budget, and activities into your timeline.</p>
          </div>
          <button
            onClick={() => onUseAsTemplate(plan)}
            className="px-6 py-3 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Copy className="w-4 h-4" />
            <span>Use as template</span>
          </button>
        </div>
      </div>
    </div>
  );
};
