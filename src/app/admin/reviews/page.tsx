'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Review } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, CheckCircle2, Trash2, Star, Sparkles, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminReviews() {
  const { 
    reviews, 
    userRole, 
    approveReview, 
    deleteReview, 
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'approved'>('all');

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-pink-50/20 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#fff8f9] items-center justify-center p-8 gap-4">
        <span className="text-4xl">🛡️</span>
        <h2 className="font-serif text-2xl font-bold text-primary-950">Access Denied</h2>
        <p className="text-muted-foreground text-sm">Please log in as Admin to access review filters.</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterType === 'pending') return !r.is_approved;
    if (filterType === 'approved') return r.is_approved;
    return true;
  });

  // Calculate stats
  const totalCount = reviews.length;
  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;
  const avgRating = totalCount > 0 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1))
    : 5.0;

  const handleApprove = (id: string) => {
    approveReview(id);
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#a855f7', '#ec4899', '#fbcfe8']
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this customer review?')) {
      deleteReview(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary-950 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
              Princess Review Moderation
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Approve verified purchase reviews, analyze rating distributions, and delete inappropriate content.
            </p>
          </div>

          {/* Filter switches */}
          <div className="flex items-center gap-2 bg-white border border-primary-200 p-0.5 rounded-full shadow-2xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-primary-50'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterType === 'pending' ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-primary-50'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterType('approved')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterType === 'approved' ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-primary-50'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs text-primary-950 font-semibold">
          
          {/* Average score */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest block">Average Score</span>
              <span className="text-xl font-serif font-black block mt-0.5">{avgRating} out of 5</span>
            </div>
          </div>

          {/* Pending Queue */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest block">Moderation Queue</span>
              <span className={`text-xl font-serif font-black block mt-0.5 ${pendingCount > 0 ? 'text-primary-600 animate-pulse' : ''}`}>
                {pendingCount} reviews pending
              </span>
            </div>
          </div>

          {/* Approved tally */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest block">Verified Reviews</span>
              <span className="text-xl font-serif font-black block mt-0.5">{approvedCount} visible online</span>
            </div>
          </div>

        </div>

        {/* REVIEWS FILTERED GRID LIST */}
        <div className="flex flex-col gap-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white border border-primary-100 rounded-3xl p-16 text-center shadow-2xs">
              <span className="text-3xl">✨</span>
              <h3 className="font-serif text-sm font-bold text-primary-850 mt-2">Moderation box empty</h3>
              <span className="text-[10px] text-muted-foreground block mt-1">
                There are no reviews cataloged under this criteria.
              </span>
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className={`bg-white border p-5 rounded-3xl shadow-2xs flex flex-col sm:flex-row justify-between gap-4 transition-all hover:border-primary-200 ${
                  !rev.is_approved ? 'border-dashed border-primary-300 bg-primary-50/5' : 'border-primary-100'
                }`}
              >
                
                {/* Review specs */}
                <div className="flex-1 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between border-b border-primary-50 pb-2">
                    <div>
                      <span className="font-bold text-primary-950 block">{rev.reviewer_name}</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        Reviewed product: <Link href={`/product/${rev.product_id}`} className="font-bold text-primary-600 hover:underline">{rev.product_title}</Link>
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Stars display */}
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-amber-200'}`} />
                    ))}
                  </div>

                  {/* Comments */}
                  <p className="text-[11px] text-primary-900 leading-relaxed italic mt-1 bg-white border border-primary-50 p-3 rounded-2xl">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                {/* Moderation actions dials */}
                <div className="flex sm:flex-col gap-2 justify-end sm:justify-center items-center shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                  {!rev.is_approved && (
                    <button
                      onClick={() => handleApprove(rev.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-[10px] shadow-xs cursor-pointer transition-colors flex items-center gap-1 w-full text-center justify-center"
                    >
                      <Sparkles className="w-3 h-3 text-amber-200 fill-amber-200" />
                      Approve Review
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="text-rose-500 hover:bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 w-full text-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Review
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
