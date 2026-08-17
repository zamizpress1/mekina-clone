'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';

export default function AdminDashboard() {
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
      
      // Strict Security Check
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

  // Open the edit modal and populate current data
  const handleEditClick = (car: any) => {
    setEditingCar(car);
    setEditForm({
      title: car.title,
      price: car.price.toString(),
      description: car.description
    });
  };

  // Submit the updated data to Supabase
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

      // Update the local state so the table refreshes instantly
      setCars(cars.map(car => car.id === editingCar.id ? { ...car, title: editForm.title, price: parseFloat(editForm.price), description: editForm.description } : car));
      
      setEditingCar(null); // Close modal
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
        <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
        <p>You do not have permission to view the broker dashboard.</p>
        <Link href="/" className="bg-white text-black px-4 py-2 rounded-lg font-semibold">Return to Homepage</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8 pt-24 relative">
      
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Master Broker Dashboard</h1>
            <p className="text-zinc-400 text-sm">Manage inventory, adjust prices, and control the marketplace.</p>
          </div>
          <Link href="/" className="text-sm text-zinc-400 hover:text-white border border-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-900 transition">
            Exit Admin View
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Price (ETB)</th>
                  <th className="px-6 py-4">Owner Phone</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
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
                      <tr key={car.id} className="hover:bg-zinc-950/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                              {primaryImage ? (
                                <img src={primaryImage} alt={car.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600">No Img</div>
                              )}
                            </div>
                            <div>
                              <Link href={`/${car.id}`} className="font-bold text-white hover:text-blue-400 transition">
                                {car.title}
                              </Link>
                              <div className="text-xs text-zinc-500 mt-1">{car.year} • {car.make}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-400">
                          {car.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-zinc-800 text-amber-400 px-3 py-1.5 rounded text-xs font-mono font-bold border border-zinc-700 shadow-inner">
                            {car.seller_phone || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleEditClick(car)}
                            className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded hover:bg-zinc-700 hover:text-white transition text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(car.id, car.title)}
                            className="bg-red-900/20 text-red-400 border border-red-900/50 px-3 py-1.5 rounded hover:bg-red-900/40 hover:text-red-300 transition text-xs font-semibold"
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