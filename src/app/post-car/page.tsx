'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

export default function PostCarPage() {
  const router = useRouter();
  const supabase = createClient();

  // Pagination State
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form States based on your screenshots
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2022');
  const [condition, setCondition] = useState('Used in Ethiopia');
  const [dailyPrice, setDailyPrice] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [category, setCategory] = useState('Economy');
  const [usageType, setUsageType] = useState('Personal Use');
  const [ownerType, setOwnerType] = useState('Private Owner');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [collateral, setCollateral] = useState({ kebele: true, license: true, passport: false });
  const [deposit, setDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add your Supabase insert logic here. 
    // No login block means this runs immediately.
    alert('Car posted successfully!');
    setIsLoading(false);
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-zinc-50 pt-8 pb-24 font-sans">
      <div className="max-w-3xl mx-auto px-4">

        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            መኪናዎን ያስመዝግቡ። ተከራዮችን እናገናኛለን።
          </h1>
          <p className="text-slate-500 text-sm">
            ፈጣን ደላሎች ሁሉንም ቦታ ማከማቻዎች ያስተናብራል ስለዚህ ምንም ስጋት አይኖርም።
          </p>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${step >= i ? 'bg-orange-600 shadow-sm' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">

          {/* STEP 1: Details & Price */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-6">1. የመኪናው ዝርዝር መረጃ እና ዋጋ</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ዓይነት (Make) *</label>
                  <input type="text" placeholder="e.g. Toyota" value={make} onChange={(e) => setMake(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ሞዴል (Model) *</label>
                  <input type="text" placeholder="e.g. Vitz / Tucson" value={model} onChange={(e) => setModel(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">የተሰራበት ዓመት *</label>
                  <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ሁኔታ (Condition)</label>
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full border rounded-lg px-4 py-3">
                    <option>Used in Ethiopia</option>
                    <option>New / Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">የቀን ዋጋ (ብር) *</label>
                  <input type="number" placeholder="e.g. 3500" value={dailyPrice} onChange={(e) => setDailyPrice(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />
                </div>
              </div>

              <div className="pt-6 mt-8 flex justify-end">
                <button type="button" onClick={() => setStep(2)} className="bg-orange-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-700">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Category & Owner */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-6">2. Category & Owner Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-lg px-4 py-3">
                    <option>Economy</option>
                    <option>Luxury</option>
                    <option>SUV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Usage Type</label>
                  <select value={usageType} onChange={(e) => setUsageType(e.target.value)} className="w-full border rounded-lg px-4 py-3">
                    <option>Personal Use</option>
                    <option>Self-Drive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">I am a... *</label>
                  <select value={ownerType} onChange={(e) => setOwnerType(e.target.value)} className="w-full border rounded-lg px-4 py-3">
                    <option>Private Owner</option>
                    <option>Dealership</option>
                    <option>Broker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Phone Number *</label>
                  <input type="tel" placeholder="e.g. 0911..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border rounded-lg px-4 py-3" required />
                </div>
              </div>

              <div className="pt-6 mt-8 flex justify-between gap-4">
                <button type="button" onClick={() => setStep(1)} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-200">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="bg-orange-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-700">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Collateral & Details */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-6">3. ከተከራይ የሚጠበቁ መያዣዎች (Collateral)</h2>

              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">Required Collateral Documents</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={collateral.kebele} onChange={(e) => setCollateral({ ...collateral, kebele: e.target.checked })} className="w-4 h-4 text-orange-600 rounded" /> Kebele ID</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={collateral.license} onChange={(e) => setCollateral({ ...collateral, license: e.target.checked })} className="w-4 h-4 text-orange-600 rounded" /> Driver's License</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={collateral.passport} onChange={(e) => setCollateral({ ...collateral, passport: e.target.checked })} className="w-4 h-4 text-orange-600 rounded" /> Passport</label>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ተጨማሪ ገንዘብ (Deposit in ETB)</label>
                  <input type="number" placeholder="e.g. 10000" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="w-full max-w-md border rounded-lg px-4 py-3" />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">መግለጫ (Description)</label>
                  <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="የመኪናዎን ሁኔታ ልዩ ገፅታዎች..." className="w-full border rounded-lg px-4 py-3"></textarea>
                </div>
              </div>

              <div className="pt-6 mt-8 flex justify-between gap-4">
                <button type="button" onClick={() => setStep(2)} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-200">
                  Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="bg-orange-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-700">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Photos & Submit */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-6">4. Photos</h2>

              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl mb-6">
                <p className="text-sm text-orange-800 font-semibold flex items-center gap-2">
                  ⚠️ የፎቶ ደህንነት እና የግላዊነት መመሪያ
                </p>
                <ul className="text-sm text-orange-700 mt-2 ml-6 list-disc">
                  <li>የመኪናውን ታርጋ ቁጥር ከመጫንዎ በፊት ይሸፍኑ ወይም ይብረዙ (Crop/Blur ያድርጉ)።</li>
                  <li>በፎቶው ላይ ምንም አይነት ስልክ ቁጥር ወይም ማስታወቂያ አያስቀምጡ።</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <input type="file" multiple accept="image/*" onChange={(e) => e.target.files && setImageFiles(Array.from(e.target.files))} className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="bg-slate-100 text-slate-700 font-semibold px-6 py-3 rounded-xl inline-block mb-2">
                    Select Photos from Gallery
                  </div>
                  <p className="text-slate-500 text-sm">{imageFiles.length}/5 photos (Min: 1)</p>
                </label>
              </div>

              <div className="pt-6 mt-8 flex justify-between gap-4">
                <button type="button" onClick={() => setStep(3)} className="bg-slate-100 text-slate-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-200">
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="bg-orange-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2">
                  {isLoading ? 'Processing...' : 'መኪናውን መዝግብ (Post Car)'}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </main>
  );
}