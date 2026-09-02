'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sparkles, Loader2, MapPin, Calendar, DollarSign, Users, Heart } from 'lucide-react';

const INTERESTS = ['Nature & Scenery', 'History & Culture', 'Shopping & Food', 'Adventure & Trekking', 'Photography', 'Religious Sites'];
const TRAVEL_TYPES = ['Solo', 'Couple', 'Family', 'Friends'];
const BUDGETS = ['Economy (PKR 5k-20k)', 'Mid-Range (PKR 20k-50k)', 'Luxury (PKR 50k+)'];

export default function PlanTripPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cities, setCities] = useState<any[]>([]);
  const [form, setForm] = useState({
    cityId: '',
    days: '3',
    budget: BUDGETS[1],
    travelType: 'Family',
    interests: ['Nature & Scenery'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelerLocation, setTravelerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    // Fetch cities for dropdown
    fetch('/api/cities').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCities(data);
    }).catch(console.error);
  }, [status]);

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Your browser does not support location services.');
      return;
    }

    setLocationStatus('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setTravelerLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocationStatus('Current location added. Nearby places will be prioritized.');
      },
      () => setLocationStatus('Location was not shared. The plan will use your selected destination.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cityId) { setError('Please select a destination city.'); return; }
    if (form.interests.length === 0) { setError('Please select at least one interest.'); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...(travelerLocation ? { travelerLocation } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate itinerary');
      router.push(`/dashboard/itineraries/${data.itineraryId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Google Gemini AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide mb-3">
          Plan Your KPK Trip
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Fill in your preferences and our AI will generate a detailed, day-wise itinerary grounded in real KPK locations from our database.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        {/* Destination */}
        <div>
          <label className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Destination City / Valley</span>
          </label>
          <select
            required
            value={form.cityId}
            onChange={(e) => setForm({ ...form, cityId: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3.5 text-sm text-white focus:outline-none transition-colors"
          >
            <option value="">— Select a destination —</option>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>{city.name}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Duration: <span className="text-emerald-400 font-bold">{form.days} {parseInt(form.days) === 1 ? 'Day' : 'Days'}</span></span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={form.days}
            onChange={(e) => setForm({ ...form, days: e.target.value })}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1 Day</span>
            <span>10 Days</span>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Budget Range</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BUDGETS.map((budget) => (
              <button
                key={budget}
                type="button"
                onClick={() => setForm({ ...form, budget })}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                  form.budget === budget
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {budget}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Type */}
        <div>
          <label className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Travel Group</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TRAVEL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, travelType: type })}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                  form.travelType === type
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="flex items-center space-x-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Heart className="w-4 h-4 text-emerald-400" />
            <span>Interests (select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
                  form.interests.includes(interest)
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">Prioritize places near me</p>
              <p className="mt-1 text-xs text-slate-400">Optional. Your precise location is used only to order this itinerary request.</p>
            </div>
            <button type="button" onClick={useCurrentLocation} className="rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10">
              {travelerLocation ? 'Location added' : 'Use my location'}
            </button>
          </div>
          {locationStatus && <p className="mt-2 text-xs text-slate-400" aria-live="polite">{locationStatus}</p>}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl text-base transition-all flex items-center justify-center space-x-3 disabled:opacity-60 shadow-lg shadow-emerald-900/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating your itinerary... This may take a moment</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate AI Itinerary</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
