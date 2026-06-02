'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import confetti from 'canvas-confetti';

export default function AdminLogin() {
  const router = useRouter();
  const { setRole, userRole } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in as admin
  useEffect(() => {
    if (userRole === 'admin') {
      router.push('/admin');
    }
  }, [userRole, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Force clear any stuck locks or corrupted sessions before trying to log in
      // This specifically fixes the "Authenticating..." infinite hang caused by Supabase locks.
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Verify admin privileges
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile || profile.role !== 'admin') {
          await supabase.auth.signOut();
          setError('Access Denied: You do not have admin privileges.');
          setLoading(false);
          return;
        }

        // Success
        setRole('admin');
        confetti({
          particleCount: 40,
          spread: 60,
          colors: ['#a855f7', '#ec4899']
        });
        
        // Let the layout handle the rendering since userRole is now admin!
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fff8f9]">
      <div className="bg-white border border-slate-100 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-fuchsia-600 to-pink-500" />
        
        <div className="w-16 h-16 rounded-2xl bg-fuchsia-50 flex items-center justify-center text-fuchsia-600 mx-auto shadow-inner mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-black text-slate-900">Royal Portal</h1>
          <p className="text-slate-500 text-sm mt-2">
            Enter your credentials to access the command center.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="superadmin@princess.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden text-slate-900 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden text-slate-900 font-medium transition-all"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm shadow-xl shadow-pink-500/20 cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>{loading ? 'Authenticating...' : 'Secure Login'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
