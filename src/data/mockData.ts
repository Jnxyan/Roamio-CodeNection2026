import { Destination, Hotel, Restaurant, Plan, DiscoverablePlace } from '../types';

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'dest-klcc-park',
    name: 'KLCC Park & Lake Symphony',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    short_description: 'A 50-acre tropical urban oasis nestled at the base of the iconic Petronas Twin Towers, featuring a 10,000 sqm man-made Lake Symphony with musical fountains, lush foliage, a children’s wading pool, and a 1.3km cushioned jogging track.',
    cover_photo: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574972413156-f0ca37330d8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.91,
    reviews_count: 2480,
    energy_level: 2,
    ticket_price: 'Free',
    is_free: true,
    typical_visit_time: '1–2 hours',
    activities: [
      'Lake Symphony Musical Fountain Water Show (Evening)',
      'Petronas Twin Towers Vantage Point Photo Walk',
      '1.3km Shaded Jogging & Walking Circuit',
      'Children’s Public Water Play Park & Wading Pool',
      'Suria KLCC Esplanade Stroll & Cafes'
    ],
    operating_hours: 'Daily: 07:00 – 22:00 | Lake Symphony Shows: 20:00, 21:00 & 21:45',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=KLCC+Park+Kuala+Lumpur+Malaysia',
    reviews: [
      {
        id: 'rev-klcc-1',
        user: 'Ahmad Farhan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Free admission with the best vantage point for photos of the Petronas Twin Towers! Come at 8pm to catch the magical fountain light show.'
      },
      {
        id: 'rev-klcc-2',
        user: 'Rachel Tan',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '1 month ago',
        comment: 'Beautiful green respite in the middle of bustling Kuala Lumpur. The cushioned running track is super gentle on knees.'
      }
    ]
  },
  {
    id: 'dest-kyoto',
    name: 'Fushimi Inari Shrine & Senbon Torii',
    country: 'Japan',
    city: 'Kyoto',
    short_description: 'Sacred Shinto mountain shrine world-famous for its endless tunnel of over 10,000 vibrant vermilion torii gates winding through tranquil cedar forests of Mount Inari.',
    cover_photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.92,
    reviews_count: 1420,
    energy_level: 3,
    ticket_price: 'Free',
    is_free: true,
    typical_visit_time: '2–3 hours',
    activities: [
      'Senbon Torii Vermilion Gate Pilgrimage Walk',
      'Mount Inari Forest Summit Hike',
      'Fox Statue (Kitsune) Cultural Photography',
      'Traditional Omikuji Fortune & Fox Ema Tablets',
      'Approach Street Food & Inari Sushi Tasting'
    ],
    operating_hours: 'Open 24 Hours Daily (Grounds & Torii Gates are always accessible)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Taisha+Kyoto+Japan',
    reviews: [
      {
        id: 'rev-1',
        user: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Completely free to enter and explore. Waking up early at dawn was life-changing before the crowds arrived.'
      },
      {
        id: 'rev-2',
        user: 'Marcus Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '1 month ago',
        comment: 'The vermilion path against the deep green mountain forest is pure magic. Don’t stop at the first fork, hike up higher for peace.'
      }
    ]
  },
  {
    id: 'dest-paris',
    name: 'The Louvre Museum & Glass Pyramid',
    country: 'France',
    city: 'Paris',
    short_description: 'The world’s most visited art museum, housed in a historic royal palace beside the Seine, home to the Mona Lisa, Venus de Milo, and Winged Victory.',
    cover_photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520939817895-060bdef4d1b3?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.88,
    reviews_count: 2890,
    energy_level: 4,
    ticket_price: '$24',
    is_free: false,
    typical_visit_time: '3–4 hours',
    activities: [
      'Mona Lisa & Renaissance Masterpieces Viewing',
      'I.M. Pei Glass Pyramid Courtyard Photography',
      'Winged Victory of Samothrace Grand Staircase',
      'Napoleon III Grand State Apartments',
      'Tuileries Garden Afternoon Stroll'
    ],
    operating_hours: '09:00 – 18:00 (Wed & Fri extended to 21:45 | Closed Tuesdays)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris+France',
    reviews: [
      {
        id: 'rev-p1',
        user: 'Sophie Martin',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Book timed-entry tickets online in advance! The Egyptian wing and French Romantic paintings are breathtaking.'
      }
    ]
  },
  {
    id: 'dest-rome',
    name: 'The Colosseum & Roman Forum',
    country: 'Italy',
    city: 'Rome',
    short_description: 'The monumental 2,000-year-old Flavian Amphitheatre of gladiatorial combat, paired with the sprawling archaeological ruins of the ancient Roman Republic.',
    cover_photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.89,
    reviews_count: 1980,
    energy_level: 4,
    ticket_price: '$20',
    is_free: false,
    typical_visit_time: '3 hours',
    activities: [
      'Colosseum Arena Floor & Underground Dungeons',
      'Roman Forum Imperial Temples Walking Tour',
      'Palatine Hill Panoramic Views of Rome',
      'Arch of Constantine Historical Walk'
    ],
    operating_hours: 'Daily: 09:00 – 19:15 (Last entry 1 hour before sunset)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Colosseum+Rome+Italy',
    reviews: [
      {
        id: 'rev-r1',
        user: 'David Bradley',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '1 month ago',
        comment: 'Standing on the arena floor looking up at the tiers gave me goosebumps. Ticket includes Roman Forum and Palatine Hill.'
      }
    ]
  },
  {
    id: 'dest-bali',
    name: 'Tegallalang Rice Terrace & Valley',
    country: 'Indonesia',
    city: 'Bali',
    short_description: 'Iconic emerald terraced rice paddies cascading down the river valley near Ubud, utilizing the ancient Balinese Subak cooperative irrigation system.',
    cover_photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.84,
    reviews_count: 1720,
    energy_level: 3,
    ticket_price: '$3',
    is_free: false,
    typical_visit_time: '2 hours',
    activities: [
      'Tegallalang Emerald Rice Terrace Sunrise Walk',
      'Giant Jungle Valley Swing Adventure',
      'Subak Irrigation Canal Exploration',
      'Terrace Edge Bamboo Cafe Coconut Water'
    ],
    operating_hours: 'Daily: 08:00 – 18:00',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Tegallalang+Rice+Terrace+Ubud+Bali',
    reviews: [
      {
        id: 'rev-b1',
        user: 'Tara Jenkins',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2 months ago',
        comment: 'Only about $3 entry fee and you can wander deep through the palm-shaded terraces.'
      }
    ]
  },
  {
    id: 'dest-barcelona',
    name: 'Sagrada Família Basilica',
    country: 'Spain',
    city: 'Barcelona',
    short_description: 'Antoni Gaudí’s astonishing unfinished masterpiece, blending Gothic geometry and naturalistic Art Nouveau stone carvings with kaleidoscopic stained glass interiors.',
    cover_photo: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.87,
    reviews_count: 2110,
    energy_level: 3,
    ticket_price: '$28',
    is_free: false,
    typical_visit_time: '2–3 hours',
    activities: [
      'Basilica Interior & Stained Glass Natural Light Viewing',
      'Nativity & Passion Towers Elevator Ascent',
      'Underground Museum & Gaudí Workshop Crypt',
      'Plaça de Gaudí Reflection Pond Photography'
    ],
    operating_hours: 'Daily: 09:00 – 19:30 (Sundays 10:30 – 19:30)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Sagrada+Familia+Barcelona+Spain',
    reviews: [
      {
        id: 'rev-bc1',
        user: 'Carlos Morales',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '3 weeks ago',
        comment: 'The stained glass reflections inside Sagrada Família around 4 PM will bring tears to your eyes.'
      }
    ]
  },
  {
    id: 'dest-banff',
    name: 'Banff National Park & Lake Louise',
    country: 'Canada',
    city: 'Banff',
    short_description: 'Spectacular glacier-fed turquoise lakes, soaring Rocky Mountain peaks, pine forests, and alpine hiking inside Canada’s oldest national park.',
    cover_photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.95,
    reviews_count: 1120,
    energy_level: 4,
    ticket_price: '$11',
    is_free: false,
    typical_visit_time: 'Full Day',
    activities: [
      'Canoeing on Turquoise Lake Louise',
      'Moraine Lake Valley of the Ten Peaks Shoreline',
      'Lake Agnes Tea House Alpine Trail',
      'Icefields Parkway Scenic Mountain Drive'
    ],
    operating_hours: 'Open 24/7 Daily (Parks Canada Visitor Centre: 08:30 – 19:00)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Banff+National+Park+Canada',
    reviews: [
      {
        id: 'rev-bf1',
        user: 'Kylie Zimmerman',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2 months ago',
        comment: 'Pure wilderness bliss! Moraine lake and Lake Louise look even more vivid in real life than any photograph.'
      }
    ]
  },
  {
    id: 'place-kyoto-railway-museum',
    name: 'Kyoto Railway Museum',
    country: 'Japan',
    city: 'Kyoto',
    short_description: 'Japan’s premier indoor railway museum featuring 53 preserved historic locomotives, bullet trains, interactive driving simulators, and a panoramic indoor observation terrace overlooking active bullet train lines.',
    cover_photo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.88,
    reviews_count: 1940,
    energy_level: 2,
    ticket_price: '$10 admission (¥1,500)',
    is_free: false,
    typical_visit_time: '2–3 hours',
    activities: [
      'Interactive Shinkansen Bullet Train Simulator',
      'Historic 53-Train Heritage Fleet & Umekoji Roundhouse Turntable',
      'Covered Observation Sky Terrace Overlooking Train Yards',
      'SL Steam Locomotive Heritage Ride',
      'Giant Railway Diorama Lighting Demonstration'
    ],
    operating_hours: '10:00 – 17:00 daily (Closed Wednesdays)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Kyoto+Railway+Museum',
    reviews: [
      {
        id: 'rev-railway-1',
        user: 'Kenji Takahashi',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '3 days ago',
        comment: 'The absolute best rainy-day alternative in Kyoto! Completely sheltered and spacious with incredible full-scale trains and hands-on simulators.'
      },
      {
        id: 'rev-railway-2',
        user: 'Emily Watson',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '1 week ago',
        comment: 'When the weather turned rainy, this was an unforgettable experience. The observation deck view of passing Shinkansen is superb.'
      }
    ]
  },
  {
    id: 'place-kyoto-manga-museum',
    name: 'Kyoto International Manga Museum',
    country: 'Japan',
    city: 'Kyoto',
    short_description: 'A cozy cultural indoor museum set within a beautifully restored 1929 elementary school, housing over 300,000 manga volumes across multi-language galleries and quiet reading halls.',
    cover_photo: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.82,
    reviews_count: 1460,
    energy_level: 2,
    ticket_price: '$8 admission (¥1,000)',
    is_free: false,
    typical_visit_time: '2 hours',
    activities: [
      'Wall of Manga with 50,000 Browseable Volumes',
      'International Translation Manga Expo',
      'Live Manga Portrait Drawing Studio',
      'Historic 1929 Wood School Architecture Tour'
    ],
    operating_hours: '10:30 – 17:30 daily (Closed Wednesdays)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Kyoto+International+Manga+Museum',
    reviews: [
      {
        id: 'rev-manga-1',
        user: 'Hana Tanaka',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '5 days ago',
        comment: 'Peaceful and completely sheltered from rainy weather. You can read manga from all eras and languages in cozy wooden classrooms.'
      }
    ]
  },
  {
    id: 'place-mori-art-museum',
    name: 'Mori Art Museum & Indoor Sky Deck',
    country: 'Japan',
    city: 'Tokyo',
    short_description: 'Enclosed 53rd-floor contemporary art museum situated atop Roppongi Hills Mori Tower, offering world-class visual exhibits and an indoor glass observatory with panoramic views.',
    cover_photo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.89,
    reviews_count: 2210,
    energy_level: 2,
    ticket_price: '$14 admission (¥2,000)',
    is_free: false,
    typical_visit_time: '2–3 hours',
    activities: [
      'Contemporary Art & Digital Installations',
      '52nd-Floor Indoor Tokyo City View Observation Gallery',
      'Museum Cafe with High-Rise Skyline Views'
    ],
    operating_hours: '10:00 – 22:00 daily (Tuesdays: 10:00 – 17:00)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Mori+Art+Museum+Tokyo',
    reviews: [
      {
        id: 'rev-mori-1',
        user: 'Liam O’Connor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '1 week ago',
        comment: 'Totally shielded from bad weather. The indoor views over Tokyo from 52 stories up are breathtaking even through cloud or rain.'
      }
    ]
  }
];

export const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'hotel-kyoto-1',
    destination_id: 'dest-kyoto',
    destination_name: 'Kyoto, Japan',
    name: 'Gion Hatanaka Traditional Ryokan',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    ],
    pricing: {
      per_night: 280,
      currency: 'USD',
      est_total: 1400
    },
    room_types: ['Tatami Garden Suite', 'Deluxe Cypress Bath Room', 'Presidential Courtyard Villa'],
    amenities: ['Hinoki Wood Bath', 'Multi-course Kaiseki Included', 'Garden View', 'Tea Master In-Room', 'High-Speed Wi-Fi', 'Luggage Courier'],
    booking_link: 'https://www.japan-guide.com/r/ryokan/gionhatanaka',
    operating_hours: 'Check-in: 15:00 – 19:00 | Check-out: 11:00 | Front Desk: 24/7',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Gion+Hatanaka+Kyoto',
    rating: 4.94,
    reviews_count: 512,
    typical_days: 5
  },
  {
    id: 'hotel-kyoto-2',
    destination_id: 'dest-kyoto',
    destination_name: 'Kyoto, Japan',
    name: 'Ace Hotel Kyoto & Heritage Garden',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    pricing: {
      per_night: 175,
      currency: 'USD',
      est_total: 875
    },
    room_types: ['Standard King', 'Deluxe Loft', 'Historic Wing Tatami King'],
    amenities: ['Stumptown Coffee', 'Craft Cocktail Bar', 'Vinyl Record Player in Room', 'Bicycle Rentals', '24/7 Gym', 'Pet Friendly'],
    booking_link: 'https://acehotel.com/kyoto',
    operating_hours: 'Check-in: 15:00 | Check-out: 12:00 | Front Desk: 24/7',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Ace+Hotel+Kyoto',
    rating: 4.88,
    reviews_count: 780,
    typical_days: 5
  },
  {
    id: 'hotel-paris-1',
    destination_id: 'dest-paris',
    destination_name: 'Paris, France',
    name: 'Hôtel Le Marais Saint-Germain',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    pricing: {
      per_night: 245,
      currency: 'USD',
      est_total: 1470
    },
    room_types: ['Classic Parisian Room', 'Superior Balcony', 'Eiffel View Suite'],
    amenities: ['Complimentary French Breakfast', 'Concierge Service', 'Air Conditioning', 'Nespresso Coffee', 'Airport Shuttle Service'],
    booking_link: 'https://www.booking.com/hotel/fr/le-marais-paris',
    operating_hours: 'Check-in: 14:00 | Check-out: 11:30 | Front Desk: 24/7',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Hotel+Saint+Germain+Paris',
    rating: 4.91,
    reviews_count: 830,
    typical_days: 6
  },
  {
    id: 'hotel-rome-1',
    destination_id: 'dest-rome',
    destination_name: 'Rome, Italy',
    name: 'Palazzo Manfredi Colosseum View',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    pricing: {
      per_night: 320,
      currency: 'USD',
      est_total: 1280
    },
    room_types: ['Colosseum View King', 'Master Deluxe Suite', 'Prestige Junior Suite'],
    amenities: ['Michelin-star Rooftop Lounge', 'Colosseum Terrace Access', 'Complimentary Champagne Welcome', 'Marble Baths'],
    booking_link: 'https://www.palazzomanfredi.com',
    operating_hours: 'Check-in: 15:00 | Check-out: 11:00 | Reception: 24/7',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Palazzo+Manfredi+Rome',
    rating: 4.96,
    reviews_count: 420,
    typical_days: 4
  },
  {
    id: 'hotel-bali-1',
    destination_id: 'dest-bali',
    destination_name: 'Bali, Indonesia',
    name: 'Maya Ubud Luxury Forest Resort & Spa',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    pricing: {
      per_night: 160,
      currency: 'USD',
      est_total: 1120
    },
    room_types: ['River Valley Villa', 'Private Pool Villa', 'Petanu Forest Suite'],
    amenities: ['Infinity Jungle Pools', 'River Valley Spa Pavilion', 'Daily Complimentary Yoga', 'Forest Trekking', 'Free Shuttle to Ubud Centre'],
    booking_link: 'https://www.mayaresorts.com/ubud',
    operating_hours: 'Check-in: 14:00 | Check-out: 12:00 | Spa: 09:00 – 21:00',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Maya+Ubud+Resort+Bali',
    rating: 4.92,
    reviews_count: 940,
    typical_days: 7
  },
  {
    id: 'hotel-barcelona-1',
    destination_id: 'dest-barcelona',
    destination_name: 'Barcelona, Spain',
    name: 'Hotel Arts Barcelona Marina',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    pricing: {
      per_night: 290,
      currency: 'USD',
      est_total: 1160
    },
    room_types: ['Panoramic Sea View King', 'Club Level Executive', 'Penthouse Duplex'],
    amenities: ['2-Michelin Star Restaurant', 'Rooftop Beachfront Pool', '43 The Spa Panoramic Oasis', 'Private Gardens'],
    booking_link: 'https://www.hotelartsbarcelona.com',
    operating_hours: 'Check-in: 15:00 | Check-out: 12:00 | Concierge: 24/7',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Hotel+Arts+Barcelona',
    rating: 4.89,
    reviews_count: 670,
    typical_days: 4
  }
];

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-kyoto-1',
    destination_id: 'dest-kyoto',
    destination_name: 'Kyoto, Japan',
    name: 'Gion Karyo Kaiseki Dining',
    cuisine: 'Traditional Kyoto Kaiseki',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80',
    rating: 4.93,
    price_level: '$$$$',
    avg_budget: 110,
    operating_hours: 'Lunch: 12:00 – 14:00 | Dinner: 18:00 – 21:30 (Closed Wed)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Gion+Karyo+Kyoto',
    avg_duration_mins: 90,
    menu_highlights: [
      { name: 'Seasonal 9-Course Chef Kaiseki', price: '$120', desc: 'Sashimi selection, seasonal sea bream simmer, wagyu beef tenderloin with Kyoto spring vegetables', is_signature: true },
      { name: 'Yuba Tofu & Bamboo Shoot Consommé', price: '$22', desc: 'Silken soy milk skin folded delicately in house-brewed dashi broth' },
      { name: 'Charcoal-Grilled Miso Black Cod', price: '$38', desc: 'Marinated 48 hours in Saikyo sweet white miso' }
    ],
    reviews: [
      {
        id: 'rev-gk1',
        user: 'Kenji Takahashi',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Every plate was an exquisite poem. Sitting at the counter watching the master chef is mesmerizing.'
      }
    ]
  },
  {
    id: 'rest-kyoto-2',
    destination_id: 'dest-kyoto',
    destination_name: 'Kyoto, Japan',
    name: 'Menbaka Fire Ramen Kyoto',
    cuisine: 'Signature Artisanal Ramen',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    rating: 4.82,
    price_level: '$$',
    avg_budget: 22,
    operating_hours: 'Daily 11:30 – 15:00, 17:30 – 21:00',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Menbaka+Fire+Ramen+Kyoto',
    avg_duration_mins: 45,
    menu_highlights: [
      { name: 'Signature Negi Fire Ramen', price: '$16', desc: 'Rich chicken-shoyu broth covered in Kyoto green scallions with blazing hot green onion oil flame finish', is_signature: true },
      { name: 'Crispy Pork Gyoza', price: '$6', desc: 'Pan-fried handmade dumplings with dipping vinegar sauce' }
    ],
    reviews: [
      {
        id: 'rev-m1',
        user: 'Rachel Adams',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Not just a viral spectacle — the smoky scallion broth is deeply flavorful!'
      }
    ]
  },
  {
    id: 'rest-paris-1',
    destination_id: 'dest-paris',
    destination_name: 'Paris, France',
    name: 'Le Comptoir du Relais Saint-Germain',
    cuisine: 'Authentic Parisian Bistro',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    rating: 4.89,
    price_level: '$$$',
    avg_budget: 65,
    operating_hours: 'Lunch: 12:00 – 15:00 | Dinner: 19:00 – 23:00 (Open Daily)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Le+Comptoir+du+Relais+Paris',
    avg_duration_mins: 75,
    menu_highlights: [
      { name: 'Roasted Duck Breast with Cherry Glaze', price: '€34', desc: 'Served with crushed ratte potatoes and crisp duck crackling', is_signature: true },
      { name: 'Traditional French Onion Soup', price: '€16', desc: 'Slow-caramelized onions with rich beef stock and melted Gruyère gratin' },
      { name: 'Warm Chocolate Fondant', price: '€14', desc: 'Valrhona molten center with house vanilla bean cream' }
    ],
    reviews: [
      {
        id: 'rev-cp1',
        user: 'Claire Dupont',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '1 month ago',
        comment: 'Quintessential Paris bistro atmosphere. Arrive a few minutes before 12:00 for lunch!'
      }
    ]
  },
  {
    id: 'rest-rome-1',
    destination_id: 'dest-rome',
    destination_name: 'Rome, Italy',
    name: 'Da Enzo al 29 Trastevere',
    cuisine: 'Roman Trattoria & Homemade Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d628151a?auto=format&fit=crop&w=1200&q=80',
    rating: 4.95,
    price_level: '$$',
    avg_budget: 35,
    operating_hours: 'Lunch: 12:15 – 15:00 | Dinner: 19:30 – 23:00 (Closed Sun)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Da+Enzo+al+29+Rome',
    avg_duration_mins: 75,
    menu_highlights: [
      { name: 'Rigatoni alla Carbonara', price: '€16', desc: 'Crispy artisanal guanciale, pecorino romano DOP, farm egg yolks, toasted black pepper', is_signature: true },
      { name: 'Carciofo alla Giudia', price: '€9', desc: 'Deep-fried Jewish-style whole Roman artichoke, crispy as chips outside, melting inside' },
      { name: 'Coda alla Vaccinara', price: '€19', desc: 'Traditional braised oxtail stew in rich tomato, celery and pine nut ragu' }
    ],
    reviews: [
      {
        id: 'rev-de1',
        user: 'Giulia Conti',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Best carbonara in Rome, bar none. The guanciale is cooked to perfection.'
      }
    ]
  },
  {
    id: 'rest-bali-1',
    destination_id: 'dest-bali',
    destination_name: 'Bali, Indonesia',
    name: 'Locavore Herbivore Ubud',
    cuisine: 'Modern Farm-to-Table Indonesian',
    image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80',
    rating: 4.91,
    price_level: '$$$',
    avg_budget: 45,
    operating_hours: 'Lunch: 12:00 – 14:30 | Dinner: 18:00 – 22:00 (Tue–Sun)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Locavore+Ubud+Bali',
    avg_duration_mins: 90,
    menu_highlights: [
      { name: 'Heirloom Roasted Pumpkin with Keluak', price: '$22', desc: 'Slow-braised with local wild seeds and black nut glaze', is_signature: true },
      { name: 'Smoked Jackfruit Rendang', price: '$18', desc: 'Sumatran coconut curry with young jackfruit and wild herbs' }
    ],
    reviews: [
      {
        id: 'rev-loc1',
        user: 'Liam O’Connor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Mind-blowing creativity with Indonesian indigenous plants and spices.'
      }
    ]
  }
];

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-kyoto-5d',
    user_id: 'user-tara',
    author_name: 'Tara Jenkins',
    author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    is_verified_traveler: true,
    title: '5 Days in Kyoto: Shrines, Bamboo & Kaiseki Secrets',
    destination_id: 'dest-kyoto',
    destination_name: 'Kyoto, Japan',
    cover_photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    days: 5,
    total_spend: 1680,
    spend_breakdown: {
      food: 460,
      tickets: 140,
      flights: 520,
      accommodation: 440,
      transport: 80,
      other: 40
    },
    description: 'A thoroughly tested, crowd-free guide to Kyoto balancing iconic zen temples at sunrise with hidden alleys, artisanal pottery workshops, and Michelin-caliber dinners on a balanced budget.',
    flight_details: {
      airline: 'All Nippon Airways (ANA)',
      from_airport: 'SFO (San Francisco Intl)',
      to_airport: 'KIX (Osaka Kansai Intl)',
      duration: '11h 20m direct'
    },
    day_by_day: [
      {
        day: 1,
        title: 'Dawn at Fushimi Inari & Historic Higashiyama',
        highlights: ['Hiking Mount Inari gates at 06:30 AM before tourist buses', 'Kiyomizu-dera sunset lookout', 'Lantern-lit walk through Ninenzaka'],
        schedule: [
          { time: '06:30', activity: 'Fushimi Inari Taisha Torii hike', notes: 'Go past the midway Yotsutsuji intersection for tranquil mountain views', category: 'Attraction' },
          { time: '10:00', activity: 'Kiyomizu-dera Temple Wooden Terrace', notes: 'Drink from Otowa waterfall springs', category: 'Attraction' },
          { time: '12:30', activity: 'Tofu lunch at Okutan Kiyomizu', notes: 'Oldest yudofu restaurant in Japan (founded 1635)', category: 'Food & Drink' },
          { time: '15:00', activity: 'Sannenzaka & Ninenzaka Traditional Crafts', notes: 'Ceramics and matcha parfaits', category: 'Culture' },
          { time: '18:30', activity: 'Pontocho Alley dinner stroll', notes: 'Riverside dining along Kamogawa river', category: 'Food & Drink' }
        ]
      },
      {
        day: 2,
        title: 'Arashiyama Bamboo Forest & Mountain Monkeys',
        highlights: ['Sagano Bamboo Grove early morning serenity', 'Tenryu-ji Zen Garden contemplation', 'Iwatayama Monkey Park summit'],
        schedule: [
          { time: '08:00', activity: 'Sagano Bamboo Grove', notes: 'Arrive early for sunlight filtering through towering stalks', category: 'Nature' },
          { time: '09:45', activity: 'Tenryu-ji Temple & Sogenchi Garden', notes: 'UNESCO World Heritage dry landscape', category: 'Attraction' },
          { time: '12:15', activity: 'Soba lunch at Arashiyama Yoshimura', notes: 'Window seats overlooking the Togetsukyo Bridge', category: 'Food & Drink' },
          { time: '14:30', activity: 'Iwatayama Monkey Park hike', notes: 'Feed wild snow monkeys with panoramic city view', category: 'Nature' },
          { time: '18:45', activity: 'Traditional Kaiseki dinner at Gion Karyo', notes: 'Pre-booked seasonal tasting menu', category: 'Food & Drink' }
        ]
      },
      {
        day: 3,
        title: 'Golden Pavilion & Central Culinary Delights',
        highlights: ['Kinkaku-ji golden reflection', 'Nishiki Market 100-vendor exploration', 'Matcha masterclass'],
        schedule: [
          { time: '09:00', activity: 'Kinkaku-ji (Golden Pavilion)', notes: 'Sun illuminates the top two gold-leaf floors', category: 'Attraction' },
          { time: '11:15', activity: 'Ryoan-ji Rock Garden', notes: '15 mysterious stones arranged in gravel sea', category: 'Culture' },
          { time: '13:00', activity: 'Nishiki Market food crawl', notes: 'Tako tamago, matcha soft serve, and wagyu skewers', category: 'Food & Drink' },
          { time: '16:00', activity: 'Traditional Chado Tea Ceremony', notes: 'Learn whisking etiquette with a tea master', category: 'Culture' },
          { time: '19:30', activity: 'Craft beer & yakitori at Gion Duck Noodles', notes: 'Modern ramen infused with French culinary tech', category: 'Food & Drink' }
        ]
      },
      {
        day: 4,
        title: 'Uji Matcha Capital Day Trip & Byodoin',
        highlights: ['Train ride to Uji', 'Byodoin Phoenix Hall (featured on 10-yen coin)', 'Fresh stone-ground matcha tasting'],
        schedule: [
          { time: '09:30', activity: 'JR Nara Line train to Uji', notes: '30 min ride from Kyoto Station', category: 'Transit' },
          { time: '10:30', activity: 'Byodoin Temple Phoenix Hall', notes: 'Pure Land Buddhist architecture over reflection pond', category: 'Attraction' },
          { time: '12:30', activity: 'Matcha soba lunch at Nakamura Tokichi', notes: 'Bamboo bowl desserts are legendary', category: 'Food & Drink' },
          { time: '15:30', activity: 'Return to Kyoto & Gion geisha evening walk', notes: 'Discreet photography only on public roads', category: 'Culture' }
        ]
      },
      {
        day: 5,
        title: 'Philosopher’s Path & Farewell Feast',
        highlights: ['Ginkaku-ji Silver Pavilion', 'Canal-side contemplative stroll', 'Station observatory view'],
        schedule: [
          { time: '09:00', activity: 'Ginkaku-ji (Silver Pavilion) & Sand Garden', notes: 'Sea of silver sand cones', category: 'Attraction' },
          { time: '10:30', activity: 'Philosopher’s Path walk (Tetsugaku-no-Michi)', notes: 'Shaded stone path alongside babbling canal', category: 'Nature' },
          { time: '13:00', activity: 'Farewell lunch at Omen Noodle House', notes: 'Thick handmade udon with fresh vegetables', category: 'Food & Drink' },
          { time: '15:00', activity: 'Kyoto Station Skyway panorama', notes: 'Futuristic glass atrium designed by Hiroshi Hara', category: 'Attraction' }
        ]
      }
    ],
    packing_list: [
      'Slip-on walking shoes (temples require taking shoes off frequently)',
      'Clean socks without holes (courtesy in tatami rooms)',
      'Coin purse for bus fares & shrine fortune papers (omikuji)',
      'Pocket Wi-Fi or e-SIM with reliable 5G data',
      'Lightweight rain umbrella / UV parasol',
      'Small hand towel (many traditional washrooms do not have paper towels)'
    ],
    cautions: [
      'Do NOT touch, chase, or harass Geiko / Maiko in Gion. Strict 10,000 JPY fines apply on private roads.',
      'Always walk on the left side of stairs and stand on the left on escalators in Kansai.',
      'Public trash cans are very rare. Carry a small bag in your daypack to hold your own waste until returning to hotel.',
      'Smoking on city streets is illegal outside designated enclosed smoking pods.'
    ],
    etiquette_tips: [
      'Bow slightly when thanking staff or greeting temple attendants instead of shaking hands.',
      'Never stick chopsticks vertically into rice bowls (this resembles funeral rites); rest them on the chopstick holder.',
      'Tipping is NOT customary in Japan and can cause confusion or polite refusal.',
      'Cover prominent tattoos when visiting public onsens or bathhouses, or request private bath facilities.'
    ],
    is_template: true,
    likes: 428,
    saves: 310,
    created_at: '2026-08-15'
  },
  {
    id: 'plan-paris-4d',
    user_id: 'user-marcus',
    author_name: 'Marcus Chen',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    is_verified_traveler: true,
    title: '4 Days in Paris: Art Masterpieces, Bakeries & Hidden Arcades',
    destination_id: 'dest-paris',
    destination_name: 'Paris, France',
    cover_photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    days: 4,
    total_spend: 1850,
    spend_breakdown: {
      food: 520,
      tickets: 160,
      flights: 590,
      accommodation: 480,
      transport: 60,
      other: 40
    },
    description: 'The definitive Paris culture guide without getting trapped in tourist queues. Includes timed entry hacks for Musée d’Orsay, best boulangeries in Le Marais, and evening jazz bars.',
    flight_details: {
      airline: 'Air France',
      from_airport: 'JFK (New York)',
      to_airport: 'CDG (Paris Charles de Gaulle)',
      duration: '7h 15m direct'
    },
    day_by_day: [
      {
        day: 1,
        title: 'Haussmann Grandeur & The Louvre at Twilight',
        highlights: ['Palais Garnier exterior', 'Louvre Museum late evening session', 'Seine bridge walk'],
        schedule: [
          { time: '10:00', activity: 'Palais Garnier Opera House visit', notes: 'Marvel at the marble Grand Staircase', category: 'Attraction' },
          { time: '12:30', activity: 'Café de Flore coffee & croque monsieur', notes: 'Iconic Left Bank intellectual haunt', category: 'Food & Drink' },
          { time: '15:30', activity: 'Tuileries Garden walk & sculpture trail', notes: 'Relax by the grand octagonal pond', category: 'Nature' },
          { time: '18:00', activity: 'Louvre evening visit', notes: 'Far fewer tour groups on late night openings', category: 'Attraction' },
          { time: '21:00', activity: 'Dinner at Le Comptoir du Relais', notes: 'Classic confit duck and fine wine', category: 'Food & Drink' }
        ]
      },
      {
        day: 2,
        title: 'Impressionism & Montmartre Sunset',
        highlights: ['Musée d’Orsay Monet & Van Gogh galleries', 'Sacré-Cœur steps sunset', 'Rue des Abbesses cafes'],
        schedule: [
          { time: '09:30', activity: 'Musée d’Orsay', notes: 'Former railway station showcasing French masters', category: 'Attraction' },
          { time: '13:00', activity: 'Lunch along Boulevard Saint-Germain', notes: 'Fresh baguette sandwiches and fruit tart', category: 'Food & Drink' },
          { time: '16:00', activity: 'Montmartre Funicular & Artists Square', notes: 'Watch live portrait painters in action', category: 'Culture' },
          { time: '19:00', activity: 'Sacré-Cœur basilica steps view', notes: 'Golden hour panoramic city overview', category: 'Attraction' }
        ]
      },
      {
        day: 3,
        title: 'Le Marais Boutiques & Covered Passages',
        highlights: ['Galerie Vivienne 19th-century glass arcade', 'Place des Vosges arcades', 'Falafel in Rue des Rosiers'],
        schedule: [
          { time: '10:00', activity: 'Passage des Panoramas & Galerie Vivienne', notes: 'Old world bookshops and antique shops', category: 'Culture' },
          { time: '12:30', activity: 'L’As du Fallafel lunch', notes: 'World-famous pita loaded with grilled eggplant and tahini', category: 'Food & Drink' },
          { time: '15:00', activity: 'Musée Carnavalet Paris History', notes: 'Free admission permanent collection and courtyard cafe', category: 'Attraction' },
          { time: '19:30', activity: 'Sunset Seine Boat Cruise', notes: 'Illuminated Eiffel Tower sparkle show at the hour mark', category: 'Attraction' }
        ]
      },
      {
        day: 4,
        title: 'Latin Quarter & Saint-Chapelle Jewels',
        highlights: ['Sainte-Chapelle 13th-century stained glass', 'Shakespeare and Company bookstore', 'Luxembourg Gardens promenade'],
        schedule: [
          { time: '09:30', activity: 'Sainte-Chapelle gothic chapel', notes: 'Arrive on a sunny morning to see 1,113 stained glass panels glow', category: 'Attraction' },
          { time: '11:30', activity: 'Shakespeare and Company book browsing', notes: 'Historic English bookstore where Hemingway spent hours', category: 'Culture' },
          { time: '13:00', activity: 'Picnic in Jardin du Luxembourg', notes: 'Fresh goat cheese, sourdough baguette, and fresh strawberries', category: 'Nature' },
          { time: '16:30', activity: 'Latin Quarter winding streets & souvenir shopping', notes: 'Old Sorbonne university atmosphere', category: 'Culture' }
        ]
      }
    ],
    packing_list: [
      'Comfortable broken-in walking sneakers (cobblestone streets are unforgiving)',
      'Crossbody anti-theft bag with zippered compartments',
      'Type C/E European plug adapter',
      'Museum reservations printed or saved offline',
      'Smart-casual outfit for evening bistro dining (avoid athletic gym shorts)'
    ],
    cautions: [
      'Watch out for the "petition clipboard" scam and gold ring trick around the Eiffel Tower and Louvre.',
      'Be extremely vigilant on Metro Line 1, 4, and at Châtelet station for pickpockets.',
      'Always validate your metro ticket and keep it until you exit the station.'
    ],
    etiquette_tips: [
      'Always say "Bonjour Madame / Monsieur" the second you enter any shop or cafe. Forgetting this is considered deeply rude.',
      'Speak in low, pleasant conversational tones in restaurants and on public transport.',
      'Service is included by law in France ("service compris"), but leaving 1 to 2 euros per person for great dinner service is polite.'
    ],
    is_template: true,
    likes: 382,
    saves: 245,
    created_at: '2026-07-28'
  },
  {
    id: 'plan-rome-3d',
    user_id: 'user-elena',
    author_name: 'Elena Rostova',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    is_verified_traveler: true,
    title: '3 Days in Rome: Gladiators, Vatican Wonders & Piazza Wine',
    destination_id: 'dest-rome',
    destination_name: 'Rome, Italy',
    cover_photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    days: 3,
    total_spend: 1120,
    spend_breakdown: {
      food: 310,
      tickets: 120,
      flights: 340,
      accommodation: 280,
      transport: 40,
      other: 30
    },
    description: 'High-energy 72 hours across ancient Rome, Vatican treasures, and cobblestone alleyways in Trastevere with authentic carbonara and gelato stops.',
    flight_details: {
      airline: 'ITA Airways',
      from_airport: 'LHR (London Heathrow)',
      to_airport: 'FCO (Rome Fiumicino)',
      duration: '2h 30m direct'
    },
    day_by_day: [
      {
        day: 1,
        title: 'Colosseum & The Roman Heart',
        highlights: ['Arena floor access', 'Palatine Hill', 'Piazza Navona'],
        schedule: [
          { time: '09:00', activity: 'Colosseum & Roman Forum tour', notes: 'Walk the footsteps of Caesar', category: 'Attraction' },
          { time: '13:00', activity: 'Da Enzo al 29 lunch', notes: 'Best carbonara in Trastevere', category: 'Food & Drink' },
          { time: '16:00', activity: 'Pantheon architectural wonder', notes: 'Stand under the famous open oculus dome', category: 'Attraction' }
        ]
      }
    ],
    packing_list: ['Shoulder-covering shawl for churches', 'Refillable water bottle for Rome’s clean street fountains (Nasoni)', 'Sun hat'],
    cautions: ['Do not pay for restaurants with photo menus and hawkers outside'],
    etiquette_tips: ['Do not order cappuccino after 11:00 AM (Italians consider milk after meals bad for digestion; order espresso instead)'],
    is_template: true,
    likes: 290,
    saves: 195,
    created_at: '2026-08-01'
  }
];

export const DISCOVERABLE_PLACES: DiscoverablePlace[] = [
  // Kyoto
  {
    id: 'place-fushimi',
    name: 'Fushimi Inari Taisha',
    category: 'Suggested',
    destination_id: 'dest-kyoto',
    description: 'Famous mountain path flanked by 10,000 vibrant vermilion torii gates dedicated to the god of rice and commerce.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    rating: 4.95,
    energy_level: 4,
    avg_duration_mins: 120,
    operating_hours: 'Open 24/7 (Best at 06:30 - 08:30)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Taisha+Kyoto',
    suitable_for_tags: ['culture', 'nature', 'photography']
  },
  {
    id: 'place-kiyomizu',
    name: 'Kiyomizu-dera Temple',
    category: 'Attraction',
    destination_id: 'dest-kyoto',
    description: 'Iconic UNESCO temple perched on wooden scaffolding offering sweeping vistas over Kyoto city and cherry/maple trees.',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    rating: 4.91,
    energy_level: 3,
    avg_duration_mins: 90,
    operating_hours: '06:00 – 18:00 daily',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Kiyomizu-dera+Kyoto',
    suitable_for_tags: ['culture', 'architecture', 'photography']
  },
  {
    id: 'place-bamboo',
    name: 'Arashiyama Bamboo Grove',
    category: 'Nature',
    destination_id: 'dest-kyoto',
    description: 'Mesmerizing soaring green bamboo stalks swaying with the mountain breeze, accompanied by the rustle of leaves.',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80',
    rating: 4.88,
    energy_level: 2,
    avg_duration_mins: 60,
    operating_hours: 'Open 24/7',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Arashiyama+Bamboo+Grove+Kyoto',
    suitable_for_tags: ['nature', 'relaxation', 'photography']
  },
  {
    id: 'place-lunch-nishiki',
    name: 'Nishiki Food Market Tasting',
    category: 'Food & Drink',
    destination_id: 'dest-kyoto',
    description: 'Kyoto’s 400-year-old pantry alley boasting over 130 food stalls with skewers, pickles, matcha sweets, and fresh seafood.',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80',
    rating: 4.86,
    energy_level: 2,
    avg_duration_mins: 90,
    operating_hours: '10:00 – 18:00 daily',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Nishiki+Market+Kyoto',
    suitable_for_tags: ['food', 'culture'],
    is_meal: 'lunch'
  },
  {
    id: 'place-lunch-menbaka',
    name: 'Menbaka Fire Ramen Feast',
    category: 'Food & Drink',
    destination_id: 'dest-kyoto',
    description: 'Legendary piping hot scallion oil fire ramen with unforgettable smoky savory broth and lively master host.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    rating: 4.83,
    energy_level: 2,
    avg_duration_mins: 60,
    operating_hours: '11:30 – 15:00, 17:30 – 21:00',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Menbaka+Fire+Ramen+Kyoto',
    suitable_for_tags: ['food', 'adventure'],
    is_meal: 'lunch'
  },
  {
    id: 'place-gion-evening',
    name: 'Gion District Lantern Walk',
    category: 'Culture',
    destination_id: 'dest-kyoto',
    description: 'Traditional preserved wooden machiya houses, paper lanterns, exclusive tea houses, and tranquil stone-paved lanes.',
    image: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=600&q=80',
    rating: 4.92,
    energy_level: 2,
    avg_duration_mins: 75,
    operating_hours: 'Best after 17:30',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Gion+Kyoto',
    suitable_for_tags: ['culture', 'nightlife', 'photography']
  },
  {
    id: 'place-dinner-karyo',
    name: 'Gion Karyo Seasonal Kaiseki',
    category: 'Food & Drink',
    destination_id: 'dest-kyoto',
    description: 'Authentic 9-course Kyoto seasonal culinary masterpiece served along a polished cypress counter by master craftsmen.',
    image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=600&q=80',
    rating: 4.94,
    energy_level: 1,
    avg_duration_mins: 120,
    operating_hours: '18:00 – 21:30',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Gion+Karyo+Kyoto',
    suitable_for_tags: ['food', 'culture', 'relaxation'],
    is_meal: 'dinner'
  },
  {
    id: 'place-pontocho-drinks',
    name: 'Pontocho Riverside Sake Bar',
    category: 'Nightlife',
    destination_id: 'dest-kyoto',
    description: 'Atmospheric canal alley lined with cozy cocktail nooks, craft sake tastings, and river breezes.',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    rating: 4.79,
    energy_level: 2,
    avg_duration_mins: 75,
    operating_hours: '18:00 – 01:00',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Pontocho+Kyoto',
    suitable_for_tags: ['nightlife', 'food']
  },

  // Paris
  {
    id: 'place-louvre',
    name: 'The Grand Louvre Museum',
    category: 'Suggested',
    destination_id: 'dest-paris',
    description: 'World’s largest museum featuring the glass pyramid, Mona Lisa, Venus de Milo, and French royal art collections.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    rating: 4.91,
    energy_level: 4,
    avg_duration_mins: 150,
    operating_hours: '09:00 – 18:00 (Fri till 21:45, Closed Tue)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris',
    suitable_for_tags: ['culture', 'art', 'photography']
  },
  {
    id: 'place-orsay',
    name: 'Musée d’Orsay Impressionism',
    category: 'Attraction',
    destination_id: 'dest-paris',
    description: 'Magnificent Beaux-Arts railway station housing masterpieces by Monet, Renoir, Degas, Cézanne, and Van Gogh.',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
    rating: 4.93,
    energy_level: 3,
    avg_duration_mins: 120,
    operating_hours: '09:30 – 18:00 (Thu till 21:45, Closed Mon)',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Musee+dOrsay+Paris',
    suitable_for_tags: ['art', 'culture']
  },
  {
    id: 'place-lunch-paris-bistro',
    name: 'Le Comptoir Bistro Terrace',
    category: 'Food & Drink',
    destination_id: 'dest-paris',
    description: 'Classic Saint-Germain terrace serving confit de canard, french onion soup, and fresh crusty baguettes with butter.',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
    rating: 4.88,
    energy_level: 1,
    avg_duration_mins: 75,
    operating_hours: '12:00 – 15:00, 19:00 – 23:00',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Le+Comptoir+du+Relais+Paris',
    suitable_for_tags: ['food', 'relaxation'],
    is_meal: 'lunch'
  },
  {
    id: 'place-montmartre',
    name: 'Montmartre & Sacré-Cœur Panorama',
    category: 'Culture',
    destination_id: 'dest-paris',
    description: 'Cobblestone hilltop village once home to Picasso and Renoir, crowned with the white-domed basilica.',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
    rating: 4.87,
    energy_level: 3,
    avg_duration_mins: 90,
    operating_hours: '06:00 – 22:30 daily',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Sacre+Coeur+Montmartre+Paris',
    suitable_for_tags: ['culture', 'architecture', 'photography']
  },
  {
    id: 'place-seine-sunset',
    name: 'Sunset Cruise on the River Seine',
    category: 'Relaxation',
    destination_id: 'dest-paris',
    description: 'Glide under historic stone bridges with panoramic glass rooftops while monuments illuminate as night falls.',
    image: 'https://images.unsplash.com/photo-1520939817895-060bdef4d1b3?auto=format&fit=crop&w=600&q=80',
    rating: 4.85,
    energy_level: 1,
    avg_duration_mins: 75,
    operating_hours: 'Departures every 30 mins from 10:00 to 22:30',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Seine+River+Cruise+Paris',
    suitable_for_tags: ['relaxation', 'romance', 'photography']
  },
  {
    id: 'place-dinner-paris-gourmet',
    name: 'Le Marais Candlelit Cellar Dinner',
    category: 'Food & Drink',
    destination_id: 'dest-paris',
    description: 'Intimate vaulted stone cellar dining experience with seasonal French tasting courses and curated wine pairings.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    rating: 4.90,
    energy_level: 1,
    avg_duration_mins: 105,
    operating_hours: '18:30 – 23:00',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Le+Marais+Restaurants+Paris',
    suitable_for_tags: ['food', 'romance'],
    is_meal: 'dinner'
  }
];

export const DEMO_USERS = [
  {
    id: 'user-alex',
    name: 'Alex Rivera',
    email: 'alex@roamio.travel',
    phone: '+1 415-555-0192',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }
];
