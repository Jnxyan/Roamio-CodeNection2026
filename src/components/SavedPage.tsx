import React, { useState } from 'react';
import { PostCard, PostCardItem } from './PostCard';
import { Bookmark, Sparkles } from 'lucide-react';

interface SavedPageProps {
  savedItems: PostCardItem[];
  onToggleSave: (item: PostCardItem, e: React.MouseEvent) => void;
  onItemClick: (item: PostCardItem) => void;
  onExploreClick: () => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  savedItems,
  onToggleSave,
  onItemClick,
  onExploreClick
}) => {
  const [filterType, setFilterType] = useState<'all' | 'destinations' | 'hotels' | 'restaurants' | 'plans'>('all');

  const filtered = savedItems.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div id="saved-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] font-display flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-[#0EA5A5] fill-[#0EA5A5]" />
            <span>Saved Places & Plans</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#374151] mt-1">
            Your personal collection of saved destinations, stays, dining spots, and completed community itineraries.
          </p>
        </div>

        <span className="text-xs font-bold text-[#0EA5A5] bg-[#0EA5A5]/10 px-3.5 py-1.5 rounded-xl self-start sm:self-auto border border-[#0EA5A5]/20">
          {savedItems.length} Saved {savedItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8" aria-label="Filter saved categories">
        {(
          [
            { id: 'all', label: 'All Saved' },
            { id: 'destinations', label: 'Destinations' },
            { id: 'hotels', label: 'Hotels' },
            { id: 'restaurants', label: 'Restaurants' },
            { id: 'plans', label: 'Curated Plans' }
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#0EA5A5] text-white shadow-sm shadow-[#0EA5A5]/25'
                : 'bg-white text-[#1F2937] border border-[#D9CFC2] hover:border-[#0EA5A5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Layout of Saved Items */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <PostCard
              key={item.id}
              item={item}
              isSaved={true}
              onToggleSave={onToggleSave}
              onClick={onItemClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-[#D9CFC2] max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#1F2937] font-display">No saved items found</h3>
          <p className="text-xs text-[#374151] mt-1 mb-6 leading-relaxed">
            {filterType === 'all'
              ? 'You haven’t bookmarked any destinations or trips yet. Tap the bookmark icon on any card to save it here.'
              : `You haven’t saved any items under ${filterType}.`}
          </p>
          <button
            onClick={onExploreClick}
            className="px-5 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Destinations</span>
          </button>
        </div>
      )}
    </div>
  );
};
