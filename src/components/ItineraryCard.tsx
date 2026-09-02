'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Calendar, Trash2, Loader2 } from 'lucide-react';

interface ItineraryCardProps {
  itinerary: {
    _id: string;
    days: number;
    travelType: string;
    createdAt: string;
    generatedPlan?: { tripTitle?: string };
    cityId?: { name?: string; coverImage?: string };
  };
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

export default function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const cityName = itinerary.cityId?.name ?? 'Unknown';
  const coverImage = itinerary.cityId?.coverImage || FALLBACK_IMAGE;
  const tripTitle = itinerary.generatedPlan?.tripTitle || `Trip to ${cityName}`;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${tripTitle}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/itinerary/${itinerary._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete itinerary.');
      }

      // Trigger a server-side revalidation so the list updates without
      // a full page reload.
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all group">
      {/* Cover Image */}
      <div className="aspect-video relative overflow-hidden bg-slate-800">
        <img
          src={coverImage}
          alt={cityName}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-bold text-white text-base leading-tight line-clamp-1">
            {tripTitle}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {cityName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {itinerary.days} {itinerary.days === 1 ? 'day' : 'days'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(itinerary.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg capitalize">
            {itinerary.travelType}
          </span>

          <div className="flex items-center gap-2">
            {/* Delete Button */}
            <button
              id={`delete-itinerary-${itinerary._id}`}
              onClick={handleDelete}
              disabled={deleting}
              aria-label={`Delete ${tripTitle}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400
                         hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20
                         border border-rose-500/20 px-2.5 py-1.5 rounded-lg
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span>{deleting ? 'Deleting…' : 'Delete'}</span>
            </button>

            {/* View Button */}
            <Link
              href={`/dashboard/itineraries/${itinerary._id}`}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300
                         px-3 py-1.5 border border-emerald-500/30 rounded-lg transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
