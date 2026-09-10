import React, { useState, useMemo } from 'react';
import {
  Trip,
  Traveler,
  FlightHotelSuggestion,
  Destination,
  Plan
} from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Plane,
  Hotel as HotelIcon,
  Sparkles,
  Sliders,
  Users,
  User as UserIcon,
  Calendar,
  Check,
  ExternalLink,
  MapPin,
  CalendarDays,
  ChevronDown
} from 'lucide-react';
import { ALL_COUNTRIES, getCitiesForCountry } from '../../data/worldLocations';
import { SearchableLocationInput } from './SearchableLocationInput';

interface CreatePlanWizardProps {
  initialDestination?: Destination | null;
  templatePlan?: Plan | null;
  onCancel: () => void;
  onFinish: (trip: Trip) => void;
}

const INTEREST_TAGS = [
  'Culture',
  'Food & Gastronomy',
  'Nature & Hiking',
  'Photography',
  'Relaxation & Spas',
  'Architecture',
  'Nightlife & Bars',
  'Adventure',
  'Shopping & Crafts'
];

export const CreatePlanWizard: React.FC<CreatePlanWizardProps> = ({
  initialDestination,
  templatePlan,
  onCancel,
  onFinish
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Trip basics - Origin
  const [fromCountry, setFromCountry] = useState('United States');
  const [fromCity, setFromCity] = useState('San Francisco');

  // Step 1: Trip basics - Destination
  const initDestCountry = initialDestination?.country
    ? initialDestination.country
    : templatePlan?.destination_name.includes(',')
    ? templatePlan.destination_name.split(',')[1].trim()
    : 'Japan';

  const initDestCity = initialDestination?.city
    ? initialDestination.city
    : templatePlan?.destination_name.includes(',')
    ? templatePlan.destination_name.split(',')[0].trim()
    : 'Kyoto';

  const [destCountry, setDestCountry] = useState(initDestCountry);
  const [destCity, setDestCity] = useState(initDestCity);
  const [additionalDestCities, setAdditionalDestCities] = useState<string[]>([]);
  const [extraCityInput, setExtraCityInput] = useState('');
  const [showAddCity, setShowAddCity] = useState(false);

  // Available origin cities depending on selected fromCountry
  const availableOriginCities = useMemo(() => {
    return getCitiesForCountry(fromCountry);
  }, [fromCountry]);

  // Available destination cities depending on selected destCountry
  const availableDestCities = useMemo(() => {
    return getCitiesForCountry(destCountry);
  }, [destCountry]);

  // Primary destination formatted string (e.g. "Kyoto, Japan")
  const primaryDestination = useMemo(() => {
    if (!destCity && !destCountry) return 'Kyoto, Japan';
    if (!destCountry) return destCity;
    if (!destCity) return destCountry;
    return destCity.toLowerCase().includes(destCountry.toLowerCase())
      ? destCity
      : `${destCity}, ${destCountry}`;
  }, [destCity, destCountry]);

  // Full destination cities array for itinerary generation and display
  const destinationCities = useMemo(() => {
    return [primaryDestination, ...additionalDestCities].filter(Boolean);
  }, [primaryDestination, additionalDestCities]);

  // Update Origin Country and auto-select a valid city from that country
  const handleFromCountryChange = (newCountry: string) => {
    setFromCountry(newCountry);
    const cities = getCitiesForCountry(newCountry);
    if (cities.length > 0 && !cities.some(c => c.toLowerCase() === fromCity.toLowerCase())) {
      setFromCity(cities[0]);
    }
  };

  // Update Destination Country and auto-select a valid city from that country
  const handleDestCountryChange = (newCountry: string) => {
    setDestCountry(newCountry);
    const cities = getCitiesForCountry(newCountry);
    if (cities.length > 0 && !cities.some(c => c.toLowerCase() === destCity.toLowerCase())) {
      setDestCity(cities[0]);
    }
  };

  // Travel dates (implied duration)
  const [startDate, setStartDate] = useState('2026-10-12');
  const [endDate, setEndDate] = useState(
    templatePlan
      ? '2026-10-17'
      : initialDestination
      ? '2026-10-17'
      : '2026-10-17'
  );

  // Calculate days difference
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = Math.abs(endD.getTime() - startD.getTime());
  const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  // Step 2: Budget
  const [budgetTier, setBudgetTier] = useState<'backpacker' | 'balanced' | 'luxury'>('balanced');
  const [budgetSliderVal, setBudgetSliderVal] = useState<number>(180);

  // Step 3: Travelers
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [travelers, setTravelers] = useState<Traveler[]>([
    {
      id: 't-1',
      name: 'Alex Rivera',
      age: 29,
      interests: ['Culture', 'Food & Gastronomy', 'Photography']
    }
  ]);

  // Step 4: Combined Flight + Hotel Suggestions
  const primaryDestName = destinationCities[0] || 'Kyoto, Japan';
  const flightHotelPackages: FlightHotelSuggestion[] = [
    {
      id: 'pkg-1',
      tier_name: 'Great Value',
      flight: {
        id: 'fl-1',
        airline: 'Zipair / ANA Partner',
        flight_no: 'ZP-024',
        departure_airport: 'SFO',
        arrival_airport: 'KIX',
        departure_time: '10:45',
        arrival_time: '14:30 +1',
        duration: '11h 45m',
        stops: 'Nonstop',
        price: 480,
        booking_url: 'https://www.zipair.net'
      },
      hotel: {
        id: 'ht-1',
        hotel_name: 'Hotel Resol Kyoto Kawaramachi',
        room_type: 'Modern Japanese Twin',
        rating: 4.82,
        price_per_night: 95,
        total_hotel_price: 95 * calculatedDays,
        booking_url: 'https://www.booking.com'
      },
      total_combined_price: 480 + 95 * calculatedDays
    },
    {
      id: 'pkg-2',
      tier_name: 'Most Popular',
      badge_color: 'bg-[#0EA5A5]',
      flight: {
        id: 'fl-2',
        airline: 'Japan Airlines (JAL)',
        flight_no: 'JL-001',
        departure_airport: 'SFO',
        arrival_airport: 'HND / KIX',
        departure_time: '12:15',
        arrival_time: '15:20 +1',
        duration: '11h 05m',
        stops: 'Nonstop',
        price: 680,
        booking_url: 'https://www.jal.co.jp'
      },
      hotel: {
        id: 'ht-2',
        hotel_name: 'Ace Hotel Kyoto & Garden Heritage',
        room_type: 'Deluxe Tatami King Room',
        rating: 4.91,
        price_per_night: 175,
        total_hotel_price: 175 * calculatedDays,
        booking_url: 'https://acehotel.com/kyoto'
      },
      total_combined_price: 680 + 175 * calculatedDays
    },
    {
      id: 'pkg-3',
      tier_name: 'Premium Comfort',
      flight: {
        id: 'fl-3',
        airline: 'All Nippon Airways (ANA) Business',
        flight_no: 'NH-007',
        departure_airport: 'SFO',
        arrival_airport: 'KIX',
        departure_time: '11:30',
        arrival_time: '14:50 +1',
        duration: '11h 20m',
        stops: 'Nonstop',
        price: 1420,
        booking_url: 'https://www.ana.co.jp'
      },
      hotel: {
        id: 'ht-3',
        hotel_name: 'Gion Hatanaka Luxury Ryokan',
        room_type: 'Courtyard Garden Suite with Hinoki Bath',
        rating: 4.96,
        price_per_night: 320,
        total_hotel_price: 320 * calculatedDays,
        booking_url: 'https://www.japan-guide.com'
      },
      total_combined_price: 1420 + 320 * calculatedDays
    }
  ];

  const [selectedPackage, setSelectedPackage] = useState<FlightHotelSuggestion>(flightHotelPackages[1]);

  // Step 5: Trip title + planning mode
  const [tripTitle, setTripTitle] = useState(
    templatePlan
      ? `${templatePlan.title} (My Plan)`
      : `Journey to ${destinationCities[0]?.split(',')[0] || 'Kyoto'}`
  );
  const [planningMode, setPlanningMode] = useState<'auto' | 'manual'>('auto');

  // Handle adding traveler
  const handleAddTraveler = () => {
    const newId = `t-${travelers.length + 1}`;
    setTravelers([
      ...travelers,
      {
        id: newId,
        name: `Traveler ${travelers.length + 1}`,
        age: 28,
        interests: ['Food & Gastronomy', 'Relaxation & Spas']
      }
    ]);
  };

  const handleRemoveTraveler = (id: string) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter(t => t.id !== id));
  };

  const handleUpdateTravelerInterests = (id: string, interest: string) => {
    setTravelers(
      travelers.map(t => {
        if (t.id !== id) return t;
        const exists = t.interests.includes(interest);
        const updated = exists
          ? t.interests.filter(i => i !== interest)
          : [...t.interests, interest];
        return { ...t, interests: updated };
      })
    );
  };

  // Complete wizard
  const handleFinalize = () => {
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      user_id: 'user-alex',
      title: tripTitle.trim() || `My Trip to ${destinationCities[0] || 'Kyoto'}`,
      origin: { country: fromCountry, city: fromCity },
      destinations: destinationCities,
      start_date: startDate,
      end_date: endDate,
      days: calculatedDays,
      budget_tier: budgetTier,
      budget_amount: budgetSliderVal,
      travelers,
      is_group: isGroup,
      mode: planningMode,
      combined_package: selectedPackage,
      itinerary: [], // Will be populated by Auto-generation logic if mode === 'auto'
      packing_checklist: [
        { id: 'pk-1', text: 'Passport and travel insurance copies', completed: false },
        { id: 'pk-2', text: 'Comfortable walking footwear', completed: true },
        { id: 'pk-3', text: 'Currency / multi-currency debit card', completed: false },
        { id: 'pk-4', text: 'Phone charger & universal plug adapter', completed: false }
      ],
      cautions: [
        'Check visa requirements prior to boarding.',
        'Keep emergency embassy contacts saved in offline notes.'
      ],
      created_at: new Date().toISOString()
    };

    onFinish(newTrip);
  };

  return (
    <div id="create-plan-wizard-modal" className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Wizard Header & Step Tracker */}
      <div className="bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#EFEAE2]">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-[#374151] hover:bg-[#FBF7F2] border border-[#D9CFC2] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-bold text-[#0EA5A5] uppercase tracking-wider">
                Step {currentStep} of 5
              </span>
              <h2 className="text-xl font-extrabold text-[#1F2937] font-display">
                {currentStep === 1 && 'Trip Basics & Route'}
                {currentStep === 2 && 'Budget & Spending Tier'}
                {currentStep === 3 && 'Traveler Profiles & Interests'}
                {currentStep === 4 && 'Flight & Hotel Matches'}
                {currentStep === 5 && 'Trip Title & Planning Mode'}
              </h2>
            </div>
          </div>

          <span className="text-xs font-bold text-[#FF6B4A] bg-[#FF6B4A]/10 px-3 py-1 rounded-xl">
            {calculatedDays} Days Implied
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EFEAE2] h-2 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-[#0EA5A5] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* STEP 1: Trip Basics */}
        {currentStep === 1 && (
          <div className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Origin Country
                </label>
                <SearchableLocationInput
                  id="select-origin-country"
                  value={fromCountry}
                  onChange={handleFromCountryChange}
                  options={ALL_COUNTRIES}
                  placeholder="e.g. United States"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Origin City
                </label>
                <SearchableLocationInput
                  id="select-origin-city"
                  value={fromCity}
                  onChange={setFromCity}
                  options={availableOriginCities}
                  placeholder="e.g. San Francisco"
                />
              </div>
            </div>

            {/* Destination Country & Destination City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Destination Country
                </label>
                <SearchableLocationInput
                  id="select-destination-country"
                  value={destCountry}
                  onChange={handleDestCountryChange}
                  options={ALL_COUNTRIES}
                  placeholder="e.g. Japan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  Destination City
                </label>
                <SearchableLocationInput
                  id="select-destination-city"
                  value={destCity}
                  onChange={setDestCity}
                  options={availableDestCities}
                  placeholder="e.g. Kyoto"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Additional Destinations (Multi-city enabled) */}
            {additionalDestCities.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1F2937]">
                  Additional Destinations
                </label>
                {additionalDestCities.map((city, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#D9CFC2] bg-[#FBF7F2] text-sm font-semibold text-[#1F2937]">
                      <MapPin className="w-4 h-4 text-[#0EA5A5]" />
                      <span>{city}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAdditionalDestCities(additionalDestCities.filter((_, i) => i !== idx))
                      }
                      className="p-2.5 rounded-xl text-[#E85555] hover:bg-red-50 border border-[#D9CFC2] cursor-pointer"
                      title="Remove city"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddCity ? (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchableLocationInput
                    id="select-add-destination-city"
                    value={extraCityInput}
                    onChange={setExtraCityInput}
                    options={availableDestCities.length > 0 ? availableDestCities : ALL_COUNTRIES}
                    placeholder="Type or select additional city..."
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (extraCityInput.trim()) {
                      const formatted =
                        destCountry && !extraCityInput.includes(',')
                          ? `${extraCityInput.trim()}, ${destCountry}`
                          : extraCityInput.trim();
                      if (!additionalDestCities.includes(formatted)) {
                        setAdditionalDestCities([...additionalDestCities, formatted]);
                      }
                      setExtraCityInput('');
                      setShowAddCity(false);
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCity(false);
                    setExtraCityInput('');
                  }}
                  className="px-3 py-2 text-xs text-[#374151] shrink-0 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-add-extra-city"
                onClick={() => setShowAddCity(true)}
                className="mt-1 text-xs font-bold text-[#0EA5A5] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add another destination city</span>
              </button>
            )}

            {/* Travel Dates */}
            <div className="p-4 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/70">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A5] mb-3">
                <CalendarDays className="w-4 h-4" />
                <span>TRAVEL DATES & IMPLIED DURATION</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9CFC2] text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9CFC2] text-sm bg-white"
                  />
                </div>
              </div>
              <p className="text-xs text-[#374151] mt-3 font-medium">
                Calculated stay: <strong className="text-[#1F2937]">{calculatedDays} full travel days</strong> (no redundant duration field needed).
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Budget */}
        {currentStep === 2 && (
          <div className="pt-6 space-y-6">
            <p className="text-xs text-[#374151] leading-relaxed">
              Show average per-person budget for {destinationCities.join(', ')}, broken into Backpacker, Balanced, and Luxury tiers.
            </p>

            {/* 3 Budget Tier Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'backpacker', label: 'Backpacker', avg: '$65', slider: 65, desc: 'Hostels, local diners, transit passes' },
                { id: 'balanced', label: 'Balanced', avg: '$175', slider: 175, desc: 'Boutique hotels, casual dining, booked tickets' },
                { id: 'luxury', label: 'Luxury', avg: '$480+', slider: 480, desc: '5-star ryokans/hotels, Michelin tastings, private car' }
              ].map(tier => (
                <div
                  key={tier.id}
                  onClick={() => {
                    setBudgetTier(tier.id as any);
                    setBudgetSliderVal(tier.slider);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    budgetTier === tier.id
                      ? 'border-[#0EA5A5] bg-[#0EA5A5]/5 ring-1 ring-[#0EA5A5]'
                      : 'border-[#D9CFC2]/70 bg-[#FBF7F2] hover:border-[#0EA5A5]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#1F2937]">{tier.label}</span>
                    <span className="text-sm font-extrabold text-[#0EA5A5]">{tier.avg}</span>
                  </div>
                  <p className="text-[11px] text-[#374151]/80 leading-tight">{tier.desc}</p>
                </div>
              ))}
            </div>

            {/* Draggable Range Slider */}
            <div className="p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2937]">Adjust Per-Person Daily Target:</span>
                <span className="text-base font-extrabold text-[#FF6B4A] bg-white px-3 py-1 rounded-xl border border-[#D9CFC2]">
                  ${budgetSliderVal} / day
                </span>
              </div>

              <input
                id="budget-range-slider"
                type="range"
                min="40"
                max="800"
                step="10"
                value={budgetSliderVal}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setBudgetSliderVal(val);
                  if (val <= 90) setBudgetTier('backpacker');
                  else if (val <= 300) setBudgetTier('balanced');
                  else setBudgetTier('luxury');
                }}
                className="w-full accent-[#FF6B4A] cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-[#374151]/70 font-semibold">
                <span>$40 (Hostel)</span>
                <span>$180 (Comfortable)</span>
                <span>$800 (Elite)</span>
              </div>

              <div className="pt-2 border-t border-[#D9CFC2]/50 flex justify-between text-xs text-[#374151]">
                <span>Est. Total Trip Spend ({calculatedDays} days):</span>
                <strong className="text-[#1F2937]">${budgetSliderVal * calculatedDays} per traveler</strong>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Travelers */}
        {currentStep === 3 && (
          <div className="pt-6 space-y-6">
            {/* Solo vs Group Toggle */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-2">
                Travel Party Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="btn-party-solo"
                  onClick={() => {
                    setIsGroup(false);
                    if (travelers.length > 1) setTravelers([travelers[0]]);
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                    !isGroup
                      ? 'border-[#0EA5A5] bg-[#0EA5A5]/10 text-[#086666]'
                      : 'border-[#D9CFC2] bg-[#FBF7F2] text-[#374151]'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Solo Traveler</span>
                </button>

                <button
                  type="button"
                  id="btn-party-group"
                  onClick={() => setIsGroup(true)}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                    isGroup
                      ? 'border-[#0EA5A5] bg-[#0EA5A5]/10 text-[#086666]'
                      : 'border-[#D9CFC2] bg-[#FBF7F2] text-[#374151]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Group Travel</span>
                </button>
              </div>
            </div>

            {/* Travelers list */}
            <div className="space-y-4">
              {travelers.map((t, index) => (
                <div key={t.id} className="p-4 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0EA5A5] uppercase">
                      Traveler {index + 1}
                    </span>
                    {isGroup && travelers.length > 1 && (
                      <button
                        onClick={() => handleRemoveTraveler(t.id)}
                        className="text-xs text-[#E85555] hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={t.name}
                        onChange={e =>
                          setTravelers(
                            travelers.map(tr => (tr.id === t.id ? { ...tr, name: e.target.value } : tr))
                          )
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-[#D9CFC2] text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#374151] mb-1">
                        Age (feeds recommendation engine)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="105"
                        value={t.age}
                        onChange={e =>
                          setTravelers(
                            travelers.map(tr =>
                              tr.id === t.id ? { ...tr, age: parseInt(e.target.value, 10) || 25 } : tr
                            )
                          )
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-[#D9CFC2] text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1.5">
                      Travel Interests (Tap to select):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {INTEREST_TAGS.map(tag => {
                        const selected = t.interests.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleUpdateTravelerInterests(t.id, tag)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              selected
                                ? 'bg-[#0EA5A5] text-white'
                                : 'bg-white text-[#374151] border border-[#D9CFC2]'
                            }`}
                          >
                            {selected && '✓ '}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isGroup && (
                <button
                  type="button"
                  id="btn-add-traveler"
                  onClick={handleAddTraveler}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#0EA5A5]/60 text-xs font-bold text-[#0EA5A5] hover:bg-[#0EA5A5]/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add another traveler to party</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Flights + Hotels (Combined) - Minimal, NO ADS */}
        {currentStep === 4 && (
          <div className="pt-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-[#086666]">
              <strong>Minimal Curated Packages:</strong> Up to 3 combined flight & hotel options paired specifically for {primaryDestName}. No pop-ups, zero third-party banners or advertisements.
            </div>

            <div className="space-y-4">
              {flightHotelPackages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPackage.id === pkg.id
                      ? 'border-[#0EA5A5] bg-white ring-2 ring-[#0EA5A5]/20 shadow-sm'
                      : 'border-[#D9CFC2] bg-[#FBF7F2] hover:border-[#0EA5A5]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#0EA5A5] text-white">
                      {pkg.tier_name}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#FF6B4A]">
                        ${pkg.total_combined_price}
                      </span>
                      <span className="text-[11px] text-[#374151] block">combined estimate</span>
                    </div>
                  </div>

                  {/* Flight Info */}
                  <div className="p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 mb-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#0EA5A5]" />
                      <div>
                        <span className="font-bold text-[#1F2937]">{pkg.flight.airline}</span>
                        <span className="text-[#374151]/80 ml-2">
                          {pkg.flight.departure_airport} → {pkg.flight.arrival_airport} ({pkg.flight.duration})
                        </span>
                      </div>
                    </div>
                    <a
                      href={pkg.flight.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[11px] font-bold text-[#0EA5A5] hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Official airline link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Hotel Info */}
                  <div className="p-3 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <HotelIcon className="w-4 h-4 text-[#0EA5A5]" />
                      <div>
                        <span className="font-bold text-[#1F2937]">{pkg.hotel.hotel_name}</span>
                        <span className="text-[#374151]/80 ml-2">
                          {pkg.hotel.room_type} • ${pkg.hotel.price_per_night}/nt
                        </span>
                      </div>
                    </div>
                    <a
                      href={pkg.hotel.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[11px] font-bold text-[#0EA5A5] hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Official hotel site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Trip Title + Planning Mode */}
        {currentStep === 5 && (
          <div className="pt-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                Trip Plan Title
              </label>
              <input
                id="input-trip-title"
                type="text"
                value={tripTitle}
                onChange={e => setTripTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D9CFC2] text-base font-bold text-[#1F2937] focus:outline-none focus:border-[#0EA5A5] bg-[#FBF7F2]"
                placeholder="Name your journey..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-2">
                Choose Your Planning Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mode 1: Help me plan (Auto-generate full itinerary) */}
                <div
                  id="choice-help-me-plan"
                  onClick={() => setPlanningMode('auto')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    planningMode === 'auto'
                      ? 'border-[#0EA5A5] bg-[#0EA5A5]/10 ring-2 ring-[#0EA5A5]/20'
                      : 'border-[#D9CFC2] bg-[#FBF7F2] hover:border-[#0EA5A5]/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0EA5A5] text-white flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#1F2937]">Help me plan</h4>
                  <p className="text-xs text-[#374151] mt-1 leading-relaxed">
                    Auto-generates a full {calculatedDays}-day schedule based on your traveler ages and stated interests. Inserts lunch (12:00–14:00) and dinner (18:00–20:00) with 15-minute snapping.
                  </p>
                </div>

                {/* Mode 2: Plan it myself */}
                <div
                  id="choice-plan-myself"
                  onClick={() => setPlanningMode('manual')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    planningMode === 'manual'
                      ? 'border-[#0EA5A5] bg-[#0EA5A5]/10 ring-2 ring-[#0EA5A5]/20'
                      : 'border-[#D9CFC2] bg-[#FBF7F2] hover:border-[#0EA5A5]/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#D9CFC2] text-[#1F2937] flex items-center justify-center mb-3">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#1F2937]">Plan it myself</h4>
                  <p className="text-xs text-[#374151] mt-1 leading-relaxed">
                    Starts from a pristine blank 24-hour timeline. Drag and drop places from the suggested discovery list onto your timeline at your own pace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Bottom Nav: Back & Next/Finish Buttons */}
        <div className="mt-8 pt-6 border-t border-[#EFEAE2] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 rounded-xl border border-[#D9CFC2] bg-white text-xs font-bold text-[#1F2937] hover:bg-[#FBF7F2] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-[#374151] hover:underline"
            >
              Cancel
            </button>
          )}

          {currentStep < 5 ? (
            <button
              id={`btn-wizard-next-step-${currentStep}`}
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-wizard-finalize"
              onClick={handleFinalize}
              className="px-6 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Launch Itinerary Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
