'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';

export default function AdminDashboard() {
  // Vault Security States
  const [pin, setPin] = useState('');
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  
  // CHANGE THIS TO YOUR SECRET PASSCODE!
  const MASTER_PIN = '778899'; 

  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Edit Modal State
  const [editingCar, setEditingCar] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', description: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuthAndFetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Strict Security Check 1: Email Validation
      if (!user || user.email !== 'zamizpress.1@gmail.com') {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);

      const { data, error } = await supabase
        .from('car_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCars(data);
      }
      setIsLoading(false);
    }

    checkAuthAndFetchData();
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_PIN) {
      setIsPinUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin(''); // clear the input on fail
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the ${title}?`);
    if (!isConfirmed) return;

    try {
      const { error } = await supabase.from('car_listings').delete().eq('id', id);
      if (error) throw error;

      setCars(cars.filter(car => car.id !== id));
      alert('Listing deleted successfully.');
    } catch (error: any) {
      alert(error.message || 'Failed to delete listing.');
    }
  };

  const handleEditClick = (car: any) => {
    setEditingCar(car);
    setEditForm({
      title: car.title,
      price: car.price.toString(),
      description: car.description
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('car_listings')
        .update({
          title: editForm.title,
          price: parseFloat(editForm.price),
          description: editForm.description
        })
        .eq('id', editingCar.id);

      if (error) throw error;

      setCars(cars.map(car => car.id === editingCar.id ? { ...car, title: editForm.title, price: parseFloat(editForm.price), description: editForm.description } : car));
      
      setEditingCar(null); 
      alert('Listing updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update listing.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Verifying Credentials...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2 border border-red-500/20">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Access Denied</h1>
        <p className="text-zinc-500 pb-4">You do not have permission to view the master dashboard.</p>
        <Link href="/" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg">Return to Homepage</Link>
      </div>
    );
  }

  // --- THE MASTER PIN LOCK SCREEN ---
  if (!isPinUnlocked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-sm bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col items-center">
          
          <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 shadow-inner">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Vault Locked</h1>
          <p className="text-zinc-500 text-sm mb-8 text-center">Enter the master passcode to access seller data.</p>

          <form onSubmit={handlePinSubmit} className="w-full">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={`w-full bg-zinc-950 border ${pinError ? 'border-red-500' : 'border-zinc-800'} text-white text-center text-2xl tracking-widest rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all mb-4 font-mono`}
              placeholder="••••••"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-xs text-center font-bold mb-4">INCORRECT PIN</p>}
            
            <button
              type="submit"
              className="w-full bg-white text-black font-bold rounded-xl px-4 py-3.5 hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg"
            >
              Unlock Dashboard
            </button>
          </form>
          
          <Link href="/" className="mt-6 text-xs text-zinc-500 hover:text-white transition-colors">
            Cancel and Return Home
          </Link>
        </div>
      </main>
    );
  }

  // --- THE ACTUAL ADMIN DASHBOARD ---
  return (
    <main className="min-h-screen bg-zinc-950 p-4 md:p-8 pt-24 relative">
      
      {/* Edit Modal Overlay */}
      {editingCar && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Edit Listing</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Title</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Price (ETB)</label>
                <input 
                  type="number" 
                  value={editForm.price} 
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2 focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingCar(null)}
                  className="flex-1 bg-zinc-800 text-zinc-300 font-semibold py-2.5 rounded-lg hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1 bg-white text-black font-bold py-2.5 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">Master Broker Dashboard</h1>
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">Top Secret</span>
            </div>
            <p className="text-zinc-400 text-sm">Manage inventory, adjust prices, and access private seller contact numbers.</p>
          </div>
          <button 
            onClick={() => setIsPinUnlocked(false)} 
            className="text-sm text-zinc-400 hover:text-white border border-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-900 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lock Vault & Exit
          </button>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Price (ETB)</th>
                  <th className="px-6 py-4">Owner Phone</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {cars.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No cars currently listed.</td>
                  </tr>
                ) : (
                  cars.map((car) => {
                    const primaryImage = car.image_urls && car.image_urls.length > 0 
                      ? car.image_urls[0] 
                      : car.image_url;

                    return (
                      <tr key={car.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-zinc-950 rounded overflow-hidden flex-shrink-0 border border-zinc-800">
                              {primaryImage ? (
                                <img src={primaryImage} alt={car.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600">No Img</div>
                              )}
                            </div>
                            <div>
                              <Link href={`/${car.id}`} className="font-bold text-white hover:text-green-400 transition">
                                {car.title}
                              </Link>
                              <div className="text-xs text-zinc-500 mt-1">{car.year} • {car.make}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {car.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-green-500/20 flex items-center gap-2 w-max shadow-inner">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {car.seller_phone || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleEditClick(car)}
                            className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-700 hover:text-white transition text-xs font-semibold shadow-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(car.id, car.title)}
                            className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition text-xs font-semibold shadow-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}