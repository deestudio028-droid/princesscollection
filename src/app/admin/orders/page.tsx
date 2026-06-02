'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    loadOrders();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } else {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin" />
      </div>
    );
  }

  const parseAddress = (addr: any) => {
    if (!addr) return { fullName: 'Unknown', addressLine1: '', city: '', postalCode: '' };
    if (typeof addr === 'string') {
      try { return JSON.parse(addr); } catch(e) { return { fullName: addr }; }
    }
    return addr;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-black text-slate-900">Order Fulfillment</h1>
        <p className="text-slate-500 text-sm mt-1">Process shipments and update delivery statuses.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(o => {
                const addr = parseAddress(o.shipping_address);
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-mono text-xs font-bold text-slate-900">{o.order_number}</span>
                      <span className="block text-[10px] text-slate-500 mt-1">{new Date(o.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="block text-sm font-bold text-slate-900">{addr.fullName}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{o.user_email || 'Guest'}</span>
                    </td>
                    <td className="p-4 font-serif font-black text-slate-900">
                      ₹{Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <select 
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border focus:outline-hidden cursor-pointer ${
                          o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          o.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 text-sm">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
