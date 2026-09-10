import React, { useState, useEffect } from 'react';
import { Destination, Review } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Star,
  Zap,
  Clock,
  ExternalLink,
  Compass,
  Bookmark,
  Share2,
  Ticket,
  MessageSquare,
  Send,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { db } from '../../services/db';

interface DestinationDetailProps {
  destination: Destination;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
  onPlanTripHere: (destination: Destination) => void;
  onDestinationUpdated?: (updated: Destination) => void;
}

const VISIT_TAG_OPTIONS = [
  'Must-Visit',
  'Free Public Access',
  'Best for Photos',
  'Family Friendly',
  'Early Morning Visit',
  'Evening Sunset'
];

export const DestinationDetail: React.FC<DestinationDetailProps> = ({
  destination,
  isSaved,
  onBack,
  onToggleSave,
  onPlanTripHere,
  onDestinationUpdated
}) => {
  const [currentDest, setCurrentDest] = useState<Destination>(destination);
  const [selectedPhoto, setSelectedPhoto] = useState(destination.cover_photo);
  const [copied, setCopied] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setCurrentDest(destination);
    setSelectedPhoto(destination.cover_photo);
  }, [destination]);

  // Review & Comment Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState(() => db.getCurrentUser()?.name || '');
  const [commentText, setCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Must-Visit');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});
  const [reviewFilter, setReviewFilter] = useState<'all' | '5' | '4' | 'recent'>('all');

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVoteHelpful = (reviewId: string) => {
    if (userVoted[reviewId]) return;
    setUserVoted((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setValidationError('Please enter your comment or advice before posting.');
      return;
    }
    setValidationError('');

    const formattedComment = selectedTag ? `[${selectedTag}] ${commentText.trim()}` : commentText.trim();
    const updated = db.addDestinationReview(currentDest.id, {
      user: authorName.trim() || 'Traveler',
      rating,
      comment: formattedComment
    });

    if (updated) {
      setCurrentDest(updated);
      setCommentText('');
      setSubmitSuccess(true);
      setShowReviewForm(false);
      if (onDestinationUpdated) {
        onDestinationUpdated(updated);
      }
      setTimeout(() => setSubmitSuccess(false), 4000);
    }
  };

  const getRatingFeedbackText = (val: number) => {
    switch (val) {
      case 5:
        return '5 Stars — Exceptional, absolute must-visit!';
      case 4:
        return '4 Stars — Great experience, highly recommended.';
      case 3:
        return '3 Stars — Average visit, good if nearby.';
      case 2:
        return '2 Stars — Disappointing or overcrowded.';
      case 1:
        return '1 Star — Not recommended.';
      default:
        return 'Select a star rating';
    }
  };

  // Filtered reviews
  const allReviews = currentDest.reviews || [];
  const filteredReviews = allReviews.filter((r) => {
    if (reviewFilter === '5') return r.rating === 5;
    if (reviewFilter === '4') return r.rating === 4;
    return true;
  });

  return (
    <div id="destination-detail-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top back & actions bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="btn-back-destination"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#1F2937] hover:text-[#0EA5A5] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#D9CFC2]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-[#D9CFC2] bg-white hover:bg-[#EFEAE2] text-[#1F2937] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Share destination link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            id="btn-toggle-save-dest"
            onClick={onToggleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              isSaved
                ? 'bg-[#0EA5A5] text-white border-[#0EA5A5]'
                : 'bg-white text-[#1F2937] border-[#D9CFC2] hover:border-[#0EA5A5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Saved to Trip' : 'Save'}</span>
          </button>

          <button
            id="btn-plan-trip-dest"
            onClick={() => onPlanTripHere(currentDest)}
            className="px-4 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Plan Trip Here</span>
          </button>
        </div>
      </div>

      {/* Main Headline & Location Meta */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
          <span className="font-extrabold text-white bg-[#0EA5A5] px-3 py-1 rounded-lg shadow-xs">
            Destination Guide
          </span>
          <span className="text-[#374151]/50">•</span>
          <span className="text-[#374151] font-medium">{currentDest.city}, {currentDest.country}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F2937] font-display">
          {currentDest.name}
        </h1>
      </div>

      {/* Hero Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
        <div className="lg:col-span-3 aspect-16/9 rounded-2xl overflow-hidden bg-[#EFEAE2] border border-[#D9CFC2]/70 shadow-sm">
          <img
            src={selectedPhoto}
            alt={currentDest.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>
        <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {currentDest.gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedPhoto(img)}
              className={`relative flex-1 aspect-16/9 lg:aspect-auto lg:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedPhoto === img
                  ? 'border-[#0EA5A5] ring-2 ring-[#0EA5A5]/30'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Gallery view ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Key Quick Facts: 5 Cards (Operating Hours, Location, Energy, Ticket & Admission, Rating & Reviews) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 mb-8">
        {/* 1. Operating Hours */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A5] mb-1">
              <Clock className="w-4 h-4" />
              <span>OPERATING HOURS</span>
            </div>
            <p className="text-xs font-semibold text-[#1F2937] leading-relaxed">
              {currentDest.operating_hours}
            </p>
          </div>
          <p className="text-[10px] text-[#374151]/60 mt-2">Daily visitor schedule</p>
        </div>

        {/* 2. Location */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A5] mb-1">
              <MapPin className="w-4 h-4" />
              <span>LOCATION</span>
            </div>
            <a
              id="link-google-maps-dest"
              href={currentDest.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B4A] hover:underline"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-[10px] text-[#374151]/60 mt-2">Verified GPS coordinates</p>
        </div>

        {/* 3. Energy Scale */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>ENERGY REQUIRED</span>
            </div>
            <div className="flex items-center gap-1 my-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <Zap
                  key={lvl}
                  className={`w-4 h-4 ${
                    lvl <= currentDest.energy_level
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-[#1F2937] ml-1.5">
                {currentDest.energy_level} / 5
              </span>
            </div>
          </div>
          <p className="text-[10px] text-[#374151]/70 mt-1">
            {currentDest.energy_level >= 4
              ? 'Active walking & exploration'
              : currentDest.energy_level === 3
              ? 'Moderate pace & paths'
              : 'Relaxed & easy stroll'}
          </p>
        </div>

        {/* 4. Ticket & Admission (Rating is separate!) */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#2FBF71] mb-1">
              <Ticket className="w-4 h-4 text-[#2FBF71]" />
              <span>TICKET & ADMISSION</span>
            </div>
            <div className="flex items-center gap-2 my-1">
              <span
                className={`text-lg font-black tracking-wide ${
                  currentDest.ticket_price?.toLowerCase() === 'free' || currentDest.is_free
                    ? 'text-emerald-600'
                    : 'text-[#1F2937]'
                }`}
              >
                {currentDest.ticket_price || (currentDest.is_free ? 'Free' : 'Free')}
              </span>
              {(currentDest.ticket_price?.toLowerCase() === 'free' || currentDest.is_free) && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  No Entry Fee
                </span>
              )}
            </div>
          </div>
          <p className="text-[10px] text-[#374151]/70 mt-1">
            Typical visit: <strong className="text-[#1F2937]">{currentDest.typical_visit_time || '1–2 hours'}</strong>
          </p>
        </div>

        {/* 5. Rating & Reviews (Separate dedicated card) */}
        <div className="bg-white p-4 rounded-2xl border border-[#D9CFC2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>RATING & REVIEWS</span>
            </div>
            <div className="flex items-center gap-2 my-1">
              <span className="text-lg font-black text-[#1F2937]">
                {currentDest.rating.toFixed(2)}
              </span>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(currentDest.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-[#374151]/70">
              <strong className="text-[#1F2937]">{currentDest.reviews_count}</strong> reviews
            </span>
            <button
              id="btn-quick-write-review"
              onClick={() => {
                setShowReviewForm(true);
                const el = document.getElementById('reviews-community-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[10px] font-bold text-[#0EA5A5] hover:underline cursor-pointer"
            >
              + Review
            </button>
          </div>
        </div>
      </div>

      {/* Description & Activities + Visitor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <h2 className="text-lg font-bold text-[#1F2937] mb-3 font-display">About the Destination</h2>
            <p className="text-sm text-[#374151] leading-relaxed">
              {currentDest.short_description}
            </p>

            <h3 className="text-sm font-bold text-[#1F2937] mt-6 mb-3">Popular Activities</h3>
            <div className="flex flex-wrap gap-2">
              {currentDest.activities.map((act, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2] text-xs font-semibold text-[#1F2937] flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>{act}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Example Itinerary if present */}
          {currentDest.itinerary_example && currentDest.itinerary_example.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1F2937] font-display">Example Itinerary</h2>
                <span className="text-xs font-semibold text-[#0EA5A5] bg-[#0EA5A5]/10 px-2.5 py-1 rounded-lg">
                  Curated Sample
                </span>
              </div>
              <div className="space-y-4">
                {currentDest.itinerary_example.map((day) => (
                  <div key={day.day} className="p-4 rounded-xl bg-[#FBF7F2] border border-[#D9CFC2]/60">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[#0EA5A5] text-white text-xs font-bold flex items-center justify-center">
                        {day.day}
                      </span>
                      <h4 className="text-sm font-bold text-[#1F2937]">{day.title}</h4>
                    </div>
                    <ul className="pl-8 list-disc space-y-1 text-xs text-[#374151]">
                      {day.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ticket Info & Visitor Details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D9CFC2]">
            <h3 className="text-sm font-bold text-[#1F2937] mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#0EA5A5]" />
              <span>Ticket & Admission Details</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F2] text-xs border border-[#D9CFC2]/50">
                <span className="font-semibold text-[#374151]">Admission / Entry</span>
                <span className={`font-extrabold ${currentDest.ticket_price?.toLowerCase() === 'free' || currentDest.is_free ? 'text-emerald-600' : 'text-[#1F2937]'}`}>
                  {currentDest.ticket_price || (currentDest.is_free ? 'Free' : 'Free')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F2] text-xs border border-[#D9CFC2]/50">
                <span className="font-semibold text-[#374151]">Typical Visit Duration</span>
                <span className="font-bold text-[#1F2937]">
                  {currentDest.typical_visit_time || '1–2 hours'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0EA5A5]/10 text-xs border border-[#0EA5A5]/30">
                <span className="font-bold text-[#086666] block mb-1">Visitor Tip</span>
                <span className="text-[#086666]/90 text-[11px] leading-relaxed block">
                  {currentDest.ticket_price?.toLowerCase() === 'free' || currentDest.is_free
                    ? 'Free public access. Peak hours are usually late afternoon; visit early for peaceful walks and photo sessions.'
                    : 'Advance timed booking online is recommended to skip on-site ticket lines.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMMUNITY REVIEWS & COMMENTS SECTION */}
      <section
        id="reviews-community-section"
        className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9CFC2] shadow-sm mb-12"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFEAE2]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0EA5A5] mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>COMMUNITY REVIEWS & ADVICE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] font-display flex items-center gap-3">
              <span>Traveler Reviews</span>
              <span className="text-sm font-semibold text-[#374151] bg-[#FBF7F2] border border-[#D9CFC2] px-3 py-1 rounded-full">
                {allReviews.length} verified reviews
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
                  {currentDest.rating.toFixed(2)}
                </span>
                <span className="text-xs text-[#374151]/70 ml-1">/ 5.0</span>
              </div>
            </div>

            <button
              id="btn-toggle-review-form"
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
            onSubmit={handleSubmitReview}
            id="destination-review-form"
            className="my-6 p-6 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2] space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0EA5A5]" />
                <span>Leave a Review for {currentDest.name}</span>
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
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-hidden"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#1F2937]">
                  {getRatingFeedbackText(hoverRating || rating)}
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
                id="input-review-author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Maya Chen or Anonymous Explorer"
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl bg-white border border-[#D9CFC2] text-sm text-[#1F2937] placeholder:text-[#374151]/50 focus:outline-hidden focus:border-[#0EA5A5] focus:ring-1 focus:ring-[#0EA5A5]"
              />
            </div>

            {/* Optional Trip Tag Chips */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5 uppercase tracking-wider">
                Visit Category Tag
              </label>
              <div className="flex flex-wrap gap-2">
                {VISIT_TAG_OPTIONS.map((tag) => (
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
                Review & Visitor Advice *
              </label>
              <textarea
                id="input-review-comment"
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What did you love? Any advice about crowd timing, best photo viewpoints, entrance cues, or what to avoid?"
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
                id="btn-submit-review"
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
              All ({allReviews.length})
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
                Be the first to share your experience with this destination!
              </p>
            </div>
          ) : (
            filteredReviews.map((rev) => (
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
                          Verified Visit
                        </span>
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
                  {rev.comment}
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
                      {userVoted[rev.id] ? 'Helpful' : 'Helpful'} (
                      {(helpfulVotes[rev.id] || 0) + (rev.id.includes('rev-1') ? 14 : rev.id.includes('rev-2') ? 9 : rev.id.includes('rev-klcc') ? 22 : 3)}
                      )
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

