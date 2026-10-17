import React from 'react';
import { ShieldCheck, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-wide mb-4">
          About Khyber Pakhtunkhwa (KPK)
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto">
          Nestled in the northwest of Pakistan, KPK is a land of legends, high mountain passes, rich Gandharan history, and unparalleled natural beauty.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Scenic KPK Mountains" 
            className="rounded-3xl shadow-xl border border-slate-800"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
            A Land of Diversity and Adventure
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            From the bustling ancient markets of Peshawar to the alpine meadows of Swat, Naran, and Kaghan Valley, KPK offers a range of experiences. It hosts historical monuments like Takht-i-Bahi that speak of its rich Buddhist past, and valleys like Chitral and Kalash that present uniquely preserved cultures.
          </p>
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Our platform, <strong>KPK Travel Explorer</strong>, was built as a Final Year Project to bridge the gap between travellers and the local infrastructure. By cataloguing hotels, tourist spots, historical zones, and medical facilities, we allow you to explore with complete confidence.
          </p>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-6">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Our Mission</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            To promote local tourism in KPK while safeguarding traveler safety through cached real-time weather and exact mapped guides.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Grounded Recommendations</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Unlike general travel agents, our AI itinerary generator coordinates with actual local database locations to prevent hallucinations.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-6">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Hospitality First</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Promoting the legendary hospitality of the Pashtun and Kalash cultures, offering travelers guides they can rely on.
          </p>
        </div>
      </div>
    </div>
  );
}
