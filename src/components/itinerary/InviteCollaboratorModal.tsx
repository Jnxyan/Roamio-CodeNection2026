import React, { useState } from 'react';
import { Trip, TripCollaborator, User } from '../../types';
import { db } from '../../services/db';
import {
  X,
  UserPlus,
  Mail,
  Users,
  Check,
  Trash2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  currentUser?: User | null;
  onTripUpdated: (updatedTrip: Trip) => void;
  onSwitchUser?: (user: User) => void;
}

export const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({
  isOpen,
  onClose,
  trip,
  currentUser,
  onTripUpdated,
  onSwitchUser
}) => {
  const [inputVal, setInputVal] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCollaborators: TripCollaborator[] = Array.isArray(trip.invited_users)
    ? trip.invited_users
    : [];

  const knownUsers = db.getKnownUsers();
  // Filter out current user from suggestions
  const suggestedUsers = knownUsers.filter(u => {
    if (currentUser && u.email.toLowerCase() === currentUser.email.toLowerCase()) return false;
    if (trip.owner_email && u.email.toLowerCase() === trip.owner_email.toLowerCase()) return false;
    return true;
  });

  const handleInvite = (emailOrUsernameToInvite?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const target = (emailOrUsernameToInvite || inputVal).trim();

    if (!target) {
      setErrorMsg('Please enter a username or email address.');
      return;
    }

    try {
      const result = db.inviteUserToTrip(trip.id, target, role);
      onTripUpdated(result.trip);
      setInputVal('');
      setSuccessMsg(result.message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to invite user.');
    }
  };

  const handleRemove = (emailOrId: string) => {
    try {
      const updated = db.removeCollaboratorFromTrip(trip.id, emailOrId);
      onTripUpdated(updated);
      setSuccessMsg('Collaborator removed.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to remove collaborator.');
    }
  };

  const handleSwitchToUser = (collab: TripCollaborator) => {
    const user = db.login(collab.email);
    if (onSwitchUser) {
      onSwitchUser(user);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#D9CFC2] p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EFEAE2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0EA5A5]/10 text-[#0EA5A5] flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2937] font-display">
                Invite to Co-Plan Trip
              </h2>
              <p className="text-xs text-[#374151]">
                Plan appears in invited user's <strong>My Plans</strong> to edit schedule together.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#374151] hover:bg-[#FBF7F2] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-5 overflow-y-auto flex-1 pr-1">
          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInvite();
            }}
            className="space-y-2.5"
          >
            <label className="block text-xs font-bold text-[#1F2937]">
              Insert Username or Email Address
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151]/50" />
                <input
                  type="text"
                  id="input-invite-email-username"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="e.g. janiceng040803@gmail.com or username"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D9CFC2] text-xs focus:outline-none focus:border-[#0EA5A5] bg-white text-[#1F2937]"
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                className="px-2.5 py-2.5 rounded-xl border border-[#D9CFC2] text-xs font-semibold bg-[#FBF7F2] text-[#1F2937] focus:outline-none focus:border-[#0EA5A5] cursor-pointer"
              >
                <option value="editor">Can edit</option>
                <option value="viewer">Can view</option>
              </select>

              <button
                type="submit"
                id="btn-send-invite"
                className="px-4 py-2.5 rounded-xl bg-[#0EA5A5] hover:bg-[#0B8585] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite</span>
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-[#E85555] font-medium pt-0.5">{errorMsg}</p>
            )}
            {successMsg && (
              <div className="flex items-center gap-1.5 text-xs text-[#2FBF71] font-bold bg-[#2FBF71]/10 px-3 py-2 rounded-xl">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>

          {/* Quick Suggestions from known travelers */}
          {suggestedUsers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#374151]/80 uppercase tracking-wider">
                  Quick Invite Suggested Travelers
                </span>
                <span className="text-[10px] text-[#0EA5A5] font-semibold">1-Click Add</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedUsers.map((user) => {
                  const isAlreadyInvited = currentCollaborators.some(
                    c => c.email.toLowerCase() === user.email.toLowerCase() || c.id === user.id
                  );
                  return (
                    <div
                      key={user.id}
                      className="p-2.5 rounded-2xl border border-[#D9CFC2]/70 bg-[#FBF7F2] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1F2937] truncate">{user.name}</p>
                          <p className="text-[10px] text-[#374151]/70 truncate">{user.email}</p>
                        </div>
                      </div>

                      {isAlreadyInvited ? (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#0EA5A5] bg-[#0EA5A5]/10 shrink-0 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInvite(user.email)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#0EA5A5] text-[#0EA5A5] hover:bg-[#0EA5A5] hover:text-white text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                        >
                          + Invite
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Members on this Plan */}
          <div>
            <span className="block text-[11px] font-bold text-[#374151]/80 uppercase tracking-wider mb-2">
              People on this Plan ({1 + currentCollaborators.length})
            </span>
            <div className="divide-y divide-[#EFEAE2] border border-[#D9CFC2]/80 rounded-2xl bg-white overflow-hidden">
              {/* Trip Creator / Owner */}
              <div className="p-3 flex items-center justify-between gap-3 bg-[#FBF7F2]/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt="Owner"
                    className="w-8 h-8 rounded-full object-cover border border-[#0EA5A5]/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5 truncate">
                      <span>{trip.owner_name || 'Alex Rivera'}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#0EA5A5]/10 text-[#086666] font-extrabold">
                        Owner
                      </span>
                    </p>
                    <p className="text-[11px] text-[#374151]/70 truncate">
                      {trip.owner_email || 'alex@roamio.travel'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#374151]/60 shrink-0">
                  Created plan
                </span>
              </div>

              {/* Invited Collaborators */}
              {currentCollaborators.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#374151]/70 italic">
                  No other collaborators yet. Insert an email or username above to invite someone!
                </div>
              ) : (
                currentCollaborators.map((collab) => (
                  <div key={collab.email} className="p-3 flex items-center justify-between gap-3 hover:bg-[#FBF7F2]/40 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={collab.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt={collab.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#D9CFC2] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5 truncate">
                          <span>{collab.name}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            {collab.role === 'editor' ? 'Can Edit' : 'Can View'}
                          </span>
                        </p>
                        <p className="text-[11px] text-[#374151]/70 truncate">{collab.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSwitchUser && (
                        <button
                          type="button"
                          onClick={() => handleSwitchToUser(collab)}
                          title={`Switch to ${collab.name} to view their My Plans`}
                          className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#086666] text-[10px] font-bold border border-teal-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span className="hidden sm:inline">Test as {collab.name.split(' ')[0]}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemove(collab.email)}
                        title="Remove from plan"
                        className="p-1.5 text-[#374151]/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#EFEAE2] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-[#374151]/80">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5A5]" />
            <span>Invited editors can add, adjust, and reorder activities together.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#FBF7F2] hover:bg-[#EFEAE2] text-xs font-bold text-[#1F2937] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
