// Comprehensive list of all recognized countries worldwide
export const ALL_COUNTRIES: string[] = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Ivory Coast',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe'
];

// Rich mapping of major cities for countries across all continents
export const COUNTRY_CITIES: Record<string, string[]> = {
  'United States': [
    'San Francisco',
    'New York',
    'Los Angeles',
    'Chicago',
    'Seattle',
    'Miami',
    'Boston',
    'Las Vegas',
    'Washington D.C.',
    'Honolulu',
    'Austin',
    'Denver',
    'San Diego',
    'New Orleans',
    'Nashville',
    'Atlanta'
  ],
  'Japan': [
    'Kyoto',
    'Tokyo',
    'Osaka',
    'Sapporo',
    'Fukuoka',
    'Nagoya',
    'Hiroshima',
    'Nara',
    'Yokohama',
    'Kobe',
    'Okinawa',
    'Hakone',
    'Takayama',
    'Kanazawa'
  ],
  'Malaysia': [
    'Kuala Lumpur',
    'George Town (Penang)',
    'Malacca City',
    'Kota Kinabalu',
    'Langkawi',
    'Johor Bahru',
    'Kuching',
    'Ipoh',
    'Putrajaya',
    'Kuantan'
  ],
  'France': [
    'Paris',
    'Nice',
    'Lyon',
    'Marseille',
    'Bordeaux',
    'Strasbourg',
    'Toulouse',
    'Cannes',
    'Lille',
    'Montpellier',
    'Aix-en-Provence',
    'Avignon'
  ],
  'United Kingdom': [
    'London',
    'Edinburgh',
    'Manchester',
    'Oxford',
    'Cambridge',
    'Bath',
    'Liverpool',
    'Belfast',
    'Glasgow',
    'Bristol',
    'York',
    'Cardiff'
  ],
  'Italy': [
    'Rome',
    'Florence',
    'Venice',
    'Milan',
    'Naples',
    'Bologna',
    'Palermo',
    'Verona',
    'Turin',
    'Sorrento',
    'Amalfi',
    'Genoa'
  ],
  'Spain': [
    'Barcelona',
    'Madrid',
    'Seville',
    'Valencia',
    'Granada',
    'Malaga',
    'Bilbao',
    'San Sebastian',
    'Palma de Mallorca',
    'Ibiza',
    'Cordoba',
    'Alicante'
  ],
  'Australia': [
    'Sydney',
    'Melbourne',
    'Brisbane',
    'Perth',
    'Adelaide',
    'Cairns',
    'Gold Coast',
    'Hobart',
    'Darwin',
    'Canberra'
  ],
  'Canada': [
    'Vancouver',
    'Toronto',
    'Montreal',
    'Calgary',
    'Ottawa',
    'Quebec City',
    'Victoria',
    'Edmonton',
    'Halifax',
    'Banff'
  ],
  'Germany': [
    'Berlin',
    'Munich',
    'Frankfurt',
    'Hamburg',
    'Cologne',
    'Dresden',
    'Stuttgart',
    'Heidelberg',
    'Nuremberg',
    'Dusseldorf'
  ],
  'Singapore': [
    'Singapore'
  ],
  'Indonesia': [
    'Bali',
    'Jakarta',
    'Yogyakarta',
    'Bandung',
    'Surabaya',
    'Lombok',
    'Ubud',
    'Seminyak',
    'Medan',
    'Labuan Bajo'
  ],
  'Thailand': [
    'Bangkok',
    'Chiang Mai',
    'Phuket',
    'Krabi',
    'Pattaya',
    'Koh Samui',
    'Hua Hin',
    'Ayutthaya',
    'Chiang Rai'
  ],
  'South Korea': [
    'Seoul',
    'Busan',
    'Jeju',
    'Incheon',
    'Daegu',
    'Gyeongju',
    'Gangneung',
    'Jeonju',
    'Suwon'
  ],
  'China': [
    'Beijing',
    'Shanghai',
    'Guangzhou',
    'Shenzhen',
    'Chengdu',
    'Xi\'an',
    'Hangzhou',
    'Chongqing',
    'Hong Kong',
    'Macau',
    'Guilin'
  ],
  'India': [
    'Mumbai',
    'Delhi',
    'Bengaluru',
    'Jaipur',
    'Goa',
    'Kolkata',
    'Chennai',
    'Agra',
    'Varanasi',
    'Udaipur',
    'Hyderabad',
    'Kochi'
  ],
  'Vietnam': [
    'Hanoi',
    'Ho Chi Minh City',
    'Da Nang',
    'Hoi An',
    'Nha Trang',
    'Hue',
    'Phu Quoc',
    'Sapa',
    'Ha Long'
  ],
  'Switzerland': [
    'Zurich',
    'Geneva',
    'Lucerne',
    'Basel',
    'Bern',
    'Zermatt',
    'Interlaken',
    'Lausanne',
    'Lugano',
    'St. Moritz'
  ],
  'Netherlands': [
    'Amsterdam',
    'Rotterdam',
    'Utrecht',
    'The Hague',
    'Eindhoven',
    'Maastricht',
    'Haarlem',
    'Groningen'
  ],
  'Greece': [
    'Athens',
    'Santorini',
    'Mykonos',
    'Crete (Heraklion)',
    'Thessaloniki',
    'Rhodes',
    'Corfu',
    'Chania',
    'Nafplio'
  ],
  'Portugal': [
    'Lisbon',
    'Porto',
    'Faro (Algarve)',
    'Sintra',
    'Coimbra',
    'Funchal (Madeira)',
    'Cascais',
    'Braga'
  ],
  'Turkey': [
    'Istanbul',
    'Antalya',
    'Cappadocia (Goreme)',
    'Izmir',
    'Bodrum',
    'Ankara',
    'Fethiye',
    'Bursa'
  ],
  'United Arab Emirates': [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ras Al Khaimah',
    'Ajman',
    'Fujairah'
  ],
  'Egypt': [
    'Cairo',
    'Alexandria',
    'Luxor',
    'Aswan',
    'Sharm El Sheikh',
    'Hurghada',
    'Giza'
  ],
  'South Africa': [
    'Cape Town',
    'Johannesburg',
    'Durban',
    'Pretoria',
    'Port Elizabeth',
    'Stellenbosch',
    'Kruger Area'
  ],
  'New Zealand': [
    'Auckland',
    'Queenstown',
    'Wellington',
    'Christchurch',
    'Rotorua',
    'Dunedin',
    'Taupo',
    'Napier'
  ],
  'Mexico': [
    'Mexico City',
    'Cancun',
    'Guadalajara',
    'Oaxaca',
    'Playa del Carmen',
    'Monterrey',
    'Puerto Vallarta',
    'Tulum',
    'Merida'
  ],
  'Brazil': [
    'Rio de Janeiro',
    'Sao Paulo',
    'Salvador',
    'Brasilia',
    'Fortaleza',
    'Curitiba',
    'Belo Horizonte',
    'Florianopolis',
    'Manaus'
  ],
  'Argentina': [
    'Buenos Aires',
    'Mendoza',
    'Cordoba',
    'Bariloche',
    'Ushuaia',
    'Salta',
    'Rosario',
    'El Calafate'
  ],
  'Ireland': [
    'Dublin',
    'Galway',
    'Cork',
    'Limerick',
    'Killarney',
    'Kilkenny',
    'Waterford'
  ],
  'Austria': [
    'Vienna',
    'Salzburg',
    'Innsbruck',
    'Graz',
    'Linz',
    'Hallstatt',
    'Klagenfurt'
  ],
  'Belgium': [
    'Brussels',
    'Bruges',
    'Antwerp',
    'Ghent',
    'Leuven',
    'Liege'
  ],
  'Sweden': [
    'Stockholm',
    'Gothenburg',
    'Malmo',
    'Uppsala',
    'Kiruna',
    'Visby'
  ],
  'Norway': [
    'Oslo',
    'Bergen',
    'Tromso',
    'Stavanger',
    'Trondheim',
    'Alesund',
    'Lofoten'
  ],
  'Denmark': [
    'Copenhagen',
    'Aarhus',
    'Odense',
    'Aalborg',
    'Roskilde'
  ],
  'Finland': [
    'Helsinki',
    'Rovaniemi',
    'Tampere',
    'Turku',
    'Oulu'
  ],
  'Czech Republic': [
    'Prague',
    'Brno',
    'Cesky Krumlov',
    'Ostrava',
    'Plzen',
    'Karlovy Vary'
  ],
  'Hungary': [
    'Budapest',
    'Debrecen',
    'Szeged',
    'Eger',
    'Pecs'
  ],
  'Poland': [
    'Krakow',
    'Warsaw',
    'Wroclaw',
    'Gdansk',
    'Poznan',
    'Zakopane'
  ],
  'Croatia': [
    'Dubrovnik',
    'Split',
    'Zagreb',
    'Zadar',
    'Rovinj',
    'Hvar',
    'Pula'
  ],
  'Iceland': [
    'Reykjavik',
    'Akureyri',
    'Vik',
    'Hafnarfjordur',
    'Selfoss'
  ],
  'Morocco': [
    'Marrakech',
    'Casablanca',
    'Fes',
    'Chefchaouen',
    'Rabat',
    'Tangier',
    'Essaouira'
  ],
  'Peru': [
    'Lima',
    'Cusco',
    'Arequipa',
    'Puno',
    'Trujillo',
    'Iquitos'
  ],
  'Chile': [
    'Santiago',
    'Valparaiso',
    'San Pedro de Atacama',
    'Puerto Varas',
    'Punta Arenas'
  ],
  'Colombia': [
    'Bogota',
    'Medellin',
    'Cartagena',
    'Cali',
    'Santa Marta',
    'Barranquilla'
  ],
  'Philippines': [
    'Manila',
    'Cebu City',
    'Boracay',
    'El Nido (Palawan)',
    'Siargao',
    'Davao',
    'Baguio'
  ],
  'Saudi Arabia': [
    'Riyadh',
    'Jeddah',
    'Mecca',
    'Medina',
    'AlUla',
    'Dammam'
  ],
  'Qatar': [
    'Doha',
    'Al Wakrah',
    'Al Khor',
    'Lusail'
  ],
  'Taiwan': [
    'Taipei',
    'Kaohsiung',
    'Taichung',
    'Tainan',
    'Hualien',
    'Jiufen'
  ],
  'Kenya': [
    'Nairobi',
    'Mombasa',
    'Maasai Mara',
    'Kisumu',
    'Nakuru'
  ],
  'Tanzania': [
    'Dar es Salaam',
    'Zanzibar City',
    'Arusha',
    'Dodoma',
    'Serengeti'
  ],
  'Maldives': [
    'Male',
    'Maafushi',
    'Hulhumale'
  ],
  'Sri Lanka': [
    'Colombo',
    'Kandy',
    'Galle',
    'Ella',
    'Sigiriya',
    'Nuwara Eliya'
  ],
  'Nepal': [
    'Kathmandu',
    'Pokhara',
    'Lalitpur',
    'Chitwan'
  ],
  'Jordan': [
    'Amman',
    'Petra (Wadi Musa)',
    'Aqaba',
    'Jerash'
  ],
  'Costa Rica': [
    'San Jose',
    'La Fortuna (Arenal)',
    'Manuel Antonio',
    'Monteverde',
    'Tamarindo'
  ],
  'Cuba': [
    'Havana',
    'Varadero',
    'Trinidad',
    'Santiago de Cuba',
    'Vinales'
  ],
  'Dominican Republic': [
    'Punta Cana',
    'Santo Domingo',
    'Puerto Plata',
    'La Romana'
  ],
  'Jamaica': [
    'Kingston',
    'Montego Bay',
    'Negril',
    'Ocho Rios'
  ],
  'Cambodia': [
    'Siem Reap',
    'Phnom Penh',
    'Battambang',
    'Sihanoukville'
  ],
  'Laos': [
    'Luang Prabang',
    'Vientiane',
    'Vang Vieng',
    'Pakse'
  ],
  'Monaco': [
    'Monaco',
    'Monte Carlo'
  ],
  'Luxembourg': [
    'Luxembourg City',
    'Echternach',
    'Vianden'
  ]
};

// Returns cities for a given country name (case-insensitive search)
export function getCitiesForCountry(countryName: string): string[] {
  if (!countryName || !countryName.trim()) return [];
  const normalized = countryName.trim().toLowerCase();

  const foundKey = Object.keys(COUNTRY_CITIES).find(
    k => k.toLowerCase() === normalized
  );

  if (foundKey) {
    return COUNTRY_CITIES[foundKey];
  }

  // If the country is recognized in ALL_COUNTRIES but not in our explicit city dict,
  // provide a placeholder city or default capital suggestion
  const matchedCountry = ALL_COUNTRIES.find(
    c => c.toLowerCase() === normalized
  );
  if (matchedCountry) {
    return [`Central ${matchedCountry}`, `Capital City (${matchedCountry})`];
  }

  return [];
}

// All formatted "City, Country" options worldwide (e.g. "San Francisco, United States", "Kyoto, Japan")
export const ALL_LOCATION_OPTIONS: string[] = (() => {
  const list: string[] = [];
  const seen = new Set<string>();

  // Add all City, Country pairs from COUNTRY_CITIES
  for (const [country, cities] of Object.entries(COUNTRY_CITIES)) {
    for (const city of cities) {
      const combined = `${city}, ${country}`;
      if (!seen.has(combined.toLowerCase())) {
        seen.add(combined.toLowerCase());
        list.push(combined);
      }
    }
  }

  // Also include countries from ALL_COUNTRIES if not already covered
  for (const country of ALL_COUNTRIES) {
    if (!COUNTRY_CITIES[country]) {
      const combined = `${country}`;
      if (!seen.has(combined.toLowerCase())) {
        seen.add(combined.toLowerCase());
        list.push(combined);
      }
    }
  }

  // Sort alphabetically
  list.sort((a, b) => a.localeCompare(b));
  return list;
})();

// Helper to parse a "City, Country" or "City" string into separate city and country properties
export function parseCityAndCountry(locationStr: string): { city: string; country: string } {
  if (!locationStr || !locationStr.trim()) {
    return { city: '', country: '' };
  }
  const trimmed = locationStr.trim();
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',');
    const city = parts[0].trim();
    const country = parts.slice(1).join(',').trim();
    return { city, country };
  }
  return { city: trimmed, country: '' };
}
