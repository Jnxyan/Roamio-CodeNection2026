export interface CityItem {
  city: string;
  country: string;
  display: string;
  airport?: string;
  popular?: boolean;
}

export const CITIES_DATABASE: CityItem[] = [
  // Asia
  { city: 'Kuala Lumpur', country: 'Malaysia', display: 'Kuala Lumpur, Malaysia', airport: 'KUL', popular: true },
  { city: 'Penang', country: 'Malaysia', display: 'Penang, Malaysia', airport: 'PEN', popular: true },
  { city: 'Langkawi', country: 'Malaysia', display: 'Langkawi, Malaysia', airport: 'LGK', popular: true },
  { city: 'Kota Kinabalu', country: 'Malaysia', display: 'Kota Kinabalu, Malaysia', airport: 'BKI', popular: true },
  { city: 'Malacca', country: 'Malaysia', display: 'Malacca, Malaysia', airport: 'MKZ', popular: true },
  { city: 'Johor Bahru', country: 'Malaysia', display: 'Johor Bahru, Malaysia', airport: 'JHB', popular: true },
  { city: 'Kyoto', country: 'Japan', display: 'Kyoto, Japan', airport: 'KIX', popular: true },
  { city: 'Tokyo', country: 'Japan', display: 'Tokyo, Japan', airport: 'HND/NRT', popular: true },
  { city: 'Osaka', country: 'Japan', display: 'Osaka, Japan', airport: 'KIX/ITM', popular: true },
  { city: 'Sapporo', country: 'Japan', display: 'Sapporo, Japan', airport: 'CTS' },
  { city: 'Fukuoka', country: 'Japan', display: 'Fukuoka, Japan', airport: 'FUK' },
  { city: 'Singapore', country: 'Singapore', display: 'Singapore, Singapore', airport: 'SIN', popular: true },
  { city: 'Bangkok', country: 'Thailand', display: 'Bangkok, Thailand', airport: 'BKK', popular: true },
  { city: 'Phuket', country: 'Thailand', display: 'Phuket, Thailand', airport: 'HKT', popular: true },
  { city: 'Chiang Mai', country: 'Thailand', display: 'Chiang Mai, Thailand', airport: 'CNX' },
  { city: 'Bali', country: 'Indonesia', display: 'Bali (Denpasar), Indonesia', airport: 'DPS', popular: true },
  { city: 'Jakarta', country: 'Indonesia', display: 'Jakarta, Indonesia', airport: 'CGK' },
  { city: 'Seoul', country: 'South Korea', display: 'Seoul, South Korea', airport: 'ICN/GMP', popular: true },
  { city: 'Busan', country: 'South Korea', display: 'Busan, South Korea', airport: 'PUS' },
  { city: 'Taipei', country: 'Taiwan', display: 'Taipei, Taiwan', airport: 'TPE/TSA', popular: true },
  { city: 'Hong Kong', country: 'Hong Kong', display: 'Hong Kong, Hong Kong', airport: 'HKG', popular: true },
  { city: 'Hanoi', country: 'Vietnam', display: 'Hanoi, Vietnam', airport: 'HAN', popular: true },
  { city: 'Ho Chi Minh City', country: 'Vietnam', display: 'Ho Chi Minh City, Vietnam', airport: 'SGN', popular: true },
  { city: 'Da Nang', country: 'Vietnam', display: 'Da Nang, Vietnam', airport: 'DAD', popular: true },
  { city: 'Manila', country: 'Philippines', display: 'Manila, Philippines', airport: 'MNL' },
  { city: 'Cebu', country: 'Philippines', display: 'Cebu, Philippines', airport: 'CEB' },
  { city: 'Dubai', country: 'United Arab Emirates', display: 'Dubai, UAE', airport: 'DXB', popular: true },
  { city: 'Abu Dhabi', country: 'United Arab Emirates', display: 'Abu Dhabi, UAE', airport: 'AUH' },
  { city: 'Doha', country: 'Qatar', display: 'Doha, Qatar', airport: 'DOH' },

  // Europe
  { city: 'Paris', country: 'France', display: 'Paris, France', airport: 'CDG/ORY', popular: true },
  { city: 'Nice', country: 'France', display: 'Nice, France', airport: 'NCE' },
  { city: 'Rome', country: 'Italy', display: 'Rome, Italy', airport: 'FCO/CIA', popular: true },
  { city: 'Positano', country: 'Italy', display: 'Positano (Amalfi Coast), Italy', airport: 'NAP', popular: true },
  { city: 'Florence', country: 'Italy', display: 'Florence, Italy', airport: 'FLR', popular: true },
  { city: 'Venice', country: 'Italy', display: 'Venice, Italy', airport: 'VCE', popular: true },
  { city: 'Milan', country: 'Italy', display: 'Milan, Italy', airport: 'MXP/LIN', popular: true },
  { city: 'London', country: 'United Kingdom', display: 'London, United Kingdom', airport: 'LHR/LGW', popular: true },
  { city: 'Edinburgh', country: 'United Kingdom', display: 'Edinburgh, United Kingdom', airport: 'EDI' },
  { city: 'Barcelona', country: 'Spain', display: 'Barcelona, Spain', airport: 'BCN', popular: true },
  { city: 'Madrid', country: 'Spain', display: 'Madrid, Spain', airport: 'MAD', popular: true },
  { city: 'Seville', country: 'Spain', display: 'Seville, Spain', airport: 'SVQ' },
  { city: 'Amsterdam', country: 'Netherlands', display: 'Amsterdam, Netherlands', airport: 'AMS', popular: true },
  { city: 'Berlin', country: 'Germany', display: 'Berlin, Germany', airport: 'BER' },
  { city: 'Munich', country: 'Germany', display: 'Munich, Germany', airport: 'MUC', popular: true },
  { city: 'Frankfurt', country: 'Germany', display: 'Frankfurt, Germany', airport: 'FRA' },
  { city: 'Zurich', country: 'Switzerland', display: 'Zurich, Switzerland', airport: 'ZRH', popular: true },
  { city: 'Geneva', country: 'Switzerland', display: 'Geneva, Switzerland', airport: 'GVA' },
  { city: 'Vienna', country: 'Austria', display: 'Vienna, Austria', airport: 'VIE' },
  { city: 'Prague', country: 'Czech Republic', display: 'Prague, Czech Republic', airport: 'PRG' },
  { city: 'Budapest', country: 'Hungary', display: 'Budapest, Hungary', airport: 'BUD' },
  { city: 'Lisbon', country: 'Portugal', display: 'Lisbon, Portugal', airport: 'LIS', popular: true },
  { city: 'Porto', country: 'Portugal', display: 'Porto, Portugal', airport: 'OPO' },
  { city: 'Athens', country: 'Greece', display: 'Athens, Greece', airport: 'ATH', popular: true },
  { city: 'Santorini', country: 'Greece', display: 'Santorini, Greece', airport: 'JTR', popular: true },
  { city: 'Dublin', country: 'Ireland', display: 'Dublin, Ireland', airport: 'DUB' },
  { city: 'Reykjavik', country: 'Iceland', display: 'Reykjavik, Iceland', airport: 'KEF' },
  { city: 'Copenhagen', country: 'Denmark', display: 'Copenhagen, Denmark', airport: 'CPH' },
  { city: 'Stockholm', country: 'Sweden', display: 'Stockholm, Sweden', airport: 'ARN' },
  { city: 'Oslo', country: 'Norway', display: 'Oslo, Norway', airport: 'OSL' },
  { city: 'Istanbul', country: 'Turkey', display: 'Istanbul, Turkey', airport: 'IST/SAW', popular: true },

  // Americas
  { city: 'San Francisco', country: 'United States', display: 'San Francisco, CA, USA', airport: 'SFO', popular: true },
  { city: 'New York', country: 'United States', display: 'New York, NY, USA', airport: 'JFK/EWR', popular: true },
  { city: 'Los Angeles', country: 'United States', display: 'Los Angeles, CA, USA', airport: 'LAX', popular: true },
  { city: 'Seattle', country: 'United States', display: 'Seattle, WA, USA', airport: 'SEA' },
  { city: 'Chicago', country: 'United States', display: 'Chicago, IL, USA', airport: 'ORD' },
  { city: 'Miami', country: 'United States', display: 'Miami, FL, USA', airport: 'MIA', popular: true },
  { city: 'Honolulu', country: 'United States', display: 'Honolulu (Hawaii), USA', airport: 'HNL', popular: true },
  { city: 'Boston', country: 'United States', display: 'Boston, MA, USA', airport: 'BOS' },
  { city: 'Las Vegas', country: 'United States', display: 'Las Vegas, NV, USA', airport: 'LAS' },
  { city: 'Vancouver', country: 'Canada', display: 'Vancouver, Canada', airport: 'YVR', popular: true },
  { city: 'Toronto', country: 'Canada', display: 'Toronto, Canada', airport: 'YYZ' },
  { city: 'Montreal', country: 'Canada', display: 'Montreal, Canada', airport: 'YUL' },
  { city: 'Mexico City', country: 'Mexico', display: 'Mexico City, Mexico', airport: 'MEX' },
  { city: 'Cancun', country: 'Mexico', display: 'Cancun, Mexico', airport: 'CUN', popular: true },
  { city: 'Buenos Aires', country: 'Argentina', display: 'Buenos Aires, Argentina', airport: 'EZE' },
  { city: 'Rio de Janeiro', country: 'Brazil', display: 'Rio de Janeiro, Brazil', airport: 'GIG' },
  { city: 'Santiago', country: 'Chile', display: 'Santiago, Chile', airport: 'SCL' },
  { city: 'Lima', country: 'Peru', display: 'Lima, Peru', airport: 'LIM' },

  // Oceania
  { city: 'Sydney', country: 'Australia', display: 'Sydney, Australia', airport: 'SYD', popular: true },
  { city: 'Melbourne', country: 'Australia', display: 'Melbourne, Australia', airport: 'MEL', popular: true },
  { city: 'Brisbane', country: 'Australia', display: 'Brisbane, Australia', airport: 'BNE' },
  { city: 'Perth', country: 'Australia', display: 'Perth, Australia', airport: 'PER' },
  { city: 'Auckland', country: 'New Zealand', display: 'Auckland, New Zealand', airport: 'AKL', popular: true },
  { city: 'Queenstown', country: 'New Zealand', display: 'Queenstown, New Zealand', airport: 'ZQN' },

  // Africa
  { city: 'Cairo', country: 'Egypt', display: 'Cairo, Egypt', airport: 'CAI', popular: true },
  { city: 'Cape Town', country: 'South Africa', display: 'Cape Town, South Africa', airport: 'CPT', popular: true },
  { city: 'Johannesburg', country: 'South Africa', display: 'Johannesburg, South Africa', airport: 'JNB' },
  { city: 'Marrakech', country: 'Morocco', display: 'Marrakech, Morocco', airport: 'RAK', popular: true }
];

export function searchCities(query: string, maxResults: number = 8): CityItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return CITIES_DATABASE.filter(c => c.popular).slice(0, maxResults);
  }

  // Exact starts-with city name first
  const exactCityMatches = CITIES_DATABASE.filter(c =>
    c.city.toLowerCase().startsWith(clean)
  );

  // Contains in city name
  const containsCityMatches = CITIES_DATABASE.filter(c =>
    !c.city.toLowerCase().startsWith(clean) && c.city.toLowerCase().includes(clean)
  );

  // Matches country or airport
  const otherMatches = CITIES_DATABASE.filter(c =>
    !c.city.toLowerCase().includes(clean) &&
    (c.country.toLowerCase().includes(clean) || (c.airport && c.airport.toLowerCase().includes(clean)))
  );

  return [...exactCityMatches, ...containsCityMatches, ...otherMatches].slice(0, maxResults);
}
