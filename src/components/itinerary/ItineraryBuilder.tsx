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
  const [compactActivityName, setCompactActivityName] = useState<string>('');

  // 24-Hour Vertical Timeline states
  const [hoveredDropHour, setHoveredDropHour] = useState<number | null>(null);
  const hourRefs = useRef<{ [hour: number]: HTMLDivElement | null }>({});
  const timelineContainerRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll timeline to first scheduled activity or 08:00 on day switch
  useEffect(() => {
    const firstItem = currentDayItems[0];
    const targetHour = firstItem ? Math.max(0, Math.min(23, parseInt(firstItem.start_time.split(':')[0], 10))) : 8;
    const el = hourRefs.current[targetHour];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeDayIndex]);

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
  };

  // Submit handler for the compact custom activity input bar
  const handleCompactAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compactActivityName || !compactActivityName.trim()) return;
    const cleanTitle = compactActivityName.trim();
    const defaultHour = currentDayItems.length > 0 
      ? Math.min(22, parseInt(currentDayItems[currentDayItems.length - 1].end_time.split(':')[0], 10))
      : 9;
    const startStr = `${String(defaultHour).padStart(2, '0')}:00`;
    const endStr = minutesToTime(Math.min(1440, defaultHour * 60 + 60));
    handleQuickAddCustomActivity(cleanTitle, startStr, endStr);
    setCompactActivityName('');
  };

  // Open add activity modal prefilled for a given hour
  const openAddCustomActivityForHour = (hour: number) => {
    const startStr = `${String(hour).padStart(2, '0')}:00`;
    const endStr = minutesToTime(Math.min(1440, hour * 60 + 60));
    setCustomTitle('');
    setCustomStartTime(startStr);
    setCustomEndTime(endStr);
    setCustomNote('');
    setCustomLocationName('');
    setCustomAddress('');
    setCustomOperatingHours('');
    setCustomWebsite('');
    setCustomFormError(null);
    setEditingCustomActivityId(null);
    setIsCustomModalOpen(true);
  };

  // Drag over a specific hour row on the 24-hour timeline (15-min snapping)
  const handleHourDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (!draggedPlace && !draggedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(0.99, offsetY / Math.max(1, rect.height)));
    const quarter = Math.floor(ratio * 4);
    const minute = quarter * 15;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setHoveredDropTime(timeStr);
    setHoveredDropHour(hour);
  };

  // Drop on a specific hour row on the 24-hour timeline (auto-updates activity time)
  const handleHourDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(0.99, offsetY / Math.max(1, rect.height)));
    const quarter = Math.floor(ratio * 4);
    const minute = quarter * 15;
    const targetTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    if (draggedItem) {
      moveItemToTime(draggedItem.id, targetTime);
      setDraggedItem(null);
    } else if (draggedPlace) {
      schedulePlaceAt(draggedPlace, targetTime);
      setDraggedPlace(null);
    }

    setHoveredDropTime(null);
    setHoveredDropHour(null);
    setDropTargetInfo(null);
  };

  // Generate full 24 hours (00:00 to 24:00)
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
        </div>

        {/* RIGHT PANEL (~2/3 width: 8 cols) - Vertical 24-hour timeline */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#D9CFC2] p-6 shadow-xs">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[#EFEAE2]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0EA5A5]" />
              <h2 className="text-base font-bold text-[#1F2937] font-display">
                Day {activeDayIndex + 1} • 24-Hour Timeline (00:00–24:00)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0EA5A5] bg-[#0EA5A5]/10 px-3 py-1 rounded-xl">
                {currentDayItems?.length || 0} Scheduled
              </span>
            </div>
          </div>

          {/* Compact Custom Activity Add Option */}
          <div className="mb-4 p-2.5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] flex flex-wrap items-center justify-between gap-2.5">
            <span className="text-xs font-bold text-[#1F2937] shrink-0 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <span>Custom Activity</span>
            </span>
            <form
              id="form-compact-custom-activity"
              onSubmit={handleCompactAddSubmit}
              className="flex items-center gap-2 flex-1 max-w-lg"
            >
              <input
                id="input-compact-custom-activity"
                type="text"
                value={compactActivityName}
                onChange={(e) => setCompactActivityName(e.target.value)}
                placeholder="e.g., Rest at hotel, Hotel breakfast, Shopping for souvenirs"
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#D9CFC2] bg-white text-xs text-[#1F2937] placeholder-[#374151]/50 focus:outline-none focus:border-[#0EA5A5]"
              />
              <button
                id="btn-add-activity-header"
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Quick jump hour anchors for effortless navigation */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4 px-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[#374151]/70 mr-1">Quick jump:</span>
              {[
                { label: '06:00 Morning', hour: 6 },
                { label: '09:00', hour: 9 },
                { label: '12:00 Lunch', hour: 12 },
                { label: '15:00', hour: 15 },
                { label: '18:00 Dinner', hour: 18 },
                { label: '21:00 Evening', hour: 21 }
              ].map(chip => (
                <button
                  key={chip.hour}
                  type="button"
                  onClick={() => {
                    const el = hourRefs.current[chip.hour];
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="text-[11px] font-medium text-[#086666] bg-[#0EA5A5]/10 hover:bg-[#0EA5A5]/20 border border-[#0EA5A5]/25 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-[#374151]/60 font-medium">
              Drag & drop places or activities to any hour
            </span>
          </div>

          {/* Active Dragging Banner Notification */}
          {(draggedPlace || draggedItem) && (
            <div className="mb-4 py-2 px-4 rounded-xl border border-[#0EA5A5] bg-[#0EA5A5]/10 text-xs font-bold text-[#086666] flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0EA5A5]" />
                <span>
                  {draggedItem
                    ? `Moving "${draggedItem.place_name}" — drag and drop to any hour or position`
                    : `Scheduling "${draggedPlace?.name}" — drag and drop to any hour or position`}
                </span>
              </div>
              {hoveredDropTime && (
                <span className="bg-[#0EA5A5] text-white px-2.5 py-0.5 rounded-lg text-xs font-mono">
                  Drop Time: {formatTime12(hoveredDropTime)} ({hoveredDropTime})
                </span>
              )}
            </div>
          )}

          {/* Simple, Stable 24-Hour Vertical Timeline (00:00 - 24:00) */}
          <div
            ref={timelineContainerRef}
            id="vertical-24h-timeline"
            className="border border-[#EFEAE2] rounded-2xl bg-white shadow-2xs divide-y divide-[#EFEAE2] overflow-hidden"
          >
            {hours.map((h) => {
              const hourStr = `${String(h).padStart(2, '0')}:00`;
              const isHovered = hoveredDropHour === h;
              const activitiesInHour = currentDayItems.filter((item) => {
                const startMin = timeToMinutes(item.start_time);
                return startMin >= h * 60 && startMin < (h + 1) * 60;
              });

              return (
                <div
                  key={h}
                  ref={(el) => {
                    hourRefs.current[h] = el;
                  }}
                  id={`timeline-hour-${h}`}
                  onDragOver={(e) => handleHourDragOver(e, h)}
                  onDragLeave={() => {
                    if (hoveredDropHour === h) {
                      setHoveredDropHour(null);
                    }
                  }}
                  onDrop={(e) => handleHourDrop(e, h)}
                  className={`flex items-stretch min-h-[58px] transition-colors ${
                    isHovered ? 'bg-[#0EA5A5]/10' : 'hover:bg-[#FBF7F2]/40'
                  }`}
                >
                  {/* Left Column: Hour label (e.g. 09:00 / 9:00 AM) */}
                  <div className="w-20 sm:w-24 shrink-0 py-3 pr-3 sm:pr-4 text-right select-none border-r border-[#EFEAE2] bg-[#FBF7F2]/50 flex flex-col justify-start">
                    <span className="font-mono font-bold text-xs text-[#1F2937]">
                      {hourStr}
                    </span>
                    <span className="text-[10px] text-[#374151]/55 font-medium leading-tight">
                      {formatTime12(hourStr)}
                    </span>
                  </div>

                  {/* Right Column: Droppable Activity Track */}
                  <div className="flex-1 p-2 sm:p-2.5 min-w-0 relative">
                    {/* Active snap drop preview if hovering over this hour */}
                    {isHovered && (
                      <div className="mb-2 p-2 rounded-xl bg-[#0EA5A5]/15 border-2 border-dashed border-[#0EA5A5] text-xs font-bold text-[#086666] flex items-center justify-between animate-in fade-in duration-100">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                          <span>Release to place here</span>
                        </span>
                        <span className="bg-[#0EA5A5] text-white px-2 py-0.5 rounded-md font-mono text-[11px]">
                          {formatTime12(hoveredDropTime || hourStr)} ({hoveredDropTime || hourStr})
                        </span>
                      </div>
                    )}

                    {/* Scheduled Activities starting in this hour */}
                    {activitiesInHour.length > 0 ? (
                      <div className="space-y-2">
                        {activitiesInHour.map((item) => {
                          const isBeingDragged = draggedItem?.id === item.id;
                          const conflicts = getItemConflicts(item);
                          const isConflicting = conflicts.length > 0;
                          const isEditing = editingTimeItemId === item.id;
                          const curIdx = currentDayItems.findIndex((ci) => ci.id === item.id);

                          return (
                            <div
                              key={item.id}
                              id={`timeline-activity-${item.id}`}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', item.id);
                                setDraggedItem(item);
                                setDraggedPlace(null);
                              }}
                              onDragEnd={() => {
                                setDraggedItem(null);
                                setDraggedPlace(null);
                                setHoveredDropTime(null);
                                setHoveredDropHour(null);
                              }}
                              className={`bg-[#FBF7F2] rounded-2xl border transition-all p-3 sm:p-4 ${
                                isBeingDragged ? 'opacity-30 border-dashed border-[#0EA5A5]' : ''
                              } ${
                                isConflicting
                                  ? 'border-amber-400 bg-amber-50/40'
                                  : 'border-[#D9CFC2] hover:border-[#0EA5A5] shadow-2xs'
                              }`}
                            >
                              {/* Card Header: Grip handle, Time badge, Quick adjustments, Action buttons */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                  {/* Grip handle */}
                                  <div
                                    className="p-1 rounded-md text-[#374151]/50 hover:text-[#0EA5A5] hover:bg-white cursor-grab active:cursor-grabbing transition-colors"
                                    title="Drag and drop to any other hour"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  {/* Time badge: Click to open time selector */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      isEditing ? setEditingTimeItemId(null) : handleOpenTimeEdit(item)
                                    }
                                    className="font-mono font-bold text-xs text-[#0EA5A5] bg-white px-2.5 py-1 rounded-lg border border-[#D9CFC2]/70 hover:border-[#0EA5A5] transition-colors flex items-center gap-1.5 cursor-pointer"
                                    title="Adjust time"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                                    <span>
                                      {formatTime12(item.start_time)} – {formatTime12(item.end_time)}
                                    </span>
                                    <span className="text-[10px] text-[#374151]/50 hidden sm:inline">
                                      ({item.start_time}–{item.end_time})
                                    </span>
                                  </button>

                                  <span className="text-[11px] font-semibold text-[#374151]/70">
                                    ({formatDuration(item.duration_mins)})
                                  </span>

                                  {/* Quick -15m / +15m Duration Buttons */}
                                  <div className="flex items-center bg-white rounded-lg border border-[#D9CFC2]/70 p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleResizeDuration(item.id, -15)}
                                      disabled={item.duration_mins <= 15}
                                      className="px-1.5 py-0.5 text-[10px] font-bold text-[#374151] hover:text-[#0EA5A5] disabled:opacity-30 rounded hover:bg-[#FBF7F2] cursor-pointer"
                                      title="Shorten by 15 mins"
                                    >
                                      -15m
                                    </button>
                                    <span className="text-[9px] text-[#374151]/30">|</span>
                                    <button
                                      type="button"
                                      onClick={() => handleResizeDuration(item.id, 15)}
                                      className="px-1.5 py-0.5 text-[10px] font-bold text-[#374151] hover:text-[#0EA5A5] rounded hover:bg-[#FBF7F2] cursor-pointer"
                                      title="Extend by 15 mins"
                                    >
                                      +15m
                                    </button>
                                  </div>
                                </div>

                                {/* Reorder, Map link, Edit details, Delete */}
                                <div className="flex items-center gap-1 sm:gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleShiftItemOrder(item.id, 'earlier')}
                                    disabled={curIdx === 0}
                                    className="p-1 rounded-md text-[#374151]/60 hover:text-[#0EA5A5] hover:bg-white disabled:opacity-20 transition-colors cursor-pointer"
                                    title="Shift earlier"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleShiftItemOrder(item.id, 'later')}
                                    disabled={curIdx === currentDayItems.length - 1}
                                    className="p-1 rounded-md text-[#374151]/60 hover:text-[#0EA5A5] hover:bg-white disabled:opacity-20 transition-colors cursor-pointer"
                                    title="Shift later"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>

                                  {item.maps_url && (
                                    <a
                                      href={item.maps_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#374151]/60 hover:text-[#0EA5A5] p-1 rounded-md hover:bg-white transition-colors"
                                      title="View on Maps"
                                    >
                                      <MapPin className="w-3.5 h-3.5" />
                                    </a>
                                  )}

                                  <button
                                    type="button"
                                    id={`btn-edit-details-${item.id}`}
                                    onClick={() => openEditCustomActivity(item)}
                                    className="text-[#374151]/60 hover:text-[#0EA5A5] p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                                    title="Edit details & notes"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-[#374151]/60 hover:text-[#E85555] p-1 rounded-md hover:bg-white transition-colors cursor-pointer"
                                    title="Remove from itinerary"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Inline Time Editor if toggled */}
                              {isEditing && (
                                <div className="mb-3 p-3 rounded-xl bg-white border border-[#0EA5A5] shadow-xs space-y-3">
                                  <div className="flex items-center justify-between pb-1 border-b border-[#EFEAE2]">
                                    <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
                                      <span>Select Time (15-min snapping)</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTimeItemId(null)}
                                      className="text-xs font-bold text-[#374151]/60 hover:text-[#1F2937] cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                      <label className="block text-[11px] font-bold text-[#374151] mb-1">
                                        Start Time
                                      </label>
                                      <select
                                        value={editStartTime}
                                        onChange={(e) => handleEditStartTimeChange(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#D9CFC2] bg-[#FBF7F2] font-mono text-xs font-semibold focus:outline-none focus:border-[#0EA5A5]"
                                      >
                                        {timeOptions.map((opt) => (
                                          <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-bold text-[#374151] mb-1">
                                        End Time
                                      </label>
                                      <select
                                        value={editEndTime}
                                        onChange={(e) => handleEditEndTimeChange(e.target.value)}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#D9CFC2] bg-[#FBF7F2] font-mono text-xs font-semibold focus:outline-none focus:border-[#0EA5A5]"
                                      >
                                        {timeOptions.map((opt) => (
                                          <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-bold text-[#374151] mb-1">
                                        Duration
                                      </label>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
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
                                          type="button"
                                          onClick={() => handleEditDurationChange(editDuration + 15)}
                                          className="px-2 py-1 bg-[#FBF7F2] border border-[#D9CFC2] rounded-md font-bold text-xs hover:bg-[#EFEAE2] cursor-pointer"
                                        >
                                          +15m
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#EFEAE2]">
                                    <button
                                      type="button"
                                      onClick={() => setEditingTimeItemId(null)}
                                      className="px-3 py-1 text-xs font-semibold text-[#374151] hover:underline cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
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
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 bg-[#EFEAE2]"
                                  />
                                ) : (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex flex-col items-center justify-center shrink-0 border border-[#0EA5A5]/20">
                                    <Sparkles className="w-5 h-5 mb-0.5" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Plan</span>
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-bold text-sm text-[#1F2937] truncate">
                                      {item.place_name}
                                    </h4>
                                    {item.category && (
                                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-[#D9CFC2] text-[#0EA5A5]">
                                        {item.category}
                                      </span>
                                    )}
                                  </div>

                                  {item.notes && (
                                    <p className="text-xs text-[#374151]/80 line-clamp-2 leading-relaxed">
                                      {item.notes}
                                    </p>
                                  )}

                                  {item.transport_to_next && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#086666] bg-[#0EA5A5]/10 px-2.5 py-1 rounded-lg border border-[#0EA5A5]/25 w-fit">
                                      <Navigation className="w-3 h-3 text-[#0EA5A5]" />
                                      <span>
                                        {item.transport_to_next.mode === 'walk' && '🚶 '}
                                        {item.transport_to_next.mode === 'subway' && '🚇 '}
                                        {item.transport_to_next.mode === 'taxi' && '🚕 '}
                                        {item.transport_to_next.detail} (~{item.transport_to_next.duration_mins} min)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Empty Hour Slot: clean, stable, droppable, or click to add activity */
                      <div
                        onClick={() => openAddCustomActivityForHour(h)}
                        className="h-10 rounded-xl border border-dashed border-transparent hover:border-[#0EA5A5]/50 hover:bg-[#0EA5A5]/5 flex items-center px-3 text-xs text-[#374151]/40 hover:text-[#0EA5A5] cursor-pointer transition-all"
                        title={`Click to schedule activity at ${hourStr} or drop place card here`}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                        <span>+ Drop place here, or click to schedule at {hourStr}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 24:00 Closing Boundary */}
            <div className="flex items-center min-h-[44px] bg-[#FBF7F2]/60 border-t border-[#EFEAE2]">
              <div className="w-20 sm:w-24 shrink-0 py-2.5 pr-3 sm:pr-4 text-right border-r border-[#EFEAE2]">
                <span className="font-mono font-bold text-xs text-[#1F2937]">24:00</span>
                <span className="block text-[10px] text-[#374151]/55 font-medium leading-tight">12:00 AM</span>
              </div>
              <div className="flex-1 px-4 py-2 text-xs font-semibold text-[#374151]/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0EA5A5]/40" />
                <span>End of Day {activeDayIndex + 1} (24:00)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Activity Modal (Simple, compact, only activity name and action button) */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            id="custom-activity-modal"
            className="bg-white rounded-3xl border border-[#D9CFC2] shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-4 border-b border-[#EFEAE2] flex items-center justify-between bg-[#FBF7F2]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937] font-display">
                  {editingCustomActivityId ? 'Edit Activity' : 'Custom Activity'}
                </h3>
              </div>
              <button
                id="btn-close-custom-modal"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-lg text-[#374151]/60 hover:text-[#1F2937] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomActivity} className="p-4 space-y-3">
              {customFormError && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>{customFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Activity Name
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
                  placeholder="e.g., Rest at hotel, Hotel breakfast, Shopping for souvenirs"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC2] text-xs text-[#1F2937] placeholder-[#374151]/50 focus:outline-none focus:border-[#0EA5A5] focus:ring-1 focus:ring-[#0EA5A5]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#D9CFC2] text-xs font-semibold text-[#374151] hover:bg-[#FBF7F2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-custom-activity"
                  className="px-4 py-1.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCustomActivityId ? 'Save' : 'Add Activity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
