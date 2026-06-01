'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { hydrate } = useStore();

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-rose-200 p-8 sm:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center flex flex-col items-center gap-6">
          
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center border-4 border-rose-100 shadow-inner">
            <XCircle className="w-12 h-12 text-rose-500" />
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-black text-rose-950">Payment Failed</h1>
            <p className="text-rose-600/80 text-sm">
              We couldn't process your payment. This might be due to a network issue, insufficient funds, or the transaction being cancelled.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <Link 
              href="/checkout"
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Link>
            
            <Link 
              href="/shop"
              className="flex-1 bg-white border-2 border-rose-200 text-rose-700 hover:bg-rose-50 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Back to Shop</span>
            </Link>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
