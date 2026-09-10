import { Trip, ItineraryItem, PlanBAlert } from '../types';
import { timeToMinutes, minutesToTime, generateTransportEstimate } from '../utils/timeUtils';

/**
 * Calculates the number of days until the trip start date.
 * If trip.simulated_days_until is explicitly set (for prototyping/testing), it takes precedence.
 */
export function calculateDaysUntilTrip(trip: Trip): number {
  if (trip.simulated_days_until !== undefined && trip.simulated_days_until !== null) {
    return trip.simulated_days_until;
  }

  if (!trip.start_date) return 30;

  try {
    const today = new Date();
    // Normalize to midnight UTC for clean calendar day difference
    const tripStart = new Date(trip.start_date);
    const diffTime = tripStart.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 30;
  }
}

/**
 * Plan B is only relevant when the trip is getting close (1 to 3 days away).
 * If the trip is far away (e.g., > 3 days), no alert is shown.
 */
export function isTripClose(daysUntil: number): boolean {
  return daysUntil >= 0 && daysUntil <= 3;
}

/**
 * Generates or retrieves an existing Plan B unexpected change alert.
 * Based on the user's actual itinerary and realistic mock circumstances.
 */
export function getOrGeneratePlanBAlert(trip: Trip): PlanBAlert | null {
  const daysUntil = calculateDaysUntilTrip(trip);

  // Requirement 2: Far away trips do NOT show unexpected change alerts
  if (!isTripClose(daysUntil)) {
    return null;
  }

  // If already exists on the trip, update the days_until and return
  if (trip.plan_b_alert) {
    return {
      ...trip.plan_b_alert,
      days_until_trip: daysUntil
    };
  }

  // Scan the trip itinerary for an outdoor activity or the classic Fushimi Inari example
  const itinerary = trip.itinerary || [];
  if (itinerary.length === 0) return null;

  // Search for Fushimi Inari or an outdoor attraction
  const fushimiItem = itinerary.find(i => 
    i.place_name.toLowerCase().includes('fushimi') || 
    i.place_name.toLowerCase().includes('inari')
  );

  const outdoorItem = fushimiItem || itinerary.find(i => 
    i.place_type === 'attraction' && 
    (i.category === 'Attraction' || i.category === 'Nature' || i.category === 'Culture')
  ) || itinerary[0];

  const dayIndex = outdoorItem.day_index;
  const dayNumber = dayIndex + 1;

  // Default Kyoto mock Plan B as specified by the user
  const isKyoto = (trip.destinations || []).some(d => d.toLowerCase().includes('kyoto'));

  let suggestedPlanB: PlanBAlert['suggested_plan_b'];

  if (isKyoto || fushimiItem) {
    suggestedPlanB = {
      place_id: 'place-kyoto-railway-museum',
      place_name: 'Kyoto Railway Museum',
      category: 'Culture & Museum',
      image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=700&q=80',
      start_time: outdoorItem.start_time || '09:00',
      end_time: outdoorItem.end_time || '11:00',
      duration_mins: outdoorItem.duration_mins || 120,
      is_indoor: true,
      distance_from_next: '10 min from your next location',
      ticket_cost: '¥1,500 (~$10 / adult)',
      cost_amount: 10,
      traveler_suitability: 'All ages • Senior, adult & child friendly',
      activity_type: 'Indoor Historic & Cultural Museum',
      reason: '100% covered indoor facility featuring 53 historic locomotives and panoramic observation decks, fully sheltered from heavy rain and only 10 minutes from your scheduled lunch venue.',
      notes: 'Indoor interactive museum with historic train exhibits & steam simulator. Perfect sheltered alternative during rainy morning.',
      maps_url: 'https://www.google.com/maps/search/?api=1&query=Kyoto+Railway+Museum'
    };
  } else {
    // Adaptive indoor alternative for other destinations
    const dest = (trip.destinations && trip.destinations[0]) || 'Destination';
    suggestedPlanB = {
      place_id: 'place-indoor-museum-alt',
      place_name: `${dest.split(',')[0]} National Art & Heritage Center`,
      category: 'Culture & Museum',
      image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=700&q=80',
      start_time: outdoorItem.start_time || '09:00',
      end_time: outdoorItem.end_time || '11:00',
      duration_mins: outdoorItem.duration_mins || 120,
      is_indoor: true,
      distance_from_next: '12 min from your next location',
      ticket_cost: '$15 / adult',
      cost_amount: 15,
      traveler_suitability: 'All ages • Family & culture lovers',
      activity_type: 'Indoor Gallery & Exhibition Hall',
      reason: 'Fully air-conditioned, sheltered cultural complex with zero exposure to outdoor weather changes.',
      notes: 'Sheltered indoor alternative with world-class exhibits and direct metro access.',
      maps_url: 'https://www.google.com/maps'
    };
  }

  const alert: PlanBAlert = {
    id: `alert-weather-${trip.id}-${Date.now()}`,
    trip_id: trip.id,
    days_until_trip: daysUntil,
    alert_type: 'weather_rain',
    title: `Rain is expected during your outdoor activity on Day ${dayNumber}`,
    description: `Heavy precipitation (85% chance, 15mm/hr) is forecast during your visit to ${outdoorItem.place_name}. Wet conditions will make outdoor walking slippery.`,
    affected_day_index: dayIndex,
    affected_item_id: outdoorItem.id,
    affected_item_name: outdoorItem.place_name,
    affected_time: `${outdoorItem.start_time} – ${outdoorItem.end_time}`,
    weather_details: {
      forecast: 'Rain & Strong Gusts',
      precipitation_chance: '85%',
      temperature: '16°C'
    },
    suggested_plan_b: suggestedPlanB,
    status: 'pending'
  };

  return alert;
}

/**
 * Applies Plan B to the trip:
 * - Replaces the affected activity in the timeline with the suggested Plan B
 * - Updates the timeline and times if needed
 * - Updates estimated costs if needed
 * - Keeps the rest of the itinerary completely intact
 */
export function applyPlanB(trip: Trip, alert: PlanBAlert): Trip {
  const updatedItinerary = (trip.itinerary || []).map((item) => {
    if (item.id === alert.affected_item_id) {
      const planB = alert.suggested_plan_b;
      return {
        ...item,
        place_id: planB.place_id,
        place_name: planB.place_name,
        category: planB.category,
        image: planB.image,
        start_time: planB.start_time,
        end_time: planB.end_time,
        duration_mins: planB.duration_mins,
        maps_url: planB.maps_url || item.maps_url,
        notes: `[Plan B Applied] ${planB.notes}`,
        transport_to_next: item.transport_to_next
          ? {
              ...item.transport_to_next,
              detail: `${planB.distance_from_next} to next venue`
            }
          : undefined
      };
    }
    return item;
  });

  const updatedAlert: PlanBAlert = {
    ...alert,
    status: 'applied'
  };

  return {
    ...trip,
    itinerary: updatedItinerary,
    plan_b_alert: updatedAlert
  };
}

/**
 * Dismisses Plan B: "Keep Current Plan"
 * Keeps the itinerary exactly as it is, marking the alert as dismissed.
 */
export function dismissPlanB(trip: Trip, alert: PlanBAlert): Trip {
  const updatedAlert: PlanBAlert = {
    ...alert,
    status: 'dismissed'
  };

  return {
    ...trip,
    plan_b_alert: updatedAlert
  };
}
