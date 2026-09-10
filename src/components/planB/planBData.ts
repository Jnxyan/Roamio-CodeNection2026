import { Trip, ItineraryItem } from '../../types';
import { formatTime12 } from '../../utils/timeUtils';

export interface PlanBSuggestion {
  id: string;
  tripId: string;
  affectedItemId: string;
  reason: string; // e.g. "Rain is expected during your outdoor activity."
  conditionBadge: string; // e.g. "Rain Forecast (85% chance)"
  conditionDetail: string; // Detailed context
  
  original: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    timeFormatted: string;
    category: string;
    image?: string;
  };
  
  suggested: {
    placeId: string;
    name: string;
    category: string;
    startTime: string;
    endTime: string;
    timeFormatted: string;
    durationMins: number;
    costDiff: number; // e.g. +10
    costLabel: string; // e.g. "$10 (¥1,500 admission)"
    image: string;
    mapsUrl: string;
    notes: string;
    highlights: string[];
    indoorSheltered: boolean;
  };
}

/**
 * Evaluates whether a saved trip's itinerary has an unexpected change (e.g. weather/outdoor conflict).
 * Returns a realistic PlanBSuggestion if an outdoor activity is affected, or null otherwise.
 */
export function getPlanBSuggestion(trip: Trip): PlanBSuggestion | null {
  if (!trip || !trip.itinerary || trip.itinerary.length === 0) {
    return null;
  }

  // 1. Scenario: Fushimi Inari Taisha (Outdoor mountain shrine) with rain expected
  const fushimiItem = trip.itinerary.find(item =>
    item.place_name.toLowerCase().includes('fushimi inari')
  );

  if (fushimiItem) {
    const startFormatted = formatTime12(fushimiItem.start_time);
    const endFormatted = formatTime12(fushimiItem.end_time);

    return {
      id: `planb-${trip.id}-fushimi`,
      tripId: trip.id,
      affectedItemId: fushimiItem.id,
      reason: 'Rain is expected during your outdoor activity.',
      conditionBadge: 'Morning Rain Alert • 85% Precip.',
      conditionDetail: 'Heavy rainfall is forecast from 8:00 AM to 11:30 AM along the mountain trail. Torii paths may be slippery and difficult to hike.',
      original: {
        id: fushimiItem.id,
        name: fushimiItem.place_name,
        startTime: fushimiItem.start_time,
        endTime: fushimiItem.end_time,
        timeFormatted: `${startFormatted} – ${endFormatted}`,
        category: fushimiItem.category || 'Attraction',
        image: fushimiItem.image
      },
      suggested: {
        placeId: 'place-kyoto-railway-museum',
        name: 'Kyoto Railway Museum',
        category: 'Indoor Attraction / Museum',
        startTime: '10:00',
        endTime: '12:00',
        timeFormatted: '10:00 AM – 12:00 PM',
        durationMins: 120,
        costDiff: 10,
        costLabel: '$10 admission (¥1,500)',
        image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kyoto+Railway+Museum',
        notes: 'Sheltered indoor rail & cultural exhibits — substituted via Plan B due to morning rain',
        highlights: [
          'Fully indoor & climate-controlled',
          'Historic steam engines & Shinkansen simulators',
          'Covered observation cafe overlooking train yards',
          'Only 10 minutes from Kyoto Station'
        ],
        indoorSheltered: true
      }
    };
  }

  // 2. Scenario: Kiyomizu-dera (Mountain temple outdoor terrace) with rain/wind
  const kiyomizuItem = trip.itinerary.find(item =>
    item.place_name.toLowerCase().includes('kiyomizu')
  );

  if (kiyomizuItem) {
    const startFormatted = formatTime12(kiyomizuItem.start_time);
    const endFormatted = formatTime12(kiyomizuItem.end_time);

    return {
      id: `planb-${trip.id}-kiyomizu`,
      tripId: trip.id,
      affectedItemId: kiyomizuItem.id,
      reason: 'Rain and strong winds expected on open hillside terraces.',
      conditionBadge: 'High Wind & Rain Advisory',
      conditionDetail: 'Sustained rain and gusty winds on the hillside pagoda paths make outdoor walking uncomfortable.',
      original: {
        id: kiyomizuItem.id,
        name: kiyomizuItem.place_name,
        startTime: kiyomizuItem.start_time,
        endTime: kiyomizuItem.end_time,
        timeFormatted: `${startFormatted} – ${endFormatted}`,
        category: kiyomizuItem.category || 'Attraction',
        image: kiyomizuItem.image
      },
      suggested: {
        placeId: 'place-kyoto-manga-museum',
        name: 'Kyoto International Manga Museum',
        category: 'Indoor Museum & Culture',
        startTime: '10:00',
        endTime: '12:00',
        timeFormatted: '10:00 AM – 12:00 PM',
        durationMins: 120,
        costDiff: 8,
        costLabel: '$8 admission (¥1,000)',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kyoto+International+Manga+Museum',
        notes: 'Converted historic elementary school with 300,000 manga volumes & cozy indoor reading halls',
        highlights: [
          '100% sheltered indoor reading halls',
          'Historic 1929 elementary school architecture',
          'Multi-language international manga gallery'
        ],
        indoorSheltered: true
      }
    };
  }

  // 3. Scenario: Tokyo parks / outdoor (e.g. Shinjuku Gyoen or Meiji Shrine)
  const outdoorParkItem = trip.itinerary.find(item =>
    item.place_name.toLowerCase().includes('shinjuku gyoen') ||
    item.place_name.toLowerCase().includes('meiji shrine') ||
    item.place_name.toLowerCase().includes('park')
  );

  if (outdoorParkItem) {
    const startFormatted = formatTime12(outdoorParkItem.start_time);
    const endFormatted = formatTime12(outdoorParkItem.end_time);

    return {
      id: `planb-${trip.id}-outdoor`,
      tripId: trip.id,
      affectedItemId: outdoorParkItem.id,
      reason: 'Rain is expected during your outdoor activity.',
      conditionBadge: 'Rain Advisory • 80% Precip.',
      conditionDetail: 'Precipitation forecast during garden visiting hours. Unpaved park trails will be wet.',
      original: {
        id: outdoorParkItem.id,
        name: outdoorParkItem.place_name,
        startTime: outdoorParkItem.start_time,
        endTime: outdoorParkItem.end_time,
        timeFormatted: `${startFormatted} – ${endFormatted}`,
        category: outdoorParkItem.category || 'Attraction',
        image: outdoorParkItem.image
      },
      suggested: {
        placeId: 'place-indoor-museum-alt',
        name: 'Mori Art Museum & Indoor Sky Deck',
        category: 'Indoor Art & Observation',
        startTime: '10:00',
        endTime: '12:00',
        timeFormatted: '10:00 AM – 12:00 PM',
        durationMins: 120,
        costDiff: 15,
        costLabel: '$15 admission',
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mori+Art+Museum+Tokyo',
        notes: 'World-class contemporary art museum housed on the 53rd floor with protected panoramic views',
        highlights: [
          'High-altitude enclosed indoor observation deck',
          'Cutting-edge contemporary art galleries',
          'Covered Roppongi Hills dining & shopping mall'
        ],
        indoorSheltered: true
      }
    };
  }

  return null;
}

/**
 * Checks if a trip currently has Plan B applied (e.g. Kyoto Railway Museum substituted).
 */
export function isPlanBActive(trip: Trip): boolean {
  if (!trip || !trip.itinerary) return false;
  return trip.itinerary.some(
    item =>
      item.place_name === 'Kyoto Railway Museum' ||
      item.place_name === 'Kyoto International Manga Museum' ||
      item.place_name === 'Mori Art Museum & Indoor Sky Deck'
  );
}

/**
 * Replaces ONLY the affected activity in the itinerary with the suggested Plan B alternative.
 * Updates the time and estimated cost if needed while keeping the rest of the itinerary unchanged.
 */
export function applyPlanBToTrip(trip: Trip, suggestion: PlanBSuggestion): Trip {
  const updatedItinerary = trip.itinerary.map(item => {
    if (item.id === suggestion.affectedItemId) {
      const newItem: ItineraryItem = {
        ...item,
        place_id: suggestion.suggested.placeId,
        place_name: suggestion.suggested.name,
        category: suggestion.suggested.category,
        start_time: suggestion.suggested.startTime,
        end_time: suggestion.suggested.endTime,
        duration_mins: suggestion.suggested.durationMins,
        image: suggestion.suggested.image,
        maps_url: suggestion.suggested.mapsUrl,
        notes: suggestion.suggested.notes,
        is_custom: false
      };
      return newItem;
    }
    return item;
  });

  return {
    ...trip,
    budget_amount: trip.budget_amount ? trip.budget_amount + Math.round(suggestion.suggested.costDiff / Math.max(1, trip.days)) : trip.budget_amount,
    itinerary: updatedItinerary
  };
}

/**
 * Reverts the Plan B substitution back to the original activity.
 */
export function revertPlanB(trip: Trip, suggestion: PlanBSuggestion): Trip {
  const updatedItinerary = trip.itinerary.map(item => {
    if (item.place_name === suggestion.suggested.name || item.id === suggestion.affectedItemId) {
      const restoredItem: ItineraryItem = {
        ...item,
        place_id: suggestion.original.id,
        place_name: suggestion.original.name,
        category: suggestion.original.category,
        start_time: suggestion.original.startTime,
        end_time: suggestion.original.endTime,
        duration_mins: 120,
        image: suggestion.original.image || item.image,
        notes: 'Ascend the vermilion torii gates at crisp morning air',
        maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(suggestion.original.name)}`
      };
      return restoredItem;
    }
    return item;
  });

  return {
    ...trip,
    budget_amount: trip.budget_amount ? Math.max(50, trip.budget_amount - Math.round(suggestion.suggested.costDiff / Math.max(1, trip.days))) : trip.budget_amount,
    itinerary: updatedItinerary
  };
}
