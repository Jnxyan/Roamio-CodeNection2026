import React, { useState } from 'react';
import { RoamioLogo } from './RoamioLogo';
import { Bookmark, MapPin, Compass, Plus, User as UserIcon, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  savedCount: number;
  plansCount: number;
  activeTab: string;
  onNavigate: (tab: 'home' | 'saved' | 'my-plans' | 'create-trip' | 'login') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  savedCount,
  plansCount,
  activeTab,
  onNavigate,
  onLogout
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header id="roamio-navbar" className="sticky top-0 z-40 w-full bg-[#FBF7F2]/95 backdrop-blur-md border-b border-[#D9CFC2]/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <RoamioLogo onClick={() => onNavigate('home')} />

          {/* Main quick links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            <button
              id="nav-btn-explore"
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-[#0EA5A5] text-white shadow-sm shadow-[#0EA5A5]/25'
                  : 'text-[#1F2937] hover:bg-[#EFEAE2] hover:text-[#0EA5A5]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </button>

            <button
              id="nav-btn-saved"
              onClick={() => onNavigate('saved')}
              className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'bg-[#0EA5A5] text-white shadow-sm shadow-[#0EA5A5]/25'
                  : 'text-[#1F2937] hover:bg-[#EFEAE2] hover:text-[#0EA5A5]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {savedCount > 0 && (
                <span
                  id="badge-saved-count"
                  className={`text-xs px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    activeTab === 'saved'
                      ? 'bg-white text-[#0EA5A5]'
                      : 'bg-[#0EA5A5] text-white'
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="nav-btn-my-plans"
              onClick={() => onNavigate('my-plans')}
              className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'my-plans'
                  ? 'bg-[#0EA5A5] text-white shadow-sm shadow-[#0EA5A5]/25'
                  : 'text-[#1F2937] hover:bg-[#EFEAE2] hover:text-[#0EA5A5]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>My Plans</span>
              {plansCount > 0 && (
                <span
                  id="badge-plans-count"
                  className={`text-xs px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    activeTab === 'my-plans'
                      ? 'bg-white text-[#0EA5A5]'
                      : 'bg-[#FF6B4A] text-white'
                  }`}
                >
                  {plansCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Actions: Create Trip CTA & Profile */}
        <div className="flex items-center gap-3">
          <button
            id="btn-create-trip"
            onClick={() => onNavigate('create-trip')}
            className="px-4 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85837] text-white font-bold text-sm shadow-sm shadow-[#FF6B4A]/30 flex items-center gap-2 transition-all transform active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Create Plan</span>
            <span className="sm:hidden">Plan</span>
          </button>

          {/* Profile User Dropdown */}
          <div className="relative">
            {currentUser ? (
              <button
                id="btn-user-profile"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl border border-[#D9CFC2] hover:border-[#0EA5A5] bg-white transition-all cursor-pointer"
                aria-expanded={profileDropdownOpen}
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#0EA5A5]/30"
                />
                <span className="hidden sm:block text-xs font-bold text-[#1F2937] max-w-[90px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#374151]" />
              </button>
            ) : (
              <button
                id="btn-nav-login"
                onClick={() => onNavigate('login')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#0EA5A5] text-[#0EA5A5] hover:bg-[#0EA5A5] hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && currentUser && (
              <div
                id="menu-user-dropdown"
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#D9CFC2] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="p-3 border-b border-[#EFEAE2]">
                  <p className="text-xs text-[#374151]/70 font-medium">Signed in as</p>
                  <p className="text-sm font-bold text-[#1F2937] truncate">{currentUser.name}</p>
                  <p className="text-xs text-[#374151]/80 truncate">{currentUser.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#2FBF71]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Traveler</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('my-plans');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#FBF7F2] rounded-lg transition-colors flex items-center gap-2.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0EA5A5]" />
                    <span>My Trips & Plans ({plansCount})</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('saved');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#FBF7F2] rounded-lg transition-colors flex items-center gap-2.5"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#0EA5A5]" />
                    <span>Saved Favorites ({savedCount})</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#EFEAE2]">
                  <button
                    id="btn-logout"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#E85555] hover:bg-[#FFF5F2] rounded-lg transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-[#D9CFC2]/60 bg-[#FBF7F2]">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 text-xs font-semibold ${
            activeTab === 'home' ? 'text-[#0EA5A5]' : 'text-[#374151]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </button>
        <button
          onClick={() => onNavigate('saved')}
          className={`flex flex-col items-center gap-0.5 text-xs font-semibold relative ${
            activeTab === 'saved' ? 'text-[#0EA5A5]' : 'text-[#374151]'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#0EA5A5] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {savedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onNavigate('my-plans')}
          className={`flex flex-col items-center gap-0.5 text-xs font-semibold relative ${
            activeTab === 'my-plans' ? 'text-[#0EA5A5]' : 'text-[#374151]'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Plans</span>
          {plansCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#FF6B4A] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {plansCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
