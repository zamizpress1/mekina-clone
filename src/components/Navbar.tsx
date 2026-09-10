'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Correct Master Admin Email Check
  const isMasterAdmin = user?.email === 'zamizpress.1@gmail.com';

  return (
    <>
      <nav className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white tracking-tight">
            Mekina<span className="text-green-500">Clone</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 md:gap-6">
            
            <Link href="/saved" className="text-zinc-400 hover:text-red-400 transition flex items-center gap-1.5 font-medium text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              <span className="hidden md:inline">Saved</span>
            </Link>

            <div className="w-px h-6 bg-zinc-800 hidden md:block"></div>

            <Link href="/post-car" className="text-zinc-300 hover:text-white text-sm font-semibold transition hidden md:block">
              + Post car
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                {isMasterAdmin && (
                  <Link href="/admin" className="text-red-400 hover:text-red-300 text-sm font-bold transition border border-red-900/50 bg-red-900/20 px-3 py-1.5 rounded-lg shadow-inner flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Vault
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-700 hover:text-white transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-white border border-transparent text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-zinc-200 transition">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Floating + Post car Button */}
      <Link
        href="/post-car"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-400 text-zinc-950 font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-green-400/30"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        <span>Post car</span>
      </Link>
    </>
  );
}