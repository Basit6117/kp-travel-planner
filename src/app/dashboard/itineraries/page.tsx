import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Itinerary from '@/models/Itinerary';
import { Sparkles } from 'lucide-react';
import ItineraryCard from '@/components/ItineraryCard';

export default async function ItinerariesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/login');

  await dbConnect();
  const userId = (session.user as any).id;
  const itineraries = await Itinerary.find({ userId })
    .populate('cityId', 'name coverImage')
    .sort({ createdAt: -1 })
    .lean();

  // Serialize Mongoose documents for the client component
  const serialized = JSON.parse(JSON.stringify(itineraries));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">My Itineraries</h1>
          <p className="text-slate-400 text-sm mt-1">
            {itineraries.length} trip{itineraries.length !== 1 ? 's' : ''} planned
          </p>
        </div>
        <Link
          href="/dashboard/plan"
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Trip</span>
        </Link>
      </div>

      {serialized.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-700" />
          <p className="font-bold text-slate-300 text-lg mb-2">No itineraries yet</p>
          <p className="text-slate-500 text-sm mb-6">
            Generate your first AI-powered travel plan to get started.
          </p>
          <Link
            href="/dashboard/plan"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors inline-block"
          >
            Plan a Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serialized.map((itin: any) => (
            <ItineraryCard key={itin._id} itinerary={itin} />
          ))}
        </div>
      )}
    </div>
  );
}

