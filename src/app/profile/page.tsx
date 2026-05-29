'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Address, Order } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, MapPin, Package, User, Calendar, Mail, Trash2, ArrowUpRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { 
    activeUser, 
    userRole, 
    orders, 
    wishlist, 
    products, 
    savedAddresses, 
    addAddress, 
    deleteAddress, 
    toggleWishlist,
    updateUserProfile,
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  
  // Address creation states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  // Authentication states
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (activeTab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        confetti({
          particleCount: 30,
          spread: 50,
          colors: ['#fbcfe8', '#f1ebfc']
        });
      } else {
        if (!authName) {
          setAuthError('Please enter your full name');
          setAuthLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: authName
            }
          }
        });
        if (error) throw error;

        // Fallback for profiles row creation
        if (data.user) {
          const { data: checkProf } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!checkProf) {
            await supabase.from('profiles').insert({
              id: data.user.id,
              email,
              full_name: authName,
              role: 'customer'
            });
          }
        }

        confetti({
          particleCount: 50,
          spread: 80,
          colors: ['#fbcfe8', '#f1ebfc', '#a855f7']
        });
        
        setActiveTab('login');
        setAuthError('Registration successful! Please sign in with your credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during authentication.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Google sign in failed.');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

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

  // Filter personal orders
  const personalOrders = orders.filter(o => o.user_id === (activeUser?.id || 'guest'));

  // Get wishlist items details
  const wishlistDetails = products.filter(p => wishlist.includes(p.id) && !p.is_deleted);

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !addressLine1 || !city || !state || !postalCode || !phone) return;

    addAddress({
      fullName,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      postalCode,
      phone
    });

    // Reset address form
    setFullName('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setPhone('');
    setShowAddressForm(false);

    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#fbcfe8', '#f1ebfc']
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Guest View Warning */}
        {!activeUser ? (
          <div className="bg-white border border-primary-150 rounded-3xl p-8 text-center max-w-md mx-auto shadow-md flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-300 via-primary-500 to-pastel-lavender" />
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl animate-bounce">👑</span>
              <h2 className="font-serif text-xl font-bold text-primary-950">Welcome to Princess Closet</h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Sign in to view your royal orders, save delivery addresses, and coordinate your jewelry wishlist.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-primary-100">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setAuthError(''); }}
                className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-b-2 border-primary-500 text-primary-900'
                    : 'text-muted-foreground hover:text-primary-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setAuthError(''); }}
                className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'signup'
                    ? 'border-b-2 border-primary-500 text-primary-900'
                    : 'text-muted-foreground hover:text-primary-600'
                }`}
              >
                Register
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 text-left">
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lily Chen"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                />
              </div>

              {authError && (
                <div className={`text-[10px] font-bold px-1.5 py-1 rounded-md ${
                  authError.includes('successful') 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-rose-50 text-rose-500 border border-rose-100'
                }`}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl text-xs shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                {authLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In to Closet' : 'Create Princess Account'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary-100" /></div>
              <span className="relative bg-white px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Or Continue With</span>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full bg-white hover:bg-primary-50 text-primary-900 border border-primary-200 font-bold py-3 rounded-xl text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* COLUMN 1: USER SUMMARY CARD */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* User Bio Card */}
              <div className="bg-white border border-primary-100 rounded-3xl p-6 shadow-2xs flex flex-col items-center text-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-r from-primary-100 to-pastel-lavender -z-10" />
                
                {/* Girly Profile Photo Customizer */}
                <div className="relative group/avatar cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={activeUser.full_name}
                    className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-xs mt-4 group-hover/avatar:opacity-80 transition-opacity"
                    onClick={() => document.getElementById('avatar-upload-input')?.click()}
                    title="Click to change profile picture"
                  />
                  <div 
                    onClick={() => document.getElementById('avatar-upload-input')?.click()}
                    className="absolute inset-0 top-4 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white pointer-events-none"
                  >
                    <span className="text-[10px] font-bold">Change</span>
                  </div>
                  <input
                    id="avatar-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          if (event.target?.result) {
                            const base64 = event.target.result as string;
                            await updateUserProfile({ avatar_url: base64 });
                            confetti({
                              particleCount: 15,
                              spread: 30,
                              colors: ['#a855f7', '#ec4899']
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {activeUser.avatar_url && activeUser.avatar_url !== 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' && (
                  <button
                    onClick={async () => {
                      if (confirm('Revert your profile photo back to the default image?')) {
                        await updateUserProfile({ 
                          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' 
                        });
                        confetti({
                          particleCount: 10,
                          spread: 20,
                          colors: ['#fbcfe8', '#f1ebfc']
                        });
                      }
                    }}
                    className="text-[9px] text-muted-foreground hover:text-primary-600 font-bold -mt-2 cursor-pointer hover:underline transition-all"
                  >
                    Reset to Default Image
                  </button>
                )}

                <div>
                  <h2 className="font-serif text-lg font-bold text-primary-950 flex items-center justify-center gap-1">
                    {activeUser.full_name}
                    <Sparkles className="w-3.5 h-3.5 text-primary-500 fill-primary-100" />
                  </h2>
                  <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block mt-0.5">
                    {activeUser.role} Profile
                  </span>
                </div>

                <div className="w-full border-t border-primary-50 pt-4 flex flex-col gap-2.5 text-left text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 text-primary-400" />
                    <span className="truncate">{activeUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary-400" />
                    <span>
                      Member Since{' '}
                      {activeUser.created_at
                        ? new Date(activeUser.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                          })
                        : '2026'}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 font-bold py-2.5 rounded-2xl text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Address Manager Card */}
              <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-primary-50 pb-2">
                  <h3 className="font-serif text-xs font-bold text-primary-950 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    Saved Addresses
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-[10px] bg-primary-50 hover:bg-primary-100 text-primary-600 font-bold px-2 py-0.5 rounded-md border border-primary-200 cursor-pointer"
                  >
                    {showAddressForm ? 'Cancel' : '+ Add'}
                  </button>
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddressSubmit} className="flex flex-col gap-2 border border-primary-100 p-3 rounded-2xl bg-primary-50/10">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white border border-primary-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-hidden text-primary-900"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Street Address"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="bg-white border border-primary-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-hidden text-primary-900"
                    />
                    <input
                      type="text"
                      placeholder="Apt, Suite (optional)"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="bg-white border border-primary-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-hidden text-primary-900"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-white border border-primary-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-hidden text-primary-900"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="bg-white border border-primary-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-hidden text-primary-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        required
                        placeholder="ZIP Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="bg-white border border-primary-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-hidden text-primary-900"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white border border-primary-200 px-2.5 py-1.5 rounded-lg text-xs focus:outline-hidden text-primary-900"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-1.5 rounded-lg text-[10px] shadow-xs cursor-pointer mt-1"
                    >
                      Save Address
                    </button>
                  </form>
                )}

                {/* Address List */}
                <div className="flex flex-col gap-2.5">
                  {savedAddresses.length === 0 ? (
                    <div className="text-center py-4 text-[10px] text-muted-foreground font-semibold">
                      No addresses saved yet.
                    </div>
                  ) : (
                    savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-primary-100 rounded-2xl p-3 bg-primary-50/5 flex justify-between items-start text-xs group"
                      >
                        <div>
                          <span className="font-bold text-primary-950 block">{addr.fullName}</span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                          </span>
                          <span className="text-[9px] text-primary-600 font-semibold block mt-1">
                            📞 {addr.phone}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-primary-300 hover:text-rose-500 transition-colors p-1"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* COLUMN 2 & 3: HISTORY & WISHLIST */}
            <div className="lg:col-span-3 flex flex-col gap-8">
              
              {/* Order History Panel */}
              <div className="bg-white border border-primary-100 rounded-3xl p-6 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-primary-950 mb-4 flex items-center gap-1.5">
                  <Package className="w-5 h-5 text-primary-500" />
                  Your Royal Orders ({personalOrders.length})
                </h3>

                {personalOrders.length === 0 ? (
                  <div className="text-center py-10 bg-primary-50/10 border border-dashed border-primary-200 rounded-2xl flex flex-col items-center gap-2">
                    <span className="text-3xl">📦</span>
                    <span className="text-xs font-bold text-primary-850">No orders placed yet</span>
                    <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
                      You haven&apos;t placed any premium orders yet. Fill your shopping casket and checkout as customer to see tracking lines!
                    </p>
                    <Link href="/shop" className="bg-primary-500 text-white font-bold px-5 py-2 rounded-full text-xs mt-1">
                      Browse Jewellery Shop
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {personalOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="border border-primary-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 bg-[#fff8f9]/5"
                      >
                        {/* Order Header bar */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-primary-50 pb-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Order Number:</span>
                            <span className="font-mono font-bold text-primary-950 ml-1.5 bg-primary-50 px-2 py-0.5 border border-primary-200/50 rounded-md">
                              {ord.order_number}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Date: {new Date(ord.created_at).toLocaleDateString()}</span>
                            
                            {/* Status tags */}
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider border shadow-2xs ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ord.status === 'packing' || ord.status === 'shipped'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : ord.status === 'cancelled'
                                ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                                : 'bg-primary-50 text-primary-700 border-primary-200'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Recap */}
                        <div className="flex flex-col gap-3">
                          {ord.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.product_image}
                                  alt={item.product_title}
                                  className="w-9 h-9 rounded-md object-cover border border-primary-50"
                                />
                                <div>
                                  <Link href={`/product/${item.product_id}`} className="font-bold text-primary-900 hover:underline">
                                    {item.product_title}
                                  </Link>
                                  <span className="text-[10px] text-muted-foreground block mt-0.5">Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="font-bold text-primary-950">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer calculations */}
                        <div className="flex items-center justify-between border-t border-primary-50 pt-3 text-xs">
                          <span className="text-muted-foreground">
                            Payment: <b className="uppercase text-primary-900">{ord.payment_method}</b> 
                            <span className="ml-1 text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.2 rounded-md uppercase font-bold">
                              {ord.payment_status}
                            </span>
                          </span>
                          <span>
                            Total Amount: <b className="text-sm text-primary-600 font-serif font-black">₹{ord.total_amount.toFixed(2)}</b>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist Panel */}
              <div className="bg-white border border-primary-100 rounded-3xl p-6 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-primary-950 mb-4 flex items-center gap-1.5">
                  <Heart className="w-5 h-5 text-primary-500 fill-primary-100" />
                  Your Wishlist Closet ({wishlistDetails.length})
                </h3>

                {wishlistDetails.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                    No items resting in your closet yet. Sparkle up your shop journey!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {wishlistDetails.map((product) => (
                      <div
                        key={product.id}
                        className="group relative bg-white border border-primary-100 rounded-2xl p-2.5 flex flex-col justify-between hover:shadow-xs transition-shadow overflow-hidden"
                      >
                        {/* Image wrapper */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-primary-50 relative">
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-primary-500 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="mt-2 text-left">
                          <h4 className="font-serif text-xs font-bold text-primary-900 truncate">
                            {product.title}
                          </h4>
                          <span className="text-[10px] text-primary-600 font-bold block mt-0.5">₹{(product.discount_price || product.price).toFixed(2)}
                          </span>
                        </div>

                        {/* View Product CTA link */}
                        <Link
                          href={`/product/${product.id}`}
                          className="mt-2 text-[9px] bg-primary-50 group-hover:bg-primary-500 group-hover:text-white border border-primary-200 group-hover:border-primary-500 text-primary-700 py-1.5 rounded-lg font-bold text-center flex items-center justify-center gap-0.5 transition-all duration-300"
                        >
                          <span>Sparkle View</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
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
