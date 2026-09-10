import React, { useState, useRef, useEffect } from 'react';
import { Trip, ItineraryItem, DiscoverablePlace } from '../../types';
import { db } from '../../services/db';
import {
  snapMinutesTo15,
  snapTimeTo15,
  minutesToTime,
  timeToMinutes,
  formatDuration,
  formatTime12,
  formatTimeRange,
  getTimeSlotOptions,
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
  Info,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X
} from 'lucide-react';

interface TimelineWordBarProps {
  id?: string;
  startTime: string;
  endTime: string;
  durationMins?: number;
  label?: string;
  placeholder?: string;
  onAddCustomActivity: (title: string, startTime: string, endTime?: string) => void;
  onDropPlace: (place: DiscoverablePlace, time: string) => void;
  onMoveItem: (itemId: string, time: string) => void;
  draggedPlace: DiscoverablePlace | null;
  draggedItem: ItineraryItem | null;
}

const TimelineWordBar: React.FC<TimelineWordBarProps> = ({
  id,
  startTime,
  endTime,
  durationMins,
  label,
  placeholder,
  onAddCustomActivity,
  onDropPlace,
  onMoveItem,
  draggedPlace,
  draggedItem,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOver, setIsOver] = useState(false);

  const handleSubmit = (customTitle?: string) => {
    const textToSubmit = (customTitle || inputValue).trim();
    if (!textToSubmit) return;
    onAddCustomActivity(textToSubmit, startTime, endTime);
    setInputValue('');
  };

  const quickChips = [
    'Walk around hotel area',
    'Rest at hotel',
    'Coffee break',
    'Souvenir shopping',
  ];

  return (
    <div
      id={id}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        if (draggedItem) {
          onMoveItem(draggedItem.id, startTime);
        } else if (draggedPlace) {
          onDropPlace(draggedPlace, startTime);
        }
      }}
      className={`my-3 p-3.5 rounded-2xl border transition-all ${
        isOver
          ? 'border-[#0EA5A5] bg-[#0EA5A5]/10 shadow-xs ring-2 ring-[#0EA5A5]/30'
          : 'border-dashed border-[#D9CFC2] bg-[#FBF7F2]/80 hover:border-[#0EA5A5]/60 hover:bg-[#FBF7F2]'
      }`}
    >
      {/* Slot Header info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-xs text-[#0EA5A5] bg-white px-2.5 py-0.5 rounded-md border border-[#D9CFC2] shadow-2xs">
            {formatTime12(startTime)} – {formatTime12(endTime)}
          </span>
          <span className="font-semibold text-xs text-[#1F2937]">
            {label || 'Free / Unplanned Time'}
          </span>
          {durationMins && durationMins > 0 ? (
            <span className="text-[11px] text-[#374151]/70 font-mono">
              ({formatDuration(durationMins)})
            </span>
          ) : null}
        </div>
        <span className="text-[11px] text-[#374151]/60 font-medium">
          {isOver ? (
            <strong className="text-[#0EA5A5]">Release to drop place at {formatTime12(startTime)}</strong>
          ) : (
            'Straight away write plan or drop place'
          )}
        </span>
      </div>

      {/* Word Bar: direct input where user straight away writes */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={placeholder || 'Write custom plan (e.g. Walk around hotel, Rest, Coffee)... or drop place'}
            className="w-full pl-9 pr-24 py-2 rounded-xl bg-white border border-[#D9CFC2] text-xs text-[#1F2937] placeholder-[#374151]/45 focus:outline-none focus:border-[#0EA5A5] focus:ring-1 focus:ring-[#0EA5A5] shadow-2xs transition-all"
          />
          <Sparkles className="w-4 h-4 text-[#0EA5A5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputValue.trim() ? (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-2.5 py-1 rounded-lg bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>Add</span>
                <span className="text-[9px] opacity-80">↵</span>
              </button>
            ) : (
              <span className="text-[10px] text-[#374151]/40 pr-2 pointer-events-none hidden sm:inline">
                press Enter ↵
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Idea Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1">
        <span className="text-[10px] text-[#374151]/50 font-medium mr-0.5">Quick ideas:</span>
        {quickChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleSubmit(chip)}
            className="text-[10px] font-medium text-[#086666] bg-white hover:bg-[#0EA5A5]/10 border border-[#D9CFC2]/70 hover:border-[#0EA5A5] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
          >
            + {chip}
          </button>
        ))}
      </div>
    </div>
  );
};

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
  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[#374151] mb-4">No active trip found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#0EA5A5] text-white font-bold rounded-xl"
        >
          Back to My Plans
        </button>
      </div>
    );
  }

  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('Suggested');
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>(trip?.itinerary || []);
  const [draggedPlace, setDraggedPlace] = useState<DiscoverablePlace | null>(null);
  const [draggedItem, setDraggedItem] = useState<ItineraryItem | null>(null);
  const [hoveredDropTime, setHoveredDropTime] = useState<string | null>(null);
  const [dropTargetInfo, setDropTargetInfo] = useState<{
    itemId: string;
    position: 'before' | 'after';
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Time editing state
  const [editingTimeItemId, setEditingTimeItemId] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState<string>('09:00');
  const [editEndTime, setEditEndTime] = useState<string>('10:30');
  const [editDuration, setEditDuration] = useState<number>(90);

  // Custom Activity Modal & Form State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [editingCustomActivityId, setEditingCustomActivityId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customStartTime, setCustomStartTime] = useState<string>('09:00');
  const [customEndTime, setCustomEndTime] = useState<string>('10:30');
  const [customNote, setCustomNote] = useState<string>('');
  const [showLocationSection, setShowLocationSection] = useState<boolean>(false);
  const [customLocationName, setCustomLocationName] = useState<string>('');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [customOperatingHours, setCustomOperatingHours] = useState<string>('');
  const [customWebsite, setCustomWebsite] = useState<string>('');
  const [customFormError, setCustomFormError] = useState<string | null>(null);

  // Top Word Bar state
  const topInputRef = useRef<HTMLInputElement>(null);
  const [topWordBarText, setTopWordBarText] = useState<string>('');
  const [topWordBarTime, setTopWordBarTime] = useState<string>('09:00');
  const [isTopDragOver, setIsTopDragOver] = useState<boolean>(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const timeOptions = getTimeSlotOptions(15);

  // Load discoverable places for the destination safely
  const safeDestinations = trip?.destinations || [];
  const firstDest = safeDestinations[0] || '';
  const destinationId = firstDest.toLowerCase().includes('paris')
    ? 'dest-paris'
    : 'dest-kyoto';
  const discoverablePlaces = db.getDiscoverablePlaces(destinationId);

  // Initialize auto-plan if empty and mode was 'auto'
  useEffect(() => {
    if ((!trip.itinerary || trip.itinerary.length === 0) && trip.mode === 'auto') {
      const generated = db.generateFullItinerary(destinationId, trip.days || 3, trip.travelers || []);
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

  // Helper to persist and sync changes
  const saveAndSync = (newItems: ItineraryItem[]) => {
    setItineraryItems(newItems);
    const updatedTrip = { ...trip, itinerary: newItems };
    db.saveTrip(updatedTrip);
    onSaveTrip(updatedTrip);
  };

  // Filter items for the active day, sorted by start time
  const currentDayItems = (itineraryItems || [])
    .filter(item => item.day_index === activeDayIndex)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  // Sync default time for top word bar to end of current day's last item or 09:00
  useEffect(() => {
    if (currentDayItems && currentDayItems.length > 0) {
      const lastItem = currentDayItems[currentDayItems.length - 1];
      const lastMins = timeToMinutes(lastItem.end_time);
      if (lastMins < 1320) {
        setTopWordBarTime(lastItem.end_time);
      } else {
        setTopWordBarTime('09:00');
      }
    } else {
      setTopWordBarTime('09:00');
    }
  }, [activeDayIndex, itineraryItems.length]);

  // Compute transports between consecutive items
  const itemsWithTransports = currentDayItems.map((item, idx) => {
    if (idx < (currentDayItems?.length || 0) - 1) {
      const currentEnd = timeToMinutes(item.end_time);
      const nextStart = timeToMinutes(currentDayItems[idx + 1].start_time);
      return {
        ...item,
        transport_to_next: generateTransportEstimate(nextStart, currentEnd)
      };
    }
    return { ...item, transport_to_next: undefined };
  });

  // Check for time conflicts with any other activity on the same day
  const getItemConflicts = (item: ItineraryItem): ItineraryItem[] => {
    const itemStart = timeToMinutes(item.start_time);
    const itemEnd = timeToMinutes(item.end_time);
    return currentDayItems.filter(other => {
      if (other.id === item.id) return false;
      const otherStart = timeToMinutes(other.start_time);
      const otherEnd = timeToMinutes(other.end_time);
      return itemStart < otherEnd && itemEnd > otherStart;
    });
  };

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
    saveAndSync(updated);

    // Check if new item conflicts
    const conflicts = currentDayItems.filter(other => {
      const otherStart = timeToMinutes(other.start_time);
      const otherEnd = timeToMinutes(other.end_time);
      return startMins < otherEnd && endMins > otherStart;
    });

    if (conflicts.length > 0) {
      showToast(`Scheduled at ${formatTime12(snappedStart)} (⚠️ Overlaps with ${conflicts[0].place_name})`);
    } else {
      showToast(`Scheduled ${place.name} at ${formatTime12(snappedStart)}`);
    }
  };

  // Move an existing activity to a new start time, preserving original duration
  const moveItemToTime = (itemId: string, newStartTime: string) => {
    const snappedStart = snapTimeTo15(newStartTime);
    const startMins = timeToMinutes(snappedStart);

    let movedPlaceName = 'Activity';
    const updated = itineraryItems.map(item => {
      if (item.id !== itemId) return item;
      movedPlaceName = item.place_name;
      const duration = item.duration_mins || 60;
      const endMins = startMins + duration;
      return {
        ...item,
        start_time: snappedStart,
        end_time: minutesToTime(endMins)
      };
    });

    saveAndSync(updated);
    showToast(`Moved ${movedPlaceName} to ${formatTime12(snappedStart)}`);
  };

  // Reorder relative to another item (move before or after)
  const moveItemRelative = (sourceItemId: string, targetItem: ItineraryItem, position: 'before' | 'after') => {
    const sourceItem = itineraryItems.find(i => i.id === sourceItemId);
    if (!sourceItem || sourceItem.id === targetItem.id) return;

    const dayItemsSorted = (itineraryItems || [])
      .filter(item => item.day_index === activeDayIndex && item.id !== sourceItemId)
      .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

    const targetIdx = dayItemsSorted.findIndex(i => i.id === targetItem.id);
    let newStartMins: number;

    if (position === 'before') {
      const targetStartMins = timeToMinutes(targetItem.start_time);
      if (targetIdx > 0) {
        const prevEndMins = timeToMinutes(dayItemsSorted[targetIdx - 1].end_time);
        if (targetStartMins - prevEndMins >= sourceItem.duration_mins) {
          newStartMins = prevEndMins;
        } else {
          newStartMins = Math.max(0, targetStartMins - sourceItem.duration_mins);
        }
      } else {
        newStartMins = Math.max(0, targetStartMins - sourceItem.duration_mins);
      }
    } else {
      const targetEndMins = timeToMinutes(targetItem.end_time);
      newStartMins = targetEndMins;
    }

    const snappedStart = minutesToTime(snapMinutesTo15(newStartMins));
    const snappedEnd = minutesToTime(snapMinutesTo15(newStartMins + sourceItem.duration_mins));

    const updated = itineraryItems.map(it => {
      if (it.id !== sourceItemId) return it;
      return {
        ...it,
        start_time: snappedStart,
        end_time: snappedEnd
      };
    });

    saveAndSync(updated);
    showToast(`Moved ${sourceItem.place_name} ${position === 'before' ? 'above' : 'below'} ${targetItem.place_name}`);
  };

  // Quick swap / shift earlier or later
  const handleShiftItemOrder = (itemId: string, direction: 'earlier' | 'later') => {
    const sorted = [...currentDayItems];
    const idx = sorted.findIndex(i => i.id === itemId);
    if (idx === -1) return;

    if (direction === 'earlier' && idx > 0) {
      const prevItem = sorted[idx - 1];
      const curItem = sorted[idx];
      const prevDuration = prevItem.duration_mins;
      const curDuration = curItem.duration_mins;
      const slotStart = prevItem.start_time;

      const newCurStart = slotStart;
      const newCurEnd = minutesToTime(timeToMinutes(newCurStart) + curDuration);
      const newPrevStart = newCurEnd;
      const newPrevEnd = minutesToTime(timeToMinutes(newPrevStart) + prevDuration);

      const updated = itineraryItems.map(it => {
        if (it.id === curItem.id) {
          return { ...it, start_time: newCurStart, end_time: newCurEnd };
        }
        if (it.id === prevItem.id) {
          return { ...it, start_time: newPrevStart, end_time: newPrevEnd };
        }
        return it;
      });
      saveAndSync(updated);
      showToast(`Moved ${curItem.place_name} earlier`);
    } else if (direction === 'later' && idx < sorted.length - 1) {
      const nextItem = sorted[idx + 1];
      const curItem = sorted[idx];
      const curDuration = curItem.duration_mins;
      const nextDuration = nextItem.duration_mins;
      const slotStart = curItem.start_time;

      const newNextStart = slotStart;
      const newNextEnd = minutesToTime(timeToMinutes(newNextStart) + nextDuration);
      const newCurStart = newNextEnd;
      const newCurEnd = minutesToTime(timeToMinutes(newCurStart) + curDuration);

      const updated = itineraryItems.map(it => {
        if (it.id === curItem.id) {
          return { ...it, start_time: newCurStart, end_time: newCurEnd };
        }
        if (it.id === nextItem.id) {
          return { ...it, start_time: newNextStart, end_time: newNextEnd };
        }
        return it;
      });
      saveAndSync(updated);
      showToast(`Moved ${curItem.place_name} later`);
    }
  };

  // Quick slot place to next available open hour
  const handleQuickAdd = (place: DiscoverablePlace) => {
    let nextAvailableMin = 540; // 09:00
    if (currentDayItems.length > 0) {
      const lastItem = currentDayItems[currentDayItems.length - 1];
      const lastEnd = timeToMinutes(lastItem.end_time);
      nextAvailableMin = Math.max(540, lastEnd + 15);
    }
    if (nextAvailableMin >= 1380) nextAvailableMin = 540;

    schedulePlaceAt(place, minutesToTime(snapMinutesTo15(nextAvailableMin)));
  };

  // Adjust duration via bottom drag handle or buttons (15-min snapping)
  const handleResizeDuration = (itemId: string, deltaMins: number) => {
    const updated = itineraryItems.map(item => {
      if (item.id !== itemId) return item;
      const currentDuration = item.duration_mins || 60;
      const newDuration = Math.max(15, snapMinutesTo15(currentDuration + deltaMins));
      const startMins = timeToMinutes(item.start_time);
      const newEndMins = startMins + newDuration;
      return {
        ...item,
        duration_mins: newDuration,
        end_time: minutesToTime(newEndMins)
      };
    });

    saveAndSync(updated);
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    const updated = itineraryItems.filter(i => i.id !== itemId);
    saveAndSync(updated);
    if (editingTimeItemId === itemId) setEditingTimeItemId(null);
  };

  // "Help me fill the free time" (Section 3.7)
  const handleFillFreeTime = () => {
    const filledDayItems = db.fillFreeTimeForDay(currentDayItems, destinationId, activeDayIndex);
    const otherDayItems = itineraryItems.filter(i => i.day_index !== activeDayIndex);
    const merged = [...otherDayItems, ...filledDayItems];
    saveAndSync(merged);
    showToast('Auto-filled empty schedule gaps with 15-minute snapping!');
  };

  // Time editing modal / panel handlers
  const handleOpenTimeEdit = (item: ItineraryItem) => {
    setEditingTimeItemId(item.id);
    setEditStartTime(item.start_time);
    setEditEndTime(item.end_time);
    setEditDuration(item.duration_mins);
  };

  const handleEditStartTimeChange = (newStart: string) => {
    setEditStartTime(newStart);
    const startMins = timeToMinutes(newStart);
    const newEnd = minutesToTime(startMins + editDuration);
    setEditEndTime(newEnd);
  };

  const handleEditEndTimeChange = (newEnd: string) => {
    setEditEndTime(newEnd);
    const startMins = timeToMinutes(editStartTime);
    const endMins = timeToMinutes(newEnd);
    const diff = Math.max(15, endMins - startMins);
    setEditDuration(snapMinutesTo15(diff));
  };

  const handleEditDurationChange = (newDur: number) => {
    const dur = Math.max(15, snapMinutesTo15(newDur));
    setEditDuration(dur);
    const startMins = timeToMinutes(editStartTime);
    setEditEndTime(minutesToTime(startMins + dur));
  };

  const handleSaveTimeEdit = () => {
    if (!editingTimeItemId) return;
    const updated = itineraryItems.map(it => {
      if (it.id !== editingTimeItemId) return it;
      return {
        ...it,
        start_time: editStartTime,
        end_time: editEndTime,
        duration_mins: editDuration
      };
    });
    saveAndSync(updated);
    setEditingTimeItemId(null);
    showToast(`Time updated: ${formatTime12(editStartTime)} – ${formatTime12(editEndTime)}`);
  };

  // Custom Activity Handlers
  const openAddCustomActivity = (slotStart?: string, slotEnd?: string) => {
    setEditingCustomActivityId(null);
    setCustomTitle('');
    const defaultStart = slotStart ? snapTimeTo15(slotStart) : '09:00';
    let defaultEnd = slotEnd ? snapTimeTo15(slotEnd) : minutesToTime(timeToMinutes(defaultStart) + 60);
    if (timeToMinutes(defaultEnd) <= timeToMinutes(defaultStart)) {
      defaultEnd = minutesToTime(timeToMinutes(defaultStart) + 60);
    }
    setCustomStartTime(defaultStart);
    setCustomEndTime(defaultEnd);
    setCustomNote('');
    setShowLocationSection(false);
    setCustomLocationName('');
    setCustomAddress('');
    setCustomOperatingHours('');
    setCustomWebsite('');
    setCustomFormError(null);
    setIsCustomModalOpen(true);
  };

  const openEditCustomActivity = (item: ItineraryItem) => {
    setEditingCustomActivityId(item.id);
    setCustomTitle(item.place_name);
    setCustomStartTime(item.start_time);
    setCustomEndTime(item.end_time);
    setCustomNote(item.notes || '');
    const hasLocation = !!(item.location_name || item.address || item.operating_hours || item.website);
    setShowLocationSection(hasLocation);
    setCustomLocationName(item.location_name || '');
    setCustomAddress(item.address || '');
    setCustomOperatingHours(item.operating_hours || '');
    setCustomWebsite(item.website || '');
    setCustomFormError(null);
    setIsCustomModalOpen(true);
  };

  const handleCustomStartTimeChange = (newStart: string) => {
    const curStartMins = timeToMinutes(customStartTime);
    const curEndMins = timeToMinutes(customEndTime);
    const duration = Math.max(15, curEndMins - curStartMins);
    const newStartMins = timeToMinutes(newStart);
    const newEndMins = newStartMins + duration;
    setCustomStartTime(newStart);
    setCustomEndTime(minutesToTime(newEndMins));
  };

  const handleCustomEndTimeChange = (newEnd: string) => {
    const startMins = timeToMinutes(customStartTime);
    let endMins = timeToMinutes(newEnd);
    if (endMins <= startMins) {
      endMins = startMins + 15;
    }
    setCustomEndTime(minutesToTime(endMins));
  };

  const handleCustomDurationPreset = (mins: number) => {
    const startMins = timeToMinutes(customStartTime);
    const endMins = startMins + mins;
    setCustomEndTime(minutesToTime(endMins));
  };

  const handleSaveCustomActivity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customTitle.trim()) {
      setCustomFormError('Please enter an activity name');
      return;
    }

    const startMins = timeToMinutes(customStartTime);
    let endMins = timeToMinutes(customEndTime);
    if (endMins <= startMins) {
      endMins = startMins + 30;
      setCustomEndTime(minutesToTime(endMins));
    }
    const durationMins = Math.max(15, endMins - startMins);

    if (editingCustomActivityId) {
      const updated = itineraryItems.map(item => {
        if (item.id !== editingCustomActivityId) return item;
        return {
          ...item,
          place_name: customTitle.trim(),
          start_time: customStartTime,
          end_time: minutesToTime(endMins),
          duration_mins: durationMins,
          notes: customNote.trim() || undefined,
          location_name: customLocationName.trim() || undefined,
          address: customAddress.trim() || undefined,
          operating_hours: customOperatingHours.trim() || undefined,
          website: customWebsite.trim() || undefined,
        };
      });
      saveAndSync(updated);
      showToast(`Updated "${customTitle.trim()}"`);
    } else {
      const newItem: ItineraryItem = {
        id: `custom-act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        trip_id: trip.id,
        day_index: activeDayIndex,
        place_id: `custom-place-${Date.now()}`,
        place_name: customTitle.trim(),
        place_type: 'activity',
        start_time: customStartTime,
        end_time: minutesToTime(endMins),
        duration_mins: durationMins,
        image: '',
        category: 'Activity',
        notes: customNote.trim() || undefined,
        is_custom: true,
        location_name: customLocationName.trim() || undefined,
        address: customAddress.trim() || undefined,
        operating_hours: customOperatingHours.trim() || undefined,
        website: customWebsite.trim() || undefined,
      };
      const updated = [...itineraryItems, newItem];
      saveAndSync(updated);
      showToast(`Added "${customTitle.trim()}" to Day ${activeDayIndex + 1}`);
    }

    setIsCustomModalOpen(false);
  };

  // Straight away add custom activity from word bar without modal
  const handleQuickAddCustomActivity = (title: string, startTime: string, endTime?: string) => {
    if (!title || !title.trim()) return;
    const cleanTitle = title.trim();
    const startMins = timeToMinutes(startTime);
    let endMins = endTime ? timeToMinutes(endTime) : startMins + 60;
    if (endMins <= startMins) {
      endMins = startMins + 60;
    }
    const durationMins = Math.max(15, endMins - startMins);

    const newItem: ItineraryItem = {
      id: `custom-act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      trip_id: trip.id,
      day_index: activeDayIndex,
      place_id: `custom-place-${Date.now()}`,
      place_name: cleanTitle,
      place_type: 'activity',
      start_time: startTime,
      end_time: minutesToTime(endMins),
      duration_mins: durationMins,
      image: '',
      category: 'Activity',
      is_custom: true,
    };
    const updated = [...itineraryItems, newItem];
    saveAndSync(updated);
    showToast(`Added "${cleanTitle}" at ${formatTime12(startTime)}`);

    // Advance topWordBarTime to end of new item if before 22:00
    if (endMins < 1320) {
      setTopWordBarTime(minutesToTime(endMins));
    }
  };

  const handleTopWordBarSubmit = () => {
    if (!topWordBarText.trim()) return;
    handleQuickAddCustomActivity(topWordBarText.trim(), topWordBarTime);
    setTopWordBarText('');
  };

  // Continuous drag over timeline calculation
  const handleTimelineDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPlace && !draggedItem) return;

    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const totalHeight = rect.height || 600;
    const ratio = Math.max(0, Math.min(1, offsetY / totalHeight));

    // Map ratio across active travel day: 07:00 (420 mins) to 23:00 (1380 mins)
    const rawMins = 420 + ratio * (1380 - 420);
    const snappedMins = snapMinutesTo15(rawMins);
    const timeStr = minutesToTime(snappedMins);
    setHoveredDropTime(timeStr);
  };

  const handleTimelineDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const targetTime = hoveredDropTime || '09:00';

    if (draggedItem) {
      moveItemToTime(draggedItem.id, targetTime);
      setDraggedItem(null);
    } else if (draggedPlace) {
      schedulePlaceAt(draggedPlace, targetTime);
      setDraggedPlace(null);
    }

    setHoveredDropTime(null);
    setDropTargetInfo(null);
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
              <span className="text-[#374151] font-semibold">{(trip.destinations || []).join(' → ') || 'Destination'}</span>
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
                const updatedTrip = { ...trip, itinerary: itineraryItems };
                db.saveTrip(updatedTrip);
                onSaveTrip(updatedTrip);
                showToast('Trip itinerary saved securely.');
              }}
              className="px-4 py-2 rounded-xl border border-[#0EA5A5] text-[#0EA5A5] hover:bg-[#0EA5A5] hover:text-white font-bold text-xs transition-all cursor-pointer"
            >
              Save Progress
            </button>

            <button
              id="btn-finish-itinerary"
              onClick={() => {
                const updatedTrip = { ...trip, itinerary: itineraryItems };
                db.saveTrip(updatedTrip);
                onFinish(updatedTrip);
              }}
              className="px-5 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Finish & View My Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Selector Bar */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-1">
          {Array.from({ length: trip.days || 1 }).map((_, dIdx) => (
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#EFEAE2]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0EA5A5]" />
              <h2 className="text-base font-bold text-[#1F2937] font-display">
                Day {activeDayIndex + 1} • 24-Hour Timeline
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-add-activity-header"
                onClick={() => {
                  topInputRef.current?.focus();
                  topInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Write plan or drop place below"
              >
                <Sparkles className="w-4 h-4" />
                <span>Write Plan</span>
              </button>
              <span className="text-xs font-bold text-[#0EA5A5] bg-[#0EA5A5]/10 px-3 py-1 rounded-xl">
                {currentDayItems?.length || 0} Scheduled Activities
              </span>
            </div>
          </div>

          {/* Top Quick Activity Word Bar: straight away write or drop place for Day X */}
          <div
            id="top-timeline-word-bar"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsTopDragOver(true);
            }}
            onDragLeave={() => setIsTopDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsTopDragOver(false);
              if (draggedItem) {
                moveItemToTime(draggedItem.id, topWordBarTime);
                setDraggedItem(null);
              } else if (draggedPlace) {
                schedulePlaceAt(draggedPlace, topWordBarTime);
                setDraggedPlace(null);
              }
            }}
            className={`mb-4 p-3.5 rounded-2xl border transition-all ${
              isTopDragOver
                ? 'border-[#0EA5A5] bg-[#0EA5A5]/10 shadow-xs ring-2 ring-[#0EA5A5]/30'
                : 'border-[#D9CFC2] bg-[#FBF7F2]/90 hover:border-[#0EA5A5]/60'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>Quick Add Plan for Day {activeDayIndex + 1}:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#374151]/70 font-medium">Time:</span>
                  <select
                    value={topWordBarTime}
                    onChange={(e) => setTopWordBarTime(e.target.value)}
                    className="px-2 py-0.5 rounded-lg border border-[#D9CFC2] bg-white font-mono text-xs font-semibold text-[#0EA5A5] focus:outline-none focus:border-[#0EA5A5]"
                  >
                    {timeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <span className="text-[11px] text-[#374151]/60 font-medium hidden sm:inline">
                {isTopDragOver ? (
                  <strong className="text-[#0EA5A5]">Release to drop place at {formatTime12(topWordBarTime)}</strong>
                ) : (
                  'Write plan or drop place'
                )}
              </span>
            </div>

            <div className="relative">
              <input
                ref={topInputRef}
                type="text"
                value={topWordBarText}
                onChange={(e) => setTopWordBarText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTopWordBarSubmit();
                  }
                }}
                placeholder="Straight away write custom plan (e.g. Walk around hotel area, Rest, Coffee)... or drop place"
                className="w-full pl-9 pr-24 py-2 rounded-xl bg-white border border-[#D9CFC2] text-xs text-[#1F2937] placeholder-[#374151]/45 focus:outline-none focus:border-[#0EA5A5] focus:ring-1 focus:ring-[#0EA5A5] shadow-2xs transition-all"
              />
              <Sparkles className="w-4 h-4 text-[#0EA5A5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {topWordBarText.trim() ? (
                  <button
                    type="button"
                    onClick={handleTopWordBarSubmit}
                    className="px-2.5 py-1 rounded-lg bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Add</span>
                    <span className="text-[9px] opacity-80">↵</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-[#374151]/40 pr-2 pointer-events-none hidden sm:inline">
                    press Enter ↵
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-0.5">
              <span className="text-[10px] text-[#374151]/50 font-medium mr-0.5">Quick ideas:</span>
              {['Walk around hotel area', 'Rest at hotel', 'Coffee break', 'Souvenir shopping'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    handleQuickAddCustomActivity(chip, topWordBarTime);
                  }}
                  className="text-[10px] font-medium text-[#086666] bg-white hover:bg-[#0EA5A5]/10 border border-[#D9CFC2]/70 hover:border-[#0EA5A5] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Active Dragging Banner Notification */}
          {(draggedPlace || draggedItem) && (
            <div className="mb-4 py-2 px-4 rounded-xl border border-[#0EA5A5] bg-[#0EA5A5]/10 text-xs font-bold text-[#086666] flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0EA5A5]" />
                <span>
                  {draggedItem
                    ? `Moving "${draggedItem.place_name}" — drop at any position or open time`
                    : `Scheduling "${draggedPlace?.name}" — drop at any position or open time`}
                </span>
              </div>
              {hoveredDropTime && (
                <span className="bg-[#0EA5A5] text-white px-2.5 py-0.5 rounded-lg text-xs font-mono">
                  Drop Time: {formatTime12(hoveredDropTime)} ({hoveredDropTime})
                </span>
              )}
            </div>
          )}

          {/* Timeline View */}
          <div
            ref={timelineRef}
            id="vertical-24h-timeline"
            onDragOver={handleTimelineDragOver}
            onDrop={handleTimelineDrop}
            className="relative border-l-2 border-[#0EA5A5]/30 ml-8 sm:ml-12 pl-4 sm:pl-6 space-y-5 min-h-[620px] py-4"
          >
            {/* Empty Timeline State (e.g. Plan it myself) */}
            {(!itemsWithTransports || itemsWithTransports.length === 0) ? (
              <div className="py-8 text-center border-2 border-dashed border-[#D9CFC2] rounded-3xl bg-[#FBF7F2]/60 p-6">
                <div className="w-12 h-12 rounded-2xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1F2937]">Day {activeDayIndex + 1} timeline is open</h4>
                <p className="text-xs text-[#374151] mt-1 max-w-sm mx-auto mb-4">
                  Straight away write your plan below, or drag & drop places from the left panel onto any time.
                </p>

                {/* Direct Word Bar for Empty State */}
                <div className="max-w-lg mx-auto mb-4 text-left">
                  <TimelineWordBar
                    id="empty-day-word-bar"
                    startTime="09:00"
                    endTime="10:30"
                    durationMins={90}
                    label={`Day ${activeDayIndex + 1} Open Schedule`}
                    placeholder="Straight away write your first activity (e.g. Check-in, Morning walk)... or drop place"
                    onAddCustomActivity={handleQuickAddCustomActivity}
                    onDropPlace={schedulePlaceAt}
                    onMoveItem={moveItemToTime}
                    draggedPlace={draggedPlace}
                    draggedItem={draggedItem}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
                  <button
                    onClick={handleFillFreeTime}
                    className="px-4 py-2 rounded-xl bg-white border border-[#D9CFC2] text-[#1F2937] hover:border-[#0EA5A5] text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-[#0EA5A5]" />
                    <span>Auto-fill with "Help me plan"</span>
                  </button>
                </div>

                {/* Hourly drop slots guide */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-lg mx-auto">
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:30', '19:00', '20:30'].map(slotTime => (
                    <div
                      key={slotTime}
                      onClick={() => {
                        setTopWordBarTime(slotTime);
                        topInputRef.current?.focus();
                        topInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setHoveredDropTime(slotTime);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedItem) {
                          moveItemToTime(draggedItem.id, slotTime);
                          setDraggedItem(null);
                        } else if (draggedPlace) {
                          schedulePlaceAt(draggedPlace, slotTime);
                          setDraggedPlace(null);
                        }
                        setHoveredDropTime(null);
                      }}
                      className="p-2.5 rounded-xl border border-dashed border-[#D9CFC2] hover:border-[#0EA5A5] bg-white/80 hover:bg-[#0EA5A5]/5 transition-all text-xs flex items-center justify-between group cursor-pointer"
                      title="Click to write plan or drop place here"
                    >
                      <span className="font-mono font-bold text-[#0EA5A5] text-xs">
                        {formatTime12(slotTime)}
                      </span>
                      <span className="text-[11px] text-[#374151]/60 group-hover:text-[#0EA5A5] group-hover:font-bold flex items-center gap-1">
                        <Plus className="w-3 h-3 text-[#0EA5A5]" />
                        <span>Write / Drop here</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Early morning free time slot if first item starts after 07:00 */}
                {timeToMinutes(itemsWithTransports[0].start_time) > 420 && (
                  (() => {
                    const firstItem = itemsWithTransports[0];
                    const firstMins = timeToMinutes(firstItem.start_time);
                    const morningStart = '07:30';
                    const gapMins = firstMins - 450;
                    return (
                      <TimelineWordBar
                        id="morning-free-slot-bar"
                        startTime={morningStart}
                        endTime={firstItem.start_time}
                        durationMins={gapMins}
                        label="Morning Free / Unplanned Time"
                        placeholder="Write morning plan (e.g. Hotel breakfast, Morning walk, Coffee)... or drop place"
                        onAddCustomActivity={handleQuickAddCustomActivity}
                        onDropPlace={schedulePlaceAt}
                        onMoveItem={moveItemToTime}
                        draggedPlace={draggedPlace}
                        draggedItem={draggedItem}
                      />
                    );
                  })()
                )}

                {/* Scheduled Activities */}
                {itemsWithTransports.map((item, idx) => {
                  const conflicts = getItemConflicts(item);
                  const isConflicting = conflicts.length > 0;
                  const isEditing = editingTimeItemId === item.id;
                  const isBeingDragged = draggedItem?.id === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Drop indicator above this card if targeted */}
                      {dropTargetInfo?.itemId === item.id && dropTargetInfo?.position === 'before' && (
                        <div className="py-1.5 px-3 rounded-xl border-2 border-dashed border-[#0EA5A5] bg-[#0EA5A5]/15 text-xs font-bold text-[#086666] text-center animate-pulse">
                          Drop here to place before {item.place_name}
                        </div>
                      )}

                      {/* Scheduled Place Card on Timeline */}
                      <div
                        id={`scheduled-item-${item.id}`}
                        draggable={!isEditing}
                        onDragStart={(e) => {
                          setDraggedItem(item);
                          setDraggedPlace(null);
                          e.dataTransfer.setData('text/plain', item.id);
                        }}
                        onDragEnd={() => {
                          setDraggedItem(null);
                          setDropTargetInfo(null);
                          setHoveredDropTime(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const midY = rect.top + rect.height / 2;
                          const pos = e.clientY < midY ? 'before' : 'after';
                          setDropTargetInfo({ itemId: item.id, position: pos });
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedItem && draggedItem.id !== item.id) {
                            const pos = dropTargetInfo?.position || 'before';
                            moveItemRelative(draggedItem.id, item, pos);
                            setDraggedItem(null);
                          } else if (draggedPlace) {
                            const targetTime = dropTargetInfo?.position === 'before'
                              ? minutesToTime(Math.max(0, timeToMinutes(item.start_time) - (draggedPlace.avg_duration_mins || 90)))
                              : item.end_time;
                            schedulePlaceAt(draggedPlace, targetTime);
                            setDraggedPlace(null);
                          }
                          setDropTargetInfo(null);
                          setHoveredDropTime(null);
                        }}
                        className={`relative group bg-[#FBF7F2] rounded-2xl border-2 transition-all shadow-xs p-4 ${
                          isBeingDragged ? 'opacity-40 border-dashed border-[#0EA5A5]' : ''
                        } ${
                          isConflicting
                            ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-300'
                            : 'border-[#D9CFC2] hover:border-[#0EA5A5]'
                        }`}
                      >
                        {/* Time snapping node on the left ruler */}
                        <div className={`absolute -left-[25px] sm:-left-[33px] top-4 w-4 h-4 rounded-full ring-4 ring-[#FBF7F2] border-2 border-white ${
                          isConflicting ? 'bg-amber-500' : 'bg-[#0EA5A5]'
                        }`} />

                        {/* Card Header: Drag handle, Time badge, Edit button, Reorder buttons, Maps & Delete */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Grip handle for dragging */}
                            <div
                              className="p-1 rounded-md text-[#374151]/50 hover:text-[#0EA5A5] hover:bg-white cursor-grab active:cursor-grabbing transition-colors"
                              title="Drag to reorder or move to another time"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Time badge (clicking opens inline time editor) */}
                            <button
                              onClick={() => isEditing ? setEditingTimeItemId(null) : handleOpenTimeEdit(item)}
                              className="font-mono font-extrabold text-xs text-[#0EA5A5] bg-white px-2.5 py-1 rounded-md border border-[#D9CFC2]/70 hover:border-[#0EA5A5] hover:bg-[#0EA5A5]/5 transition-all flex items-center gap-1.5 cursor-pointer"
                              title="Click to edit exact start/end time"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                              <span>{formatTime12(item.start_time)} – {formatTime12(item.end_time)}</span>
                              <span className="text-[10px] text-[#374151]/60">({item.start_time}–{item.end_time})</span>
                              <Edit2 className="w-3 h-3 text-[#374151]/40 ml-0.5" />
                            </button>

                            <span className="text-[11px] font-semibold text-[#374151]/70">
                              ({formatDuration(item.duration_mins)})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 sm:gap-1.5">
                            {/* Quick Reorder Earlier / Later buttons */}
                            <button
                              onClick={() => handleShiftItemOrder(item.id, 'earlier')}
                              disabled={idx === 0}
                              className="p-1 rounded-md text-[#374151]/60 hover:text-[#0EA5A5] hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                              title="Move earlier (swap with preceding activity)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleShiftItemOrder(item.id, 'later')}
                              disabled={idx === currentDayItems.length - 1}
                              className="p-1 rounded-md text-[#374151]/60 hover:text-[#0EA5A5] hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                              title="Move later (swap with next activity)"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {item.maps_url && (
                              <a
                                href={item.maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#0EA5A5] hover:underline flex items-center gap-1 px-1.5 py-1"
                                title="Open in Google Maps"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Maps</span>
                              </a>
                            )}

                            {item.website && !item.maps_url && (
                              <a
                                href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#0EA5A5] hover:underline flex items-center gap-1 px-1.5 py-1"
                                title="Open website"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Web</span>
                              </a>
                            )}

                            <button
                              id={`btn-edit-details-${item.id}`}
                              onClick={() => openEditCustomActivity(item)}
                              className="text-[#374151]/60 hover:text-[#0EA5A5] p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                              title="Edit activity details, note & location"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-[#374151]/60 hover:text-[#E85555] p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Time Conflict Warning Banner (Requirement 7) */}
                        {isConflicting && (
                          <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-amber-800">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>⚠️ Time conflict</span>
                            </div>
                            <div className="text-[11px] text-amber-800 mt-1 space-y-0.5">
                              <p>This activity overlaps with:</p>
                              {conflicts.map(c => (
                                <p key={c.id} className="font-semibold pl-2">
                                  • {c.place_name} ({formatTime12(c.start_time)} – {formatTime12(c.end_time)})
                                </p>
                              ))}
                              <p className="text-[10px] text-amber-700/80 pt-0.5">
                                Drag to an open slot or click the time badge to adjust.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Inline Exact Time Editor (Requirement 4) */}
                        {isEditing && (
                          <div className="mb-3 p-3.5 rounded-2xl bg-white border-2 border-[#0EA5A5] shadow-xs space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2]">
                              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[#0EA5A5]" />
                                <span>Choose Exact Time (15-min snapping)</span>
                              </span>
                              <button
                                onClick={() => setEditingTimeItemId(null)}
                                className="text-xs font-bold text-[#374151]/60 hover:text-[#1F2937] cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              {/* Start Time Picker */}
                              <div>
                                <label className="block text-[11px] font-bold text-[#374151] mb-1">
                                  Start Time
                                </label>
                                <select
                                  value={editStartTime}
                                  onChange={(e) => handleEditStartTimeChange(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#D9CFC2] bg-[#FBF7F2] font-mono text-xs font-semibold focus:outline-none focus:border-[#0EA5A5]"
                                >
                                  {timeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>

                              {/* End Time Picker */}
                              <div>
                                <label className="block text-[11px] font-bold text-[#374151] mb-1">
                                  End Time
                                </label>
                                <select
                                  value={editEndTime}
                                  onChange={(e) => handleEditEndTimeChange(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#D9CFC2] bg-[#FBF7F2] font-mono text-xs font-semibold focus:outline-none focus:border-[#0EA5A5]"
                                >
                                  {timeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Duration with -15m / +15m */}
                              <div>
                                <label className="block text-[11px] font-bold text-[#374151] mb-1">
                                  Duration
                                </label>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditDurationChange(editDuration - 15)}
                                    disabled={editDuration <= 15}
                                    className="px-2 py-1 bg-[#FBF7F2] border border-[#D9CFC2] rounded-md font-bold text-xs hover:bg-[#EFEAE2] disabled:opacity-40 cursor-pointer"
                                  >
                                    -15m
                                  </button>
                                  <span className="flex-1 text-center font-mono font-bold text-[#0EA5A5]">
                                    {formatDuration(editDuration)}
                                  </span>
                                  <button
                                    onClick={() => handleEditDurationChange(editDuration + 15)}
                                    className="px-2 py-1 bg-[#FBF7F2] border border-[#D9CFC2] rounded-md font-bold text-xs hover:bg-[#EFEAE2] cursor-pointer"
                                  >
                                    +15m
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Quick Duration Presets */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] text-[#374151]/70 font-semibold">Preset Duration:</span>
                              {[30, 45, 60, 90, 120, 150, 180].map(mins => (
                                <button
                                  key={mins}
                                  onClick={() => handleEditDurationChange(mins)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                    editDuration === mins
                                      ? 'bg-[#0EA5A5] text-white border-[#0EA5A5]'
                                      : 'bg-[#FBF7F2] text-[#374151] border-[#D9CFC2] hover:border-[#0EA5A5]'
                                  }`}
                                >
                                  {formatDuration(mins)}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFEAE2]">
                              <button
                                onClick={() => setEditingTimeItemId(null)}
                                className="px-3 py-1 text-xs font-semibold text-[#374151] hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveTimeEdit}
                                className="px-4 py-1.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                              >
                                Apply Time
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Card Content */}
                        <div className="flex items-start gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.place_name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#EFEAE2]"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex flex-col items-center justify-center shrink-0 border border-[#0EA5A5]/20">
                              <Sparkles className="w-6 h-6 mb-0.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Plan</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-[#1F2937]">{item.place_name}</h4>
                              {item.is_custom && (
                                <span className="text-[10px] font-bold text-[#086666] bg-[#0EA5A5]/15 px-2 py-0.5 rounded-md">
                                  Custom Activity
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-xs text-[#374151] mt-0.5 leading-relaxed line-clamp-2">
                                {item.notes}
                              </p>
                            )}

                            {/* Optional Location Details */}
                            {(item.location_name || item.address || item.operating_hours || item.website) && (
                              <div className="mt-2 pt-1.5 border-t border-[#D9CFC2]/40 text-[11px] text-[#374151]/80 space-y-1">
                                {(item.location_name || item.address) && (
                                  <div className="flex items-center gap-1.5 text-[#374151]">
                                    <MapPin className="w-3 h-3 text-[#0EA5A5] shrink-0" />
                                    <span>{[item.location_name, item.address].filter(Boolean).join(' • ')}</span>
                                  </div>
                                )}
                                {item.operating_hours && (
                                  <div className="flex items-center gap-1.5 text-[#374151]/80">
                                    <Clock className="w-3 h-3 text-[#0EA5A5] shrink-0" />
                                    <span>Hours: {item.operating_hours}</span>
                                  </div>
                                )}
                              </div>
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
                              disabled={item.duration_mins <= 15}
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

                      {/* Drop indicator below this card if targeted */}
                      {dropTargetInfo?.itemId === item.id && dropTargetInfo?.position === 'after' && (
                        <div className="py-1.5 px-3 rounded-xl border-2 border-dashed border-[#0EA5A5] bg-[#0EA5A5]/15 text-xs font-bold text-[#086666] text-center animate-pulse">
                          Drop here to place after {item.place_name}
                        </div>
                      )}

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

                      {/* Open Free Time Slot Between Consecutive Places (if gap >= 15 min) */}
                      {idx < currentDayItems.length - 1 && (
                        (() => {
                          const curEnd = timeToMinutes(item.end_time);
                          const nextStart = timeToMinutes(currentDayItems[idx + 1].start_time);
                          const gap = nextStart - curEnd;
                          if (gap >= 15) {
                            return (
                              <TimelineWordBar
                                key={`gap-wordbar-${item.id}`}
                                id={`gap-wordbar-${item.id}`}
                                startTime={item.end_time}
                                endTime={currentDayItems[idx + 1].start_time}
                                durationMins={gap}
                                label="Free / Unplanned Time"
                                placeholder="Write custom plan (e.g. Rest at hotel, Coffee break, Lunch)... or drop place here"
                                onAddCustomActivity={handleQuickAddCustomActivity}
                                onDropPlace={schedulePlaceAt}
                                onMoveItem={moveItemToTime}
                                draggedPlace={draggedPlace}
                                draggedItem={draggedItem}
                              />
                            );
                          }
                          return null;
                        })()
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Available Evening Slots & General Drop Zone */}
                {currentDayItems.length > 0 && (
                  <div className="space-y-3 pt-3">
                    {(() => {
                      const lastItem = currentDayItems[currentDayItems.length - 1];
                      const lastEndMins = timeToMinutes(lastItem.end_time);
                      const eveningSlots = ['16:00', '17:30', '19:00', '20:30']
                        .filter(t => timeToMinutes(t) >= lastEndMins);

                      return (
                        <div className="space-y-2">
                          {/* Evening Unplanned Time block if before 22:00 */}
                          {lastEndMins < 1320 && (
                            <TimelineWordBar
                              id="evening-free-slot-bar"
                              startTime={lastItem.end_time}
                              endTime={minutesToTime(Math.min(1320, lastEndMins + 90))}
                              durationMins={Math.min(1320, lastEndMins + 90) - lastEndMins}
                              label="Evening Free / Unplanned Time"
                              placeholder="Write evening plan (e.g. Dinner, Night walk, Hotel rest)... or drop place here"
                              onAddCustomActivity={handleQuickAddCustomActivity}
                              onDropPlace={schedulePlaceAt}
                              onMoveItem={moveItemToTime}
                              draggedPlace={draggedPlace}
                              draggedItem={draggedItem}
                            />
                          )}

                          {eveningSlots.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[11px] font-bold text-[#374151]/60 px-1">
                                Quick Drop / Write Slots:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {eveningSlots.map(slotTime => (
                                  <div
                                    key={slotTime}
                                    onClick={() => {
                                      setTopWordBarTime(slotTime);
                                      topInputRef.current?.focus();
                                      topInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setHoveredDropTime(slotTime);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (draggedItem) {
                                        moveItemToTime(draggedItem.id, slotTime);
                                        setDraggedItem(null);
                                      } else if (draggedPlace) {
                                        schedulePlaceAt(draggedPlace, slotTime);
                                        setDraggedPlace(null);
                                      }
                                      setHoveredDropTime(null);
                                    }}
                                    className="py-2 px-3 rounded-xl border border-dashed border-[#D9CFC2] hover:border-[#0EA5A5] bg-[#FBF7F2]/50 hover:bg-[#0EA5A5]/5 transition-all flex items-center justify-between text-xs cursor-pointer group"
                                    title="Click to write plan or drop place here"
                                  >
                                    <span className="font-mono font-bold text-[#0EA5A5] text-xs">
                                      {formatTime12(slotTime)}
                                    </span>
                                    <span className="text-[11px] text-[#374151]/60 group-hover:text-[#0EA5A5] group-hover:font-semibold flex items-center gap-1">
                                      <Plus className="w-3 h-3" />
                                      <span>Write / Drop ({formatTime12(slotTime)})</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* General drop zone at end */}
                    <div
                      onDragOver={e => {
                        e.preventDefault();
                        const lastItem = currentDayItems[currentDayItems.length - 1];
                        const nextMin = Math.max(540, timeToMinutes(lastItem.end_time) + 15);
                        setHoveredDropTime(minutesToTime(snapMinutesTo15(nextMin)));
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        const targetTime = hoveredDropTime || '18:00';
                        if (draggedItem) {
                          moveItemToTime(draggedItem.id, targetTime);
                          setDraggedItem(null);
                        } else if (draggedPlace) {
                          schedulePlaceAt(draggedPlace, targetTime);
                          setDraggedPlace(null);
                        }
                        setHoveredDropTime(null);
                      }}
                      className="py-3 px-4 rounded-xl border border-dashed border-[#D9CFC2] hover:border-[#0EA5A5] text-center text-xs text-[#374151]/70 bg-[#FBF7F2]/40 cursor-pointer"
                    >
                      Drop place cards here to schedule after {formatTime12(currentDayItems[currentDayItems.length - 1].end_time)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom Activity Modal (Simple, non-restrictive, supports personal plans & notes) */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            id="custom-activity-modal"
            className="bg-white rounded-3xl border border-[#D9CFC2] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-5 border-b border-[#EFEAE2] flex items-center justify-between bg-[#FBF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F2937] font-display">
                    {editingCustomActivityId ? 'Edit Activity' : 'Add Activity'}
                  </h3>
                  <p className="text-[11px] text-[#374151]">
                    Day {activeDayIndex + 1} • Add any personal plan or custom activity
                  </p>
                </div>
              </div>
              <button
                id="btn-close-custom-modal"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-xl text-[#374151]/60 hover:text-[#1F2937] hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomActivity} className="p-5 space-y-4">
              {customFormError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{customFormError}</span>
                </div>
              )}

              {/* 1. Activity Name (Required) */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Activity Name <span className="text-[#FF6B4A]">*</span>
                </label>
                <input
                  id="input-custom-activity-title"
                  type="text"
                  required
                  autoFocus
                  value={customTitle}
                  onChange={(e) => {
                    setCustomTitle(e.target.value);
                    if (customFormError) setCustomFormError(null);
                  }}
                  placeholder="e.g., Walk around hotel area, Rest at hotel, Coffee break, Souvenir shop"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CFC2] text-sm text-[#1F2937] placeholder-[#374151]/40 focus:outline-none focus:border-[#0EA5A5] focus:ring-1 focus:ring-[#0EA5A5]"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'Walk around hotel area',
                    'Rest at hotel',
                    'Have coffee',
                    'Souvenir shopping',
                    'Luggage storage / pickup',
                    'Local street exploration'
                  ].map((quickIdea) => (
                    <button
                      key={quickIdea}
                      type="button"
                      onClick={() => {
                        setCustomTitle(quickIdea);
                        if (customFormError) setCustomFormError(null);
                      }}
                      className="text-[10px] font-medium text-[#086666] bg-[#0EA5A5]/10 hover:bg-[#0EA5A5]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      + {quickIdea}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Schedule Times & Duration (15-min snapping) */}
              <div className="bg-[#FBF7F2] p-3.5 rounded-2xl border border-[#D9CFC2]/70 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                      <span>Start Time</span>
                    </label>
                    <select
                      id="select-custom-start-time"
                      value={customStartTime}
                      onChange={(e) => handleCustomStartTimeChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CFC2] bg-white font-mono text-xs font-semibold focus:outline-none focus:border-[#0EA5A5]"
                    >
                      {timeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                      <span>End Time</span>
                    </label>
                    <select
                      id="select-custom-end-time"
                      value={customEndTime}
                      onChange={(e) => handleCustomEndTimeChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CFC2] bg-white font-mono text-xs font-semibold focus:outline-none focus:border-[#0EA5A5]"
                    >
                      {timeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration presets */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D9CFC2]/50">
                  <span className="text-[11px] text-[#374151]/70 font-semibold">
                    Duration: <strong className="text-[#0EA5A5] font-mono">{formatDuration(Math.max(15, timeToMinutes(customEndTime) - timeToMinutes(customStartTime)))}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleCustomDurationPreset(mins)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          timeToMinutes(customEndTime) - timeToMinutes(customStartTime) === mins
                            ? 'bg-[#0EA5A5] text-white border-[#0EA5A5]'
                            : 'bg-white text-[#374151] border-[#D9CFC2] hover:border-[#0EA5A5]'
                        }`}
                      >
                        {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Note (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  Note <span className="text-[#374151]/50 text-[11px] font-normal">(optional)</span>
                </label>
                <textarea
                  id="input-custom-activity-note"
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Add any reminders, packing tips, or details..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D9CFC2] text-xs text-[#1F2937] placeholder-[#374151]/40 focus:outline-none focus:border-[#0EA5A5]"
                />
              </div>

              {/* 4. Optional Location Details Collapsible */}
              <div className="border border-[#D9CFC2]/70 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowLocationSection(!showLocationSection)}
                  className="w-full px-4 py-2.5 bg-[#FBF7F2] hover:bg-[#F4ECE1] text-xs font-bold text-[#1F2937] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0EA5A5]" />
                    <span>Location Details</span>
                    <span className="text-[10px] text-[#374151]/60 font-normal">(optional)</span>
                  </span>
                  <span className="text-xs text-[#0EA5A5] font-semibold">
                    {showLocationSection ? '− Hide' : '+ Add Location Info'}
                  </span>
                </button>

                {showLocationSection && (
                  <div className="p-3.5 space-y-2.5 bg-white text-xs border-t border-[#D9CFC2]/50">
                    <div>
                      <label className="block text-[11px] font-bold text-[#374151] mb-1">
                        Location / Place Name
                      </label>
                      <input
                        type="text"
                        value={customLocationName}
                        onChange={(e) => setCustomLocationName(e.target.value)}
                        placeholder="e.g., Hotel Lobby, Kyoto Station Central Gate, % Arabica"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D9CFC2] text-xs focus:outline-none focus:border-[#0EA5A5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#374151] mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder="e.g., Shimogyo Ward, Higashishiokojicho, Kyoto"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D9CFC2] text-xs focus:outline-none focus:border-[#0EA5A5]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#374151] mb-1">
                          Opening Hours
                        </label>
                        <input
                          type="text"
                          value={customOperatingHours}
                          onChange={(e) => setCustomOperatingHours(e.target.value)}
                          placeholder="e.g., 08:00 – 20:00"
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D9CFC2] text-xs focus:outline-none focus:border-[#0EA5A5]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#374151] mb-1">
                          Website / URL
                        </label>
                        <input
                          type="text"
                          value={customWebsite}
                          onChange={(e) => setCustomWebsite(e.target.value)}
                          placeholder="e.g., https://example.com"
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D9CFC2] text-xs focus:outline-none focus:border-[#0EA5A5]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D9CFC2] text-xs font-bold text-[#374151] hover:bg-[#FBF7F2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-custom-activity"
                  className="px-5 py-2 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCustomActivityId ? 'Save Changes' : 'Add to Timeline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
