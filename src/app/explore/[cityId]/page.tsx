import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, Hotel, ShoppingBag, Stethoscope, Compass } from 'lucide-react';
import dbConnect from '@/lib/dbConnect';
import City from '@/models/City';
import Category from '@/models/Category';
import Place from '@/models/Place';

export const revalidate = 0;

const ICON_MAP: Record<string, any> = {
  'Hotels': Hotel,
  'Historical Places': Landmark,
  'Malls / Shopping': ShoppingBag,
  'Hospitals': Stethoscope,
  'General / Tourist Attractions': Compass,
};

export default async function CityCategoriesPage({ params }: { params: { cityId: string } }) {
  await dbConnect();
  
  const city = await City.findById(params.cityId);
  if (!city) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        <h1 className="text-2xl font-bold text-white mb-2">Destination Not Found</h1>
        <p className="mb-4">The requested destination does not exist in our database.</p>
        <Link href="/explore" className="text-emerald-400 hover:underline">&larr; Back to Destinations</Link>
      </div>
    );
  }

  const categories = await Category.find({}).sort({ name: 1 });

  // Get place counts for each category in this city
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat: any) => {
      const count = await Place.countDocuments({
        cityId: city._id,
        categoryId: cat._id,
        parentPlaceId: null, // count top-level category places
      });
      return {
        _id: cat._id.toString(),
        name: cat.name,
        count,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/explore" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>Back to Destinations</span>
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-12 shadow-xl">
        <div className="aspect-[21/9] w-full relative overflow-hidden bg-slate-800">
          <img 
            src={city.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'} 
            alt={city.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-wide mb-2">{city.name}</h1>
            <p className="text-emerald-400 font-semibold text-sm sm:text-base">{city.provinceRegion}</p>
          </div>
        </div>
        <div className="p-8">
          <h2 className="text-xl font-bold text-white mb-4">About {city.name}</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
            {city.description}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-8">What are you looking for?</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map((cat) => {
            const IconComponent = ICON_MAP[cat.name] || Compass;
            return (
              <Link
                key={cat._id}
                href={`/explore/${params.cityId}/${cat._id}`}
                className="group p-6 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl flex items-center space-x-4 transition-all hover:scale-[1.01] hover:-translate-y-0.5"
              >
                <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg tracking-wide group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {cat.count} {cat.count === 1 ? 'place' : 'places'} found
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
