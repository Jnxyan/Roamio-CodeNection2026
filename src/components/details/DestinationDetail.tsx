import React, { useState } from 'react';
import { Destination } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Star,
  Zap,
  Clock,
  ExternalLink,
  Compass,
  Bookmark,
  Calendar,
  Share2,
  CheckCircle2
} from 'lucide-react';

interface DestinationDetailProps {
  destination: Destination;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
  onPlanTripHere: (destination: Destination) => void;
}

export const DestinationDetail: React.FC<DestinationDetailProps> = ({
  destination,
  isSaved,
  onBack,
  onToggleSave,
  onPlanTripHere
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(destination.cover_photo);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="destination-detail-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top back & actions bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="btn-back-destination"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#1F2937] hover:text-[#0EA5A5] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D9CFC2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-[#D9CFC2] bg-white hover:bg-[#EFEAE2] text-[#1F2937] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Share destination link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            id="btn-toggle-save-dest"
            onClick={onToggleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              isSaved
                ? 'bg-[#0EA5A5] text-white border-[#0EA5A5]'
                : 'bg-white text-[#1F2937] border-[#D9CFC2] hover:border-[#0EA5A5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Saved to Trip' : 'Save'}</span>
          </button>

          <button
            id="btn-plan-trip-dest"
            onClick={() => onPlanTripHere(destination)}
            className="px-4 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Plan Trip Here</span>
          </button>
        </div>
      </div>

      {/* Main Headline & Location Meta */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
          <span className="font-semibold text-[#0EA5A5] bg-[#0EA5A5]/10 px-2.5 py-0.5 rounded-md">
            Destination Guide
          </span>
          <span className="text-[#374151]/50">•</span>
          <span className="text-[#374151] font-medium">{destination.city}, {destination.country}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F2937] font-display">
          {destination.name}
        </h1>
      </div>

      {/* Hero Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
        <div className="lg:col-span-3 aspect-16/9 rounded-2xl overflow-hidden bg-[#EFEAE2] border border-[#D9CFC2]/70 shadow-sm">
          <img
            src={selectedPhoto}
            alt={destination.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>
        <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {destination.gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedPhoto(img)}
              className={`relative flex-1 aspect-16/9 lg:aspect-auto lg:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedPhoto === img
                  ? 'border-[#0EA5A5] ring-2 ring-[#0EA5A5]/30'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Gallery view ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Key Quick Facts: Hours, Location Deep Link, Energy, Rating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        {/* Operating Hours (Strict Requirement) */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A5] mb-1">
            <Clock className="w-4 h-4" />
            <span>OPERATING HOURS</span>
          </div>
          <p className="text-xs font-semibold text-[#1F2937] leading-relaxed">
            {destination.operating_hours}
          </p>
        </div>

        {/* Location deep link (Strict Requirement: External Google Maps) */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A5] mb-1">
            <MapPin className="w-4 h-4" />
            <span>LOCATION</span>
          </div>
          <a
            id="link-google-maps-dest"
            href={destination.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B4A] hover:underline"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <p className="text-[11px] text-[#374151]/70 mt-1">Deep-links to external Google Maps navigation</p>
        </div>

        {/* Energy Scale: 5 lightning bolts */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>ENERGY REQUIRED</span>
          </div>
          <div className="flex items-center gap-1 my-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <Zap
                key={lvl}
                className={`w-5 h-5 ${
                  lvl <= destination.energy_level
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-[#1F2937] ml-2">
              {destination.energy_level} / 5
            </span>
          </div>
          <p className="text-[11px] text-[#374151]/70">
            {destination.energy_level >= 4
              ? 'Active walking & exploration'
              : destination.energy_level === 3
              ? 'Moderate pace & temple walks'
              : 'Relaxed & contemplative'}
          </p>
        </div>

        {/* Rating & Average Stay */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2FBF71] mb-1">
            <Star className="w-4 h-4 fill-[#2FBF71] text-[#2FBF71]" />
            <span>RATING & DURATION</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-[#1F2937]">{destination.rating.toFixed(2)}</span>
            <span className="text-xs text-[#374151]">({destination.reviews_count} reviews)</span>
          </div>
          <p className="text-[11px] text-[#374151]/70 mt-1">
            Recommended duration: <strong className="text-[#1F2937]">{destination.typical_days} days</strong>
          </p>
        </div>
      </div>

      {/* Description & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <h2 className="text-lg font-bold text-[#1F2937] mb-3 font-display">About the Destination</h2>
            <p className="text-sm text-[#374151] leading-relaxed">
              {destination.short_description}
            </p>

            <h3 className="text-sm font-bold text-[#1F2937] mt-6 mb-3">Popular Activities</h3>
            <div className="flex flex-wrap gap-2">
              {destination.activities.map((act, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2] text-xs font-semibold text-[#1F2937] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>{act}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Full Itinerary Example */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1F2937] font-display">Example Itinerary</h2>
              <span className="text-xs font-semibold text-[#0EA5A5] bg-[#0EA5A5]/10 px-2.5 py-1 rounded-lg">
                Curated 3-Day Sample
              </span>
            </div>
            <div className="space-y-4">
              {destination.itinerary_example.map((day) => (
                <div key={day.day} className="p-4 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#0EA5A5] text-white text-xs font-bold flex items-center justify-center">
                      {day.day}
                    </span>
                    <h4 className="text-sm font-bold text-[#1F2937]">{day.title}</h4>
                  </div>
                  <ul className="pl-8 list-disc space-y-1 text-xs text-[#374151]">
                    {day.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Budget Breakdown & Reviews */}
        <div className="space-y-6">
          {/* Average Budget Tiers */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <h3 className="text-sm font-bold text-[#1F2937] mb-3">Est. Daily Budget per Person</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF7F2] text-xs border border-[#D9CFC2]/50">
                <span className="font-semibold text-[#374151]">Backpacker</span>
                <span className="font-bold text-[#1F2937]">${destination.avg_budget_tiers.backpacker}/day</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0EA5A5]/10 text-xs border border-[#0EA5A5]/30">
                <span className="font-bold text-[#086666]">Balanced (Recommended)</span>
                <span className="font-extrabold text-[#086666]">${destination.avg_budget_tiers.balanced}/day</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF7F2] text-xs border border-[#D9CFC2]/50">
                <span className="font-semibold text-[#374151]">Luxury</span>
                <span className="font-bold text-[#1F2937]">${destination.avg_budget_tiers.luxury}/day</span>
              </div>
            </div>
          </div>

          {/* User Reviews */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <h3 className="text-sm font-bold text-[#1F2937] mb-3">Traveler Reviews</h3>
            <div className="space-y-3">
              {destination.reviews.map((rev) => (
                <div key={rev.id} className="text-xs border-b border-[#EFEAE2] pb-3 last:border-none">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <img src={rev.avatar} alt={rev.user} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold text-[#1F2937]">{rev.user}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span className="font-bold ml-0.5">{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-[#374151] italic leading-relaxed">"{rev.comment}"</p>
                  <span className="text-[10px] text-[#374151]/60 mt-0.5 block">{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
