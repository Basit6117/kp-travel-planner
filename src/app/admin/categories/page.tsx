'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Tag, X, Save } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
    if (status === 'authenticated') fetchCategories();
  }, [status]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) { setError('Category name is required.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), icon: form.icon.trim() }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ name: '', icon: '' });
        fetchCategories();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to add category.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?\n\nPlaces linked to this category will lose their category reference.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      fetchCategories();
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Categories</h1>
          <p className="text-slate-400 text-sm mt-1">{categories.length} categories in the database</p>
        </div>
        <button
          id="add-category-btn"
          onClick={() => { setShowForm(!showForm); setError(null); }}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 space-y-4"
        >
          <h2 className="font-bold text-white text-base">New Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                Category Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="category-name-input"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Hotels & Accommodation"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                Icon (emoji, optional)
              </label>
              <input
                id="category-icon-input"
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="🏨"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-rose-400 text-xs font-medium">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Category</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500">
          <Tag className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p className="font-medium text-slate-400 mb-1">No categories yet</p>
          <p className="text-sm">Add a category above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="text-2xl bg-slate-800 p-2 rounded-xl group-hover:scale-110 transition-transform shrink-0">
                  {cat.icon || <Tag className="w-4 h-4 text-emerald-400" />}
                </span>
                <span className="font-semibold text-white truncate">{cat.name}</span>
              </div>
              <button
                onClick={() => handleDelete(cat._id, cat.name)}
                disabled={deletingId === cat._id}
                aria-label={`Delete ${cat.name}`}
                className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 p-2 rounded-lg transition-all disabled:opacity-50 shrink-0 ml-2"
              >
                {deletingId === cat._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
