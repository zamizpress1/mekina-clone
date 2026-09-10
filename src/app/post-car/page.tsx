'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostCarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // State updated for rentals instead of sales
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    rentPrice: '',
    rentDuration: 'daily',
  });

  return (
    <main className="min-h-screen bg-zinc-50 pt-10 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header Section */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Post your car</h1>
        <p className="text-slate-600 mb-8">
          Post a car for rent. After posting you can continue to order / payment.
        </p>

        {/* 4-Step Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${step >= i ? 'bg-red-700' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Basics</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Corolla 2020"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Addis Ababa"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rental Rate (ETB) *</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={formData.rentPrice}
                    onChange={(e) => setFormData({ ...formData, rentPrice: e.target.value })}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  <select
                    value={formData.rentDuration}
                    onChange={(e) => setFormData({ ...formData, rentDuration: e.target.value })}
                    className="w-36 bg-white border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all text-slate-900"
                  >
                    <option value="daily">Per Day</option>
                    <option value="weekly">Per Week</option>
                    <option value="monthly">Per Month</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="bg-red-700 text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-800 transition-colors shadow-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step > 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Details (Step {step})</h2>
              <p className="text-slate-600">The rest of your rental details will go here.</p>

              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-8">
                <button
                  onClick={() => setStep(step - 1)}
                  className="bg-white border border-slate-300 text-slate-700 font-semibold px-8 py-3 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => step < 4 ? setStep(step + 1) : alert('Listing ready for payment!')}
                  className="bg-red-700 text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-800 transition-colors shadow-sm"
                >
                  {step === 4 ? 'Save & Continue to Payment' : 'Continue'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}