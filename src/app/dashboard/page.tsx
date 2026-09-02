import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Itinerary from '@/models/Itinerary';
import { Calendar, MapPin, Sparkles, User as UserIcon, Clock, ShieldAlert } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/login');

  await dbConnect();

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';
  const itineraries = await Itinerary.find({ userId })
    .populate('cityId', 'name coverImage')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const totalItineraries = await Itinerary.countDocuments({ userId });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/20 rounded-3xl p-8 mb-10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-400">
            <UserIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              Welcome back, {session.user.name}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">{session.user.email}</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="bg-slate-950/50 border border-slate-800 px-4 py-2 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">Total Trips</p>
                <p className="text-2xl font-bold text-emerald-400">{totalItineraries}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {isAdmin && (
          <Link href="/admin" className="group bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 p-6 rounded-2xl transition-all hover:-translate-y-1">
            <div className="bg-amber-500/15 p-3 rounded-xl w-fit text-amber-300 mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Admin Control Centre</h3>
            <p className="text-slate-300 text-sm">Add destinations and places, manage categories, users, and messages.</p>
          </Link>
        )}
        <Link href="/dashboard/plan" className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/30 p-6 rounded-2xl transition-all hover:-translate-y-1">
          <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Plan New Trip</h3>
          <p className="text-slate-400 text-sm">Generate a custom AI itinerary for any KPK destination.</p>
        </Link>

        <Link href="/dashboard/itineraries" className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/30 p-6 rounded-2xl transition-all hover:-translate-y-1">
          <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">My Itineraries</h3>
          <p className="text-slate-400 text-sm">View, download, and revisit all your saved travel plans.</p>
        </Link>

        <Link href="/explore" className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/30 p-6 rounded-2xl transition-all hover:-translate-y-1">
          <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Explore KPK</h3>
          <p className="text-slate-400 text-sm">Browse cities, categories, and local attractions.</p>
        </Link>
      </div>

      {/* Recent Itineraries */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Itineraries</h2>
          <Link href="/dashboard/itineraries" className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            View All &rarr;
          </Link>
        </div>

        {itineraries.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-slate-700" />
            <p className="font-medium text-slate-300 mb-2">No trips planned yet!</p>
            <p className="text-sm mb-6">Use the AI Trip Planner to generate your first personalized itinerary.</p>
            <Link href="/dashboard/plan" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors inline-block">
              Start Planning
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {itineraries.map((itin: any) => (
              <Link
                key={itin._id.toString()}
                href={`/dashboard/itineraries/${itin._id.toString()}`}
                className="flex items-center space-x-4 bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  <img
                    src={(itin.cityId as any)?.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {itin.generatedPlan?.tripTitle || `Trip to ${(itin.cityId as any)?.name}`}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-3">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{(itin.cityId as any)?.name}</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{itin.days} days</span>
                    <span className="capitalize">{itin.travelType}</span>
                  </p>
                </div>
                <span className="text-xs text-slate-500 shrink-0 hidden sm:block">
                  {new Date(itin.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
