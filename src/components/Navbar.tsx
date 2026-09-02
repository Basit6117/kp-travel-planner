'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Compass, Calendar, User as UserIcon, LogOut, Menu, X, ShieldAlert, Award } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors">
              <Award className="w-6 h-6" />
              <span>KPK Travel Explorer</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/explore" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1">
                <Compass className="w-4 h-4" />
                <span>Explore</span>
              </Link>
              <Link href="/about" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </Link>

              {status === 'authenticated' ? (
                <>
                  <Link href="/dashboard" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Plan & Trips</span>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 text-amber-300 border border-amber-500/30 bg-amber-500/10">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link href="/dashboard/profile" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>Profile ({session.user?.name})</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="hover:text-rose-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 text-slate-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                status !== 'loading' && (
                  <div className="flex items-center space-x-3 ml-4">
                    <Link href="/login" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Log In
                    </Link>
                    <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-emerald-900/30">
                      Register
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/explore" onClick={() => setIsOpen(false)} className="hover:text-emerald-400 block px-3 py-2 rounded-md text-base font-medium transition-colors">
            Explore
          </Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-emerald-400 block px-3 py-2 rounded-md text-base font-medium transition-colors">
            About
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-emerald-400 block px-3 py-2 rounded-md text-base font-medium transition-colors">
            Contact
          </Link>

          {status === 'authenticated' ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-emerald-400 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                Plan & Trips
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="text-amber-300 hover:text-amber-400 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  Admin Panel
                </Link>
              )}
              <Link href="/dashboard/profile" onClick={() => setIsOpen(false)} className="hover:text-emerald-400 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                Profile ({session.user?.name})
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full text-left text-rose-400 hover:text-rose-300 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            status !== 'loading' && (
              <div className="pt-4 pb-2 border-t border-slate-800 px-3 space-y-2">
                <Link href="/login" onClick={() => setIsOpen(false)} className="block text-center text-slate-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors">
                  Log In
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="block text-center bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-base font-medium transition-all">
                  Register
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
