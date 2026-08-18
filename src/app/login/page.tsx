'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('private_seller');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLoginView) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        router.push('/'); // Redirects to the homepage on success
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: accountType }
          }
        });
        if (error) throw error;
        
        alert('Success! Account created. You can now log in.');
        setIsLoginView(true); // Automatically switch back to login mode
        setPassword(''); // Clear the password for security
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {isLoginView ? 'Welcome Back' : 'Join the Marketplace'}
        </h1>

        <div className="flex bg-zinc-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLoginView(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              isLoginView ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsLoginView(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              !isLoginView ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-zinc-500"
              >
                <option value="private_seller">Private Seller</option>
                <option value="dealership">Dealership</option>
                <option value="broker">Broker</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-zinc-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-zinc-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-semibold rounded-lg px-4 py-3 mt-4 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLoginView ? 'Log In' : 'Create Account')}
          </button>
        </form>
      </div>
    </main>
  );
}