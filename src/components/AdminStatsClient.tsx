'use client';

import React from 'react';
import Link from 'next/link';
import { Users, MapPin, LayoutGrid, Calendar, Building2, Tag, Database } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AdminStatsClientProps {
  stats: { totalUsers: number; totalCities: number; totalPlaces: number; totalItineraries: number };
  recentUsers: any[];
  recentItineraries: any[];
  chartDays: string[];
}

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'totalCities', label: 'KPK Destinations', icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { key: 'totalPlaces', label: 'Total Places', icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { key: 'totalItineraries', label: 'AI Itineraries', icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
];

const PIE_COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b'];

export default function AdminStatsClient({ stats, recentUsers, recentItineraries, chartDays }: AdminStatsClientProps) {
  const pieData = [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Destinations', value: stats.totalCities },
    { name: 'Places', value: stats.totalPlaces },
    { name: 'Itineraries', value: stats.totalItineraries },
  ];

  const barData = chartDays.map((day, i) => ({
    day,
    itineraries: Math.floor(Math.random() * 8), // placeholder - in production aggregate from DB
  }));

  return (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className={`bg-slate-900 border ${card.border} rounded-2xl p-5`}>
              <div className={`${card.bg} p-3 rounded-xl w-fit ${card.color} mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-white">{(stats as any)[card.key]}</p>
              <p className="text-slate-400 text-xs font-medium mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-white text-sm mb-6">Itineraries Generated (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              <Bar dataKey="itineraries" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-white text-sm mb-6">Platform Data Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Nav Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { href: '/admin/cities', label: 'Cities', icon: Building2 },
          { href: '/admin/categories', label: 'Categories', icon: Tag },
          { href: '/admin/places', label: 'Places', icon: MapPin },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/messages', label: 'Messages', icon: Database },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl text-center text-xs font-semibold text-slate-300 hover:text-white transition-all group"
            >
              <Icon className="w-5 h-5 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Recent Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Recent Registrations</h3>
          <Link href="/admin/users" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead className="bg-slate-950/50 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-medium text-white">{u.name}</td>
                  <td className="px-6 py-3 text-slate-400">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
