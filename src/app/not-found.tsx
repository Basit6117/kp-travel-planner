import React from 'react';
import Link from 'next/link';
import { Compass, Home, MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-lg mx-auto space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl mb-2">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <p className="text-emerald-400 font-extrabold text-sm uppercase tracking-widest">
            404 Error • Page Off The Trail
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Destination Not Found
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto pt-2">
            Looks like you&apos;ve wandered into unmapped territory! The page or KPK destination you are looking for doesn&apos;t exist or has moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Explore KPK</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
