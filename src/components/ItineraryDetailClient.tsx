'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Sun, Sunset, Moon, Hotel, DollarSign, Info, Package } from 'lucide-react';

interface ItineraryDetailClientProps {
  itinerary: any;
}

export default function ItineraryDetailClient({ itinerary }: ItineraryDetailClientProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const plan = itinerary.generatedPlan;
  const city = itinerary.cityId;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href="/dashboard/itineraries" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>My Itineraries</span>
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download / Print PDF</span>
        </button>
      </div>

      <div ref={printRef} id="itinerary-print">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/20 rounded-3xl overflow-hidden mb-8 shadow-xl">
          {city?.coverImage && (
            <div className="aspect-[21/9] relative overflow-hidden">
              <img
                src={city.coverImage}
                alt={city.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide mb-2">
              {plan?.tripTitle || `Trip to ${city?.name}`}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span>📍 {city?.name}</span>
              <span>🗓️ {itinerary.days} Days</span>
              <span>👥 {itinerary.travelType}</span>
              <span>💰 {itinerary.budget}</span>
              <span>📅 {new Date(itinerary.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Day-wise Itinerary */}
        {plan?.itinerary && plan.itinerary.length > 0 && (
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sun className="w-5 h-5 text-emerald-400" />
              <span>Day-by-Day Plan</span>
            </h2>
            {plan.itinerary.map((day: any) => (
              <div key={day.day} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-emerald-900/30 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-bold text-emerald-400 text-lg">Day {day.day}</h3>
                  <span className="text-slate-400 text-sm italic">{day.theme}</span>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Sun className="w-3.5 h-3.5" />
                      <span>Morning</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{day.morning?.activity}</p>
                    {day.morning?.recommendedPlace && day.morning.recommendedPlace !== 'N/A' && (
                      <span className="inline-block mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        📍 {day.morning.recommendedPlace}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Sunset className="w-3.5 h-3.5" />
                      <span>Afternoon</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{day.afternoon?.activity}</p>
                    {day.afternoon?.recommendedPlace && day.afternoon.recommendedPlace !== 'N/A' && (
                      <span className="inline-block mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        📍 {day.afternoon.recommendedPlace}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Moon className="w-3.5 h-3.5" />
                      <span>Evening</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{day.evening?.activity}</p>
                    {day.evening?.recommendedPlace && day.evening.recommendedPlace !== 'N/A' && (
                      <span className="inline-block mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        📍 {day.evening.recommendedPlace}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggested Hotels */}
        {plan?.suggestedHotels && plan.suggestedHotels.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
              <Hotel className="w-5 h-5 text-emerald-400" />
              <span>Suggested Hotels</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plan.suggestedHotels.map((hotel: any, i: number) => (
                <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <h4 className="font-bold text-white text-sm mb-1">{hotel.name}</h4>
                  <p className="text-xs text-emerald-400 font-semibold mb-1">💰 {hotel.priceRange}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{hotel.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        {plan?.costBreakdown && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Estimated Cost Breakdown</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(plan.costBreakdown).filter(([k]) => k !== 'total').map(([key, val]) => (
                <div key={key} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-400 capitalize mb-1">{key}</p>
                  <p className="text-sm font-bold text-white">{val as string}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
              <span className="text-sm text-slate-300 font-semibold">Total Estimated Cost</span>
              <span className="text-lg font-extrabold text-emerald-400">{plan.costBreakdown.total}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Travel Tips */}
          {plan?.travelTips && plan.travelTips.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Safety & Travel Tips</span>
              </h2>
              <ul className="space-y-2">
                {plan.travelTips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Packing Suggestions */}
          {plan?.packingSuggestions && plan.packingSuggestions.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
                <Package className="w-4 h-4 text-blue-400" />
                <span>Packing Suggestions</span>
              </h2>
              <ul className="space-y-2">
                {plan.packingSuggestions.map((item: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
