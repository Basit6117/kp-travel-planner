'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, MapPin, X, Save } from 'lucide-react';

export default function AdminPlacesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [places, setPlaces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', cityId: '', categoryId: '', description: '',
    image: '', latitude: '', longitude: '', priceRange: 'Free'
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    const [pRes, cRes, catRes] = await Promise.all([
      fetch('/api/admin/places'),
      fetch('/api/admin/cities'),
      fetch('/api/admin/categories')
    ]);
    const [pData, cData, catData] = await Promise.all([pRes.json(), cRes.json(), catRes.json()]);
    
    setPlaces(Array.isArray(pData) ? pData : []);
    setCities(Array.isArray(cData) ? cData : []);
    setCategories(Array.isArray(catData) ? catData : []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/places', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        ...form,
        location: { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) }
      }) 
    });
    
    if (res.ok) { 
      setShowForm(false); 
      setForm({ name: '', cityId: '', categoryId: '', description: '', image: '', latitude: '', longitude: '', priceRange: 'Free' }); 
      fetchData(); 
    } else { 
      alert('Failed to add place'); 
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this place?')) return;
    setDeletingId(id);
    await fetch(`/api/admin/places?id=${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchData();
  };

  if (status === 'loading' || loading) return (
    <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Places</h1>
          <p className="text-slate-400 text-sm mt-1">{places.length} attractions in the database</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'Add Place'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 space-y-4">
          <h2 className="font-bold text-white text-base mb-4">New Tourist Spot</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Place Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Image URL</label>
              <input type="url" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">City</label>
              <select required value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white focus:outline-none">
                <option value="">Select City</option>
                {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Category</label>
              <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white focus:outline-none">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Price Level</label>
              <select required value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white focus:outline-none">
                <option value="Free">Free</option>
                <option value="$">$ (Budget)</option>
                <option value="$$">$$ (Moderate)</option>
                <option value="$$$">$$$ (Expensive)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Latitude</label>
              <input type="number" step="any" required value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="34.7717" className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Longitude</label>
              <input type="number" step="any" required value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="72.3602" className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white focus:outline-none resize-none" />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Place</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Place Name</th>
                <th className="px-6 py-3 text-left hidden sm:table-cell">City</th>
                <th className="px-6 py-3 text-left hidden md:table-cell">Category</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {places.map((place) => (
                <tr key={place._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                        <img src={place.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-white">{place.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs hidden sm:table-cell">{(place.cityId as any)?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs hidden md:table-cell">
                    <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">{(place.categoryId as any)?.name || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(place._id)}
                      disabled={deletingId === place._id}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {deletingId === place._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      <span className="hidden sm:inline">Delete</span>
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
