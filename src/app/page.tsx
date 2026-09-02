import React from 'react';
import Link from 'next/link';
import { Compass, Calendar, Map, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-white min-h-[90vh] flex flex-col justify-between">
      {/* Hero Section */}
      <div className="relative py-24 sm:py-32 flex-grow flex items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khyber Pakhtunkhwa Tourism</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent mb-6 max-w-4xl mx-auto leading-tight">
            KPK Smart Travel Explorer
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover majestic valleys, ancient history, modern shopping, and access customized, AI-driven itineraries tailored to your budget and travel style.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-900/20 hover:scale-[1.02]"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Destinations</span>
            </Link>

            <Link
              href="/dashboard/plan"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02]"
            >
              <Calendar className="w-5 h-5" />
              <span>AI Trip Planner</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-slate-900/50 border-t border-slate-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Explore Khyber Pakhtunkhwa Smartly
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              Everything you need for an unforgettable journey in northern Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Category-Based Discovery</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Find hotels, historical places, shopping spots, and hospitals inside every district of KPK.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Google Gemini AI</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate tailored itineraries utilizing real KPK places from our database to ground recommendations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Interactive Leaflet Maps</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Interact with physical maps pinpointing locations alongside live weather updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
