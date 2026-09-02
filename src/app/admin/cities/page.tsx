'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Trash2, Building2, X, Save, AlertTriangle } from 'lucide-react';

export default function AdminCitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', provinceRegion: 'Khyber Pakhtunkhwa', description: '', coverImage: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
    if (status === 'authenticated') fetchCities();
  }, [status]);

  const fetchCities = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/cities');
    const data = await res.json();
    setCities(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch('/api/admin/cities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, coverImage: form.coverImage.trim() || undefined }) });
    if (res.ok) { setShowForm(false); setForm({ name: '', provinceRegion: 'Khyber Pakhtunkhwa', description: '', coverImage: '' }); fetchCities(); }
    else { const d = await res.json(); setError(d.error || 'Failed to add city'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this city? This will NOT remove associated places.')) return;
    setDeletingId(id);
    await fetch(`/api/admin/cities?id=${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchCities();
  };

  if (status === 'loading' || loading) return (
    <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Destinations</h1>
          <p className="text-slate-400 text-sm mt-1">Create a destination first, then add its places, hotels, and categories. {cities.length} destinations in the database.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'Add Destination'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 space-y-4">
          <h2 className="font-bold text-white text-base mb-2">New Destination</h2>
          {[
            { label: 'Destination Name', key: 'name', type: 'text', placeholder: 'e.g. Haripur or Mabali Island' },
            { label: 'Province/Region', key: 'provinceRegion', type: 'text', placeholder: 'Khyber Pakhtunkhwa' },
            { label: 'Cover Image URL', key: 'coverImage', type: 'url', placeholder: 'https://...' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">{field.label}</label>
              <input
                type={field.type}
                required={field.key !== 'coverImage'}
                placeholder={field.placeholder}
                value={(form as any)[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description of this destination..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors resize-none"
            />
          </div>
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">
            After saving this destination, open <Link href="/admin/places" className="font-bold underline hover:text-white">Manage Places</Link> and select it from the city dropdown to add historical sites, food spots, hotels, and activities.
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Destination</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">City</th>
                <th className="px-6 py-3 text-left hidden sm:table-cell">Region</th>
                <th className="px-6 py-3 text-left hidden lg:table-cell">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {cities.map((city) => (
                <tr key={city._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                        <img src={city.coverImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-white">{city.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs hidden sm:table-cell">{city.provinceRegion}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs hidden lg:table-cell max-w-xs">
                    <span className="line-clamp-2">{city.description}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(city._id)}
                      disabled={deletingId === city._id}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {deletingId === city._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
