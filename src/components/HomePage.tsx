import React, { useState } from 'react';
import { PostCard, PostCardItem } from './PostCard';
import {
  Search,
  Filter,
  Sparkles,
  Calendar,
  Users,
  Compass,
  SlidersHorizontal,
  X,
  ArrowRight
} from 'lucide-react';

interface HomePageProps {
  postCards: PostCardItem[];
  savedIds: Set<string>;
  onToggleSave: (item: PostCardItem, e: React.MouseEvent) => void;
  onOpenDetail: (item: PostCardItem) => void;
  onLaunchCreateTrip: () => void;
}

const INTEREST_TAGS = [
  'All',
  'Culture',
  'Food & Dining',
  'Nature & Hiking',
  'Photography',
  'Relaxation & Spas',
  'Architecture',
  'Nightlife'
];

const TRAVELER_TYPES = ['Any Party', 'Solo', 'Couple', 'Family', 'Group'];
const DURATION_FILTERS = ['Any Duration', '1-3 Days', '4-7 Days', '8+ Days'];

export const HomePage: React.FC<HomePageProps> = ({
  postCards,
  savedIds,
  onToggleSave,
  onOpenDetail,
  onLaunchCreateTrip
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('All');
  const [selectedParty, setSelectedParty] = useState('Any Party');
  const [selectedDuration, setSelectedDuration] = useState('Any Duration');
  const [activeCategory, setActiveCategory] = useState<'all' | 'destinations' | 'hotels' | 'restaurants' | 'plans'>('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filter posts based on search and tags
  const filteredPosts = postCards.filter(item => {
    // Category filter
    if (activeCategory !== 'all' && item.type !== activeCategory) {
      return false;
    }

    // Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchLocation = item.locationName.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle ? item.subtitle.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchLocation && !matchSubtitle) return false;
    }

    // Interest tag
    if (selectedInterest !== 'All') {
      const interestLower = selectedInterest.toLowerCase();
      const matchSub = item.subtitle?.toLowerCase().includes(interestLower);
      const matchTitle = item.title.toLowerCase().includes(interestLower);
      if (!matchSub && !matchTitle) return false;
    }

    // Duration filter
    if (selectedDuration !== 'Any Duration') {
      const daysNum = parseInt(item.daysOfStay, 10) || 0;
      if (selectedDuration === '1-3 Days' && (daysNum < 1 || daysNum > 3)) return false;
      if (selectedDuration === '4-7 Days' && (daysNum < 4 || daysNum > 7)) return false;
      if (selectedDuration === '8+ Days' && daysNum < 8) return false;
    }

    return true;
  });

  // Group items by recommendation order (Section 3.3: destinations first, then hotels, then restaurants)
  const isSearchOrFilterActive =
    searchQuery.trim() !== '' ||
    selectedInterest !== 'All' ||
    selectedParty !== 'Any Party' ||
    selectedDuration !== 'Any Duration';

  const destinationItems = filteredPosts.filter(p => p.type === 'destinations');
  const hotelItems = filteredPosts.filter(p => p.type === 'hotels');
  const restaurantItems = filteredPosts.filter(p => p.type === 'restaurants');
  const planItems = filteredPosts.filter(p => p.type === 'plans');

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedInterest('All');
    setSelectedParty('Any Party');
    setSelectedDuration('Any Duration');
    setActiveCategory('all');
  };

  return (
    <div id="home-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome & Search Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0EA5A5] via-[#0B8585] to-[#086666] text-white p-6 sm:p-10 mb-10 shadow-sm">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none blur-xl" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-[#FF6B4A]/20 pointer-events-none blur-xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
            Smart Travel Discovery & Scheduling
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight tracking-tight">
            Curate your journey. Schedule with precision.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-teal-50 leading-relaxed">
            Explore verified destinations, boutique stays, and Michelin gastronomies. Plan your day with automatic 15-minute time snapping.
          </p>

          {/* Search Bar & Recommendation Trigger (Section 3.3) */}
          <div className="mt-6 bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3 w-full">
              <Search className="w-5 h-5 text-[#0EA5A5] shrink-0" />
              <input
                id="input-home-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Kyoto, Paris, Rome, boutique hotels, ramen..."
                className="w-full text-xs sm:text-sm text-[#1F2937] placeholder-[#374151]/50 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-toggle-filters-panel"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  showFiltersPanel || selectedInterest !== 'All' || selectedParty !== 'Any Party' || selectedDuration !== 'Any Duration'
                    ? 'bg-[#0EA5A5]/10 text-[#086666] border border-[#0EA5A5]/30'
                    : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {(selectedInterest !== 'All' || selectedParty !== 'Any Party' || selectedDuration !== 'Any Duration') && (
                  <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                )}
              </button>

              <button
                id="btn-home-create-trip"
                onClick={onLaunchCreateTrip}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Plan Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Filter Tags Panel (Section 3.3) */}
      {(showFiltersPanel || isSearchOrFilterActive) && (
        <div
          id="recommendation-tags-panel"
          className="bg-white rounded-3xl border border-[#D9CFC2] p-5 mb-8 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <span>Smart Recommendation Tags</span>
            </h3>
            {isSearchOrFilterActive && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#E85555] font-semibold hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Who's Traveling */}
            <div>
              <span className="block text-[11px] font-bold text-[#374151] mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#0EA5A5]" />
                <span>Who's Traveling:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TRAVELER_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedParty(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedParty === type
                        ? 'bg-[#0EA5A5] text-white'
                        : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2] border border-[#D9CFC2]/70'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Duration */}
            <div>
              <span className="block text-[11px] font-bold text-[#374151] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0EA5A5]" />
                <span>Days of Travel:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_FILTERS.map(dur => (
                  <button
                    key={dur}
                    onClick={() => setSelectedDuration(dur)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedDuration === dur
                        ? 'bg-[#0EA5A5] text-white'
                        : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2] border border-[#D9CFC2]/70'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Interests */}
            <div>
              <span className="block text-[11px] font-bold text-[#374151] mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0EA5A5]" />
                <span>Primary Interests:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedInterest(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedInterest === tag
                        ? 'bg-[#0EA5A5] text-white'
                        : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2] border border-[#D9CFC2]/70'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed Category Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Filter content feed">
          {(
            [
              { id: 'all', label: 'All Recommendations' },
              { id: 'destinations', label: 'Destinations' },
              { id: 'hotels', label: 'Hotels & Stays' },
              { id: 'restaurants', label: 'Dining & Bars' },
              { id: 'plans', label: 'Curated Plans' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#0EA5A5] text-white shadow-sm shadow-[#0EA5A5]/25'
                  : 'bg-white text-[#1F2937] border border-[#D9CFC2] hover:border-[#0EA5A5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-[#374151]/70 shrink-0 hidden sm:block">
          Showing {filteredPosts.length} post cards
        </span>
      </div>

      {/* When Recommendation mode is active (Section 3.3):
          "Recommendation results show destinations first, then recommended hotels, then recommended restaurants"
      */}
      {isSearchOrFilterActive && activeCategory === 'all' ? (
        <div className="space-y-10">
          {/* 1. Destinations First */}
          {destinationItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1F2937] font-display flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#0EA5A5]" />
                  <span>Recommended Destinations</span>
                </h2>
                <span className="text-xs font-bold text-[#0EA5A5]">
                  {destinationItems.length} destinations
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {destinationItems.map(item => (
                  <PostCard
                    key={item.id}
                    item={item}
                    isSaved={savedIds.has(item.id)}
                    onToggleSave={onToggleSave}
                    onClick={onOpenDetail}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Recommended Hotels Second */}
          {hotelItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1F2937] font-display flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Recommended Hotels & Accommodations</span>
                </h2>
                <span className="text-xs font-bold text-indigo-600">
                  {hotelItems.length} stays
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hotelItems.map(item => (
                  <PostCard
                    key={item.id}
                    item={item}
                    isSaved={savedIds.has(item.id)}
                    onToggleSave={onToggleSave}
                    onClick={onOpenDetail}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. Recommended Restaurants Third */}
          {restaurantItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1F2937] font-display flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Recommended Restaurants & Gastronomy</span>
                </h2>
                <span className="text-xs font-bold text-amber-700">
                  {restaurantItems.length} places
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurantItems.map(item => (
                  <PostCard
                    key={item.id}
                    item={item}
                    isSaved={savedIds.has(item.id)}
                    onToggleSave={onToggleSave}
                    onClick={onOpenDetail}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 4. Curated Community Plans */}
          {planItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1F2937] font-display flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
                  <span>Curated Verified Plans (Ready to Template)</span>
                </h2>
                <span className="text-xs font-bold text-[#FF6B4A]">
                  {planItems.length} community plans
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {planItems.map(item => (
                  <PostCard
                    key={item.id}
                    item={item}
                    isSaved={savedIds.has(item.id)}
                    onToggleSave={onToggleSave}
                    onClick={onOpenDetail}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Standard Unified Grid of Post Cards (Section 3.3 & 5) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPosts.map(item => (
            <PostCard
              key={item.id}
              item={item}
              isSaved={savedIds.has(item.id)}
              onToggleSave={onToggleSave}
              onClick={onOpenDetail}
            />
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#D9CFC2] max-w-md mx-auto">
          <Search className="w-12 h-12 text-[#374151]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1F2937] font-display">No results found</h3>
          <p className="text-xs text-[#374151] mt-1 mb-4">
            Try adjusting your search query or loosening your recommendation filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
