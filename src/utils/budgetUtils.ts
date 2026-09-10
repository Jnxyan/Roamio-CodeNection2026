export interface BudgetTierDetail {
  daily: number;
  label: string;
  desc: string;
  accommodation: string;
  food: string;
  activities: string;
  transit: string;
  // Estimated percentage breakdown
  breakdown: {
    accommodationPercent: number; // e.g. 50%
    foodPercent: number;          // e.g. 25%
    activitiesPercent: number;    // e.g. 15%
    transitPercent: number;       // e.g. 10%
  };
}

export interface DestinationBudgetProfile {
  tierName: string;
  tierDescription: string;
  costIndex: 'low' | 'medium_low' | 'medium' | 'medium_high' | 'high';
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  backpacker: BudgetTierDetail;
  balanced: BudgetTierDetail;
  luxury: BudgetTierDetail;
}

// Region cost classifier
function classifyCostIndex(destinationName: string): 'low' | 'medium_low' | 'medium' | 'medium_high' | 'high' {
  const clean = destinationName.toLowerCase();

  // Ultra-High / Premium Luxury
  if (
    clean.includes('amalfi') ||
    clean.includes('positano') ||
    clean.includes('switzerland') ||
    clean.includes('zurich') ||
    clean.includes('geneva') ||
    clean.includes('iceland') ||
    clean.includes('reykjavik') ||
    clean.includes('norway') ||
    clean.includes('oslo') ||
    clean.includes('monaco') ||
    clean.includes('maldives') ||
    clean.includes('santorini')
  ) {
    return 'high';
  }

  // High-Cost / Top-tier Western
  if (
    clean.includes('paris') ||
    clean.includes('france') ||
    clean.includes('london') ||
    clean.includes('united kingdom') ||
    clean.includes('new york') ||
    clean.includes('san francisco') ||
    clean.includes('los angeles') ||
    clean.includes('seattle') ||
    clean.includes('chicago') ||
    clean.includes('boston') ||
    clean.includes('amsterdam') ||
    clean.includes('netherlands') ||
    clean.includes('denmark') ||
    clean.includes('copenhagen') ||
    clean.includes('sweden') ||
    clean.includes('stockholm') ||
    clean.includes('singapore') ||
    clean.includes('sydney') ||
    clean.includes('melbourne') ||
    clean.includes('australia') ||
    clean.includes('dubai')
  ) {
    return 'medium_high';
  }

  // Moderate Cost (Japan, South Korea, Italy standard, Spain, Germany, Austria)
  if (
    clean.includes('japan') ||
    clean.includes('kyoto') ||
    clean.includes('tokyo') ||
    clean.includes('osaka') ||
    clean.includes('fukuoka') ||
    clean.includes('sapporo') ||
    clean.includes('south korea') ||
    clean.includes('seoul') ||
    clean.includes('busan') ||
    clean.includes('italy') ||
    clean.includes('rome') ||
    clean.includes('florence') ||
    clean.includes('venice') ||
    clean.includes('milan') ||
    clean.includes('germany') ||
    clean.includes('berlin') ||
    clean.includes('munich') ||
    clean.includes('austria') ||
    clean.includes('vienna') ||
    clean.includes('spain') ||
    clean.includes('barcelona') ||
    clean.includes('madrid') ||
    clean.includes('canada') ||
    clean.includes('vancouver') ||
    clean.includes('toronto') ||
    clean.includes('new zealand') ||
    clean.includes('auckland')
  ) {
    return 'medium';
  }

  // Medium-Low Cost (Malaysia, Taiwan, Portugal, Greece, Mexico, Eastern Europe, South Africa)
  if (
    clean.includes('malaysia') ||
    clean.includes('kuala lumpur') ||
    clean.includes('penang') ||
    clean.includes('langkawi') ||
    clean.includes('taiwan') ||
    clean.includes('taipei') ||
    clean.includes('portugal') ||
    clean.includes('lisbon') ||
    clean.includes('porto') ||
    clean.includes('greece') ||
    clean.includes('athens') ||
    clean.includes('czech') ||
    clean.includes('prague') ||
    clean.includes('hungary') ||
    clean.includes('budapest') ||
    clean.includes('mexico') ||
    clean.includes('cancun') ||
    clean.includes('south africa') ||
    clean.includes('cape town') ||
    clean.includes('chile') ||
    clean.includes('argentina')
  ) {
    return 'medium_low';
  }

  // Low Cost (Southeast Asia, South Asia, South America, North Africa)
  if (
    clean.includes('bali') ||
    clean.includes('indonesia') ||
    clean.includes('thailand') ||
    clean.includes('bangkok') ||
    clean.includes('phuket') ||
    clean.includes('chiang mai') ||
    clean.includes('vietnam') ||
    clean.includes('hanoi') ||
    clean.includes('ho chi minh') ||
    clean.includes('da nang') ||
    clean.includes('philippines') ||
    clean.includes('manila') ||
    clean.includes('cebu') ||
    clean.includes('india') ||
    clean.includes('morocco') ||
    clean.includes('marrakech') ||
    clean.includes('egypt') ||
    clean.includes('cairo') ||
    clean.includes('peru') ||
    clean.includes('lima')
  ) {
    return 'low';
  }

  // Default fallback to medium
  return 'medium';
}

export function getDestinationBudgetProfile(destinationCities: string[]): DestinationBudgetProfile {
  if (!destinationCities || destinationCities.length === 0) {
    destinationCities = ['Kyoto, Japan'];
  }

  // Classify all destinations and pick weighted/dominant index
  const indices = destinationCities.map(classifyCostIndex);
  
  const scoreMap = {
    low: 1,
    medium_low: 2,
    medium: 3,
    medium_high: 4,
    high: 5
  };

  const avgScore = indices.reduce((acc, idx) => acc + scoreMap[idx], 0) / indices.length;
  let resolvedIndex: 'low' | 'medium_low' | 'medium' | 'medium_high' | 'high' = 'medium';

  if (avgScore <= 1.4) resolvedIndex = 'low';
  else if (avgScore <= 2.4) resolvedIndex = 'medium_low';
  else if (avgScore <= 3.4) resolvedIndex = 'medium';
  else if (avgScore <= 4.4) resolvedIndex = 'medium_high';
  else resolvedIndex = 'high';

  switch (resolvedIndex) {
    case 'low':
      return {
        tierName: 'Budget-Friendly Hub',
        tierDescription: 'High purchasing power with exceptional street food, affordable boutique villas, and transit.',
        costIndex: 'low',
        sliderMin: 20,
        sliderMax: 600,
        sliderStep: 5,
        backpacker: {
          daily: 35,
          label: 'Backpacker',
          desc: 'Social hostels & guesthouses, night markets & warungs, public scooters / transit',
          accommodation: 'Hostel dorm or simple guesthouse ($14/night)',
          food: 'Local street eateries & markets ($12/day)',
          activities: 'Free walking tours, temples & public beaches ($5/day)',
          transit: 'Public songthaew, scooter rental, walking ($4/day)',
          breakdown: { accommodationPercent: 40, foodPercent: 35, activitiesPercent: 15, transitPercent: 10 }
        },
        balanced: {
          daily: 95,
          label: 'Balanced',
          desc: 'Boutique hotels & private villas, trendy cafes & beach clubs, guided tours & Grab rides',
          accommodation: '3–4★ boutique hotel or private pool villa ($50/night)',
          food: 'Sit-down cafes, seafood grills & casual bars ($26/day)',
          activities: 'Scuba diving, cooking classes & entry tickets ($12/day)',
          transit: 'Grab rides & private airport taxi transfers ($7/day)',
          breakdown: { accommodationPercent: 52, foodPercent: 28, activitiesPercent: 13, transitPercent: 7 }
        },
        luxury: {
          daily: 290,
          label: 'Luxury',
          desc: '5-star ocean suites, Michelin-grade tasting menus, private yacht charters & chauffeur',
          accommodation: '5-star luxury brand resort or private luxury villa ($180/night)',
          food: 'Fine dining tasting menus & champagne cocktails ($65/day)',
          activities: 'Private speedboat charters & luxury wellness spa ($30/day)',
          transit: 'Dedicated private air-conditioned car & driver ($15/day)',
          breakdown: { accommodationPercent: 62, foodPercent: 22, activitiesPercent: 11, transitPercent: 5 }
        }
      };

    case 'medium_low':
      return {
        tierName: 'Moderate-Low Hub',
        tierDescription: 'Great value for money with budget-friendly dining, efficient rail, and comfortable stays.',
        costIndex: 'medium_low',
        sliderMin: 30,
        sliderMax: 750,
        sliderStep: 5,
        backpacker: {
          daily: 50,
          label: 'Backpacker',
          desc: 'Budget pods & hostels, hawker centers & bakeries, metro day passes',
          accommodation: 'Modern pod hostel or shared flat ($22/night)',
          food: 'Hawker centres, local noodle stalls, tap water ($16/day)',
          activities: 'City viewpoints, public museums & parks ($7/day)',
          transit: 'Subway & bus smart cards ($5/day)',
          breakdown: { accommodationPercent: 44, foodPercent: 32, activitiesPercent: 14, transitPercent: 10 }
        },
        balanced: {
          daily: 135,
          label: 'Balanced',
          desc: 'Heritage 4★ hotels, rooftop bistros & wine taverns, guided cultural tours',
          accommodation: 'Heritage boutique hotel or modern city studio ($72/night)',
          food: 'Bistros, tapas, craft coffee & local specialties ($38/day)',
          activities: 'Museum entrances, wine tastings & landmark passes ($15/day)',
          transit: 'Metro, ride-hailing & scenic funiculars ($10/day)',
          breakdown: { accommodationPercent: 53, foodPercent: 28, activitiesPercent: 11, transitPercent: 8 }
        },
        luxury: {
          daily: 390,
          label: 'Luxury',
          desc: 'Luxury waterfront hotels, chef tables, private guide & luxury transport',
          accommodation: '5-star grand luxury hotel suite ($240/night)',
          food: 'Multi-course chef dinners & sommelier pairings ($90/day)',
          activities: 'Private historical guides & bespoke culinary workshops ($40/day)',
          transit: 'Private chauffeur & express airport transfers ($20/day)',
          breakdown: { accommodationPercent: 61, foodPercent: 23, activitiesPercent: 10, transitPercent: 6 }
        }
      };

    case 'medium':
      return {
        tierName: 'Moderate-Cost Destination',
        tierDescription: 'Balanced urban & cultural pricing with world-renowned rail, cuisine, and hospitality.',
        costIndex: 'medium',
        sliderMin: 40,
        sliderMax: 950,
        sliderStep: 10,
        backpacker: {
          daily: 68,
          label: 'Backpacker',
          desc: 'Capsule hotels & guesthouses, ramen bars & konbini marts, regional train passes',
          accommodation: 'Capsule hotel or clean youth hostel ($32/night)',
          food: 'Ramen bars, donburi diners & convenience store meals ($20/day)',
          activities: 'Temple garden visits, shrines & public parks ($10/day)',
          transit: 'City metro & regional commuter lines ($6/day)',
          breakdown: { accommodationPercent: 47, foodPercent: 30, activitiesPercent: 14, transitPercent: 9 }
        },
        balanced: {
          daily: 185,
          label: 'Balanced',
          desc: 'Boutique hotels & traditional ryokans, izakayas & cafes, express rail & skip-the-line tickets',
          accommodation: 'Boutique modern hotel or traditional ryokan ($100/night)',
          food: 'Izakayas, sushi sets, craft cocktail bars ($48/day)',
          activities: 'Tea ceremonies, museum admissions & guided walks ($22/day)',
          transit: 'Shinkansen bullet train contribution & city transit ($15/day)',
          breakdown: { accommodationPercent: 54, foodPercent: 26, activitiesPercent: 12, transitPercent: 8 }
        },
        luxury: {
          daily: 520,
          label: 'Luxury',
          desc: 'Luxury onsen ryokans with private baths, kaiseki dinners, bespoke cultural guides',
          accommodation: 'Luxury onsen ryokan or 5-star international suite ($330/night)',
          food: 'Multi-course Kaiseki dinners & Michelin restaurants ($120/day)',
          activities: 'Private tea master ceremony & VIP temple access ($45/day)',
          transit: 'First-class Gran Class rail & private luxury transfers ($25/day)',
          breakdown: { accommodationPercent: 63, foodPercent: 23, activitiesPercent: 9, transitPercent: 5 }
        }
      };

    case 'medium_high':
      return {
        tierName: 'High-Cost Urban Destination',
        tierDescription: 'Major metropolitan destination with premium accommodations, diverse dining, and transit.',
        costIndex: 'medium_high',
        sliderMin: 50,
        sliderMax: 1400,
        sliderStep: 15,
        backpacker: {
          daily: 85,
          label: 'Backpacker',
          desc: 'Central youth hostels, bakeries & casual street bistros, multi-day metro passes',
          accommodation: 'Shared hostel dorm or budget private room ($42/night)',
          food: 'Bakeries, street markets & casual bistro lunches ($25/day)',
          activities: 'Free museum days, self-guided walks, monuments ($11/day)',
          transit: 'Subway & city bus unlimited passes ($7/day)',
          breakdown: { accommodationPercent: 49, foodPercent: 29, activitiesPercent: 13, transitPercent: 9 }
        },
        balanced: {
          daily: 240,
          label: 'Balanced',
          desc: '4-star boutique hotels, brasseries & wine bars, Louvre/landmark passes & Seine cruise',
          accommodation: 'Well-located 4-star boutique hotel ($135/night)',
          food: 'Classic brasseries, cafes, wine bars & dessert parlors ($60/day)',
          activities: 'Major museum tickets, skip-the-line passes & river cruises ($27/day)',
          transit: 'Metro, regional trains & occasional Uber rides ($18/day)',
          breakdown: { accommodationPercent: 56, foodPercent: 25, activitiesPercent: 11, transitPercent: 8 }
        },
        luxury: {
          daily: 680,
          label: 'Luxury',
          desc: '5-star palace hotels, haute cuisine degustations, private curator tours & chauffeur',
          accommodation: 'Palace or 5-star landmark hotel suite ($440/night)',
          food: '2–3 Michelin star dining, sommelier selections ($150/day)',
          activities: 'Private after-hours museum tours & VIP experiences ($55/day)',
          transit: 'Private Mercedes-Benz chauffeur & airport fast-track ($35/day)',
          breakdown: { accommodationPercent: 65, foodPercent: 22, activitiesPercent: 8, transitPercent: 5 }
        }
      };

    case 'high':
      return {
        tierName: 'Premium Luxury Haven',
        tierDescription: 'World-renowned scenic resort / high-standard destination with premium baseline costs.',
        costIndex: 'high',
        sliderMin: 70,
        sliderMax: 2000,
        sliderStep: 20,
        backpacker: {
          daily: 115,
          label: 'Backpacker',
          desc: 'Cozy guesthouses/ferries, paninis & deli picnics, scenic buses & walking trails',
          accommodation: 'Budget mountain guesthouse or cliffside hostel ($60/night)',
          food: 'Local bakeries, deli sandwiches & trattoria pizzas ($32/day)',
          activities: 'Hiking trails, public swimming coves & scenic viewpoints ($14/day)',
          transit: 'Public ferries, funiculars & regional buses ($9/day)',
          breakdown: { accommodationPercent: 52, foodPercent: 28, activitiesPercent: 12, transitPercent: 8 }
        },
        balanced: {
          daily: 320,
          label: 'Balanced',
          desc: 'Cliffside sea-view rooms, seafood trattorias & limoncello bars, boat day trips',
          accommodation: 'Sea-view boutique hotel or alpine chalet ($185/night)',
          food: 'Fresh seafood trattorias, pasta & local wine ($78/day)',
          activities: 'Shared skippered boat tour & historic villa entries ($35/day)',
          transit: 'Hydrofoil ferries, panoramic rail & local taxis ($22/day)',
          breakdown: { accommodationPercent: 58, foodPercent: 24, activitiesPercent: 11, transitPercent: 7 }
        },
        luxury: {
          daily: 950,
          label: 'Luxury',
          desc: 'Iconic 5-star cliffside suites, private Riva boat charters, Michelin cliff restaurants',
          accommodation: 'Iconic 5-star cliffside luxury hotel with private plunge pool ($640/night)',
          food: 'Cliffside Michelin tasting menus & reserve wines ($200/day)',
          activities: 'Private full-day Riva wooden boat charter ($70/day)',
          transit: 'Helicopter / luxury Mercedes private transfers ($40/day)',
          breakdown: { accommodationPercent: 67, foodPercent: 21, activitiesPercent: 7, transitPercent: 5 }
        }
      };
  }
}

/**
 * Calculates estimated breakdown amounts for a given daily budget and day count
 */
export function calculateBudgetBreakdown(
  dailyBudget: number,
  days: number,
  tier: 'backpacker' | 'balanced' | 'luxury',
  profile: DestinationBudgetProfile
) {
  const tierDetail = profile[tier];
  const totalTripBudget = dailyBudget * days;
  const p = tierDetail.breakdown;

  const accommodationDaily = Math.round((dailyBudget * p.accommodationPercent) / 100);
  const foodDaily = Math.round((dailyBudget * p.foodPercent) / 100);
  const activitiesDaily = Math.round((dailyBudget * p.activitiesPercent) / 100);
  const transitDaily = Math.max(0, dailyBudget - accommodationDaily - foodDaily - activitiesDaily);

  return {
    dailyTotal: dailyBudget,
    totalTripBudget,
    days,
    categories: [
      {
        name: 'Accommodations',
        percent: p.accommodationPercent,
        daily: accommodationDaily,
        total: accommodationDaily * days,
        icon: 'Hotel',
        detail: tierDetail.accommodation
      },
      {
        name: 'Food & Dining',
        percent: p.foodPercent,
        daily: foodDaily,
        total: foodDaily * days,
        icon: 'Utensils',
        detail: tierDetail.food
      },
      {
        name: 'Activities & Sights',
        percent: p.activitiesPercent,
        daily: activitiesDaily,
        total: activitiesDaily * days,
        icon: 'Ticket',
        detail: tierDetail.activities
      },
      {
        name: 'Local Transit',
        percent: p.transitPercent,
        daily: transitDaily,
        total: transitDaily * days,
        icon: 'Compass',
        detail: tierDetail.transit
      }
    ]
  };
}
