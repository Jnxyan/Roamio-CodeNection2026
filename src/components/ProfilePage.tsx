import React, { useState } from 'react';
import { User, Trip } from '../types';
import { db } from '../services/db';
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  MapPin,
  Camera,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Plus,
  X,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  Calendar,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onNavigate: (tab: 'home' | 'saved' | 'my-plans' | 'create-trip' | 'login' | 'profile') => void;
  savedCount: number;
  plansCount: number;
}

// Curated traveler avatar options
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80'
];

// Curated popular travel interests
const POPULAR_INTERESTS = [
  'Culture',
  'Food & Dining',
  'Photography',
  'Architecture',
  'Nature & Wildlife',
  'Hiking & Trekking',
  'Beach & Coast',
  'Art & Museums',
  'Historic Landmarks',
  'Local Markets',
  'Wellness & Spa',
  'Nightlife & Bars',
  'Cafes & Coffee',
  'Adventure Sports',
  'Scenic Road Trips',
  'Hidden Gems',
  'Street Food',
  'Music & Festivals'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  onNavigate,
  savedCount,
  plansCount
}) => {
  // If no user, show simple sign in prompt
  if (!currentUser) {
    return (
      <main className="min-h-[calc(100vh-4.5rem)] bg-[#FBF7F2] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 border border-[#D9CFC2] max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#1F2937] font-display">Sign In Required</h1>
          <p className="text-sm text-[#374151] mt-2 mb-6">
            Please sign in or create an account to view and customize your traveler profile.
          </p>
          <button
            id="btn-profile-signin"
            onClick={() => onNavigate('login')}
            className="w-full py-3 px-6 rounded-xl bg-[#0EA5A5] text-white font-bold hover:bg-[#0C8F8F] transition-all cursor-pointer shadow-sm"
          >
            Sign In with Roamio
          </button>
        </div>
      </main>
    );
  }

  // Active section tab
  const [activeSection, setActiveSection] = useState<'details' | 'interests' | 'security'>('details');

  // Details form state
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [homeLocation, setHomeLocation] = useState(currentUser.homeLocation || 'San Francisco, United States');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [detailsFeedback, setDetailsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Interests state
  const [interests, setInterests] = useState<string[]>(
    Array.isArray(currentUser.interests) && currentUser.interests.length > 0
      ? currentUser.interests
      : ['Culture', 'Food & Dining', 'Photography', 'Architecture']
  );
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [interestsFeedback, setInterestsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Handlers for Personal Details
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setDetailsFeedback({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setDetailsFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    const updated = db.updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      homeLocation: homeLocation.trim(),
      bio: bio.trim(),
      avatar
    });

    onUpdateUser(updated);
    setDetailsFeedback({ type: 'success', message: 'Personal details updated successfully!' });
    setTimeout(() => setDetailsFeedback(null), 4000);
  };

  // Handlers for Interests
  const handleToggleInterest = (item: string) => {
    let updated: string[];
    if (interests.includes(item)) {
      updated = interests.filter(i => i.toLowerCase() !== item.toLowerCase());
    } else {
      updated = [...interests, item];
    }
    setInterests(updated);
    const savedUser = db.updateUserProfile({ interests: updated });
    onUpdateUser(savedUser);
    setInterestsFeedback({ type: 'success', message: 'Interests updated!' });
    setTimeout(() => setInterestsFeedback(null), 2500);
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInterestInput.trim();
    if (!clean) return;

    // Check if already in list (case-insensitive)
    const exists = interests.some(i => i.toLowerCase() === clean.toLowerCase());
    if (exists) {
      setInterestsFeedback({ type: 'error', message: `"${clean}" is already in your interests.` });
      setTimeout(() => setInterestsFeedback(null), 3000);
      return;
    }

    const updated = [...interests, clean];
    setInterests(updated);
    setCustomInterestInput('');
    const savedUser = db.updateUserProfile({ interests: updated });
    onUpdateUser(savedUser);
    setInterestsFeedback({ type: 'success', message: `Added "${clean}" to your travel interests!` });
    setTimeout(() => setInterestsFeedback(null), 3000);
  };

  const handleRemoveInterest = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = interests.filter(i => i !== itemToRemove);
    setInterests(updated);
    const savedUser = db.updateUserProfile({ interests: updated });
    onUpdateUser(savedUser);
    setInterestsFeedback({ type: 'success', message: `Removed "${itemToRemove}"` });
    setTimeout(() => setInterestsFeedback(null), 2500);
  };

  // Handlers for Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New passwords do not match. Please re-enter.' });
      return;
    }

    const res = db.changePassword(currentPassword, newPassword);
    if (!res.success) {
      setPasswordFeedback({ type: 'error', message: res.error || 'Failed to update password.' });
    } else {
      setPasswordFeedback({ type: 'success', message: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 5000);
    }
  };

  // Select custom avatar
  const handleApplyCustomAvatar = () => {
    if (customAvatarUrl.trim()) {
      setAvatar(customAvatarUrl.trim());
      setCustomAvatarUrl('');
      setShowAvatarPicker(false);
      const updated = db.updateUserProfile({ avatar: customAvatarUrl.trim() });
      onUpdateUser(updated);
    }
  };

  return (
    <main id="profile-page-main" className="min-h-[calc(100vh-4.5rem)] bg-[#FBF7F2] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-from-profile"
              onClick={() => onNavigate('home')}
              className="p-2.5 rounded-xl border border-[#D9CFC2] bg-white hover:bg-[#EFEAE2] text-[#1F2937] transition-all cursor-pointer shadow-sm"
              title="Return to Explore"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1F2937] tracking-tight font-display">
                Traveler Profile & Settings
              </h1>
              <p className="text-xs sm:text-sm text-[#374151]/80">
                Manage your personal details, travel preferences, and account security.
              </p>
            </div>
          </div>

          {/* Quick Action links */}
          <div className="flex items-center gap-2">
            <button
              id="btn-profile-to-plans"
              onClick={() => onNavigate('my-plans')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#D9CFC2] bg-white text-[#1F2937] hover:border-[#0EA5A5] hover:text-[#0EA5A5] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>My Plans ({plansCount})</span>
            </button>
            <button
              id="btn-profile-to-saved"
              onClick={() => onNavigate('saved')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#D9CFC2] bg-white text-[#1F2937] hover:border-[#0EA5A5] hover:text-[#0EA5A5] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#0EA5A5]" />
              <span>Saved ({savedCount})</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: User Summary Card (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-[#D9CFC2] p-6 shadow-sm space-y-6">
              {/* Profile Avatar & Quick Info */}
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#0EA5A5]/20 shadow-md transition-transform group-hover:scale-102"
                  />
                  <button
                    id="btn-change-avatar-trigger"
                    type="button"
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute bottom-1 right-1 p-2 rounded-full bg-[#0EA5A5] hover:bg-[#0C8F8F] text-white shadow-md transition-all cursor-pointer"
                    title="Change profile avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Avatar Picker Modal / Dropdown */}
                {showAvatarPicker && (
                  <div className="mt-4 p-4 rounded-2xl border border-[#D9CFC2] bg-[#FBF7F2] text-left w-full space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F2937]">Choose Avatar</span>
                      <button
                        type="button"
                        onClick={() => setShowAvatarPicker(false)}
                        className="text-[#374151] hover:text-[#1F2937] p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_PRESETS.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatar(presetUrl);
                            setShowAvatarPicker(false);
                            const updated = db.updateUserProfile({ avatar: presetUrl });
                            onUpdateUser(updated);
                          }}
                          className={`relative rounded-full overflow-hidden border-2 transition-all aspect-square cursor-pointer ${
                            avatar === presetUrl ? 'border-[#0EA5A5] scale-105' : 'border-transparent hover:border-[#D9CFC2]'
                          }`}
                        >
                          <img src={presetUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#D9CFC2]/60">
                      <label className="block text-[10px] font-bold text-[#374151] mb-1">Or paste image URL:</label>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={customAvatarUrl}
                          onChange={e => setCustomAvatarUrl(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#D9CFC2] bg-white focus:outline-none focus:border-[#0EA5A5]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomAvatar}
                          className="px-2.5 py-1 rounded-lg bg-[#0EA5A5] text-white text-xs font-bold hover:bg-[#0C8F8F] cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <h2 className="text-lg font-black text-[#1F2937]">{name}</h2>
                  <p className="text-xs text-[#374151]/80 truncate max-w-[240px]">{email}</p>
                </div>

                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2FBF71]/10 text-[#2FBF71] text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Traveler</span>
                </div>
              </div>

              {/* Bio snippet */}
              {bio && (
                <div className="p-3.5 rounded-2xl bg-[#FBF7F2] border border-[#EFEAE2]">
                  <p className="text-xs text-[#374151] italic leading-relaxed">
                    "{bio}"
                  </p>
                </div>
              )}

              {/* Traveler Stats & Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EFEAE2]">
                <div className="p-3 rounded-2xl bg-[#FBF7F2] text-center border border-[#EFEAE2]">
                  <div className="text-xl font-black text-[#0EA5A5] font-display">{plansCount}</div>
                  <div className="text-[11px] font-bold text-[#374151]/70">Trips & Plans</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FBF7F2] text-center border border-[#EFEAE2]">
                  <div className="text-xl font-black text-[#FF6B4A] font-display">{savedCount}</div>
                  <div className="text-[11px] font-bold text-[#374151]/70">Saved Items</div>
                </div>
              </div>

              {/* Selected Interests overview in sidebar */}
              <div className="space-y-2 pt-2 border-t border-[#EFEAE2]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
                    <span>Active Interests ({interests.length})</span>
                  </span>
                  <button
                    onClick={() => setActiveSection('interests')}
                    className="text-[11px] font-bold text-[#0EA5A5] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {interests.slice(0, 6).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-[#0EA5A5]/10 text-[#0EA5A5] text-[11px] font-bold"
                    >
                      {item}
                    </span>
                  ))}
                  {interests.length > 6 && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#FBF7F2] text-[#374151] text-[11px] font-bold">
                      +{interests.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Meta details */}
              <div className="space-y-2 pt-2 border-t border-[#EFEAE2] text-xs text-[#374151]/70">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>Base: <strong className="text-[#1F2937]">{homeLocation || 'San Francisco, United States'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[#0EA5A5]" />
                  <span>Member since: <strong className="text-[#1F2937]">{currentUser.joinedDate || 'March 2025'}</strong></span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Settings Tabs and Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section Tab Navigation */}
            <div className="bg-white rounded-2xl p-1.5 border border-[#D9CFC2] flex gap-1 shadow-sm">
              <button
                id="tab-btn-details"
                onClick={() => setActiveSection('details')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeSection === 'details'
                    ? 'bg-[#0EA5A5] text-white shadow-sm'
                    : 'text-[#374151] hover:bg-[#FBF7F2] hover:text-[#1F2937]'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Personal Details</span>
              </button>

              <button
                id="tab-btn-interests"
                onClick={() => setActiveSection('interests')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeSection === 'interests'
                    ? 'bg-[#0EA5A5] text-white shadow-sm'
                    : 'text-[#374151] hover:bg-[#FBF7F2] hover:text-[#1F2937]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Travel Interests</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeSection === 'interests' ? 'bg-white text-[#0EA5A5]' : 'bg-[#EFEAE2] text-[#1F2937]'
                }`}>
                  {interests.length}
                </span>
              </button>

              <button
                id="tab-btn-security"
                onClick={() => setActiveSection('security')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeSection === 'security'
                    ? 'bg-[#0EA5A5] text-white shadow-sm'
                    : 'text-[#374151] hover:bg-[#FBF7F2] hover:text-[#1F2937]'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>

            {/* TAB 1: Personal Details Form */}
            {activeSection === 'details' && (
              <div className="bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1F2937] font-display">
                    Edit Personal Details
                  </h3>
                  <p className="text-xs sm:text-sm text-[#374151]/80 mt-1">
                    Update your display name, contact information, base city, and traveler bio.
                  </p>
                </div>

                {detailsFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
                      detailsFeedback.type === 'success'
                        ? 'bg-[#2FBF71]/10 text-[#2FBF71] border border-[#2FBF71]/20'
                        : 'bg-[#E85555]/10 text-[#E85555] border border-[#E85555]/20'
                    }`}
                  >
                    {detailsFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{detailsFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveDetails} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="input-profile-name" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                        Full Name <span className="text-[#FF6B4A]">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/50" />
                        <input
                          id="input-profile-name"
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Alex Rivera"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="input-profile-email" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                        Email Address <span className="text-[#FF6B4A]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/50" />
                        <input
                          id="input-profile-email"
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label htmlFor="input-profile-phone" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/50" />
                        <input
                          id="input-profile-phone"
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+1 415-555-0192"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                        />
                      </div>
                    </div>

                    {/* Home Location */}
                    <div>
                      <label htmlFor="input-profile-location" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                        Home Base (City, Country)
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/50" />
                        <input
                          id="input-profile-location"
                          type="text"
                          value={homeLocation}
                          onChange={e => setHomeLocation(e.target.value)}
                          placeholder="San Francisco, United States"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="input-profile-bio" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                      Traveler Bio & Exploration Motto
                    </label>
                    <textarea
                      id="input-profile-bio"
                      rows={3}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Share a short bio about what you love discovering, your favorite travel styles, or bucket list destinations..."
                      className="w-full p-3.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      id="btn-save-details"
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0C8F8F] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#0EA5A5]/25 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Set & Edit Travel Interests */}
            {activeSection === 'interests' && (
              <div className="bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1F2937] font-display flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FF6B4A]" />
                    <span>Set & Edit Travel Interests</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#374151]/80 mt-1">
                    Select the travel styles and activities you enjoy. Roamio tailors itinerary suggestions and discovery cards to match your passions.
                  </p>
                </div>

                {interestsFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
                      interestsFeedback.type === 'success'
                        ? 'bg-[#2FBF71]/10 text-[#2FBF71] border border-[#2FBF71]/20'
                        : 'bg-[#E85555]/10 text-[#E85555] border border-[#E85555]/20'
                    }`}
                  >
                    {interestsFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{interestsFeedback.message}</span>
                  </div>
                )}

                {/* Currently Selected Active Interests */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF7F2] border border-[#D9CFC2]/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F2937]">
                      Your Selected Interests ({interests.length})
                    </span>
                    {interests.length > 0 && (
                      <span className="text-[11px] text-[#374151]/70">
                        Click '×' to remove
                      </span>
                    )}
                  </div>

                  {interests.length === 0 ? (
                    <p className="text-xs text-[#374151]/70 italic py-2">
                      No interests selected yet. Pick from the curated tags below or add your own custom travel interest!
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest, idx) => (
                        <div
                          key={idx}
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0EA5A5] text-white text-xs font-bold shadow-sm transition-all animate-in fade-in"
                        >
                          <span>{interest}</span>
                          <button
                            id={`btn-remove-interest-${idx}`}
                            type="button"
                            onClick={(e) => handleRemoveInterest(interest, e)}
                            className="p-0.5 hover:bg-black/20 rounded-full transition-colors cursor-pointer"
                            title={`Remove ${interest}`}
                          >
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Custom Interest input */}
                <form onSubmit={handleAddCustomInterest} className="space-y-2">
                  <label htmlFor="input-custom-interest" className="block text-xs font-bold text-[#1F2937]">
                    Add Custom Interest
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="input-custom-interest"
                      type="text"
                      placeholder="e.g. Scuba Diving, Wine Tasting, Street Art..."
                      value={customInterestInput}
                      onChange={e => setCustomInterestInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                    />
                    <button
                      id="btn-add-custom-interest"
                      type="submit"
                      disabled={!customInterestInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                {/* Popular Interest Suggestions Grid */}
                <div className="space-y-3 pt-2 border-t border-[#EFEAE2]">
                  <span className="text-xs font-bold text-[#1F2937] block">
                    Curated Travel Styles (Click to toggle)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_INTERESTS.map((popInterest, idx) => {
                      const isSelected = interests.some(i => i.toLowerCase() === popInterest.toLowerCase());
                      return (
                        <button
                          id={`btn-toggle-interest-${idx}`}
                          key={idx}
                          type="button"
                          onClick={() => handleToggleInterest(popInterest)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#0EA5A5] text-white shadow-sm'
                              : 'bg-[#FBF7F2] text-[#1F2937] border border-[#D9CFC2] hover:border-[#0EA5A5] hover:bg-white'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-[#374151]/60" />
                          )}
                          <span>{popInterest}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Change Password */}
            {activeSection === 'security' && (
              <div className="bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1F2937] font-display flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#0EA5A5]" />
                    <span>Change Account Password</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#374151]/80 mt-1">
                    Ensure your account stays secure by using a strong password of at least 6 characters.
                  </p>
                </div>

                {passwordFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
                      passwordFeedback.type === 'success'
                        ? 'bg-[#2FBF71]/10 text-[#2FBF71] border border-[#2FBF71]/20'
                        : 'bg-[#E85555]/10 text-[#E85555] border border-[#E85555]/20'
                    }`}
                  >
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                {/* Helpful note for demo */}
                <div className="p-3.5 rounded-2xl bg-[#0EA5A5]/10 border border-[#0EA5A5]/20 text-xs text-[#0EA5A5]">
                  <p className="font-bold">Password Verification Note</p>
                  <p className="mt-0.5 text-[#374151]">
                    If you are using the default demo account, the current password is: <code className="bg-white px-1.5 py-0.5 rounded border border-[#0EA5A5]/30 font-bold text-[#0EA5A5]">roamio2026</code>
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="input-current-password" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                      Current Password <span className="text-[#FF6B4A]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/50" />
                      <input
                        id="input-current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#374151]/60 hover:text-[#1F2937] cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="input-new-password" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                      New Password <span className="text-[#FF6B4A]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/50" />
                      <input
                        id="input-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#374151]/60 hover:text-[#1F2937] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#EFEAE2] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              newPassword.length < 6
                                ? 'w-1/4 bg-[#E85555]'
                                : newPassword.length < 9
                                ? 'w-2/3 bg-[#F59E0B]'
                                : 'w-full bg-[#2FBF71]'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#374151]/70">
                          {newPassword.length < 6 ? 'Too short' : newPassword.length < 9 ? 'Moderate' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="input-confirm-password" className="block text-xs font-bold text-[#1F2937] mb-1.5">
                      Confirm New Password <span className="text-[#FF6B4A]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/50" />
                      <input
                        id="input-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9CFC2] text-xs sm:text-sm bg-[#FBF7F2] focus:bg-white focus:outline-none focus:border-[#0EA5A5] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#374151]/60 hover:text-[#1F2937] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[11px] text-[#E85555] font-semibold mt-1">
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      id="btn-submit-change-password"
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0C8F8F] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#0EA5A5]/25 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
