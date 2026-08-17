'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [car, setCar] = useState<any>(null);
  const [similarCars, setSimilarCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0); 
  
  // NEW: Favorites State
  const [isFavorite, setIsFavorite] = useState(false);
  
  const supabase = createClient();
  const TELEGRAM_USERNAME = 'hulecar'; // Update this!

  useEffect(() => {
    async function fetchCarDetails() {
      if (!params.id) return;
      
      // Check Admin Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === 'zamizpress.1@gmail.com') {
        setIsAdmin(true);
      }

      // Fetch Car
      const { data: currentCar, error } = await supabase
        .from('car_listings')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && currentCar) {
        setCar(currentCar);
        
        // Check if saved in LocalStorage
        const savedCars = JSON.parse(localStorage.getItem('saved_cars') || '[]');
        if (savedCars.some((savedCar: any) => savedCar.id === currentCar.id)) {
          setIsFavorite(true);
        }
        
        // Fetch Similar
        const { data: similarData } = await supabase
          .from('car_listings')
          .select('*')
          .eq('make', currentCar.make)
          .neq('id', currentCar.id)
          .limit(3);
          
        if (similarData) setSimilarCars(similarData);
      }
      setIsLoading(false);
    }

    fetchCarDetails();
  }, [params.id]);

  // NEW: Toggle Favorite Function
  const toggleFavorite = () => {
    let savedCars = JSON.parse(localStorage.getItem('saved_cars') || '[]');
    
    if (isFavorite) {
      // Remove it
      savedCars = savedCars.filter((savedCar: any) => savedCar.id !== car.id);
      setIsFavorite(false);
    } else {
      // Save it (we save the whole car object so we can display it on a saved page later)
      savedCars.push(car);
      setIsFavorite(true);
    }
    
    localStorage.setItem('saved_cars', JSON.stringify(savedCars));
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this listing? This cannot be undone.");
    if (!isConfirmed) return;

    try {
      const { error } = await supabase.from('car_listings').delete().eq('id', car.id);
      if (error) throw error;
      alert('Listing successfully deleted.');
      router.push('/'); 
    } catch (error: any) {
      alert(error.message || 'Failed to delete listing.');
    }
  };

  if (isLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
  if (!car) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
      <p className="mb-4">Vehicle not found.</p>
      <Link href="/" className="bg-white text-black px-4 py-2 rounded-lg font-semibold">Back to Home</Link>
    </div>
  );

  const images = car.image_urls && car.image_urls.length > 0 ? car.image_urls : car.image_url ? [car.image_url] : [];

  // Quick Action Telegram Links
  const baseMessage = `Hello! I am inquiring about the ${car.year} ${car.make} ${car.model} (Ref ID: ${car.id}).`;
  const defaultLink = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(baseMessage)}`;
  const availableLink = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(baseMessage + " Is this vehicle still available?")}`;
  const negotiateLink = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(baseMessage + ` It is listed at ${car.price.toLocaleString()} ETB. Are you open to negotiation?`)}`;

  return (
    <main className="min-h-screen bg-zinc-950 p-8 pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white mb-6 inline-block">&larr; Back to Listings</Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl mb-12 relative">
          
          {/* NEW: Floating Favorite Button */}
          <button 
            onClick={toggleFavorite}
            className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md p-3 rounded-full hover:bg-black/80 transition-all active:scale-90 group border border-zinc-700/50"
            title="Save to Favorites"
          >
            <svg 
              className={`w-6 h-6 transition-colors duration-300 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white group-hover:text-red-400'}`} 
              fill={isFavorite ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>

          {/* Main Image Display */}
          <div className="h-[400px] md:h-[500px] bg-zinc-800 flex items-center justify-center border-b border-zinc-800 relative overflow-hidden group">
            {images.length > 0 ? (
              <>
                <img src={images[activeImageIndex]} alt={`${car.title} view ${activeImageIndex + 1}`} className="object-cover w-full h-full transition-opacity duration-300" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">&#8592;</button>
                    <button onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">&#8594;</button>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium">{activeImageIndex + 1} / {images.length}</div>
                  </>
                )}
              </>
            ) : (
              <span className="text-zinc-500 text-lg">No Images Available</span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 bg-zinc-950 border-b border-zinc-800 overflow-x-auto overflow-y-hidden snap-x scrollbar-hide">
              {images.map((url: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden snap-center transition-all ${activeImageIndex === idx ? 'ring-2 ring-white scale-105 z-10' : 'opacity-60 hover:opacity-100'}`}>
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full uppercase tracking-wider">{car.condition}</span>
                <h1 className="text-3xl font-bold text-white mt-2">{car.title}</h1>
              </div>
              <p className="text-3xl font-bold text-green-400">{car.price.toLocaleString()} ETB</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
              <div><p className="text-zinc-500 text-xs uppercase">Year</p><p className="text-white font-semibold">{car.year}</p></div>
              <div><p className="text-zinc-500 text-xs uppercase">Transmission</p><p className="text-white font-semibold">{car.transmission}</p></div>
              <div><p className="text-zinc-500 text-xs uppercase">Fuel Type</p><p className="text-white font-semibold">{car.fuel_type}</p></div>
              <div><p className="text-zinc-500 text-xs uppercase">Make</p><p className="text-white font-semibold">{car.make}</p></div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-zinc-300 bg-zinc-950 p-4 rounded-xl border border-zinc-800 whitespace-pre-line">{car.description}</p>
            </div>

            {/* Jiji-Style Safety Banner */}
            <div className="mb-8 bg-amber-900/20 border border-amber-900/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <h3 className="text-amber-500 font-bold">Safety Tips for Buyers</h3>
              </div>
              <ul className="text-amber-200/80 text-sm space-y-2 ml-7 list-disc">
                <li>Never send money in advance, even for delivery or "reserving" the car.</li>
                <li>Always meet the seller in a safe, public place.</li>
              </ul>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl text-center space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Interested in this vehicle?</h3>
                <p className="text-zinc-400 text-sm mt-1">Contact our brokerage team directly.</p>
              </div>
              
              {/* Primary Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+251930175564" className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition text-center flex items-center justify-center gap-2">
                  📞 +251 93 017 5564
                </a>
                <a href={defaultLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#229ED9] text-white font-bold py-3 rounded-xl hover:bg-[#1c88ba] transition text-center flex items-center justify-center gap-2">
                  Message on Telegram
                </a>
              </div>

              {/* NEW: Quick Action Chips */}
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-3">Quick Actions</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href={availableLink} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 shadow-sm">
                    <span>👋</span> Is this available?
                  </a>
                  <a href={negotiateLink} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 shadow-sm">
                    <span>💰</span> Negotiate Price
                  </a>
                </div>
              </div>

              {/* Secret Admin View */}
              {isAdmin && (
                <div className="mt-6 pt-6 border-t border-zinc-800 text-left">
                  <p className="text-xs text-amber-400 font-semibold uppercase mb-4 text-center">Admin Control Panel</p>
                  <div className="space-y-4">
                    {showPhone ? (
                      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 text-center">
                        <p className="text-zinc-400 text-sm mb-1">Owner Direct Phone:</p>
                        <p className="text-green-400 font-bold text-xl">{car.seller_phone || 'No phone provided by seller'}</p>
                      </div>
                    ) : (
                      <button onClick={() => setShowPhone(true)} className="w-full bg-zinc-800 text-zinc-300 px-4 py-3 rounded-lg hover:bg-zinc-700 transition font-semibold">Reveal Owner's Private Number</button>
                    )}
                    <button onClick={handleDelete} className="w-full bg-red-900/20 text-red-400 border border-red-900/50 px-4 py-3 rounded-lg hover:bg-red-900/40 hover:text-red-300 transition font-semibold">Delete This Listing</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}