'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SavedCarsPage() {
  const [savedCars, setSavedCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Pull the saved cars from the browser's local storage
    const cars = JSON.parse(localStorage.getItem('saved_cars') || '[]');
    setSavedCars(cars);
    setIsLoading(false);
  }, []);

  // Remove a car directly from this page
  const removeCar = (carId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the Link from clicking through to the details page
    const updatedCars = savedCars.filter(car => car.id !== carId);
    setSavedCars(updatedCars);
    localStorage.setItem('saved_cars', JSON.stringify(updatedCars));
  };

  return (
    <main className="min-h-screen bg-black pt-32 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">My Garage</h1>
            <p className="text-zinc-400 mt-2">Vehicles you have saved for later.</p>
          </div>
          <Link href="/" className="text-sm text-zinc-400 hover:text-white border border-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-900 transition">
            Back to Marketplace
          </Link>
        </div>

        {isLoading ? (
          <div className="text-zinc-500">Loading saved vehicles...</div>
        ) : savedCars.length === 0 ? (
          <div className="text-center py-24 bg-zinc-950 border border-zinc-900 rounded-2xl">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No saved vehicles yet</h3>
            <p className="text-zinc-500 mb-6">Click the heart icon on any listing to save it here.</p>
            <Link href="/" className="bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-zinc-200 transition">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCars.map((car) => {
              const primaryImage = car.image_urls && car.image_urls.length > 0 ? car.image_urls[0] : car.image_url;

              return (
                <Link href={`/${car.id}`} key={car.id} className="group block relative">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group-hover:border-zinc-500 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                    
                    {/* Quick Remove Button */}
                    <button 
                      onClick={(e) => removeCar(car.id, e)}
                      className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md p-2 rounded-full hover:bg-red-500 transition-colors border border-white/10 text-white hover:text-white"
                      title="Remove from saved"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div className="h-[220px] bg-zinc-800 relative overflow-hidden">
                      {primaryImage ? (
                        <img src={primaryImage} alt={car.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-500">No Image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-lg font-bold text-white mb-2 line-clamp-1">{car.title}</h2>
                      <div className="text-2xl font-bold text-green-400">{car.price.toLocaleString()} ETB</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}