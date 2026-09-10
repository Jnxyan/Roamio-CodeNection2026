import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Minus,
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
  AlertCircle,
  Utensils,
  Ticket,
  Compass,
  DollarSign,
  TrendingUp,
  Info
} from 'lucide-react';
import { CitySearchInput } from './CitySearchInput';
import {
  getDestinationBudgetProfile,
  calculateBudgetBreakdown
} from '../../utils/budgetUtils';

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

  // Step 1: Trip basics
  const [fromCity, setFromCity] = useState('San Francisco');
  const [fromCountry, setFromCountry] = useState('United States');
  const [destinationCities, setDestinationCities] = useState<string[]>(
    templatePlan
      ? [templatePlan.destination_name]
      : initialDestination
      ? [`${initialDestination.city}, ${initialDestination.country}`]
      : ['Kyoto, Japan']
  );
  const [destinationInput, setDestinationInput] = useState('');
  const [step1Error, setStep1Error] = useState<string | null>(null);

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

  // Flexible days changer that keeps startDate and adjusts endDate
  const setDaysCount = (newDays: number) => {
    const validDays = Math.max(1, Math.min(60, newDays));
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      const end = new Date(start);
      end.setDate(start.getDate() + validDays - 1);
      const yyyy = end.getFullYear();
      const mm = String(end.getMonth() + 1).padStart(2, '0');
      const dd = String(end.getDate()).padStart(2, '0');
      setEndDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  // Step 2: Destination-aware Budget & Dynamic Days calculation
  const [budgetTier, setBudgetTier] = useState<'backpacker' | 'balanced' | 'luxury'>('balanced');

  const budgetProfile = useMemo(() => {
    return getDestinationBudgetProfile(destinationCities);
  }, [destinationCities]);

  const [budgetSliderVal, setBudgetSliderVal] = useState<number>(() => {
    const initialProfile = getDestinationBudgetProfile(
      templatePlan
        ? [templatePlan.destination_name]
        : initialDestination
        ? [`${initialDestination.city}, ${initialDestination.country}`]
        : ['Kyoto, Japan']
    );
    return initialProfile.balanced.daily;
  });

  // Track if user explicitly customized the slider or when destination updates
  const prevDestKeyRef = useRef<string>(destinationCities.join(','));
  useEffect(() => {
    const currentKey = destinationCities.join(',');
    if (prevDestKeyRef.current !== currentKey) {
      prevDestKeyRef.current = currentKey;
      setBudgetSliderVal(budgetProfile[budgetTier].daily);
    }
  }, [destinationCities, budgetProfile, budgetTier]);

  const budgetBreakdown = useMemo(() => {
    return calculateBudgetBreakdown(budgetSliderVal, calculatedDays, budgetTier, budgetProfile);
  }, [budgetSliderVal, calculatedDays, budgetTier, budgetProfile]);

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
    const chosenCoverPhoto =
      templatePlan?.cover_photo ||
      initialDestination?.cover_photo ||
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80';

    const chosenGallery =
      templatePlan?.gallery ||
      initialDestination?.gallery || [
        chosenCoverPhoto,
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80'
      ];

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      user_id: 'user-alex',
      title: tripTitle.trim() || `My Trip to ${destinationCities[0] || 'Kyoto'}`,
      cover_photo: chosenCoverPhoto,
      gallery: chosenGallery,
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (!fromCity.trim()) {
        setStep1Error('Please enter or select an origin departure city.');
        return;
      }
      if (destinationCities.length === 0) {
        if (destinationInput.trim()) {
          setDestinationCities([destinationInput.trim()]);
          setDestinationInput('');
          setStep1Error(null);
          setCurrentStep(currentStep + 1);
          return;
        }
        setStep1Error('Please add or select at least one destination city.');
        return;
      }
      setStep1Error(null);
    }
    setCurrentStep(currentStep + 1);
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
            {step1Error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{step1Error}</span>
              </div>
            )}

            {/* Origin City only (Origin Country removed, guided bar enabled) */}
            <div>
              <CitySearchInput
                id="input-origin-city"
                label="Origin City"
                value={fromCity}
                onChange={val => {
                  setFromCity(val);
                  if (step1Error) setStep1Error(null);
                }}
                onSelectCity={item => {
                  setFromCity(item.city);
                  setFromCountry(item.country);
                  if (step1Error) setStep1Error(null);
                }}
                onSubmitCustom={val => {
                  setFromCity(val);
                  if (step1Error) setStep1Error(null);
                }}
                placeholder="Type your departure city (e.g. San Francisco, Tokyo, London, Singapore)..."
                icon="plane"
                helperText="Type to search and select your departure city from the guided suggestions bar"
              />
            </div>

            {/* Destination Cities with multi-city support and guided bar */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#1F2937] flex items-center justify-between">
                <span>Destination City</span>
                {destinationCities.length > 0 && (
                  <span className="text-[11px] font-medium text-[#0EA5A5]">
                    {destinationCities.length} {destinationCities.length === 1 ? 'destination selected' : 'destinations selected'}
                  </span>
                )}
              </label>

              {/* Selected Destination Badges */}
              {destinationCities.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {destinationCities.map((city, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D9CFC2] bg-[#FBF7F2] text-xs font-bold text-[#1F2937] shadow-2xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#0EA5A5]/15 text-[#0EA5A5] text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <MapPin className="w-3.5 h-3.5 text-[#0EA5A5] shrink-0" />
                      <span>{city}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDestinationCities(destinationCities.filter((_, i) => i !== idx))
                        }
                        className="text-gray-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                        title={`Remove ${city}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Destination City typing input with guide bar */}
              <CitySearchInput
                id="input-destination-city"
                value={destinationInput}
                onChange={val => {
                  setDestinationInput(val);
                  if (step1Error) setStep1Error(null);
                }}
                onSelectCity={item => {
                  const label = `${item.city}, ${item.country}`;
                  if (!destinationCities.includes(label)) {
                    setDestinationCities([...destinationCities, label]);
                  }
                  setDestinationInput('');
                  if (step1Error) setStep1Error(null);
                }}
                onSubmitCustom={val => {
                  if (val.trim() && !destinationCities.includes(val.trim())) {
                    setDestinationCities([...destinationCities, val.trim()]);
                    setDestinationInput('');
                    if (step1Error) setStep1Error(null);
                  }
                }}
                placeholder={
                  destinationCities.length === 0
                    ? "Type destination city (e.g. Kyoto, Paris, Rome, Bali)..."
                    : "Type another destination city to add to itinerary..."
                }
                icon="map-pin"
                excludeCities={destinationCities}
                helperText="Type a city name to see suggested destinations and choose from the bar"
              />
            </div>

            {/* Travel Dates */}
            <div className="p-4 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/70 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#0EA5A5]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>TRAVEL DATES & DURATION</span>
                </div>
                <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#D9CFC2] text-[#1F2937] text-xs">
                  <span className="font-extrabold text-[#0EA5A5]">{calculatedDays}</span>
                  <span className="text-gray-500 font-medium">full travel days</span>
                </div>
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

              {/* Flexible Days Presets & Stepper */}
              <div className="pt-2 border-t border-[#E5DFD7] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#4B5563]">Flexible days:</span>
                  {[3, 5, 7, 10, 14, 21].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysCount(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        calculatedDays === d
                          ? 'bg-[#0EA5A5] text-white border-[#0EA5A5] shadow-2xs'
                          : 'bg-white text-[#374151] border-[#D9CFC2] hover:bg-gray-50'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-[#D9CFC2]">
                  <button
                    type="button"
                    onClick={() => setDaysCount(calculatedDays - 1)}
                    disabled={calculatedDays <= 1}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    title="Decrease 1 day"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-[#1F2937] px-2">{calculatedDays} days</span>
                  <button
                    type="button"
                    onClick={() => setDaysCount(calculatedDays + 1)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                    title="Increase 1 day"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Budget (Destination & Days Flexible Calculation) */}
        {currentStep === 2 && (
          <div className="pt-6 space-y-6 animate-fade-in">
            {/* Destination Benchmark & Days Controller Banner */}
            <div className="p-4 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0EA5A5]" />
                    <span className="text-xs font-bold text-[#1F2937]">
                      {destinationCities.join(' • ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0EA5A5]/10 text-[#0EA5A5] text-[10px] font-bold border border-[#0EA5A5]/20">
                      {budgetProfile.tierName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] mt-1">
                    {budgetProfile.tierDescription}
                  </p>
                </div>

                {/* Flexible Days Changer inside Budget step */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-2 rounded-xl border border-[#D9CFC2] shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span className="text-xs font-bold text-[#1F2937]">Trip Days:</span>
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      onClick={() => setDaysCount(calculatedDays - 1)}
                      disabled={calculatedDays <= 1}
                      className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      title="Decrease by 1 day"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold text-[#0EA5A5] px-1 min-w-5 text-center">
                      {calculatedDays}d
                    </span>
                    <button
                      type="button"
                      onClick={() => setDaysCount(calculatedDays + 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                      title="Increase by 1 day"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset Days Chips */}
              <div className="pt-2.5 border-t border-[#EFEAE2] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#6B7280]">Flexible duration presets:</span>
                  {[3, 5, 7, 10, 14, 21].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysCount(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        calculatedDays === d
                          ? 'bg-[#0EA5A5] text-white border-[#0EA5A5] shadow-2xs'
                          : 'bg-white text-[#374151] border-[#D9CFC2] hover:bg-gray-50'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[#6B7280] font-medium">
                  Dates: {startDate} → {endDate}
                </span>
              </div>
            </div>

            {/* 3 Destination-Calibrated Budget Tier Cards */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-[#1F2937]">
                  Choose Budget Tier ({calculatedDays} Days in {destinationCities[0]?.split(',')[0] || 'Destination'})
                </label>
                <span className="text-[11px] text-[#0EA5A5] font-medium">
                  Totals auto-scale with your {calculatedDays}-day stay
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {(['backpacker', 'balanced', 'luxury'] as const).map(tierId => {
                  const tierData = budgetProfile[tierId];
                  const isSelected = budgetTier === tierId;
                  const totalTripPerPerson = tierData.daily * calculatedDays;

                  return (
                    <div
                      key={tierId}
                      onClick={() => {
                        setBudgetTier(tierId);
                        setBudgetSliderVal(tierData.daily);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0EA5A5] bg-[#0EA5A5]/5 ring-2 ring-[#0EA5A5]/30 shadow-sm'
                          : 'border-[#D9CFC2]/70 bg-[#FBF7F2] hover:border-[#0EA5A5]/50 hover:bg-white'
                      }`}
                    >
                      <div>
                        {/* Tier Title & Badges */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                            {tierData.label}
                            {tierId === 'balanced' && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[#0EA5A5]/15 text-[#0EA5A5] text-[9px] font-extrabold uppercase">
                                Value
                              </span>
                            )}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#0EA5A5] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Daily Rate & Calculated Total */}
                        <div className="mb-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-[#0EA5A5]">
                              ${tierData.daily}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-500">/ day</span>
                          </div>
                          <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white border border-[#D9CFC2] text-xs font-bold text-[#1F2937]">
                            ${totalTripPerPerson.toLocaleString()} total <span className="font-normal text-gray-500">({calculatedDays}d)</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#4B5563] leading-relaxed mb-3">
                          {tierData.desc}
                        </p>
                      </div>

                      {/* Destination specific inclusions */}
                      <div className="pt-2.5 border-t border-[#E5DFD7] space-y-1.5 text-[11px] text-[#374151]">
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-gray-900 shrink-0">Stay:</span>
                          <span className="text-gray-600 line-clamp-1">{tierData.accommodation}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-gray-900 shrink-0">Dining:</span>
                          <span className="text-gray-600 line-clamp-1">{tierData.food}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-gray-900 shrink-0">Sights:</span>
                          <span className="text-gray-600 line-clamp-1">{tierData.activities}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Draggable Fine-Tune Range Slider with Real-time Trip Spending */}
            <div className="p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#0EA5A5]" />
                    <span>Custom Daily Target Slider:</span>
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Adjust anywhere between ${budgetProfile.sliderMin} and ${budgetProfile.sliderMax}/day
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-[#FF6B4A] bg-white px-3 py-1 rounded-xl border border-[#D9CFC2] shadow-2xs">
                    ${budgetSliderVal} / day
                  </span>
                </div>
              </div>

              <input
                id="budget-range-slider"
                type="range"
                min={budgetProfile.sliderMin}
                max={budgetProfile.sliderMax}
                step={budgetProfile.sliderStep}
                value={budgetSliderVal}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setBudgetSliderVal(val);
                  if (val <= budgetProfile.backpacker.daily * 1.35) {
                    setBudgetTier('backpacker');
                  } else if (val <= budgetProfile.balanced.daily * 1.4) {
                    setBudgetTier('balanced');
                  } else {
                    setBudgetTier('luxury');
                  }
                }}
                className="w-full accent-[#FF6B4A] cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-[#4B5563] font-semibold">
                <span>${budgetProfile.sliderMin} (Minimalist)</span>
                <span>${budgetProfile.balanced.daily} (Benchmark)</span>
                <span>${budgetProfile.sliderMax} (Elite)</span>
              </div>

              <div className="pt-3 border-t border-[#E5DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="text-gray-600">
                  Total Trip Estimated Spend (<strong className="text-gray-900">{calculatedDays} full days</strong>):
                </span>
                <div className="flex items-center gap-2">
                  <strong className="text-base font-extrabold text-[#1F2937]">
                    ${(budgetSliderVal * calculatedDays).toLocaleString()}
                  </strong>
                  <span className="text-xs text-gray-500 font-medium">per traveler</span>
                  {travelers.length > 1 && (
                    <span className="text-[11px] text-[#0EA5A5] font-bold bg-[#0EA5A5]/10 px-2 py-0.5 rounded-md">
                      (${(budgetSliderVal * calculatedDays * travelers.length).toLocaleString()} for {travelers.length} party)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Estimated Category Breakdown for this Destination & Days */}
            <div className="p-4 rounded-2xl bg-white border border-[#D9CFC2] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>Estimated Category Breakdown ({calculatedDays} Days in {destinationCities[0]?.split(',')[0] || 'Destination'})</span>
                </span>
                <span className="text-[11px] font-semibold text-[#0EA5A5]">
                  ${(budgetSliderVal * calculatedDays).toLocaleString()} total spend
                </span>
              </div>

              {/* Stacked Proportional Color Bar */}
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-100">
                <div
                  style={{ width: `${budgetBreakdown.categories[0].percent}%` }}
                  className="bg-[#0EA5A5] h-full"
                  title="Accommodations"
                />
                <div
                  style={{ width: `${budgetBreakdown.categories[1].percent}%` }}
                  className="bg-[#FF6B4A] h-full"
                  title="Food & Dining"
                />
                <div
                  style={{ width: `${budgetBreakdown.categories[2].percent}%` }}
                  className="bg-[#F59E0B] h-full"
                  title="Activities & Sights"
                />
                <div
                  style={{ width: `${budgetBreakdown.categories[3].percent}%` }}
                  className="bg-[#6366F1] h-full"
                  title="Transit"
                />
              </div>

              {/* 4 Category Pill Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {budgetBreakdown.categories.map((cat, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#FBF7F2] border border-[#EFEAE2]">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#374151] mb-1">
                      <span className="truncate">{cat.name}</span>
                      <span className="text-gray-400 text-[10px]">{cat.percent}%</span>
                    </div>
                    <div className="text-xs font-extrabold text-[#1F2937]">
                      ${cat.daily} <span className="text-[10px] font-normal text-gray-500">/day</span>
                    </div>
                    <div className="text-[10px] text-[#0EA5A5] font-semibold mt-0.5">
                      ${cat.total.toLocaleString()} total ({calculatedDays}d)
                    </div>
                  </div>
                ))}
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
              onClick={handleNext}
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
