'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Shield,
  Save,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const user = session!.user!;
  const role = (session!.user as any)?.role ?? 'user';

  // Initialize name field from session on first render
  const displayName = name || user.name || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Client-side validation for password change
    if (showPasswordSection && newPassword) {
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'error', message: 'New passwords do not match.' });
        return;
      }
      if (newPassword.length < 6) {
        setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
        return;
      }
    }

    const payload: Record<string, string> = {};
    if (name.trim() && name.trim() !== user.name) payload.name = name.trim();
    if (showPasswordSection && newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setFeedback({ type: 'error', message: 'No changes to save.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Update failed.' });
        return;
      }

      // If name changed, update the NextAuth session client-side
      if (payload.name) {
        await update({ name: payload.name });
      }

      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
    } catch {
      setFeedback({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Avatar & Role */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-emerald-400 mb-4">
          <UserIcon className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              role === 'admin'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {role}
          </span>
        </div>
      </div>

      {/* Read-only info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="flex items-start space-x-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-400 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
            <p className="text-sm font-bold text-white mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="bg-purple-500/10 p-2.5 rounded-lg text-purple-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Role</p>
            <p className="text-sm font-bold text-white mt-0.5 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6"
      >
        <h2 className="text-base font-bold text-white">Edit Profile</h2>

        {/* Name */}
        <div>
          <label
            htmlFor="profile-name"
            className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider"
          >
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            placeholder={user.name || 'Your name'}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Password Section Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowPasswordSection((p) => !p)}
            className="flex items-center space-x-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Change Password</span>
            {showPasswordSection ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showPasswordSection && (
            <div className="mt-4 space-y-4 border-t border-slate-800 pt-4">
              {[
                { id: 'current-password', label: 'Current Password', value: currentPassword, setter: setCurrentPassword },
                { id: 'new-password', label: 'New Password', value: newPassword, setter: setNewPassword },
                { id: 'confirm-password', label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
              ].map(({ id, label, value, setter }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  >
                    {label}
                  </label>
                  <input
                    id={id}
                    type="password"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    autoComplete="off"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Save Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors"
            >
              <span>Dashboard</span>
            </a>
            {role === 'admin' && (
              <a
                href="/admin"
                className="inline-flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </a>
            )}
          </div>

          <button
            id="save-profile-btn"
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg shadow-emerald-900/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
