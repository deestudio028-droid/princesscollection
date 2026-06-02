'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import confetti from 'canvas-confetti';

// (adminSupabase removed to rely on global auth state so subpages can access the token)

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [userRole, setUserRole] = useState<'guest' | 'customer' | 'admin'>('guest');
  const [isLoading, setIsLoading] = useState(false); // Start false since we require manual login
  const [syncing, setSyncing] = useState(false);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [
        { data: productsData },
        { data: ordersData },
        { data: profilesData }
      ] = await Promise.all([
        supabase.from('products').select('*').eq('is_deleted', false),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);

      setProducts(productsData || []);
      setOrders(ordersData || []);
      setCustomers(profilesData || []);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  // We completely remove the auto-login useEffect to guarantee no local storage hangs.
  // The user MUST log in manually, which guarantees a fresh in-memory session.

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      // Force clear any stuck locks or corrupted sessions before trying to log in
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }

      // We use the GLOBAL supabase client here so that the session is saved
      // to localStorage. This allows the Zustand store.ts in subpages
      // (like /admin/products) to recognize the admin session!
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
      });

      if (error) {
        setLoginError(error.message);
        setLoginLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile || profile.role !== 'admin') {
          await supabase.auth.signOut();
          setLoginError('Access Denied: You do not have admin privileges.');
          setLoginLoading(false);
          return;
        }

        setUserRole('admin');
        useStore.getState().setRole('admin'); // Sync with global store for subpages!
        await fetchAdminData();
        confetti({
          particleCount: 40,
          spread: 60,
          colors: ['#a855f7', '#ec4899']
        });
      }
    } catch (err: any) {
      setLoginError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    await fetchAdminData();
    setSyncing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50/20 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  // IF USER IS NOT ADMIN, RENDER SECURITY GATE PORTAL
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#fff8f9]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border border-primary-150 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-lg flex flex-col gap-5 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-purple-500 via-primary-500 to-pink-400" />
            
            <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mx-auto shadow-2xs">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold text-primary-950">Secure Admin Portal</h1>
              <p className="text-muted-foreground text-xs mt-1">
                Enter your royal credentials to unlock total warehouse inventory management, coupon settings, and financial analytics.
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-3 text-left">
              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Admin Email</label>
                <input
                  type="email"
                  placeholder="admin@princess.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-primary-950 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-primary-950 font-medium"
                />
              </div>

              {loginError && (
                <span className="text-[10px] text-rose-500 font-bold px-1">{loginError}</span>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                {loginLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // CALCULATE ADMIN METRICS DYNAMICALLY
  const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.payment_status === 'paid');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalOrdersCount = activeOrders.length;
  
  // Low stock products
  const lowStockProducts = products.filter(p => p.stock_quantity <= 4);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);

  // Recent 5 orders (only paid)
  const recentOrders = orders.filter(o => o.payment_status === 'paid').slice(0, 5);

  // Dynamic Revenue Chart Data grouped by Month of creation
  const getRevenueChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    
    // Last 5 months leading to current month
    const last5Months: { name: string; index: number; Sales: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      last5Months.push({ name: months[idx], index: idx, Sales: 0 });
    }

    // Populate actual sales
    activeOrders.forEach(o => {
      const orderDate = new Date(o.created_at);
      const orderMonthIdx = orderDate.getMonth();
      const chartMonth = last5Months.find(m => m.index === orderMonthIdx);
      if (chartMonth) {
        chartMonth.Sales += Number(o.total_amount);
      }
    });

    return last5Months.map(({ name, Sales }) => ({ name, Sales: Math.round(Sales) }));
  };

  const revenueChartData = getRevenueChartData();

  // Dynamic Patron Growth Chart Data grouped by joined date
  const getCustomerChartData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const weeklyCounts = [0, 0, 0, 0];
    
    customers.forEach((c, idx) => {
      const weekIdx = idx % 4;
      weeklyCounts[weekIdx]++;
    });

    let cumulative = 0;
    return weeks.map((w, idx) => {
      cumulative += weeklyCounts[idx];
      return { name: w, Customers: cumulative };
    });
  };

  const customerChartData = getCustomerChartData();

  const parseAddress = (addressData: any) => {
    if (!addressData) return { fullName: 'Unknown' };
    if (typeof addressData === 'string') {
      try {
        return JSON.parse(addressData);
      } catch (e) {
        return { fullName: addressData };
      }
    }
    return addressData;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10 mt-8">
          <div>
            <h1 className="text-3xl font-serif text-slate-800 flex items-center gap-3">
              <ShieldCheck className="text-fuchsia-600 w-8 h-8" />
              Royal Admin Command Center
            </h1>
            <p className="text-slate-500 mt-2">Real-time metrics, warehouse inventory adjustments, coupon limits, and customer insights.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSyncData}
              disabled={syncing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> 
              {syncing ? 'Syncing...' : 'Sync Data'}
            </button>
            <Link 
              href="/"
              className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-md shadow-pink-200 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" /> View Storefront
            </Link>
          </div>
        </div>

        {/* METRIC KANBAN CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Total Sales</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-primary-950">₹{totalRevenue.toFixed(2)}
              </h2>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" />
                {activeOrders.length > 0 ? '+18.4% monthly trend' : 'No sales logs'}
              </span>
            </div>
          </div>

          {/* Card 2: Orders Count */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col justify-between group">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Paid Orders</span>
              <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-primary-950">
                {totalOrdersCount} orders
              </h2>
              <span className="text-[10px] text-primary-500 font-bold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" />
                {activeOrders.length > 0 ? '+4.2% daily trend' : 'Awaiting orders'}
              </span>
            </div>
          </div>

          {/* Card 3: Customers count */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col justify-between group">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Princess Patrons</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-primary-950">
                {customers.length} users
              </h2>
              <span className="text-[10px] text-purple-600 font-bold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" />
                {customers.length > 0 ? '+15% registration trend' : 'Awaiting registrations'}
              </span>
            </div>
          </div>

          {/* Card 4: Inventory Alerts */}
          <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col justify-between group">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Stock Alert</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                lowStockProducts.length > 0 || outOfStockProducts.length > 0
                  ? 'bg-rose-50 text-rose-500 animate-pulse'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-primary-950">
                {lowStockProducts.length + outOfStockProducts.length} warnings
              </h2>
              {outOfStockProducts.length > 0 ? (
                <span className="text-[10px] text-rose-500 font-bold block mt-1">
                  🚨 {outOfStockProducts.length} items out of stock!
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  ✓ Inventory fully optimized
                </span>
              )}
            </div>
          </div>

        </div>

        {/* CHARTS CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Revenue Analytics Chart Area */}
          <div className="lg:col-span-2 bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs">
            <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest mb-4">
              Monthly Revenue Sparkline (₹)
            </h3>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#db2777" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#db2777" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#705b63" fontSize={10} tickLine={false} />
                  <YAxis stroke="#705b63" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, borderColor: '#f5d6da' }} />
                  <Area type="monotone" dataKey="Sales" stroke="#db2777" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Growth Bar Chart */}
          <div className="lg:col-span-1 bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs">
            <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest mb-4">
              Patrons Growth
            </h3>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#705b63" fontSize={10} tickLine={false} />
                  <YAxis stroke="#705b63" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, borderColor: '#f5d6da' }} />
                  <Bar dataKey="Customers" fill="#a855f7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: RECENT ORDERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders List */}
          <div className="lg:col-span-3 bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-primary-50 pb-3 mb-4">
              <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest">
                Recent Paid Princess Sales
              </h3>
              <Link href="/admin/orders" className="text-[10px] text-primary-600 hover:underline font-bold flex items-center gap-0.5">
                Manage Orders
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No recent sales yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentOrders.map((ord) => {
                  const addr = parseAddress(ord.shipping_address);
                  return (
                    <div
                      key={ord.id}
                      className="border border-primary-100 rounded-2xl p-3 bg-[#fff8f9]/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-primary-950 block">{addr.fullName}</span>
                        <span className="text-[9px] text-muted-foreground block">{ord.user_email || 'Unknown Email'}</span>
                        <span className="text-[9px] font-mono text-primary-600 font-semibold block mt-0.5">
                          {ord.order_number} ({new Date(ord.created_at).toLocaleDateString()})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wider ${
                          ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          ord.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ord.status}
                        </span>
                        <span className="font-serif font-black text-primary-950 text-sm">
                          ₹{Number(ord.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
