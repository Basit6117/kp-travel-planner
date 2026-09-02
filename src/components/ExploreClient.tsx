'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

interface City {
  _id: string;
  name: string;
  provinceRegion: string;
  description: string;
  coverImage?: string;
}

interface ExploreClientProps {
  cities: City[];
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

export default function ExploreClient({ cities }: ExploreClientProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(q) ||
        city.provinceRegion.toLowerCase().includes(q) ||
        city.description.toLowerCase().includes(q)
    );
  }, [query, cities]);

  return (
    <>
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          id="explore-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cities, valleys, or regions…"
          aria-label="Search destinations"
          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors shadow-lg"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Count */}
      {query && (
        <p className="text-slate-400 text-sm text-center mb-6">
          {filtered.length === 0
            ? `No destinations found for "${query}"`
            : `${filtered.length} destination${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* City Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500">
          <Search className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p className="font-medium text-slate-300 mb-1">No results for &quot;{query}&quot;</p>
          <p className="text-sm">Try a different city or valley name.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((city) => (
            <Link
              key={city._id}
              href={`/explore/${city._id}`}
              className="group block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-800">
                <img
                  src={city.coverImage || FALLBACK_IMAGE}
                  alt={city.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-xl font-bold text-white tracking-wide">{city.name}</h2>
                  <p className="text-xs text-emerald-400 font-semibold">{city.provinceRegion}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {city.description}
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  <span>Explore Categories</span>
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
