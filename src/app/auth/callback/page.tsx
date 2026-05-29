'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the code from query parameters if present (for PKCE flow)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch (error) {
        console.error('Error during auth callback exchange:', error);
      } finally {
        // Redirect back to profile page
        router.push('/profile');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-pink-50/20 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
      <p className="font-serif text-sm font-semibold text-primary-950 animate-pulse">
        Securing your connection... Please wait.
      </p>
    </div>
  );
}
