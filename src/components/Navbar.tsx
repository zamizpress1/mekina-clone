'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          Mekina<span className="text-green-500">Clone</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* NEW: Saved Cars Link */}
          <Link href="/saved" className="text-zinc-400 hover:text-red-400 transition flex items-center gap-1.5 font-medium text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <span className="hidden md:inline">Saved</span>
          </Link>

          <div className="w-px h-6 bg-zinc-800 hidden md:block"></div>

          {/* Action Buttons */}
          <Link href="/post-car" className="text-zinc-300 hover:text-white text-sm font-semibold transition hidden md:block">
            Post Car
          </Link>
          
          <Link href="/login" className="bg-zinc-900 border border-zinc-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-800 transition">
            Login / Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}