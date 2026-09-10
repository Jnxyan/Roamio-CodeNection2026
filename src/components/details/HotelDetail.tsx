import React, { useState } from 'react';
import { Hotel } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

interface HotelDetailProps {
  hotel: Hotel;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
}

export const HotelDetail: React.FC<HotelDetailProps> = ({
  hotel,
  isSaved,
  onBack,
  onToggleSave
}) => {
  const [selectedRoom, setSelectedRoom] = useState(hotel.room_types[0]);

  return (
    <div id="hotel-detail-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top back & actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="btn-back-hotel"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#1F2937] hover:text-[#0EA5A5] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D9CFC2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-toggle-save-hotel"
            onClick={onToggleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              isSaved
                ? 'bg-[#0EA5A5] text-white border-[#0EA5A5]'
                : 'bg-white text-[#1F2937] border-[#D9CFC2] hover:border-[#0EA5A5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Saved to Trip' : 'Save Hotel'}</span>
          </button>

          <a
            id="btn-book-hotel-top"
            href={hotel.booking_link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Book Directly</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Hotel Title & Badge */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm mb-1.5">
          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md text-xs border border-indigo-200">
            Accommodations
          </span>
          <span className="text-[#374151]/50">•</span>
          <span className="text-[#374151] font-medium">{hotel.destination_name}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-display">
          {hotel.name}
        </h1>
      </div>

      {/* Hero Image */}
      <div className="aspect-16/9 md:aspect-21/9 rounded-2xl overflow-hidden bg-[#EFEAE2] border border-[#D9CFC2] mb-8 shadow-sm">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Mandatory Facts: Hours & Location Deep Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Operating Hours / Check-in */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0EA5A5] mb-1">
            <Clock className="w-4 h-4" />
            <span>OPERATING HOURS</span>
          </div>
          <p className="text-xs font-semibold text-[#1F2937] leading-relaxed">
            {hotel.operating_hours}
          </p>
        </div>

        {/* Location deep link to Google Maps */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0EA5A5] mb-1">
            <MapPin className="w-4 h-4" />
            <span>LOCATION</span>
          </div>
          <a
            id="link-google-maps-hotel"
            href={hotel.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B4A] hover:underline"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <p className="text-[11px] text-[#374151]/70 mt-1">Direct navigation link</p>
        </div>

        {/* Pricing */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2FBF71] mb-1">
            <DollarSign className="w-4 h-4" />
            <span>RATE & PRICING</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#1F2937]">
              ${hotel.pricing.per_night}
            </span>
            <span className="text-xs text-[#374151]">/ night</span>
          </div>
          <p className="text-[11px] text-[#374151]/70 mt-1">Est. 5-night stay: ${hotel.pricing.per_night * 5}</p>
        </div>

        {/* Guest Rating */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>GUEST RATING</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-[#1F2937]">{hotel.rating.toFixed(2)}</span>
            <span className="text-xs text-[#374151]">({hotel.reviews_count} reviews)</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#2FBF71] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Luxury Stay</span>
          </div>
        </div>
      </div>

      {/* Main Content: Room Types & Amenities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Room Types */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <h2 className="text-lg font-bold text-[#1F2937] mb-4 font-display">Available Room Types</h2>
            <div className="space-y-3">
              {hotel.room_types.map((room, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedRoom === room
                      ? 'border-[#0EA5A5] bg-[#0EA5A5]/5 ring-1 ring-[#0EA5A5]'
                      : 'border-[#D9CFC2]/70 hover:border-[#0EA5A5]/60 bg-[#FBF7F2]'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2937]">{room}</h4>
                    <p className="text-xs text-[#374151]/70 mt-0.5">King or Twin configuration • Ensuite Bath • City/Garden View</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#FF6B4A]">
                      ${hotel.pricing.per_night + idx * 45}
                    </span>
                    <span className="text-[11px] text-[#374151] block">/ night</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotel Amenities */}
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <h2 className="text-lg font-bold text-[#1F2937] mb-4 font-display">Featured Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hotel.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#1F2937] p-2.5 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60">
                  <CheckCircle2 className="w-4 h-4 text-[#0EA5A5] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2] sticky top-24 shadow-xs">
            <h3 className="text-base font-bold text-[#1F2937] mb-2 font-display">Direct Official Booking</h3>
            <p className="text-xs text-[#374151]/80 leading-relaxed mb-4">
              Roamio deep-links directly to official booking portals and hotel partners without hidden agency markups.
            </p>

            <div className="p-3.5 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 mb-5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#374151]">Selected:</span>
                <span className="font-bold text-[#1F2937]">{selectedRoom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#374151]">Cancellation:</span>
                <span className="font-bold text-[#2FBF71]">Free until 48h prior</span>
              </div>
            </div>

            <a
              id="btn-hotel-direct-book"
              href={hotel.booking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Book on Official Site</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
