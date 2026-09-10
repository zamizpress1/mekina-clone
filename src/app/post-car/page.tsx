'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import imageCompression from 'browser-image-compression';
const router = useRouter();
const [currentUser, setCurrentUser] = useState<any>(null);

useEffect(() => {
  const checkUser = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please sign in first to list a car.');
      router.push('/login');
    } else {
      setCurrentUser(session.user);
    }
  };
  checkUser();
}, [router]);
export default function PostCarPage() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Benzine');
  const [condition, setCondition] = useState('Brand New');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [loadingStatus, setLoadingStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // NEW: Auth loading state

  const router = useRouter();
  const supabase = createClient();

  // NEW: Instantly redirect unauthenticated users before they even see the form
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); // Send them straight to login instantly
      } else {
        setIsCheckingAuth(false); // Only show the form if they are logged in
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Secondary safety check just in case
      if (!authUser) {
        router.push('/login');
        return;
      }

      const uploaderId = authUser.id;
      const storageFolder = authUser.id;
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          setLoadingStatus(`Optimizing photo ${i + 1} of ${imageFiles.length}...`);

          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1000,
            useWebWorker: true,
            maxIteration: 5,
          };

          const compressedFile = await imageCompression(file, options);
          setLoadingStatus(`Uploading photo ${i + 1} of ${imageFiles.length}...`);

          const fileExt = compressedFile.name.split('.').pop() || 'jpg';
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${storageFolder}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, compressedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      setLoadingStatus('Finalizing listing...');

      const { error } = await supabase.from('car_listings').insert([
        {
          user_id: uploaderId,
          title: `${year} ${make} ${model}`,
          make,
          model,
          year: parseInt(year),
          price: parseFloat(price),
          seller_phone: sellerPhone,
          transmission,
          fuel_type: fuelType,
          condition,
          description,
          image_url: imageUrls[0] || null,
          image_urls: imageUrls
        }
      ]);

      if (error) throw error;

      router.push('/');
    } catch (error: any) {
      alert(error.message || 'Error creating listing');
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // NEW: Show a black screen while checking so the form doesn't "flash" before redirecting
  if (isCheckingAuth) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Securely connecting...</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 pt-24 pb-12">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Post a Car for Sale</h1>
        <p className="text-zinc-400 text-sm mb-6">Account verified. Your phone number remains private for broker verification.</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="mb-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Upload Car Photos (Multiple allowed)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={handleImageChange}
              className="w-full text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200 transition"
            />
            {imageFiles.length > 0 && (
              <p className="text-sm text-green-400 mt-2">{imageFiles.length} file(s) selected.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Make</label>
              <input type="text" required value={make} onChange={(e) => setMake(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2" placeholder="e.g. Toyota" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Model</label>
              <input type="text" required value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2" placeholder="e.g. Corolla" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Year</label>
              <input type="number" required value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2" placeholder="2022" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Price (ETB)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2" placeholder="3000000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Your Private Phone Number</label>
            <input type="text" required value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2" placeholder="+251930175564" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Transmission</label>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2">
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Fuel Type</label>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2">
                <option value="Benzine">Benzine</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2">
                <option value="Brand New">Brand New</option>
                <option value="Used in Ethiopia">Used in Ethiopia</option>
                <option value="Not used in Ethiopia">Not used in Ethiopia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2" placeholder="Tell buyers more about the car..." />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-white text-black font-semibold rounded-lg px-4 py-3 mt-6 hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loadingStatus}
              </>
            ) : (
              'Submit Listing'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}