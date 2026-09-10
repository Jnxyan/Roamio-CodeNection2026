import React, { useState, useEffect } from 'react';
import { Trip } from '../../types';
import { db, getTripGallery, getTripCoverPhoto } from '../../services/db';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Plane,
  Hotel as HotelIcon,
  CheckSquare,
  Square,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Sliders,
  Pencil,
  Trash2,
  Users,
  Camera,
  Compass,
  Navigation
} from 'lucide-react';

interface TripDetailProps {
  trip: Trip;
  onBack: () => void;
  onOpenTimeline: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  onTripUpdated?: (updatedTrip: Trip) => void;
}

export const TripDetail: React.FC<TripDetailProps> = ({
  trip,
  onBack,
  onOpenTimeline,
  onDelete,
  onTripUpdated
}) => {
  const [currentTrip, setCurrentTrip] = useState<Trip>(trip);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    setCurrentTrip(trip);
  }, [trip]);

  // Gallery images
  const galleryImages = getTripGallery(currentTrip);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    galleryImages[0] || getTripCoverPhoto(currentTrip)
  );

  useEffect(() => {
    const imgs = getTripGallery(currentTrip);
    setSelectedPhoto(imgs[0] || getTripCoverPhoto(currentTrip));
  }, [currentTrip]);

  // Toggle packing checklist item
  const handleToggleChecklist = (itemId: string) => {
    const currentList = currentTrip.packing_checklist || [];
    const updatedChecklist = currentList.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedTrip = { ...currentTrip, packing_checklist: updatedChecklist };
    db.saveTrip(updatedTrip);
    setCurrentTrip(updatedTrip);
    if (onTripUpdated) onTripUpdated(updatedTrip);
  };

  // Add packing item
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `pk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    const currentList = currentTrip.packing_checklist || [];
    const updatedTrip = {
      ...currentTrip,
      packing_checklist: [...currentList, newItem]
    };
    db.saveTrip(updatedTrip);
    setCurrentTrip(updatedTrip);
    if (onTripUpdated) onTripUpdated(updatedTrip);
    setNewChecklistText('');
  };

  // Calculate budget vs actual spend
  const estimatedActualSpend =
    (currentTrip.combined_package?.total_combined_price || 0) +
    (currentTrip.days || 1) * (currentTrip.budget_amount || 150);

  const targetBudget =
    (currentTrip.days || 1) *
    (currentTrip.budget_amount || 150) *
    (currentTrip.travelers?.length || 1);

  const isOverBudget = estimatedActualSpend > targetBudget && targetBudget > 0;

  const totalPacking = currentTrip.packing_checklist?.length || 0;
  const packedCount = currentTrip.packing_checklist?.filter(i => i.completed).length || 0;
  const primaryDest = currentTrip.destinations?.[0] || 'Destination';

  return (
    <div id={`trip-detail-${currentTrip.id}`} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          id="btn-back-to-my-plans"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D9CFC2] bg-white text-xs font-bold text-[#1F2937] hover:bg-[#FBF7F2] transition-colors cursor-pointer self-start shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Plans</span>
        </button>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Edit Plan button */}
          <button
            id="btn-edit-plan-from-detail"
            onClick={() => onOpenTimeline(currentTrip)}
            className="px-4 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Edit itinerary and schedule"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </button>

          {/* Delete Trip button */}
          <button
            id="btn-delete-trip-from-detail"
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${currentTrip.title}"?`)) {
                onDelete(currentTrip.id);
              }
            }}
            className="px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            title="Delete this trip"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Picture Gallery */}
      <div id="trip-picture-gallery" className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
        <div className="lg:col-span-3 aspect-16/9 rounded-2xl overflow-hidden bg-[#EFEAE2] border border-[#D9CFC2]/70 shadow-sm relative group">
          <img
            src={selectedPhoto}
            alt={currentTrip.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium shadow-sm">
            <Camera className="w-3.5 h-3.5 text-[#0EA5A5]" />
            <span>Trip Photo Gallery</span>
            <span className="text-white/70 ml-1">
              ({galleryImages.indexOf(selectedPhoto) + 1} / {galleryImages.length})
            </span>
          </div>
        </div>

        {/* Thumbnail Selector */}
        <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedPhoto(img)}
              className={`relative flex-1 min-w-[84px] aspect-16/9 lg:aspect-auto lg:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedPhoto === img
                  ? 'border-[#0EA5A5] ring-2 ring-[#0EA5A5]/30'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
              title={`View photo ${i + 1}`}
            >
              <img src={img} alt={`${currentTrip.title} photo ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Trip Information Card */}
      <div className="bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-xs space-y-8 mb-8">
        {/* Title & Route */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#0EA5A5] text-white">
              Personal Plan
            </span>
            <span className="text-[#374151]/50">•</span>
            <span className="text-xs text-[#086666] font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <span>{primaryDest}</span>
            </span>
          </div>

          <h1 id="trip-detail-title" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F2937] font-display leading-tight">
            {currentTrip.title}
          </h1>

          {/* Route info */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#374151]">
            <span className="flex items-center gap-1.5 font-medium">
              <Navigation className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <strong>Origin:</strong> {currentTrip.origin.city}{currentTrip.origin.country ? `, ${currentTrip.origin.country}` : ''}
            </span>
            <span className="text-[#D9CFC2]">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <strong>Dates:</strong> {currentTrip.start_date} → {currentTrip.end_date}
            </span>
          </div>
        </div>

        {/* 4-Stat Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/70">
          <div>
            <span className="text-[11px] font-bold text-[#0EA5A5] uppercase tracking-wider block">Duration</span>
            <span className="text-2xl font-extrabold text-[#1F2937] font-display block mt-1">
              {currentTrip.days} Days
            </span>
            <span className="text-[11px] text-[#374151]">
              {Math.max(1, currentTrip.days - 1)} Nights Stay
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#FF6B4A] uppercase tracking-wider block">Estimated Spend</span>
            <span className="text-2xl font-extrabold text-[#FF6B4A] font-display block mt-1">
              ${estimatedActualSpend.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#374151]">total trip est.</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#0EA5A5] uppercase tracking-wider block">Travelers</span>
            <span className="text-2xl font-extrabold text-[#1F2937] font-display block mt-1">
              {currentTrip.travelers?.length || 1}
            </span>
            <span className="text-[11px] text-[#374151]">
              {currentTrip.travelers?.[0]?.name || 'Party'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#0EA5A5] uppercase tracking-wider block">Activities</span>
            <span className="text-2xl font-extrabold text-[#1F2937] font-display block mt-1">
              {currentTrip.itinerary?.length || 0}
            </span>
            <span className="text-[11px] text-[#374151]">scheduled stops</span>
          </div>
        </div>

        {/* Travelers party breakdown if multiple or interests */}
        {currentTrip.travelers && currentTrip.travelers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]/70 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <span>Traveler Profiles & Interests</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentTrip.travelers.map((traveler, idx) => (
                <div key={traveler.id || idx} className="p-3.5 rounded-xl bg-white border border-[#D9CFC2]/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1F2937] text-sm">{traveler.name}</span>
                    <span className="text-[11px] text-[#374151]/70 font-semibold">{traveler.age} yrs old</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(traveler.interests || []).map((interest, iIdx) => (
                      <span key={iIdx} className="px-2 py-0.5 rounded-md bg-[#0EA5A5]/10 text-[#086666] text-[10px] font-semibold">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget vs Actual Spend Tracker */}
        <div id="trip-budget-tracker" className="p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#0EA5A5]" />
              <h3 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                Budget vs. Actual Spend Tracker
              </h3>
            </div>

            {isOverBudget ? (
              <span
                id="badge-trip-over-budget"
                className="px-2.5 py-1 rounded-lg bg-red-100 text-[#E85555] text-xs font-bold flex items-center gap-1 border border-red-200"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Over Budget Target</span>
              </span>
            ) : (
              <span
                id="badge-trip-within-budget"
                className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#2FBF71] text-xs font-bold flex items-center gap-1 border border-emerald-200"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Within Budget</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#D9CFC2]/70">
              <span className="text-[11px] text-[#374151]/70 font-semibold block">Target Budget</span>
              <span className="text-2xl font-extrabold text-[#1F2937] font-display block mt-0.5">
                ${targetBudget.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#374151] block mt-0.5">
                (${currentTrip.budget_amount}/day × {currentTrip.days} days × {currentTrip.travelers?.length || 1} travelers)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#D9CFC2]/70">
              <span className="text-[11px] text-[#374151]/70 font-semibold block">Estimated Actual Spend</span>
              <span
                className={`text-2xl font-extrabold font-display block mt-0.5 ${
                  isOverBudget ? 'text-[#E85555]' : 'text-[#FF6B4A]'
                }`}
              >
                ${estimatedActualSpend.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#374151] block mt-0.5">
                (Includes flight, accommodation, & daily spend)
              </span>
            </div>
          </div>
        </div>

        {/* Day-by-Day Schedule & Locations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1F2937] font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0EA5A5]" />
              <span>Day-by-Day Schedule & Locations</span>
            </h3>
            <button
              onClick={() => onOpenTimeline(currentTrip)}
              className="text-xs font-bold text-[#0EA5A5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>Customize in Timeline</span>
            </button>
          </div>

          {(!currentTrip.itinerary || currentTrip.itinerary.length === 0) ? (
            <div className="text-center p-6 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/60">
              <p className="text-xs text-[#374151] italic mb-3">
                No timeline items added yet. Click below to launch the timeline builder and schedule places.
              </p>
              <button
                onClick={() => onOpenTimeline(currentTrip)}
                className="px-4 py-2 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Timeline Builder</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: currentTrip.days || 1 }).map((_, dIdx) => {
                const dayItems = (currentTrip.itinerary || []).filter(i => i.day_index === dIdx);
                return (
                  <div key={dIdx} className="rounded-2xl border border-[#D9CFC2] overflow-hidden shadow-2xs">
                    <div className="bg-[#FBF7F2] px-4 py-3 border-b border-[#D9CFC2] flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#0EA5A5]">
                        Day {dIdx + 1}
                      </span>
                      <span className="text-[11px] text-[#374151] font-semibold">
                        {dayItems.length} {dayItems.length === 1 ? 'activity' : 'activities'}
                      </span>
                    </div>

                    <div className="p-3 sm:p-4 space-y-2.5">
                      {dayItems.length === 0 ? (
                        <p className="text-xs text-[#374151]/70 italic py-2">
                          Free day / open schedule. Click "Customize in Timeline" to add stops.
                        </p>
                      ) : (
                        dayItems.map(item => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs p-3 rounded-xl bg-white border border-[#EFEAE2] hover:border-[#0EA5A5]/40 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-mono font-bold text-[#0EA5A5] w-24 shrink-0 bg-[#0EA5A5]/10 px-2 py-1 rounded-md text-center">
                                {item.start_time} - {item.end_time}
                              </span>
                              <div>
                                <p className="font-bold text-[#1F2937] text-sm">{item.place_name}</p>
                                {item.notes && (
                                  <p className="text-[11px] text-[#374151]/70 mt-0.5">{item.notes}</p>
                                )}
                                {item.transport_to_next && (
                                  <span className="inline-block mt-1 text-[10px] text-[#086666] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                    Next: {item.transport_to_next.detail} ({item.transport_to_next.duration_mins}m)
                                  </span>
                                )}
                              </div>
                            </div>

                            {item.maps_url && (
                              <a
                                href={item.maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#FF6B4A] hover:underline flex items-center gap-1 shrink-0 font-bold text-xs self-start sm:self-auto bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Google Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Flight & Hotel Details (Curated Package) */}
        {currentTrip.combined_package && (
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
                    href={currentTrip.combined_package.flight.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF6B4A] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Book Airline</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="font-bold text-[#1F2937] text-sm">
                  {currentTrip.combined_package.flight.airline} ({currentTrip.combined_package.flight.flight_no})
                </p>
                <p className="text-[#374151]">
                  {currentTrip.combined_package.flight.departure_airport} → {currentTrip.combined_package.flight.arrival_airport}
                </p>
                <p className="text-[#374151]/80">
                  Duration: {currentTrip.combined_package.flight.duration} • ${currentTrip.combined_package.flight.price}
                </p>
              </div>

              {/* Hotel details */}
              <div className="p-4 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0EA5A5] uppercase">Hotel Stay</span>
                  <a
                    href={currentTrip.combined_package.hotel.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF6B4A] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Book Hotel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="font-bold text-[#1F2937] text-sm">
                  {currentTrip.combined_package.hotel.hotel_name}
                </p>
                <p className="text-[#374151]">
                  {currentTrip.combined_package.hotel.room_type}
                </p>
                <p className="text-[#374151]/80">
                  ${currentTrip.combined_package.hotel.price_per_night}/night • Est. ${currentTrip.combined_package.hotel.total_hotel_price} total
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Packing Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1F2937] font-display flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#0EA5A5]" />
              <span>Packing Checklist</span>
            </h3>
            <span className="text-xs font-semibold text-[#086666] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
              {packedCount} of {totalPacking} packed
            </span>
          </div>

          <div className="space-y-2">
            {(currentTrip.packing_checklist || []).map(item => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 cursor-pointer hover:bg-[#EFEAE2]/60 transition-colors"
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
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add item to your packing list..."
              value={newChecklistText}
              onChange={e => setNewChecklistText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#D9CFC2] text-xs bg-white focus:outline-none focus:border-[#0EA5A5]"
            />
            <button
              onClick={handleAddChecklistItem}
              className="px-5 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Cautions & Trip Reminders */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Cautions & Trip Reminders</span>
          </h3>
          <ul className="space-y-2 text-xs text-[#374151]">
            {(currentTrip.cautions || []).map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span className="leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
