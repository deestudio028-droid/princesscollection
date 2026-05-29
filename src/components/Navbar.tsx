'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ShoppingBag, Heart, User, ShieldCheck, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { cart, wishlist, userRole, activeUser } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const isAdmin = userRole === 'admin';
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-40 w-full premium-glass border-b border-primary-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-between p-1.5 border border-primary-300 group-hover:scale-110 transition-transform duration-300 shadow-xs">
                <Sparkles className="w-5 h-5 text-primary-500 fill-primary-100" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-wider text-primary-700 group-hover:text-primary-500 transition-colors duration-200">
                  Princess Collection
                </span>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground -mt-1">
                  Ornaments As Unique As You
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdminRoute ? (
              // Admin Links
              <>
                <Link
                  href="/admin"
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                    pathname === '/admin'
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                    pathname === '/admin/products'
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Products
                </Link>
                <Link
                  href="/admin/categories"
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                    pathname === '/admin/categories'
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Categories
                </Link>
                <Link
                  href="/admin/orders"
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                    pathname === '/admin/orders'
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  href="/admin/coupons"
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                    pathname === '/admin/coupons'
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Coupons
                </Link>
                <Link
                  href="/admin/reviews"
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                    pathname === '/admin/reviews'
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Reviews
                </Link>
                <Link
                  href="/admin/social"
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                    pathname === '/admin/social'
                      ? 'bg-purple-100 text-purple-800 font-semibold'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  Social Feed
                </Link>
                <Link
                  href="/"
                  className="text-xs bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-300 font-semibold px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1 shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  View Shop
                </Link>
              </>
            ) : (
              // Storefront Links
              <>
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    pathname === '/' ? 'text-primary-600 font-semibold' : 'text-foreground'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    pathname === '/shop' ? 'text-primary-600 font-semibold' : 'text-foreground'
                  }`}
                >
                  Shop Jewelry
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-xs bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-700 font-bold px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1 shadow-xs ring-2 ring-purple-100 ring-offset-2 animate-bounce"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAdminRoute && (
              <>
                <Link href="/profile" className="relative p-2 text-foreground hover:text-primary-600 transition-colors" title="Wishlist">
                  <Heart className={`w-6 h-6 ${wishlistCount > 0 ? 'fill-primary-400 text-primary-500' : ''}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-primary-500 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link href="/cart" className="relative p-2 text-foreground hover:text-primary-600 transition-colors" title="Shopping Cart">
                  <ShoppingBag className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-primary-500 rounded-full animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            <Link
              href="/profile"
              className="flex items-center gap-2 p-1.5 text-sm font-medium border border-primary-200 rounded-full bg-white/50 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
            >
              {activeUser ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={activeUser.full_name}
                    className="w-7 h-7 rounded-full border border-primary-300 object-cover"
                  />
                  <span className="max-w-[80px] truncate text-primary-700 font-semibold pr-2">
                    {activeUser.full_name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-600">
                  <User className="w-4 h-4" />
                </div>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-700 hover:text-primary-500 hover:bg-primary-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-100 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAdminRoute ? (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
                >
                  Products CRUD
                </Link>
                <Link
                  href="/admin/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
                >
                  Categories CRUD
                </Link>
                <Link
                  href="/admin/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
                >
                  Orders Management
                </Link>
                <Link
                  href="/admin/coupons"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
                >
                  Coupons CRUD
                </Link>
                <Link
                  href="/admin/reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
                >
                  Reviews CRUD
                </Link>
                <Link
                  href="/admin/social"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
                >
                  Social Feed
                </Link>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-semibold text-primary-600 hover:bg-primary-50"
                >
                  🛍️ View Storefront
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary-50"
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary-50"
                >
                  Shop Jewelry
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-bold text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    🛡️ Admin Panel
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary-50"
                >
                  <Heart className="w-5 h-5 text-primary-500 fill-primary-100" />
                  Wishlist ({wishlistCount})
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary-50"
                >
                  <ShoppingBag className="w-5 h-5 text-primary-500" />
                  Cart ({cartCount})
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary-50"
                >
                  Profile & History
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
