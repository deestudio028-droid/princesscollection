'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore, supabase } from '@/lib/store';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [mounted, setMounted] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { hydrate } = useStore();

  useEffect(() => {
    hydrate();
    setMounted(true);
    
    // Clear cart
    localStorage.removeItem('pc_cart');
    
    // Confetti celebration
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    const colors = ['#fbcfe8', '#f472b6', '#e8daef', '#d4af37'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    if (orderId) {
      supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setOrderDetails(data);
        });
    }
  }, [hydrate, orderId]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-primary-200 p-8 sm:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center flex flex-col items-center gap-6">
          
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100 shadow-inner">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-black text-primary-950">Payment Successful!</h1>
            <p className="text-muted-foreground text-sm">
              Thank you for choosing Princess Collection. Your payment has been received and your order is now being processed.
            </p>
          </div>

          {orderDetails && (
            <div className="w-full bg-primary-50/50 border border-primary-100 p-5 rounded-2xl flex flex-col gap-3 text-left">
              <h3 className="font-bold text-xs uppercase tracking-widest text-primary-900 border-b border-primary-200 pb-2 mb-1">
                Order Summary
              </h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-bold text-primary-700">{orderDetails.order_number}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-serif font-bold text-primary-950 text-lg">₹{Number(orderDetails.total_amount).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <Link 
              href="/shop"
              className="flex-1 bg-white border-2 border-primary-300 text-primary-900 hover:bg-primary-50 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
