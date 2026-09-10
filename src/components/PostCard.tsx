import React from 'react';
import { Bookmark, Star, MapPin, Zap, ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export interface PostCardItem {
  id: string;
  type: 'destinations' | 'hotels' | 'restaurants' | 'plans';
  title: string;
  coverPhoto: string;
  daysOfStay: string;
  budget: string;
  rating: number;
  reviewsCount?: number;
  locationName: string;
  mapsUrl: string;
  operatingHours?: string;
  energyLevel?: number; // 1-5
  authorName?: string;
  authorAvatar?: string;
  subtitle?: string;
}

interface PostCardProps {
  item: PostCardItem;
  isSaved?: boolean;
  onToggleSave?: (item: PostCardItem, e: React.MouseEvent) => void;
  onClick?: (item: PostCardItem) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  item,
  isSaved = false,
  onToggleSave,
  onClick
}) => {
  const categoryLabels = {
    destinations: 'Destination',
    hotels: 'Hotel',
    restaurants: 'Restaurant',
    plans: 'Curated Plan'
  };

  const categoryColors = {
    destinations: 'bg-[#0EA5A5]/10 text-[#086666] border-[#0EA5A5]/25',
    hotels: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    restaurants: 'bg-amber-50 text-amber-800 border-amber-200',
    plans: 'bg-[#FF6B4A]/10 text-[#C94324] border-[#FF6B4A]/25'
  };

  return (
    <motion.div
      id={`post-card-${item.id}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick && onClick(item)}
      className="group relative bg-white rounded-2xl border border-[#D9CFC2]/80 overflow-hidden shadow-sm hover:shadow-md hover:border-[#0EA5A5]/60 transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#EFEAE2]">
        <img
          src={item.coverPhoto}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges: Category & Save Bookmark */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border ${
              categoryColors[item.type]
            }`}
          >
            {categoryLabels[item.type]}
          </span>

          <button
            id={`btn-save-${item.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave && onToggleSave(item, e);
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save post'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isSaved
                ? 'bg-[#0EA5A5] text-white hover:bg-[#0B8585]'
                : 'bg-white/90 text-[#1F2937] hover:bg-white hover:text-[#0EA5A5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Floating Stats over Image: Days & Budget */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
            <span>{item.daysOfStay}</span>
          </div>

          <div
            id={`budget-badge-${item.id}`}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FF6B4A] text-white shadow-sm flex items-center gap-1"
          >
            <span>{item.budget}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <span className="flex items-center gap-1 text-[#374151] font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-[#0EA5A5] shrink-0" />
              <span className="truncate">{item.locationName}</span>
            </span>

            <div className="flex items-center gap-1 font-bold text-[#1F2937] shrink-0 bg-[#FBF7F2] px-2 py-0.5 rounded-md border border-[#D9CFC2]/50">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{item.rating.toFixed(1)}</span>
              {item.reviewsCount && (
                <span className="text-[10px] text-[#374151]/70 font-normal">
                  ({item.reviewsCount})
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-[#1F2937] text-base leading-snug group-hover:text-[#0EA5A5] transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Subtitle / Description if present */}
          {item.subtitle && (
            <p className="mt-1 text-xs text-[#374151]/80 line-clamp-2 leading-relaxed">
              {item.subtitle}
            </p>
          )}
        </div>

        {/* Bottom Section: Energy Bolts / Author & Deep-Link */}
        <div className="mt-4 pt-3 border-t border-[#EFEAE2] flex items-center justify-between text-xs">
          {item.energyLevel ? (
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-[#374151]/70">Energy:</span>
              <div className="flex items-center" title={`${item.energyLevel} of 5 energy intensity`}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <Zap
                    key={lvl}
                    className={`w-3.5 h-3.5 ${
                      lvl <= item.energyLevel!
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : item.authorName ? (
            <div className="flex items-center gap-1.5">
              {item.authorAvatar ? (
                <img
                  src={item.authorAvatar}
                  alt={item.authorName}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : null}
              <span className="text-[11px] text-[#374151] font-medium truncate max-w-[120px]">
                By {item.authorName}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[#374151]/70 font-medium">
              Verified Roamio Place
            </span>
          )}

          {/* External Map deep link trigger */}
          <a
            href={item.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-bold text-[#0EA5A5] hover:text-[#086666] flex items-center gap-0.5 transition-colors cursor-pointer"
            title="Open in Google Maps"
          >
            <span>Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
