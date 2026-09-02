'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Star, MapPin, Eye, MessageSquare, Loader2, Sparkles, Navigation, Trash2 } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

// Dynamically load the Leaflet Map component with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

interface Place {
  _id: string;
  name: string;
  description: string;
  images: string[];
  videoUrl?: string;
  location: { lat: number; lng: number };
  address?: string;
  rating: number;
  children?: Place[];
}

interface PlaceListClientProps {
  city: any;
  category: any;
  places: Place[];
}

export default function PlaceListClient({ city, category, places }: PlaceListClientProps) {
  const { data: session } = useSession();
  const [activePlace, setActivePlace] = useState<Place | null>(places[0] || null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    places[0]?.location.lat ?? 34.0,
    places[0]?.location.lng ?? 72.0
  ]);
  const [mapZoom, setMapZoom] = useState(12);

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Fetch reviews when active place changes
  useEffect(() => {
    if (activePlace) {
      fetchReviews(activePlace._id);
    }
  }, [activePlace]);

  const fetchReviews = async (placeId: string) => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`/api/reviews?placeId=${placeId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleFocusPlace = (place: Place) => {
    setActivePlace(place);
    setMapCenter([place.location.lat, place.location.lng]);
    setMapZoom(14);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlace) return;

    try {
      setSubmittingReview(true);
      setReviewError(null);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: activePlace._id,
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setNewComment('');
      // Reload reviews
      fetchReviews(activePlace._id);
    } catch (err: any) {
      setReviewError(err.message || 'Something went wrong');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (res.ok && activePlace) {
        fetchReviews(activePlace._id);
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // Build the list of all map markers

  const mapMarkers = [];
  for (const place of places) {
    mapMarkers.push({
      id: place._id,
      name: place.name,
      lat: place.location.lat,
      lng: place.location.lng,
      description: place.description,
    });
    // Add child subplaces to the map markers as well
    if (place.children) {
      for (const child of place.children) {
        mapMarkers.push({
          id: child._id,
          name: child.name,
          lat: child.location.lat,
          lng: child.location.lng,
          description: child.description,
        });
      }
    }
  }

  if (places.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <p className="text-lg font-medium">No places found in this category for {city.name}.</p>
        <p className="text-sm mt-2">Try checking another category or add locations via the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left side: Place List */}
      <div className="lg:col-span-7 space-y-6">
        {places.map((place) => {
          const isActive = activePlace?._id === place._id;
          return (
            <div
              key={place._id}
              onClick={() => handleFocusPlace(place)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-950/20'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-48 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  <img
                    src={(place.images?.[0] ?? (place as any).image) || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'}
                    alt={place.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h2 className="text-xl font-bold text-white tracking-wide">{place.name}</h2>
                      <div className="flex items-center text-amber-400 text-sm font-semibold shrink-0 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-850">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        <span>{place.rating || 'N/A'}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                      {place.description}
                    </p>

                    {place.address && (
                      <p className="text-xs text-slate-400 flex items-center mb-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                        <span>{place.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Breadcrumb check & Nesting indicator */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
                    <div className="text-xs text-emerald-400 font-semibold flex items-center space-x-1.5">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{city.name} &rarr; {category.name}</span>
                    </div>

                    <span className="text-xs text-slate-400 font-medium">Click to show on map</span>
                  </div>
                </div>
              </div>

              {/* Sub-places (Nested levels) */}
              {place.children && place.children.length > 0 && (
                <div className="mt-6 pl-4 border-l-2 border-emerald-500/30 space-y-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Valleys & Sub-Places inside {place.name}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {place.children.map((child) => (
                      <div
                        key={child._id}
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid triggering parent click
                          handleFocusPlace(child);
                        }}
                        className={`p-4 rounded-xl border transition-colors ${
                          activePlace?._id === child._id
                            ? 'bg-slate-950 border-emerald-500/40'
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <h5 className="font-bold text-white text-sm mb-1">{child.name}</h5>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {child.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-semibold">{place.name} &rarr; {child.name}</span>
                          <span className="text-[10px] text-amber-400 flex items-center">
                            <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                            {child.rating || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right side: Map, Weather & Active Place Reviews */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
        {/* Live Weather Widget */}
        <WeatherWidget
          cityId={city._id}
          lat={activePlace?.location.lat ?? city.lat ?? 34.0}
          lng={activePlace?.location.lng ?? city.lng ?? 72.0}
          cityName={activePlace ? activePlace.name : city.name}
        />

        {/* Leaflet Map */}
        <div className="h-96 rounded-2xl overflow-hidden border border-slate-800">
          <MapComponent center={mapCenter} zoom={mapZoom} places={mapMarkers} />
        </div>

        {/* Detail / Reviews Box of the Active Place */}
        {activePlace && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-bold text-lg text-white mb-2">{activePlace.name} Details</h3>
            
            {(activePlace.images?.[0] ?? (activePlace as any).image) && (
              <img
                src={activePlace.images?.[0] ?? (activePlace as any).image}
                alt={activePlace.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover"
              />
            )}
            
            {activePlace.images && activePlace.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 my-4">
                {activePlace.images.slice(1, 4).map((img, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden bg-slate-800">
                    <img
                      src={img}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {activePlace.videoUrl && (
              <div className="mb-4">
                <a
                  href={activePlace.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Watch Video Tour</span>
                </a>
              </div>
            )}

            {/* Reviews Section */}
            <div className="border-t border-slate-800 pt-4 mt-4">
              <h4 className="font-bold text-sm text-white mb-4 flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Guest Reviews ({reviews.length})</span>
              </h4>

              {/* Review writing form */}
              {session ? (
                <form onSubmit={handleReviewSubmit} className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300">Rate this place:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= newRating ? 'text-amber-400 fill-current' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your review here..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    required
                  />
                  {reviewError && <p className="text-[10px] text-rose-400 mt-1">{reviewError}</p>}
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg flex items-center transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : null}
                      <span>Submit</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl text-center border border-slate-850 text-xs text-slate-400 mb-6">
                  Please{' '}
                  <Link href="/login" className="text-emerald-400 hover:underline">
                    log in
                  </Link>{' '}
                  to write a review.
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-4 space-x-2 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading reviews...</span>
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
                  {reviews.map((rev) => {
                    const isOwnerOrAdmin =
                      session?.user &&
                      ((session.user as any).id === rev.userId?._id || (session.user as any).role === 'admin');

                    return (
                      <div key={rev._id} className="bg-slate-950/50 border border-slate-900 p-3 rounded-lg text-xs relative group/rev">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-300">{rev.userId?.name || 'Anonymous'}</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-amber-400 text-[10px]">
                              <Star className="w-3 h-3 fill-current mr-0.5" />
                              <span>{rev.rating}</span>
                            </div>
                            {isOwnerOrAdmin && (
                              <button
                                onClick={() => handleReviewDelete(rev._id)}
                                title="Delete review"
                                className="text-rose-400 hover:text-rose-300 opacity-70 hover:opacity-100 transition-opacity p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-400 leading-normal">{rev.comment}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

