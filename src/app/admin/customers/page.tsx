'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Order } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Search, Users, ArrowUpRight, X, Mail, Phone, Calendar, MapPin } from 'lucide-react';

interface CustomerType {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  phone: string;
  joined: string;
  totalOrders: number;
  totalSpending: number;
  address: string;
}

export default function AdminCustomers() {
  const { 
    customers, 
    orders, 
    userRole, 
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal for detail view
  const [selectedCustProfile, setSelectedCustProfile] = useState<CustomerType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
        <p className="text-muted-foreground text-sm">Please log in as Admin to access patron details.</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const typedCustomers = customers as CustomerType[];

  // Filter customers by search
  const filteredCustomers = typedCustomers.filter((cust) => 
    cust.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetailModal = (cust: CustomerType) => {
    setSelectedCustProfile(cust);
    setShowDetailModal(true);
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
              Princess Patron Directory
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Analyze total spends, trace active orders counts, and view verified customer avatars.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search patrons by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-primary-200 pl-9 pr-4 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-primary-950 font-medium"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* CUSTOMERS DATA TABLE */}
        <div className="bg-white border border-primary-100 rounded-3xl overflow-hidden shadow-2xs">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted-foreground font-semibold">
              No customer records found matching search filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-50/50 border-b border-primary-100 font-bold uppercase tracking-widest text-primary-900">
                    <th className="p-4">Patron Details</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4">Total Spending</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {filteredCustomers.map((c) => {
                    // Calculate totals from orders
                    const custOrders = orders.filter(o => o.user_id === c.id && o.status !== 'cancelled');
                    const totalSpent = custOrders.reduce((sum, o) => sum + o.total_amount, 0);

                    return (
                      <tr key={c.id} className="hover:bg-primary-50/10 transition-colors text-primary-950">
                        {/* Avatar & Info */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={c.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                              alt={c.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-primary-50"
                            />
                            <div>
                              <span className="font-serif font-bold text-sm block">{c.fullName}</span>
                              <span className="text-[10px] text-muted-foreground block font-mono">{c.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Orders Tally */}
                        <td className="p-4 font-semibold text-primary-850">
                          {custOrders.length > 0 ? `${custOrders.length} orders` : 'No purchases yet'}
                        </td>

                        {/* Total Spends */}
                        <td className="p-4 font-bold text-primary-600">₹{totalSpent > 0 ? totalSpent.toFixed(2) : '0.00'}
                        </td>

                        {/* Action buttons */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openDetailModal(c)}
                            className="text-purple-600 hover:bg-purple-50 p-1.5 border border-purple-200 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                            title="Inspect Details"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =====================================================================
            MODAL: CUSTOMER GRANULAR DETAIL CARD
        ===================================================================== */}
        {showDetailModal && selectedCustProfile && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-primary-150 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative flex flex-col gap-4 animate-scale">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCustProfile(null);
                }}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-lg font-bold text-primary-950 pb-2 border-b border-primary-50 flex items-center gap-1.5">
                <Users className="w-5 h-5 text-purple-600" />
                Patron Profile Specs
              </h3>

              {/* Bio summary */}
              <div className="flex items-center gap-4 bg-primary-50/20 p-4 border border-primary-100 rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedCustProfile.avatar}
                  alt={selectedCustProfile.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
                />
                <div className="text-xs flex flex-col gap-1">
                  <span className="font-serif font-bold text-base text-primary-950 block">{selectedCustProfile.fullName}</span>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {selectedCustProfile.email}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {selectedCustProfile.phone}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Member Since: {new Date(selectedCustProfile.joined).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Address details */}
              <div className="bg-primary-50/10 p-3.5 border border-primary-100 rounded-2xl text-xs flex flex-col gap-1.5">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Registered Address
                </span>
                <span className="text-primary-950 font-medium">{selectedCustProfile.address}</span>
              </div>

              {/* Patron orders summary lists */}
              <div>
                <h4 className="font-bold text-primary-950 uppercase text-[9px] tracking-widest mb-3">Purchase History Logs</h4>
                
                {orders.filter(o => o.user_id === selectedCustProfile.id).length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    This user hasn&apos;t completed any purchases.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {orders.filter(o => o.user_id === selectedCustProfile.id).map((ord) => (
                      <div
                        key={ord.id}
                        className="border border-primary-100 rounded-xl p-3 bg-primary-50/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-primary-900 block">{ord.order_number}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(ord.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-primary-950 block">₹{ord.total_amount.toFixed(2)}</span>
                          <span className={`px-1.5 py-0.2 rounded-md font-bold text-[8px] uppercase ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ord.status === 'cancelled'
                              ? 'bg-neutral-100 text-neutral-600'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
