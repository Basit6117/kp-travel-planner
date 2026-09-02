import React from 'react';
import dbConnect from '@/lib/dbConnect';
import City from '@/models/City';
import ExploreClient from '@/components/ExploreClient';

// Destination content is managed by admins and must reflect additions without
// waiting for a build or route-cache revalidation.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExplorePage() {
  await dbConnect();

  let cities: any[] = [];
  try {
    cities = await City.find({}).sort({ name: 1 }).lean();
  } catch (error) {
    console.error('Error fetching cities:', error);
  }

  const serialized = JSON.parse(JSON.stringify(cities));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Discover KPK Districts &amp; Valleys
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Select a city or valley inside Khyber Pakhtunkhwa to explore hotels, historical places, shopping malls, and local attractions.
        </p>
      </div>

      {serialized.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <p className="text-lg font-medium mb-4">No destinations found in the database.</p>
          <p className="text-sm">Please run the seed script to populate the database with KPK cities and locations:</p>
          <code className="block bg-slate-950 p-3 rounded-lg text-emerald-400 text-xs mt-3 max-w-md mx-auto select-all">
            node src/scripts/seed.js
          </code>
        </div>
      ) : (
        <ExploreClient cities={serialized} />
      )}
    </div>
  );
}
