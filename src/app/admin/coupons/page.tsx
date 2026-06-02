'use client';

import React, { useEffect, useState } from 'react';
import { useStore, Coupon } from '@/lib/store';
import { Plus, Trash2, Power, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminCoupons() {
  const { coupons, addCoupon, toggleCoupon, deleteCoupon, hydrate } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;
    setSaving(true);
    
    await addCoupon({
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_purchase_amount: minPurchaseAmount ? Number(minPurchaseAmount) : 0,
      expiry_date: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      is_active: true
    });

    setSaving(false);
    setShowAddModal(false);
    
    // Reset Form
    setCode('');
    setDiscountValue('');
    setMinPurchaseAmount('');
    setExpiresAt('');
    
    confetti({ particleCount: 30, spread: 50, colors: ['#a855f7', '#ec4899'] });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await deleteCoupon(id);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900">Coupons</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage discount codes.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Purchase</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="font-mono font-bold text-slate-900 tracking-widest text-lg">{c.code}</span>
                  </td>
                  <td className="p-4 font-bold text-fuchsia-600">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {c.min_purchase_amount ? `₹${c.min_purchase_amount}` : 'None'}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleCoupon(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                        c.is_active 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button onClick={() => handleDelete(c.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">No coupons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-6">Create New Coupon</h3>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Coupon Code</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. SUMMER20"
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden uppercase font-mono tracking-widest" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Type</label>
                  <select 
                    value={discountType} 
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')} 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Value</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder={discountType === 'percentage' ? "20" : "500"}
                    value={discountValue} 
                    onChange={(e) => setDiscountValue(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Min Purchase Amount (Optional)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 1000"
                  value={minPurchaseAmount} 
                  onChange={(e) => setMinPurchaseAmount(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" 
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  value={expiresAt} 
                  onChange={(e) => setExpiresAt(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" 
                />
              </div>

              <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 text-sm disabled:opacity-75">
                {saving ? 'Creating...' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
