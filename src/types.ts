export type CategoryFilter = 'all' | 'destinations' | 'hotels' | 'restaurants' | 'plans';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  short_description: string;
  gallery: string[];
  cover_photo: string;
  rating: number;
  reviews_count: number;
  energy_level: number; // 1 to 5 lightning bolts
  activities: string[];
  operating_hours: string;
  maps_url: string;
  ticket_price: string; // "Free", "$24", etc.
  is_free?: boolean;
  typical_visit_time?: string;
  avg_budget_tiers?: {
    backpacker: number;
    balanced: number;
    luxury: number;
  };
  typical_days?: number;
  itinerary_example?: {
    day: number;
    title: string;
    highlights: string[];
  }[];
  reviews: Review[];
}

export interface Hotel {
  id: string;
  destination_id: string;
  destination_name: string;
  name: string;
  image: string;
  gallery?: string[];
  pricing: {
    per_night: number;
    currency: string;
    est_total?: number;
  };
  room_types: string[];
  amenities: string[];
  booking_link: string;
  operating_hours: string;
  maps_url: string;
  rating: number;
  reviews_count: number;
  typical_days: number;
}

export interface Restaurant {
  id: string;
  destination_id: string;
  destination_name: string;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  price_level: string; // '$', '$$', '$$$', '$$$$'
  avg_budget: number;
  operating_hours: string;
  maps_url: string;
  menu_highlights: {
    name: string;
    price: string;
    desc: string;
    is_signature?: boolean;
  }[];
  reviews: {
    id: string;
    user: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
  }[];
  avg_duration_mins: number;
}

export interface Plan {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  is_verified_traveler: boolean;
  title: string;
  destination_id: string;
  destination_name: string;
  cover_photo: string;
  days: number;
  total_spend: number;
  spend_breakdown: {
    food: number;
    tickets: number;
    flights: number;
    accommodation: number;
    transport: number;
    other: number;
  };
  description: string;
  flight_details: {
    airline: string;
    from_airport: string;
    to_airport: string;
    duration?: string;
  };
  day_by_day: {
    day: number;
    title: string;
    highlights: string[];
    schedule: {
      time: string;
      activity: string;
      notes?: string;
      category?: string;
    }[];
  }[];
  packing_list: string[];
  cautions: string[];
  etiquette_tips: string[];
  is_template: boolean;
  likes: number;
  saves: number;
  created_at: string;
}

export interface Traveler {
  id: string;
  name: string;
  age: number;
  interests: string[];
}

export interface FlightOption {
  id: string;
  airline: string;
  flight_no: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  stops: string;
  price: number;
  booking_url: string;
}

export interface HotelOption {
  id: string;
  hotel_name: string;
  room_type: string;
  rating: number;
  price_per_night: number;
  total_hotel_price: number;
  booking_url: string;
}

export interface FlightHotelSuggestion {
  id: string;
  tier_name: string; // "Great Value", "Most Popular", "Premium Comfort"
  badge_color?: string;
  flight: FlightOption;
  hotel: HotelOption;
  total_combined_price: number;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_index: number; // 0-based or 1-based
  place_id: string;
  place_name: string;
  place_type: 'destination' | 'attraction' | 'restaurant' | 'hotel' | 'activity';
  start_time: string; // HH:mm snapping at :00, :15, :30, :45
  end_time: string;   // HH:mm
  duration_mins: number;
  image: string;
  category: string;
  maps_url?: string;
  notes?: string;
  transport_to_next?: {
    mode: 'walk' | 'subway' | 'taxi' | 'bus';
    duration_mins: number;
    detail: string;
  };
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  origin: {
    country: string;
    city: string;
  };
  destinations: string[]; // destination names or IDs
  start_date: string;
  end_date: string;
  days: number;
  budget_tier: 'backpacker' | 'balanced' | 'luxury';
  budget_amount: number;
  travelers: Traveler[];
  is_group: boolean;
  mode: 'auto' | 'manual';
  combined_package?: FlightHotelSuggestion;
  itinerary: ItineraryItem[];
  packing_checklist: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  cautions: string[];
  created_at: string;
}

export interface DiscoverablePlace {
  id: string;
  name: string;
  category: 'Suggested' | 'Attraction' | 'Food & Drink' | 'Culture' | 'Nature' | 'Nightlife' | 'Relaxation';
  destination_id: string;
  description: string;
  image: string;
  rating: number;
  energy_level: number; // 1-5
  avg_duration_mins: number; // typically 60, 90, 120, 150
  operating_hours: string;
  maps_url: string;
  suitable_for_tags: string[];
  is_meal?: 'lunch' | 'dinner';
}
