import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg tracking-wider text-emerald-400">KPK Travel Explorer</h3>
            <p className="text-sm max-w-sm">
              Discover the breathtaking beauty, historic spots, and rich culture of Khyber Pakhtunkhwa (KPK), Pakistan. Our AI travel itinerary planner custom-builds your adventure.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="hover:text-emerald-400 transition-colors">Explore Categories</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">About KPK</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li>Peshawar, KP, Pakistan</li>
              <li>info@kpktravel.com</li>
              <li>+92 (91) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} KPK Travel Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
