import React, { useState, useRef, useEffect } from 'react';
import { Trip, ItineraryItem, DiscoverablePlace } from '../../types';
import { db } from '../../services/db';
import {
  snapMinutesTo15,
  snapTimeTo15,
  minutesToTime,
  timeToMinutes,
  formatDuration,
  generateTransportEstimate
} from '../../utils/timeUtils';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Zap,
  Star,
  Info
} from 'lucide-react';

interface ItineraryBuilderProps {
  trip: Trip;
  onSaveTrip: (updatedTrip: Trip) => void;
  onFinish: (trip: Trip) => void;
  onBack: () => void;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  trip,
  onSaveTrip,
  onFinish,
  onBack
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('Suggested');
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>(trip.itinerary || []);
  const [draggedPlace, setDraggedPlace] = useState<DiscoverablePlace | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);

  // Load discoverable places for the destination
  const destinationId = trip.destinations[0]?.toLowerCase().includes('paris')
    ? 'dest-paris'
    : 'dest-kyoto';
  const discoverablePlaces = db.getDiscoverablePlaces(destinationId);

  // Initialize auto-plan if empty and mode was 'auto'
  useEffect(() => {
    if ((!trip.itinerary || trip.itinerary.length === 0) && trip.mode === 'auto') {
      const generated = db.generateFullItinerary(destinationId, trip.days, trip.travelers);
      setItineraryItems(generated);
      const updated = { ...trip, itinerary: generated };
      db.saveTrip(updated);
      onSaveTrip(updated);
      showToast('Itinerary auto-generated with 15-min snapping & dining windows!');
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter items for the active day
  const currentDayItems = itineraryItems
    .filter(item => item.day_index === activeDayIndex)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  // Compute transports between consecutive items
  const itemsWithTransports = currentDayItems.map((item, idx) => {
    if (idx < currentDayItems.length - 1) {
      const currentEnd = timeToMinutes(item.end_time);
      const nextStart = timeToMinutes(currentDayItems[idx + 1].start_time);
      return {
        ...item,
        transport_to_next: generateTransportEstimate(nextStart, currentEnd)
      };
    }
    return { ...item, transport_to_next: undefined };
  });

  // Filter left panel discoverable places
  const filteredPlaces = discoverablePlaces.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Filter tab: "Suggested" is ALWAYS the first tab
    if (activeCategoryTab === 'Suggested') {
      return place.category === 'Suggested' || place.rating >= 4.88;
    }
    if (activeCategoryTab === 'Attractions') {
      return place.category === 'Attraction' || place.category === 'Suggested';
    }
    if (activeCategoryTab === 'Food & Drink') {
      return place.category === 'Food & Drink';
    }
    if (activeCategoryTab === 'Culture') {
      return place.category === 'Culture';
    }
    if (activeCategoryTab === 'Relaxation') {
      return place.category === 'Relaxation' || place.category === 'Nature';
    }
    if (activeCategoryTab === 'Nightlife') {
      return place.category === 'Nightlife';
    }
    return true;
  });

  // Schedule an item at a specific time (snapped to 15 minutes)
  const schedulePlaceAt = (place: DiscoverablePlace, startTime: string) => {
    const snappedStart = snapTimeTo15(startTime);
    const startMins = timeToMinutes(snappedStart);
    const duration = snapMinutesTo15(place.avg_duration_mins || 90);
    const endMins = startMins + duration;
    const snappedEnd = minutesToTime(endMins);

    const newItem: ItineraryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      trip_id: trip.id,
      day_index: activeDayIndex,
      place_id: place.id,
      place_name: place.name,
      place_type: place.category === 'Food & Drink' ? 'restaurant' : 'attraction',
      start_time: snappedStart,
      end_time: snappedEnd,
      duration_mins: duration,
      image: place.image,
      category: place.category,
      maps_url: place.maps_url,
      notes: place.description
    };

    const updated = [...itineraryItems, newItem];
    setItineraryItems(updated);
    const updatedTrip = { ...trip, itinerary: updated };
    db.saveTrip(updatedTrip);
    onSaveTrip(updatedTrip);
    showToast(`Added ${place.name} at ${snappedStart}`);
  };

  // Quick slot place to next available open hour
  const handleQuickAdd = (place: DiscoverablePlace) => {
    let nextAvailableMin = 540; // 09:00
    if (currentDayItems.length > 0) {
      const lastItem = currentDayItems[currentDayItems.length - 1];
      const lastEnd = timeToMinutes(lastItem.end_time);
      nextAvailableMin = Math.max(540, lastEnd + 30); // 30 min after last
    }
    if (nextAvailableMin >= 1380) nextAvailableMin = 540; // wrap if past 23:00

    schedulePlaceAt(place, minutesToTime(snapMinutesTo15(nextAvailableMin)));
  };

  // Adjust duration via bottom drag handle or buttons (15-min snapping)
  const handleResizeDuration = (itemId: string, deltaMins: number) => {
    const updated = itineraryItems.map(item => {
      if (item.id !== itemId) return item;
      const currentDuration = item.duration_mins || 60;
      const newDuration = Math.max(30, snapMinutesTo15(currentDuration + deltaMins));
      const startMins = timeToMinutes(item.start_time);
      const newEndMins = startMins + newDuration;
      return {
        ...item,
        duration_mins: newDuration,
        end_time: minutesToTime(newEndMins)
      };
    });

    setItineraryItems(updated);
    const updatedTrip = { ...trip, itinerary: updated };
    db.saveTrip(updatedTrip);
    onSaveTrip(updatedTrip);
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    const updated = itineraryItems.filter(i => i.id !== itemId);
    setItineraryItems(updated);
    const updatedTrip = { ...trip, itinerary: updated };
    db.saveTrip(updatedTrip);
    onSaveTrip(updatedTrip);
  };

  // "Help me fill the free time" (Section 3.7)
  const handleFillFreeTime = () => {
    const filledDayItems = db.fillFreeTimeForDay(currentDayItems, destinationId, activeDayIndex);
    const otherDayItems = itineraryItems.filter(i => i.day_index !== activeDayIndex);
    const merged = [...otherDayItems, ...filledDayItems];
    setItineraryItems(merged);
    const updatedTrip = { ...trip, itinerary: merged };
    db.saveTrip(updatedTrip);
    onSaveTrip(updatedTrip);
    showToast('Auto-filled empty schedule gaps with 15-minute snapping!');
  };

  // Generate 24-hour time slots (every 60 mins marker with 15m sub-ticks)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div id="itinerary-builder-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1F2937] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-[#0EA5A5] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-[#0EA5A5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Trip title, destination, and day tabs */}
      <div className="bg-white rounded-3xl border border-[#D9CFC2] p-5 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1">
              <button
                onClick={onBack}
                className="text-[#0EA5A5] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trip Overview</span>
              </button>
              <span className="text-[#374151]/40">•</span>
              <span className="text-[#374151] font-semibold">{trip.destinations.join(' → ')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] font-display">
              {trip.title}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              id="btn-save-itinerary"
              onClick={() => {
                db.saveTrip({ ...trip, itinerary: itineraryItems });
                showToast('Trip itinerary saved securely.');
              }}
              className="px-4 py-2 rounded-xl border border-[#0EA5A5] text-[#0EA5A5] hover:bg-[#0EA5A5] hover:text-white font-bold text-xs transition-all cursor-pointer"
            >
              Save Progress
            </button>

            <button
              id="btn-finish-itinerary"
              onClick={() => onFinish({ ...trip, itinerary: itineraryItems })}
              className="px-5 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Finish & View My Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Selector Bar */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-1">
          {Array.from({ length: trip.days }).map((_, dIdx) => (
            <button
              key={dIdx}
              id={`tab-day-${dIdx + 1}`}
              onClick={() => setActiveDayIndex(dIdx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                activeDayIndex === dIdx
                  ? 'bg-[#0EA5A5] text-white shadow-sm shadow-[#0EA5A5]/25'
                  : 'bg-[#FBF7F2] text-[#1F2937] border border-[#D9CFC2] hover:border-[#0EA5A5]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {dIdx + 1}</span>
            </button>
          ))}
          <span className="text-xs text-[#374151]/70 ml-2 font-medium">
            (15-min snapping enforced)
          </span>
        </div>
      </div>

      {/* Two-Panel Layout (Section 3.7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL (~1/3 width: 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#D9CFC2] p-5 shadow-xs flex flex-col max-h-[820px]">
          {/* Header & Search */}
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#1F2937] font-display mb-2">
              Discover & Add Places
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/60" />
              <input
                id="input-search-places"
                type="text"
                placeholder="Search sights, restaurants, temples..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-[#D9CFC2] text-xs focus:outline-none focus:border-[#0EA5A5] bg-[#FBF7F2]"
              />
            </div>
          </div>

          {/* Filter Tabs: First filter tab is ALWAYS "Suggested" */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-[#EFEAE2]">
            {(
              [
                'Suggested', // ALWAYS first!
                'Attractions',
                'Food & Drink',
                'Culture',
                'Relaxation',
                'Nightlife'
              ] as const
            ).map((tab, idx) => (
              <button
                key={tab}
                id={`filter-tab-${idx}`}
                onClick={() => setActiveCategoryTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategoryTab === tab
                    ? 'bg-[#0EA5A5] text-white'
                    : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Discoverable Places List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map(place => (
                <div
                  key={place.id}
                  id={`place-card-${place.id}`}
                  draggable
                  onDragStart={() => setDraggedPlace(place)}
                  onDragEnd={() => setDraggedPlace(null)}
                  className="p-3 rounded-2xl border border-[#D9CFC2]/70 bg-[#FBF7F2] hover:border-[#0EA5A5] transition-all cursor-grab active:cursor-grabbing shadow-2xs group"
                >
                  <div className="flex gap-3">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-18 h-18 rounded-xl object-cover shrink-0 bg-[#EFEAE2]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-[#D9CFC2] text-[#374151]">
                          {place.category}
                        </span>
                        <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{place.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-[#1F2937] truncate mt-1 group-hover:text-[#0EA5A5] transition-colors">
                        {place.name}
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] text-[#374151]/80 mt-1">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-[#0EA5A5]" />
                          <span>{formatDuration(place.avg_duration_mins)}</span>
                        </span>
                        {place.energy_level && (
                          <span className="flex items-center text-amber-500">
                            <Zap className="w-3 h-3 fill-amber-500" />
                            <span className="text-[10px] text-[#1F2937] font-semibold ml-0.5">
                              {place.energy_level}/5
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions on place card */}
                  <div className="mt-2 pt-2 border-t border-[#D9CFC2]/50 flex items-center justify-between text-[11px]">
                    <a
                      href={place.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0EA5A5] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Maps</span>
                    </a>

                    <button
                      id={`btn-add-${place.id}`}
                      onClick={() => handleQuickAdd(place)}
                      className="px-2.5 py-1 rounded-lg bg-[#0EA5A5] hover:bg-[#0B8585] text-white font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Day {activeDayIndex + 1}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-center text-[#374151]/70 py-8">
                No places found matching your search.
              </p>
            )}
          </div>

          {/* Section 3.7: "Help me fill the free time" button below the list */}
          <div className="pt-4 mt-3 border-t border-[#EFEAE2]">
            <button
              id="btn-help-fill-free-time"
              onClick={handleFillFreeTime}
              className="w-full py-3 rounded-2xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Help me fill the free time</span>
            </button>
            <p className="text-[10px] text-center text-[#374151]/70 mt-1.5">
              Auto-schedules unscheduled spots into open time gaps (15-min snapping)
            </p>
          </div>
        </div>

        {/* RIGHT PANEL (~2/3 width: 8 cols) - Vertical 24-hour timeline */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D9CFC2] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EFEAE2]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0EA5A5]" />
              <h2 className="text-base font-bold text-[#1F2937] font-display">
                Day {activeDayIndex + 1} • 24-Hour Timeline
              </h2>
            </div>
            <span className="text-xs font-bold text-[#0EA5A5] bg-[#0EA5A5]/10 px-3 py-1 rounded-xl">
              {currentDayItems.length} Scheduled Activities
            </span>
          </div>

          {/* Timeline View */}
          <div
            id="vertical-24h-timeline"
            className="relative border-l-2 border-[#0EA5A5]/30 ml-8 sm:ml-12 pl-4 sm:pl-6 space-y-6 min-h-[600px] py-4"
          >
            {/* Hour marker background grid */}
            {itemsWithTransports.length === 0 ? (
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  if (draggedPlace) {
                    schedulePlaceAt(draggedPlace, '09:00');
                  }
                }}
                className="py-16 text-center border-2 border-dashed border-[#D9CFC2] rounded-3xl bg-[#FBF7F2]/60"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1F2937]">This day’s timeline is clear</h4>
                <p className="text-xs text-[#374151] mt-1 max-w-sm mx-auto mb-4">
                  Drag and drop places from the left panel onto this timeline, or click "+ Add to Day {activeDayIndex + 1}".
                </p>
                <button
                  onClick={handleFillFreeTime}
                  className="px-4 py-2 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold shadow-sm"
                >
                  Auto-fill with "Help me plan"
                </button>
              </div>
            ) : (
              itemsWithTransports.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {/* Scheduled Place Card on Timeline */}
                  <div
                    id={`scheduled-item-${item.id}`}
                    className="relative group bg-[#FBF7F2] rounded-2xl border-2 border-[#D9CFC2] hover:border-[#0EA5A5] p-4 transition-all shadow-xs"
                  >
                    {/* Time snapping node on the left ruler */}
                    <div className="absolute -left-[25px] sm:-left-[33px] top-4 w-4 h-4 rounded-full bg-[#0EA5A5] ring-4 ring-[#FBF7F2] border-2 border-white" />

                    {/* Time Label */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-[#0EA5A5] bg-white px-2.5 py-1 rounded-md border border-[#D9CFC2]/60">
                          {item.start_time} – {item.end_time}
                        </span>
                        <span className="text-[11px] font-semibold text-[#374151]/70">
                          ({formatDuration(item.duration_mins)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.maps_url && (
                          <a
                            href={item.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#0EA5A5] hover:underline flex items-center gap-1"
                            title="Open in Google Maps"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Maps</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-[#374151]/60 hover:text-[#E85555] p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.place_name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#EFEAE2]"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#1F2937]">{item.place_name}</h4>
                        {item.notes && (
                          <p className="text-xs text-[#374151] mt-0.5 leading-relaxed line-clamp-2">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Edge Resize Handle (Section 3.7: user drags handle near bottom edge to resize in 15-min increments) */}
                    <div className="mt-3 pt-2 border-t border-[#D9CFC2]/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#374151]/70 flex items-center gap-1 font-semibold">
                        <GripVertical className="w-3.5 h-3.5 text-[#0EA5A5]" />
                        <span>Resize Duration (15-min snap):</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          id={`btn-shrink-${item.id}`}
                          onClick={() => handleResizeDuration(item.id, -15)}
                          disabled={item.duration_mins <= 30}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#D9CFC2] text-xs font-bold text-[#1F2937] hover:bg-[#EFEAE2] disabled:opacity-40 cursor-pointer"
                          title="Decrease 15 minutes"
                        >
                          -15m
                        </button>
                        <span className="font-mono text-xs font-bold text-[#0EA5A5] px-1">
                          {formatDuration(item.duration_mins)}
                        </span>
                        <button
                          id={`btn-expand-${item.id}`}
                          onClick={() => handleResizeDuration(item.id, 15)}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#D9CFC2] text-xs font-bold text-[#1F2937] hover:bg-[#EFEAE2] cursor-pointer"
                          title="Increase 15 minutes"
                        >
                          +15m
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transportation Suggestion Between Consecutive Places (Section 3.7) */}
                  {item.transport_to_next && (
                    <div className="my-2 ml-4 flex items-center gap-2 text-xs font-semibold text-[#086666] bg-[#0EA5A5]/10 px-3 py-1.5 rounded-xl border border-[#0EA5A5]/25 self-start w-fit">
                      <Navigation className="w-3.5 h-3.5 text-[#0EA5A5]" />
                      <span>
                        {item.transport_to_next.mode === 'walk' && '🚶 '}
                        {item.transport_to_next.mode === 'subway' && '🚇 '}
                        {item.transport_to_next.mode === 'taxi' && '🚕 '}
                        {item.transport_to_next.detail} (~{item.transport_to_next.duration_mins} min transit)
                      </span>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}

            {/* Drop zone at end of day */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (draggedPlace) {
                  handleQuickAdd(draggedPlace);
                }
              }}
              className="py-3 px-4 rounded-xl border border-dashed border-[#D9CFC2] hover:border-[#0EA5A5] text-center text-xs text-[#374151]/70 bg-[#FBF7F2]/40"
            >
              Drop place cards here to append to Day {activeDayIndex + 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
