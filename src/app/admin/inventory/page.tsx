'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Product, InventoryLog } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Plus, RefreshCw, AlertTriangle, ListCollapse, ArrowUpDown } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminInventory() {
  const { 
    products, 
    inventoryLogs, 
    userRole, 
    restockProduct, 
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);

  // Form Fields
  const [selectedProductId, setSelectedProductId] = useState('');
  const [restockQty, setRestockQty] = useState('10');

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  // Set default product selection once mounted
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products.filter(p => !p.is_deleted)[0]?.id || '');
    }
  }, [products, selectedProductId]);

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
        <h2 className="font-serif text-2xl font-bold text-primary-900">Access Denied</h2>
        <p className="text-muted-foreground text-sm">Please log in as Admin to access inventory logs.</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const activeProducts = products.filter(p => !p.is_deleted);
  
  // Calculate alerts
  const totalItemsCount = activeProducts.reduce((sum, p) => sum + p.stock_quantity, 0);
  const outOfStockCount = activeProducts.filter(p => p.stock_quantity === 0).length;
  const lowStockCount = activeProducts.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 4).length;

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !restockQty) return;

    restockProduct(selectedProductId, Number(restockQty));
    
    // Sparkly celebratory feedback!
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#a855f7', '#ec4899', '#f3e5ab']
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary-950 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
              Real-time Inventory & Stock Logs
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Restock warehouse items, inspect inventory movement details, and check low-stock thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="bg-white border border-primary-200 text-primary-700 font-bold px-4 py-2 rounded-full text-xs hover:bg-primary-50 transition-colors shadow-2xs cursor-pointer"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs text-primary-950 font-semibold">
          
          {/* Total stock physical */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest block">Total Physical Units</span>
              <span className="text-xl font-serif font-black block mt-0.5">{totalItemsCount} units</span>
            </div>
          </div>

          {/* Out of stock warnings */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest block">Out of Stock Warnings</span>
              <span className={`text-xl font-serif font-black block mt-0.5 ${outOfStockCount > 0 ? 'text-rose-600 animate-pulse' : ''}`}>
                {outOfStockCount} items empty
              </span>
            </div>
          </div>

          {/* Low inventory alerts */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest block">Low Inventory Warnings</span>
              <span className={`text-xl font-serif font-black block mt-0.5 ${lowStockCount > 0 ? 'text-amber-600 animate-pulse' : ''}`}>
                {lowStockCount} items low (&lt;= 4)
              </span>
            </div>
          </div>

        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT PANEL: RESTOCK FORM */}
          <div className="lg:col-span-1 bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs h-fit sticky top-24">
            <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest border-b border-primary-50 pb-2.5 mb-4 flex items-center gap-1">
              <span>Restock Warehouse</span>
            </h3>

            <form onSubmit={handleRestockSubmit} className="flex flex-col gap-3.5 text-xs text-primary-950">
              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Select Jewellery Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-semibold"
                >
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Current: {p.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Restock Quantity Addition</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="10"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-center mt-2 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Submit Restock Adjust
              </button>
            </form>
          </div>

          {/* RIGHT PANEL: MOVEMENT LEDGER HISTORY */}
          <div className="lg:col-span-2 bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs">
            <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest border-b border-primary-50 pb-2.5 mb-4 flex items-center gap-1.5">
              <ListCollapse className="w-4 h-4 text-purple-600" />
              Stock Movement History
            </h3>

            {inventoryLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">
                No stock movements logged in the warehouse.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                {inventoryLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-primary-100 rounded-2xl p-3 bg-[#fff8f9]/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-primary-950 block">{log.product_title}</span>
                      <span className="text-[9px] text-muted-foreground font-mono mt-0.5 block">Log ID: {log.id}</span>
                      <span className="text-[9px] text-muted-foreground block">{new Date(log.created_at).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      {/* Reason tags */}
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-wider ${
                        log.reason === 'restock'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.reason === 'sale'
                          ? 'bg-primary-50 text-primary-700'
                          : log.reason === 'refund'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {log.reason}
                      </span>
                      
                      {/* Quantity change display */}
                      <span className={`font-bold text-sm min-w-[50px] ${
                        log.quantity_changed >= 0 ? 'text-emerald-600' : 'text-rose-500'
                      }`}>
                        {log.quantity_changed >= 0 ? `+${log.quantity_changed}` : log.quantity_changed}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
