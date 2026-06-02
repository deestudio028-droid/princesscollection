'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tags, 
  Users, 
  Settings,
  LogOut,
  ShieldCheck,
  PackageSearch
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrate, userRole, setRole } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole('guest');
    router.push('/admin/login');
  };

  // If we are still hydrating the client, show a loading spinner
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fff8f9] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-fuchsia-200 border-t-fuchsia-600 animate-spin" />
        <span className="mt-4 font-bold text-fuchsia-900 tracking-widest text-xs uppercase animate-pulse">Initializing Security...</span>
      </div>
    );
  }

  // If on login page, render just the children (login form)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If NOT on login page and NOT an admin, redirect to login
  if (userRole !== 'admin') {
    router.push('/admin/login');
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: PackageSearch },
    { name: 'Customers', href: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f3eff5] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-black text-lg text-slate-900 leading-tight">Royal</h1>
            <p className="text-[10px] font-bold text-fuchsia-600 uppercase tracking-widest">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-fuchsia-50 text-fuchsia-700 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-fuchsia-600' : 'text-slate-400'}`} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
            <span className="text-sm">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden bg-[#fffcfd]">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-fuchsia-600" />
            <span className="font-serif font-black text-lg text-slate-900">Royal Admin</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-600">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* Page Content */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
