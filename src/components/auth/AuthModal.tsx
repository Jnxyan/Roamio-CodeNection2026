import React, { useState } from 'react';
import { RoamioLogo } from '../RoamioLogo';
import { User } from '../../types';
import { db } from '../../services/db';
import { X, Mail, Lock, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [password, setPassword] = useState('roamio2026');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const newUser = db.signUp(email, password, name || 'Travel Explorer');
      onLoginSuccess(newUser);
    } else {
      const user = db.login(email, password);
      onLoginSuccess(user);
    }
    onClose();
  };

  const handleQuickDemo = () => {
    const user = db.login('alex.rivera@example.com', 'roamio2026');
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#D9CFC2] p-6 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#374151] hover:bg-[#FBF7F2] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <RoamioLogo />
          </div>
          <h2 className="text-xl font-extrabold text-[#1F2937] font-display">
            {isSignUp ? 'Create your Roamio account' : 'Welcome back, traveler'}
          </h2>
          <p className="text-xs text-[#374151] mt-1">
            {isSignUp
              ? 'Save custom itineraries, track budgets, and share trip plans.'
              : 'Sign in to access your saved trips and active plans.'}
          </p>
        </div>

        {/* Quick Social / Demo Login */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 rounded-xl border border-[#D9CFC2] bg-[#FBF7F2] hover:bg-[#EFEAE2] text-xs font-bold text-[#1F2937] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Alex"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>Continue as Alex Rivera (Demo Traveler)</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D9CFC2]/70" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#374151]/70 font-semibold">Or use email</span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/60" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D9CFC2] text-xs bg-[#FBF7F2] focus:outline-none focus:border-[#0EA5A5]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/60" />
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D9CFC2] text-xs bg-[#FBF7F2] focus:outline-none focus:border-[#0EA5A5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#1F2937] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/60" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D9CFC2] text-xs bg-[#FBF7F2] focus:outline-none focus:border-[#0EA5A5]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>{isSignUp ? 'Sign Up & Save Trips' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between Login and Sign up */}
        <div className="mt-5 text-center text-xs text-[#374151]">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-bold text-[#0EA5A5] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-bold text-[#FF6B4A] hover:underline cursor-pointer"
              >
                Create one free
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
