import React from 'react';
import { Bookmark, Star, MapPin, ArrowUpRight, Clock, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export interface PostCardItem {
  id: string;
  type: 'destinations' | 'hotels' | 'restaurants' | 'plans';
  title: string;
  coverPhoto: string;
  daysOfStay?: string;
  budget: string;
  ticketPrice?: string;
  isFree?: boolean;
  rating: number;
  reviewsCount?: number;
  locationName: string;
  mapsUrl: string;
  operatingHours?: string;
  energyLevel?: number; // legacy field, not rendered on cover or card
  authorName?: string;
  authorAvatar?: string;
  subtitle?: string;
  likesCount?: number;
}

interface PostCardProps {
  item: PostCardItem;
  isSaved?: boolean;
  isLiked?: boolean;
  onToggleSave?: (item: PostCardItem, e: React.MouseEvent) => void;
  onToggleLike?: (item: PostCardItem, e: React.MouseEvent) => void;
  onClick?: (item: PostCardItem) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  item,
  isSaved = false,
  isLiked = false,
  onToggleSave,
  onToggleLike,
  onClick
}) => {
  const categoryLabels = {
    destinations: 'Destination',
    hotels: 'Hotel',
    restaurants: 'Restaurant',
    plans: 'Curated Plan'
  };

  // Completely solid, fully opaque, non-transparent background colors
  const categoryColors = {
    destinations: 'bg-[#0EA5A5] text-white border-[#0EA5A5]',
    hotels: 'bg-indigo-600 text-white border-indigo-600',
    restaurants: 'bg-amber-600 text-white border-amber-600',
    plans: 'bg-[#FF6B4A] text-white border-[#FF6B4A]'
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

        {/* Top Badges: Category (Solid Non-Transparent) & Actions */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          {/* Label with completely solid opaque background */}
          <span
            id={`badge-cat-${item.id}`}
            className={`text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm border ${
              categoryColors[item.type]
            }`}
          >
            {categoryLabels[item.type]}
          </span>

          {/* Bookmark button */}
          <button
            id={`btn-save-${item.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave && onToggleSave(item, e);
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save post'}
            className={`p-2 rounded-xl transition-all shadow-sm cursor-pointer ${
              isSaved
                ? 'bg-[#0EA5A5] text-white hover:bg-[#0B8585]'
                : 'bg-white text-[#1F2937] hover:text-[#0EA5A5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Floating Stats over Image: Days & Budget/Ticket Price */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white z-10 pointer-events-none">
          {item.type !== 'destinations' && item.daysOfStay ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <span>{item.daysOfStay}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Ticket / Budget Badge */}
          <div
            id={`budget-badge-${item.id}`}
            className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 ${
              item.type === 'destinations' &&
              (item.ticketPrice?.toLowerCase() === 'free' ||
                item.budget?.toLowerCase() === 'free' ||
                item.isFree)
                ? 'bg-emerald-600 text-white font-extrabold tracking-wide'
                : 'bg-[#FF6B4A] text-white'
            }`}
          >
            <span>
              {item.type === 'destinations'
                ? item.ticketPrice || item.budget || 'Free'
                : item.budget}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <span className="flex items-center gap-1 text-[#374151] font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-[#0EA5A5]" />
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

        {/* Bottom Section: Likes Action & Author & Deep-Link */}
        <div className="mt-4 pt-3 border-t border-[#EFEAE2] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {/* Interactive Like button replacing legacy energy */}
            <button
              id={`btn-like-${item.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike && onToggleLike(item, e);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                isLiked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                  : 'bg-[#FBF7F2] text-[#374151] hover:bg-rose-50 hover:text-rose-600 border border-[#D9CFC2]/60'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
              <span>{(item.likesCount || 0).toLocaleString()} likes</span>
            </button>

            {item.authorName && (
              <div className="hidden sm:flex items-center gap-1.5">
                {item.authorAvatar ? (
                  <img
                    src={item.authorAvatar}
                    alt={item.authorName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : null}
                <span className="text-[11px] text-[#374151] font-medium truncate max-w-[100px]">
                  By {item.authorName}
                </span>
              </div>
            )}
          </div>

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
