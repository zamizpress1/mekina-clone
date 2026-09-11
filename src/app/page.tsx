'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';

export default function Home() {
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const CARS_PER_PAGE = 9;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchCars(true);
  }, [searchTerm, selectedMake, minPrice, maxPrice]);

  const fetchCars = async (resetList = false) => {
    if (resetList) {
      setIsLoading(true);
      setPage(1);
    } else {
      setIsLoadingMore(true);
    }

    const currentPage = resetList ? 1 : page;
    const fromIndex = (currentPage - 1) * CARS_PER_PAGE;
    const toIndex = fromIndex + CARS_PER_PAGE - 1;

    let query = supabase
      .from('car_listings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(fromIndex, toIndex);

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
    }
    if (selectedMake) query = query.eq('make', selectedMake);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

    const { data, error, count } = await query;

    if (!error && data) {
      if (resetList) {
        setCars(data);
      } else {
        setCars((prevCars) => [...prevCars, ...data]);
      }

      if (count !== null) {
        setHasMore(fromIndex + data.length < count);
      }
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  };

  const handleLoadMore = () => {
    setPage((prevPage) => {
      const nextPage = prevPage + 1;
      setTimeout(() => fetchCars(false), 0);
      return nextPage;
    });
  };

  const uniqueMakes = Array.from(new Set(cars.map(car => car.make))).filter(Boolean);

  // YOUR CENTRALIZED DEALER CONTACT INFO
  const ADMIN_PHONE = "+251905868312";
  const ADMIN_TELEGRAM = "hulecar"; // e.g., "https://t.me/prime"

  return (
    <main className="min-h-screen bg-zinc-950 text-white relative selection:bg-green-500/30">

      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-16 px-4 md:px-8 overflow-hidden border-b border-zinc-900/50">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Premium Listings</h1>
                <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20 font-medium">Verified</span>
              </div>
              <p className="text-zinc-400">Discover the best vehicles in Addis Ababa.</p>
            </div>
            <Link href="/list-car" className="bg-white text-black font-bold px-8 py-3.5 rounded-xl hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] whitespace-nowrap">
              Post a Car
            </Link>
          </div>

          {/* Glassmorphism Filter Bar */}
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder="Search model or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition placeholder:text-zinc-600"
              />
            </div>

            <div className="w-px bg-zinc-800 hidden md:block my-2"></div>

            <div className="relative md:w-48">
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full bg-transparent text-white rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition appearance-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900">All Makes</option>
                {uniqueMakes.map(make => (
                  <option key={make as string} value={make as string} className="bg-zinc-900">{make as string}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="w-px bg-zinc-800 hidden md:block my-2"></div>

            <div className="flex gap-2 md:w-80">
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-transparent text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition placeholder:text-zinc-600"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-transparent text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Car Feed */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-zinc-900/50 h-[450px] rounded-3xl border border-zinc-800/50"></div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800/30 backdrop-blur-sm">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700/50">
                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No vehicles found</h3>
              <p className="text-zinc-500">Try adjusting your filters to see more cars.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => {
                  const primaryImage = car.image_urls && car.image_urls.length > 0
                    ? car.image_urls[0]
                    : car.image_url;

                  return (
                    <div key={car.id} className="group bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/60 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all duration-500 shadow-xl flex flex-col">

                      {/* Image Container with Link */}
                      <Link href={`/${car.id}`} className="block relative h-[240px] overflow-hidden bg-zinc-950">
                        {primaryImage ? (
                          <img src={primaryImage} alt={car.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-zinc-600">No Image Available</div>
                        )}
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80"></div>

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/10">
                          {car.condition}
                        </div>
                      </Link>

                      {/* Content Container */}
                      <div className="p-6 flex flex-col flex-1">
                        <Link href={`/${car.id}`} className="block flex-1">
                          <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1 mb-1">
                            {car.title}
                          </h2>
                          <div className="text-2xl font-black text-white mb-5 tracking-tight">
                            {car.price.toLocaleString()} <span className="text-sm font-medium text-zinc-500">ETB</span>
                          </div>

                          {/* Spec Badges */}
                          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 mb-6 flex-wrap">
                            <span className="bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/50">{car.year}</span>
                            <span className="bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/50">{car.transmission}</span>
                            <span className="bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/50">{car.fuel_type}</span>
                          </div>
                        </Link>

                        {/* ONE-CLICK CONTACT BUTTONS (Admin Controlled) */}
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <a
                            href={`tel:${ADMIN_PHONE}`}
                            className="bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM19 12h2a9 9 0 00-9-9v2c3.9 0 7.1 3.1 7 7z" /><path d="M15 12h2c0-2.8-2.2-5-5-5v2c1.7 0 3 1.3 3 3z" /></svg>
                            Call Dealer
                          </a>
                          <a
                            href={ADMIN_TELEGRAM}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#2AABEE] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#229ED9] active:scale-95 transition-all shadow-[0_0_15px_rgba(42,171,238,0.2)]"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.21 3.45-.49.33-.94.5-1.34.49-.44-.01-1.28-.24-1.9-.44-.77-.25-1.38-.38-1.33-.8.03-.22.34-.44.93-.68 3.63-1.58 6.05-2.63 7.27-3.13 3.46-1.42 4.18-1.68 4.65-1.69.1 0 .34.02.47.12.11.08.15.2.16.35-.01.12-.02.26-.04.42z" /></svg>
                            Telegram
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="mt-16 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-white font-bold px-8 py-4 rounded-xl hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50 flex items-center gap-3"
                  >
                    {isLoadingMore ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Loading Vehicles...
                      </>
                    ) : (
                      'Load More Vehicles'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}