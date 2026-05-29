'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Coupon } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Plus, Trash2, Ticket, X, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminCoupons() {
  const { 
    coupons, 
    userRole, 
    addCoupon, 
    toggleCoupon, 
    deleteCoupon, 
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('');

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
        <p className="text-muted-foreground text-sm">Please log in as Admin to access coupon configurations.</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const openAddModal = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setExpiryDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setUsageLimit('100');
    setMinPurchaseAmount('50');
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    addCoupon({
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      usage_limit: usageLimit ? Number(usageLimit) : undefined,
      min_purchase_amount: minPurchaseAmount ? Number(minPurchaseAmount) : 0,
      is_active: true
    });

    setShowAddModal(false);
    confetti({
      particleCount: 25,
      spread: 40,
      colors: ['#a855f7', '#ec4899', '#fbcfe8']
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title and Top CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary-950 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
              Royal Discount Coupon system
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Create campaigns, set minimum purchase thresholds, control expirations, and track coupon usages.
            </p>
          </div>
          
          <button
            onClick={openAddModal}
            className="bg-purple-600 hover:bg-purple-700 hover:scale-102 text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Campaign Coupon
          </button>
        </div>

        {/* Coupons List Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((c) => {
            const isExpired = c.expiry_date && new Date(c.expiry_date).getTime() < Date.now();
            
            return (
              <div
                key={c.id}
                className={`bg-white border rounded-3xl p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs relative overflow-hidden ${
                  !c.is_active || isExpired 
                    ? 'border-neutral-200 opacity-70' 
                    : 'border-primary-100'
                }`}
              >
                
                {/* Coupon Code badge */}
                <div className="flex items-center justify-between border-b border-primary-50 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <span className="font-mono font-bold text-base text-primary-950 tracking-wider uppercase">
                      {c.code}
                    </span>
                  </div>
                  
                  {/* Status Toggle Switch button */}
                  <button
                    onClick={() => toggleCoupon(c.id)}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      c.is_active && !isExpired
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    {isExpired ? 'Expired' : c.is_active ? 'Active' : 'Disabled'}
                  </button>
                </div>

                {/* Coupon details content */}
                <div className="flex-1 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center text-primary-950 font-semibold">
                    <span>Discount Rate</span>
                    <span className="font-serif font-black text-sm text-primary-600">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% Off` : `₹${c.discount_value} Off`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Minimum Purchase</span>
                    <span className="font-bold text-primary-950">₹{Number(c.min_purchase_amount).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Usage Count</span>
                    <span className="font-bold text-primary-950">
                      {c.used_count} {c.usage_limit ? `/ ${c.usage_limit}` : 'used'}
                    </span>
                  </div>

                  {c.expiry_date && (
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Expiry Date
                      </span>
                      <span className={`font-bold ${isExpired ? 'text-rose-500' : 'text-primary-950'}`}>
                        {new Date(c.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Delete Campaign coupon */}
                <div className="flex justify-end mt-4 pt-3 border-t border-primary-50">
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="text-primary-300 hover:text-rose-500 transition-colors p-1.5 border border-primary-200 hover:bg-rose-50 rounded-xl"
                    title="Delete Coupon Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* =====================================================================
            MODAL: CREATE COUPON
        ===================================================================== */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-primary-150 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-lg font-bold text-primary-950 flex items-center gap-1.5 pb-1 border-b border-primary-50">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Create Royal Coupon Campaign
              </h3>

              <form onSubmit={handleAddSubmit} className="flex flex-col gap-3.5 text-xs text-primary-950">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CROWN25"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 uppercase font-mono tracking-wider font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-semibold"
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="flat">Flat Price Discount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Min Purchase Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={minPurchaseAmount}
                      onChange={(e) => setMinPurchaseAmount(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Usage Limit Count</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-center mt-2"
                >
                  Create Campaign Coupon
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
