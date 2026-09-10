import React from 'react';
import { Restaurant } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  ExternalLink,
  Bookmark,
  Utensils,
  Flame
} from 'lucide-react';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
}

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({
  restaurant,
  isSaved,
  onBack,
  onToggleSave
}) => {
  return (
    <div id="restaurant-detail-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top back & actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="btn-back-restaurant"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#1F2937] hover:text-[#0EA5A5] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D9CFC2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-toggle-save-rest"
            onClick={onToggleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              isSaved
                ? 'bg-[#0EA5A5] text-white border-[#0EA5A5]'
                : 'bg-white text-[#1F2937] border-[#D9CFC2] hover:border-[#0EA5A5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Saved to Trip' : 'Save Restaurant'}</span>
          </button>

          <a
            id="btn-open-maps-rest-top"
            href={restaurant.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Open in Maps</span>
          </a>
        </div>
      </div>

      {/* Title & Cuisine */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm mb-1.5">
          <span className="font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md text-xs border border-amber-200">
            {restaurant.cuisine}
          </span>
          <span className="text-[#374151]/50">•</span>
          <span className="text-[#374151] font-medium">{restaurant.destination_name}</span>
          <span className="text-[#374151]/50">•</span>
          <span className="font-bold text-[#1F2937]">{restaurant.price_level}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-display">
          {restaurant.name}
        </h1>
      </div>

      {/* Hero Image */}
      <div className="aspect-16/9 md:aspect-21/9 rounded-2xl overflow-hidden bg-[#EFEAE2] border border-[#D9CFC2] mb-8 shadow-sm">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Mandatory Facts: Hours & Location Pin (External Google Maps) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Operating Hours (Strict requirement) */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0EA5A5] mb-1">
            <Clock className="w-4 h-4" />
            <span>OPERATING HOURS</span>
          </div>
          <p className="text-xs font-semibold text-[#1F2937] leading-relaxed">
            {restaurant.operating_hours}
          </p>
        </div>

        {/* Location Pin (Strict requirement: opens external Google Maps) */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0EA5A5] mb-1">
            <MapPin className="w-4 h-4" />
            <span>LOCATION PIN</span>
          </div>
          <a
            id="link-google-maps-rest"
            href={restaurant.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B4A] hover:underline"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <p className="text-[11px] text-[#374151]/70 mt-1">Direct Google Maps routing pin</p>
        </div>

        {/* Average Budget & Meal Length */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2FBF71] mb-1">
            <Utensils className="w-4 h-4" />
            <span>PRICE & DURATION</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-[#1F2937]">~${restaurant.avg_budget}</span>
            <span className="text-xs text-[#374151]">/ person</span>
          </div>
          <p className="text-[11px] text-[#374151]/70 mt-1">Typical visit: {restaurant.avg_duration_mins} mins</p>
        </div>

        {/* Rating */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>CRITIC & GUEST SCORE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-[#1F2937]">{restaurant.rating.toFixed(2)}</span>
            <span className="text-xs text-[#374151]">/ 5.0</span>
          </div>
          <p className="text-[11px] text-[#2FBF71] font-semibold mt-1">Curated gastronomy stop</p>
        </div>
      </div>

      {/* Menu Highlights & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Menu Highlights */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1F2937] font-display">Menu Highlights</h2>
              <span className="text-xs font-semibold text-[#0EA5A5] bg-[#0EA5A5]/10 px-2.5 py-1 rounded-lg">
                Signature House Dishes
              </span>
            </div>

            <div className="space-y-4">
              {restaurant.menu_highlights.map((dish, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#1F2937]">{dish.name}</h4>
                      {dish.is_signature && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF6B4A]/15 text-[#C94324] text-[10px] font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#FF6B4A]" />
                          Signature
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#374151] mt-1 leading-relaxed">{dish.desc}</p>
                  </div>
                  <span className="text-sm font-extrabold text-[#1F2937] shrink-0 bg-white px-2.5 py-1 rounded-lg border border-[#D9CFC2]">
                    {dish.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Reviews */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <h3 className="text-base font-bold text-[#1F2937] mb-3 font-display">Diner Reviews</h3>
            <div className="space-y-4">
              {restaurant.reviews.map((rev) => (
                <div key={rev.id} className="text-xs border-b border-[#EFEAE2] pb-3 last:border-none">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <img src={rev.avatar} alt={rev.user} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold text-[#1F2937]">{rev.user}</span>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                      {rev.rating}
                    </div>
                  </div>
                  <p className="text-[#374151] italic leading-relaxed">"{rev.comment}"</p>
                  <span className="text-[10px] text-[#374151]/60 mt-1 block">{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
