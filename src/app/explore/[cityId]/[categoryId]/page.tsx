import React from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import City from '@/models/City';
import Category from '@/models/Category';
import Place from '@/models/Place';
import PlaceListClient from '@/components/PlaceListClient';

export const revalidate = 0;

export default async function CategoryPlacesPage({
  params
}: {
  params: { cityId: string; categoryId: string };
}) {
  await dbConnect();

  const city = await City.findById(params.cityId);
  const category = await Category.findById(params.categoryId);

  if (!city || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        <h1 className="text-2xl font-bold text-white mb-2">Not Found</h1>
        <p className="mb-4">The requested destination or category does not exist.</p>
        <Link href="/explore" className="text-emerald-400 hover:underline">&larr; Back to Destinations</Link>
      </div>
    );
  }

  // Get all top-level places in this city and category
  const topPlaces = await Place.find({
    cityId: city._id,
    categoryId: category._id,
    parentPlaceId: null,
  }).lean();

  // For each top-level place, find its children (sub-places)
  const placesWithChildren = await Promise.all(
    topPlaces.map(async (place: any) => {
      const children = await Place.find({ parentPlaceId: place._id }).lean();
      return {
        ...place,
        _id: place._id.toString(),
        cityId: place.cityId.toString(),
        categoryId: place.categoryId.toString(),
        parentPlaceId: place.parentPlaceId ? place.parentPlaceId.toString() : null,
        children: children.map((child: any) => ({
          ...child,
          _id: child._id.toString(),
          cityId: child.cityId.toString(),
          categoryId: child.categoryId.toString(),
          parentPlaceId: child.parentPlaceId ? child.parentPlaceId.toString() : null,
        })),
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb / Back button */}
      <div className="flex flex-wrap items-center space-x-2 text-sm text-slate-400 mb-8">
        <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
        <span>&middot;</span>
        <Link href={`/explore/${city._id}`} className="hover:text-white transition-colors">{city.name}</Link>
        <span>&middot;</span>
        <span className="text-emerald-400 font-semibold">{category.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide mb-1">
            {category.name} in {city.name}
          </h1>
          <p className="text-slate-400 text-sm">
            Browse through curated listings and check detailed guides.
          </p>
        </div>
      </div>

      <PlaceListClient 
        city={JSON.parse(JSON.stringify(city))} 
        category={JSON.parse(JSON.stringify(category))} 
        places={placesWithChildren} 
      />
    </div>
  );
}
