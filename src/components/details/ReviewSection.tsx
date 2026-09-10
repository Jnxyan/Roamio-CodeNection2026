import React, { useState } from 'react';
import { Review } from '../../types';
import {
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { db } from '../../services/db';

export interface ReviewSectionProps {
  entityId: string;
  entityName: string;
  entityType: 'destination' | 'hotel' | 'restaurant' | 'plan';
  rating: number;
  reviews: Review[];
  reviewsCount?: number;
  title?: string;
  subtitle?: string;
  verifiedBadgeText?: string;
  tagOptions?: string[];
  commentPlaceholder?: string;
  onSubmitReview: (reviewData: { user: string; rating: number; comment: string }) => void;
}

const DEFAULT_TAGS_BY_TYPE: Record<string, string[]> = {
  destination: [
    'Must-Visit',
    'Free Public Access',
    'Best for Photos',
    'Family Friendly',
    'Early Morning Visit',
    'Evening Sunset'
  ],
  hotel: [
    'Verified Guest',
    'Couples Getaway',
    'Family Friendly',
    'Solo Traveler',
    'Great Location',
    'Quiet Room'
  ],
  restaurant: [
    'Must-Try Dish',
    'Signature Cocktail',
    'Romantic Ambiance',
    'Great Value',
    'Quick Service',
    'Outdoor Seating'
  ],
  plan: [
    'Followed Exactly',
    'Pacing Was Perfect',
    'Great Budget Tips',
    'Hidden Gem Finds',
    'Family Tested',
    'First-Time Visitor'
  ]
};

const DEFAULT_PLACEHOLDERS: Record<string, string> = {
  destination: 'What did you love? Any advice about crowd timing, best photo viewpoints, entrance cues, or what to avoid?',
  hotel: 'How was the check-in, room comfort, bed quality, noise level, breakfast, and proximity to attractions?',
  restaurant: 'Which dishes or drinks did you order? How was the service, portion size, and overall vibe?',
  plan: 'Did you follow this itinerary? What were the standout highlights, budget surprises, or tips for others?'
};

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  entityId,
  entityName,
  entityType,
  rating,
  reviews = [],
  reviewsCount,
  title,
  subtitle,
  verifiedBadgeText,
  tagOptions,
  commentPlaceholder,
  onSubmitReview
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [starRating, setStarRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState(() => db.getCurrentUser()?.name || '');
  const [commentText, setCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});
  const [reviewFilter, setReviewFilter] = useState<'all' | '5' | '4'>('all');

  const tags = tagOptions || DEFAULT_TAGS_BY_TYPE[entityType] || DEFAULT_TAGS_BY_TYPE.destination;
  const placeholder = commentPlaceholder || DEFAULT_PLACEHOLDERS[entityType] || DEFAULT_PLACEHOLDERS.destination;
  const badgeLabel = verifiedBadgeText || (
    entityType === 'hotel'
      ? 'Verified Guest'
      : entityType === 'restaurant'
      ? 'Verified Diner'
      : entityType === 'plan'
      ? 'Verified Traveler'
      : 'Verified Visit'
  );

  const sectionTitle = title || (
    entityType === 'hotel'
      ? 'Guest Reviews'
      : entityType === 'restaurant'
      ? 'Diner Reviews & Ratings'
      : entityType === 'plan'
      ? 'Community Feedback & Reviews'
      : 'Traveler Reviews'
  );

  const sectionSubtitle = subtitle || (
    entityType === 'hotel'
      ? 'VERIFIED GUEST REVIEWS'
      : entityType === 'restaurant'
      ? 'DINER FEEDBACK & TIPS'
      : entityType === 'plan'
      ? 'ITINERARY FEEDBACK'
      : 'COMMUNITY REVIEWS & ADVICE'
  );

  const handleVoteHelpful = (reviewId: string) => {
    if (userVoted[reviewId]) return;
    setUserVoted((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setValidationError('Please enter your review comment or advice before posting.');
      return;
    }
    setValidationError('');

    const formattedComment = selectedTag ? `[${selectedTag}] ${commentText.trim()}` : commentText.trim();
    onSubmitReview({
      user: authorName.trim() || 'Traveler',
      rating: starRating,
      comment: formattedComment
    });

    setCommentText('');
    setSubmitSuccess(true);
    setShowReviewForm(false);
    setTimeout(() => setSubmitSuccess(false), 4500);
  };

  const getRatingFeedbackText = (val: number) => {
    switch (val) {
      case 5:
        return '5 Stars — Exceptional, absolute must-experience!';
      case 4:
        return '4 Stars — Great experience, highly recommended.';
      case 3:
        return '3 Stars — Average visit, good if nearby.';
      case 2:
        return '2 Stars — Below expectations or overcrowded.';
      case 1:
        return '1 Star — Not recommended.';
      default:
        return 'Select a star rating';
    }
  };

  const displayReviewsCount = reviewsCount || reviews.length;

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === '5') return r.rating === 5;
    if (reviewFilter === '4') return r.rating === 4;
    return true;
  });

  return (
    <section
      id={`reviews-section-${entityId}`}
      className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9CFC2] shadow-sm mb-12"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFEAE2]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A5] mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>{sectionSubtitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] font-display flex items-center gap-3">
            <span>{sectionTitle}</span>
            <span className="text-sm font-semibold text-[#374151] bg-[#FBF7F2] border border-[#D9CFC2] px-3 py-1 rounded-full">
              {displayReviewsCount} verified reviews
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FBF7F2] border border-[#D9CFC2] px-4 py-2 rounded-2xl">
            <div className="flex items-center text-amber-500">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-base font-extrabold text-[#1F2937]">
                {(rating || 5).toFixed(2)}
              </span>
              <span className="text-xs text-[#374151]/70 ml-1">/ 5.0</span>
            </div>
          </div>

          <button
            id={`btn-toggle-review-form-${entityId}`}
            onClick={() => setShowReviewForm((prev) => !prev)}
            className="px-4 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#088383] text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
          </button>
        </div>
      </div>

      {/* Success Alert Banner */}
      {submitSuccess && (
        <div className="my-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">Review successfully posted!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Thank you for contributing your experience to help fellow travelers.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Review & Comment Form */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmit}
          id={`review-form-${entityId}`}
          className="my-6 p-6 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0EA5A5]" />
              <span>Leave a Review for {entityName}</span>
            </h3>
            <span className="text-xs text-[#374151]/70">All fields are shared publicly</span>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
              Your Rating *
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-[#D9CFC2] shadow-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-hidden"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoverRating || starRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-[#1F2937]">
                {getRatingFeedbackText(hoverRating || starRating)}
              </span>
            </div>
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
              Your Name / Display Name
            </label>
            <input
              type="text"
              id={`input-review-author-${entityId}`}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Maya Chen or Anonymous Explorer"
              className="w-full max-w-md px-3.5 py-2.5 rounded-xl bg-white border border-[#D9CFC2] text-sm text-[#1F2937] placeholder:text-[#374151]/50 focus:outline-hidden focus:border-[#0EA5A5] focus:ring-1 focus:ring-[#0EA5A5]"
            />
          </div>

          {/* Optional Trip Tag Chips */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
              Category Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#0EA5A5] text-white border-[#0EA5A5] shadow-xs'
                      : 'bg-white text-[#374151] border-[#D9CFC2] hover:border-[#0EA5A5]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Body */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
              Review & Advice *
            </label>
            <textarea
              id={`input-review-comment-${entityId}`}
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#D9CFC2] text-sm text-[#1F2937] placeholder:text-[#374151]/50 focus:outline-hidden focus:border-[#0EA5A5] focus:ring-1 focus:ring-[#0EA5A5]"
            />
          </div>

          {/* Validation warning */}
          {validationError && (
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
              <AlertCircle className="w-4 h-4" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#374151] hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id={`btn-submit-review-${entityId}`}
              className="px-5 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#088383] text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Post Review</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-6 pt-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#374151]/80 mr-2">Filter:</span>
          <button
            onClick={() => setReviewFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              reviewFilter === 'all'
                ? 'bg-[#1F2937] text-white'
                : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2]'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setReviewFilter('5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              reviewFilter === '5'
                ? 'bg-amber-500 text-white'
                : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2]'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>5 Stars</span>
          </button>
          <button
            onClick={() => setReviewFilter('4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              reviewFilter === '4'
                ? 'bg-amber-500 text-white'
                : 'bg-[#FBF7F2] text-[#374151] hover:bg-[#EFEAE2]'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>4 Stars</span>
          </button>
        </div>

        <span className="text-xs text-[#374151]/60">
          Showing {filteredReviews.length} traveler feedbacks
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[#FBF7F2] rounded-2xl border border-dashed border-[#D9CFC2]">
            <MessageSquare className="w-8 h-8 text-[#0EA5A5]/60 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1F2937]">No reviews matching this filter</p>
            <p className="text-xs text-[#374151]/70 mt-1">
              Be the first to share your experience with this {entityType}!
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            // Check if comment has [Tag] prefix
            const tagMatch = rev.comment.match(/^\[([^\]]+)\]\s*(.*)$/);
            const tagLabel = tagMatch ? tagMatch[1] : null;
            const pureComment = tagMatch ? tagMatch[2] : rev.comment;

            return (
              <div
                key={rev.id}
                id={`review-item-${rev.id}`}
                className="p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/70 hover:border-[#D9CFC2] transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.user}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(rev.user)}`;
                      }}
                      className="w-9 h-9 rounded-full object-cover border border-[#D9CFC2] bg-white"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1F2937]">{rev.user}</span>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          {badgeLabel}
                        </span>
                        {tagLabel && (
                          <span className="text-[10px] font-semibold bg-[#0EA5A5]/15 text-[#086666] px-2 py-0.5 rounded-md">
                            {tagLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#374151]/60">{rev.date}</span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#D9CFC2]/60 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-extrabold text-[#1F2937]">{rev.rating}.0</span>
                  </div>
                </div>

                {/* Comment body */}
                <p className="text-xs sm:text-sm text-[#374151] leading-relaxed mt-2 pl-12 font-medium">
                  {pureComment}
                </p>

                {/* Helpful Upvote Button */}
                <div className="flex items-center justify-end gap-3 mt-3 pt-2 border-t border-[#D9CFC2]/40">
                  <button
                    type="button"
                    onClick={() => handleVoteHelpful(rev.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      userVoted[rev.id]
                        ? 'text-emerald-700 bg-emerald-100/60 font-bold'
                        : 'text-[#374151]/70 hover:text-[#0EA5A5] hover:bg-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>
                      Helpful (
                      {(helpfulVotes[rev.id] || 0) + (rev.id.includes('1') ? 14 : rev.id.includes('2') ? 9 : 5)}
                      )
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
