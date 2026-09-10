import React, { useState } from 'react';
import { PostCard, PostCardItem } from './PostCard';
import {
  Search,
  Sparkles,
  Calendar,
  Users,
  Compass,
  X,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

interface HomePageProps {
  postCards: PostCardItem[];
  savedIds: Set<string>;
  likedIds?: Set<string>;
  onToggleSave: (item: PostCardItem, e: React.MouseEvent) => void;
  onToggleLike?: (item: PostCardItem, e: React.MouseEvent) => void;
  onOpenDetail: (item: PostCardItem) => void;
  onLaunchCreateTrip?: () => void;
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
  postCards = [],
  savedIds,
  likedIds,
  onToggleSave,
  onToggleLike,
  onOpenDetail
}) => {
  const safePostCards = Array.isArray(postCards) ? postCards : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('All');
  const [selectedParty, setSelectedParty] = useState('Any Party');
  const [selectedDuration, setSelectedDuration] = useState('Any Duration');
  const [activeCategory, setActiveCategory] = useState<'all' | 'destinations' | 'hotels' | 'restaurants' | 'plans'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    (selectedParty !== 'Any Party' ? 1 : 0) +
    (selectedDuration !== 'Any Duration' ? 1 : 0) +
    (selectedInterest !== 'All' ? 1 : 0);

  // Filter posts based on search and tags
  const filteredPosts = safePostCards.filter(item => {
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

    // Duration filter (applies to multi-day plans)
    if (selectedDuration !== 'Any Duration') {
      if (item.type === 'destinations') return false;
      const daysNum = parseInt(item.daysOfStay || '0', 10) || 0;
      if (selectedDuration === '1-3 Days' && (daysNum < 1 || daysNum > 3)) return false;
      if (selectedDuration === '4-7 Days' && (daysNum < 4 || daysNum > 7)) return false;
      if (selectedDuration === '8+ Days' && daysNum < 8) return false;
    }

    return true;
  });

  const isSearchOrFilterActive =
    searchQuery.trim() !== '' ||
    selectedInterest !== 'All' ||
    selectedParty !== 'Any Party' ||
    selectedDuration !== 'Any Duration' ||
    activeCategory !== 'all';

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

  const handleSearchClick = () => {
    const el = document.getElementById('explore-posts-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="home-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0EA5A5] via-[#0B8585] to-[#086666] text-white p-6 sm:p-8 mb-6 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
            Explore Verified Places & Community Plans
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display leading-tight tracking-tight">
            Curate your journey. Discover top spots.
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-teal-50 leading-relaxed">
            Browse verified destinations, boutique stays, gastronomy, and tested itineraries.
          </p>
        </div>
      </div>

      {/* Unified Search & Filters Card (Search and filter features together in one card) */}
      <div
        id="unified-search-filters-card"
        className="bg-white rounded-3xl border border-[#D9CFC2] p-5 sm:p-6 shadow-sm mb-8 space-y-5"
      >
        {/* Row 1: Search Input & Dedicated Search and Filter Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 w-full bg-[#FBF7F2] rounded-2xl border border-[#D9CFC2]/80 focus-within:border-[#0EA5A5] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-[#0EA5A5] shrink-0" />
            <input
              id="input-home-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearchClick();
              }}
              placeholder="Search Kyoto, Paris, Rome, boutique hotels, Michelin ramen, 5-day itineraries..."
              className="w-full text-xs sm:text-sm text-[#1F2937] placeholder-[#374151]/50 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Button */}
            <button
              id="btn-home-search"
              type="button"
              onClick={handleSearchClick}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            {/* Filter Toggle Button */}
            <button
              id="btn-toggle-filters"
              type="button"
              onClick={() => setShowFilters(prev => !prev)}
              aria-expanded={showFilters}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
                showFilters || activeFilterCount > 0
                  ? 'bg-[#086666] text-white border-[#086666] shadow-sm'
                  : 'bg-[#FBF7F2] hover:bg-[#EFEAE2] text-[#1F2937] border-[#D9CFC2]/80'
              }`}
              title={showFilters ? 'Hide filters' : 'Show filters'}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 bg-white text-[#086666] text-[10px] font-extrabold rounded-full leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Tabs (inside the same card) */}
        <div className="pt-3 border-t border-[#EFEAE2] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'destinations', label: 'Destinations' },
              { id: 'hotels', label: 'Hotels & Stays' },
              { id: 'restaurants', label: 'Dining & Bars' },
              { id: 'plans', label: 'Curated Plans' }
            ].map(tab => (
              <button
                key={tab.id}
                id={`tab-category-${tab.id}`}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#0EA5A5] text-white shadow-xs'
                    : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2] border border-[#D9CFC2]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isSearchOrFilterActive && (
            <button
              id="btn-reset-filters"
              onClick={clearAllFilters}
              className="text-xs text-[#E85555] hover:text-[#C93333] font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all</span>
            </button>
          )}
        </div>

        {/* Row 3: Filter Features (hidden in the filter button) */}
        {showFilters && (
          <div
            id="collapsible-filters-section"
            className="pt-4 border-t border-[#EFEAE2] grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Who's Traveling */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937] mb-2">
                <Users className="w-3.5 h-3.5 text-[#0EA5A5]" />
                <span>Who's Traveling</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRAVELER_TYPES.map(type => (
                  <button
                    key={type}
                    id={`btn-filter-party-${type.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedParty(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedParty === type
                        ? 'bg-[#0EA5A5] text-white shadow-xs font-bold'
                        : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2] border border-[#D9CFC2]/70'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Days of Travel */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937] mb-2">
                <Calendar className="w-3.5 h-3.5 text-[#0EA5A5]" />
                <span>Days of Travel</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_FILTERS.map(dur => (
                  <button
                    key={dur}
                    id={`btn-filter-dur-${dur.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedDuration(dur)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedDuration === dur
                        ? 'bg-[#0EA5A5] text-white shadow-xs font-bold'
                        : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2] border border-[#D9CFC2]/70'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Interests */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#0EA5A5]" />
                <span>Primary Interests</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_TAGS.map(tag => (
                  <button
                    key={tag}
                    id={`btn-filter-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedInterest(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedInterest === tag
                        ? 'bg-[#0EA5A5] text-white shadow-xs font-bold'
                        : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2] border border-[#D9CFC2]/70'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explore Posts Container */}
      <div id="explore-posts-container">
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
                      isLiked={likedIds ? likedIds.has(item.id) : false}
                      onToggleSave={onToggleSave}
                      onToggleLike={onToggleLike}
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
                      isLiked={likedIds ? likedIds.has(item.id) : false}
                      onToggleSave={onToggleSave}
                      onToggleLike={onToggleLike}
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
                      isLiked={likedIds ? likedIds.has(item.id) : false}
                      onToggleSave={onToggleSave}
                      onToggleLike={onToggleLike}
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
                    <span>Curated Verified Plans</span>
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
                      isLiked={likedIds ? likedIds.has(item.id) : false}
                      onToggleSave={onToggleSave}
                      onToggleLike={onToggleLike}
                      onClick={onOpenDetail}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Standard Unified Grid of Post Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map(item => (
              <PostCard
                key={item.id}
                item={item}
                isSaved={savedIds.has(item.id)}
                isLiked={likedIds ? likedIds.has(item.id) : false}
                onToggleSave={onToggleSave}
                onToggleLike={onToggleLike}
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
              Try adjusting your search query or clearing your recommendation filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
