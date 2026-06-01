'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Order, OrderItem } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Truck, ShoppingBag, CreditCard, ChevronDown, CheckCircle, Ban } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminOrders() {
  const { 
    orders, 
    userRole, 
    updateOrderStatus, 
    updateOrderPaymentStatus, 
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
        <h2 className="font-serif text-2xl font-bold text-primary-900">Access Denied</h2>
        <p className="text-muted-foreground text-sm">Please log in as Admin to access order logs.</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  // Filter orders
  const validOrders = orders.filter(o => !(o.payment_method === 'phonepe' && o.payment_status === 'pending'));

  const filteredOrders = statusFilter === 'all' 
    ? validOrders 
    : validOrders.filter((o) => o.status === statusFilter);

  const handleStatusChange = (id: string, status: Order['status']) => {
    updateOrderStatus(id, status);
    
    // Sparkly celebratory burst if delivered!
    if (status === 'delivered') {
      confetti({
        particleCount: 20,
        spread: 30,
        colors: ['#22c55e', '#a855f7', '#ec4899']
      });
    }
  };

  const handlePaymentChange = (id: string, payment_status: Order['payment_status']) => {
    updateOrderPaymentStatus(id, payment_status);
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
              Royal Order & Refund Ledger
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Advance shipping lines, view customer notes, and issue refunds on cancelled items.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-primary-200 p-0.5 rounded-full shadow-2xs">
            {['all', 'pending', 'packing', 'shipped', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white'
                    : 'text-muted-foreground hover:bg-primary-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ORDERS LIST */}
        <div className="flex flex-col gap-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-primary-100 rounded-3xl p-16 text-center shadow-2xs flex flex-col items-center gap-2">
              <span className="text-3xl">📦</span>
              <span className="text-xs font-bold text-primary-800">No orders in this vault</span>
              <span className="text-[10px] text-muted-foreground">
                There are currently no customer orders classified under the &quot;{statusFilter}&quot; status filter.
              </span>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isExpanded = expandedOrderId === ord.id;
              
              return (
                <div
                  key={ord.id}
                  className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col gap-4 transition-all hover:border-primary-200"
                >
                  
                  {/* Order summary bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-[9px]">Client Details</span>
                      <span className="font-bold text-primary-950 block truncate">{ord.shipping_address.fullName}</span>
                      <span className="text-muted-foreground text-[10px] block truncate">{ord.user_email}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-[9px]">Order Specs</span>
                      <span className="font-mono font-bold text-primary-600 block mt-0.5">{ord.order_number}</span>
                      <span className="text-[10px] text-muted-foreground block">{new Date(ord.created_at).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-[9px]">Financials</span>
                      <span className="font-serif font-black text-sm text-primary-700 block mt-0.5">₹{ord.total_amount.toFixed(2)}</span>
                      <span className="text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.2 rounded-md font-bold uppercase inline-block">
                        {ord.payment_method} / {ord.payment_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
                      {/* Current shipping status display */}
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider border shadow-2xs ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ord.status === 'cancelled'
                          ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {ord.status}
                      </span>

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                        className="text-primary-400 hover:text-primary-700 p-1 border border-primary-200 rounded-xl hover:bg-primary-50 cursor-pointer"
                        title="Toggle Detail Specifications"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED GRANULAR SPECIFICATIONS */}
                  {isExpanded && (
                    <div className="border-t border-primary-50 pt-4 flex flex-col gap-4 text-xs animate-scale">
                      
                      {/* Address specs & control options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary-50/10 border border-primary-100/50 p-4 rounded-2xl">
                        <div>
                          <h4 className="font-bold text-primary-950 uppercase text-[9px] tracking-widest mb-2">Shipping Credentials</h4>
                          <div className="text-[11px] text-muted-foreground flex flex-col gap-1">
                            <span><b>Street:</b> {ord.shipping_address.addressLine1} {ord.shipping_address.addressLine2}</span>
                            <span><b>City/ZIP:</b> {ord.shipping_address.city}, {ord.shipping_address.state} {ord.shipping_address.postalCode}</span>
                            <span><b>Phone:</b> {ord.shipping_address.phone}</span>
                            {ord.notes && <span><b>Client Notes:</b> <i className="text-primary-800">&quot;{ord.notes}&quot;</i></span>}
                          </div>
                        </div>

                        {/* Status updating dials */}
                        <div className="flex flex-col gap-3 justify-center">
                          <h4 className="font-bold text-primary-950 uppercase text-[9px] tracking-widest mb-1">Status Commands</h4>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-muted-foreground font-semibold">Shipping:</span>
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusChange(ord.id, e.target.value as Order['status'])}
                              className="bg-white border border-primary-200 text-[10px] px-2.5 py-1.5 rounded-lg focus:outline-hidden text-primary-900 font-bold"
                            >
                              <option value="pending">Pending Review</option>
                              <option value="packing">Packing Items</option>
                              <option value="shipped">Shipped Transit</option>
                              <option value="delivered">Delivered Success</option>
                              <option value="cancelled">Cancel Order</option>
                            </select>

                            <span className="text-[10px] text-muted-foreground font-semibold ml-2">Payment:</span>
                            <select
                              value={ord.payment_status}
                              onChange={(e) => handlePaymentChange(ord.id, e.target.value as Order['payment_status'])}
                              className="bg-white border border-primary-200 text-[10px] px-2.5 py-1.5 rounded-lg focus:outline-hidden text-primary-900 font-bold"
                            >
                              <option value="pending">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Items details table */}
                      <div>
                        <h4 className="font-bold text-primary-950 uppercase text-[9px] tracking-widest mb-3">Granular Items Breakdown</h4>
                        <div className="flex flex-col gap-2">
                          {ord.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs border border-primary-100 p-2.5 rounded-xl bg-white">
                              <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.product_image}
                                  alt={item.product_title}
                                  className="w-8 h-8 rounded-md object-cover border border-primary-50"
                                />
                                <div>
                                  <span className="font-bold text-primary-950">{item.product_title}</span>
                                  <span className="text-[10px] text-muted-foreground block">ID: {item.product_id}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-8">
                                <span className="font-semibold text-primary-800">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</span>
                                <span className="font-bold text-primary-950 min-w-[60px] text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
