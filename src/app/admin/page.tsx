import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import City from '@/models/City';
import Place from '@/models/Place';
import Itinerary from '@/models/Itinerary';
import AdminStatsClient from '@/components/AdminStatsClient';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    redirect('/');
  }

  await dbConnect();

  const [totalUsers, totalCities, totalPlaces, totalItineraries, recentUsers, recentItineraries] =
    await Promise.all([
      User.countDocuments({}),
      City.countDocuments({}),
      Place.countDocuments({}),
      Itinerary.countDocuments({}),
      User.find({}).sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean(),
      Itinerary.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name')
        .populate('cityId', 'name')
        .lean(),
    ]);

  const stats = { totalUsers, totalCities, totalPlaces, totalItineraries };

  // Build chart data (itineraries by day for last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of the KPK Travel Explorer platform</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/places" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500">Manage places</Link>
          <Link href="/admin/cities" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white">Manage cities</Link>
        </div>
      </div>

      <AdminStatsClient
        stats={stats}
        recentUsers={JSON.parse(JSON.stringify(recentUsers))}
        recentItineraries={JSON.parse(JSON.stringify(recentItineraries))}
        chartDays={last7Days}
      />
    </div>
  );
}
