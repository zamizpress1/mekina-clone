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
  const CARS_PER_PAGE = 9; // Loads 9 cars at a time (a clean 3x3 grid)
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchCars(true);
  }, [searchTerm, selectedMake, minPrice, maxPrice]); // Re-fetch if filters change

  // The main fetch function
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
      .select('*', { count: 'exact' }) // Get the total count to know if we hit the end
      .order('created_at', { ascending: false })
      .range(fromIndex, toIndex);

    // Apply Filters if they exist
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
      
      // Determine if there are more cars to load in the database
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
      // We rely on the useEffect hook not firing here. 
      // We manually fetch the next set after updating the state.
      setTimeout(() => fetchCars(false), 0);
      return nextPage;
    });
  };

  // Extract unique makes for the dropdown
  const uniqueMakes = Array.from(new Set(cars.map(car => car.make))).filter(Boolean);

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-zinc-950 pt-32 pb-16 px-4 md:px-8 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Verified Listings</h1>
              <span className="bg-zinc-900 text-zinc-400 text-xs px-3 py-1 rounded-full border border-zinc-800">አማርኛ</span>
            </div>
            <Link href="/post-car" className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition whitespace-nowrap shadow-lg shadow-white/5">
              Post a Car
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search model or year..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
            <select 
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition appearance-none md:w-48"
            >
              <option value="">All Makes</option>
              {uniqueMakes.map(make => (
                <option key={make as string} value={make as string}>{make as string}</option>
              ))}
            </select>
            <div className="flex gap-2 md:w-72">
              <input 
                type="number" 
                placeholder="Min Price" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition"
              />
              <input 
                type="number" 
                placeholder="Max Price" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Car Grid Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-zinc-900 h-[350px] rounded-2xl border border-zinc-800"></div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No vehicles found</h3>
              <p className="text-zinc-500">Try adjusting your filters or searching for something else.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => {
                  const primaryImage = car.image_urls && car.image_urls.length > 0 
                    ? car.image_urls[0] 
                    : car.image_url;

                  return (
                    <Link href={`/${car.id}`} key={car.id} className="group block">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group-hover:border-zinc-500 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                        
                        {/* Image Container */}
                        <div className="h-[220px] bg-zinc-800 relative overflow-hidden">
                          {primaryImage ? (
                            <img src={primaryImage} alt={car.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-zinc-500">No Image</div>
                          )}
                          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium border border-white/10">
                            {car.condition}
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-bold text-white group-hover:text-zinc-300 transition-colors line-clamp-1">{car.title}</h2>
                          </div>
                          
                          <div className="text-2xl font-bold text-green-400 mb-4">
                            {car.price.toLocaleString()} ETB
                          </div>

                          <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 bg-zinc-950 p-3 rounded-xl border border-zinc-800/50">
                            <div className="flex flex-col"><span className="text-zinc-600 mb-0.5">YEAR</span><span className="text-zinc-300">{car.year}</span></div>
                            <div className="w-px h-6 bg-zinc-800"></div>
                            <div className="flex flex-col"><span className="text-zinc-600 mb-0.5">TRANS</span><span className="text-zinc-300">{car.transmission}</span></div>
                            <div className="w-px h-6 bg-zinc-800"></div>
                            <div className="flex flex-col"><span className="text-zinc-600 mb-0.5">FUEL</span><span className="text-zinc-300">{car.fuel_type}</span></div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* NEW: Load More Button */}
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-zinc-900 border border-zinc-800 text-white font-semibold px-8 py-3 rounded-full hover:bg-zinc-800 transition shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Loading...
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