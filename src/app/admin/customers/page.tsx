'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Calendar, ShieldCheck, Search } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomers(data);
      }
      setLoading(false);
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    (c.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900">Patrons</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your royal customer base.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search patrons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-100 to-pink-100 flex items-center justify-center text-fuchsia-700 font-bold uppercase shrink-0">
                      {(c.full_name || c.email || 'A')[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{c.full_name || 'Anonymous User'}</span>
                      <span className="text-xs text-slate-500 font-mono block mt-0.5">{c.id.substring(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-fuchsia-600 transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                      {c.email}
                    </a>
                  </td>
                  <td className="p-4">
                    {c.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-700">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        Customer
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                    No patrons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
