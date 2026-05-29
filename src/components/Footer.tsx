'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Sparkles, Heart, Compass, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    
    // Sparkly cute girly confetti!
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#fbcfe8', '#f472b6', '#db2777', '#f1ebfc']
    });
  };

  return (
    <footer className="w-full bg-linear-to-b from-white via-primary-50 to-primary-100/80 border-t border-primary-200/50 pt-16 pb-8 text-sm text-primary-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center border border-primary-300">
                <Sparkles className="w-4 h-4 text-primary-500 fill-primary-100" />
              </div>
              <span className="font-serif text-lg font-bold text-primary-700">
                Princess Collection
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Exquisite handmade luxury jewelry crafted for the modern princess. Sparkling crystals, luminous pearls, and delicate gold ribbons to elevate your everyday royalty.
            </p>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/princess_collection79?igsh=NTNsbm4zMmFxdWFk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-primary-200 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-xs text-primary-600"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://whatsapp.com/channel/0029Vb9QNJEKGGGCg98FUV1S"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-primary-200 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-xs text-primary-600"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.16 1.449 4.966 1.45 5.513 0 9.998-4.488 10.001-10.002.002-2.67-1.037-5.18-2.92-7.066-1.884-1.885-4.393-2.922-7.066-2.923-5.523 0-10.01 4.49-10.014 10.006-.002 1.83.483 3.619 1.408 5.2l-1.047 3.823 3.916-1.027zm11.232-7.665c-.29-.146-1.714-.847-1.979-.942-.266-.096-.46-.144-.652.146-.192.29-.744.943-.912 1.134-.167.19-.335.213-.625.068-2.9-.145-4.832-1.226-5.59-2.528-.29-.497.29-.462.83-1.543.08-.162.04-.303-.02-.45-.06-.146-.653-1.572-.895-2.155-.236-.57-.475-.494-.653-.503-.17-.008-.364-.01-.558-.01-.194 0-.51.073-.777.364-.266.29-1.018.995-1.018 2.427 0 1.431 1.041 2.812 1.187 3.006.145.19 2.052 3.134 4.972 4.39.694.299 1.237.478 1.659.612.698.222 1.334.19 1.838.115.56-.083 1.714-.7 1.956-1.378.24-.678.24-1.258.17-1.378-.073-.12-.266-.193-.558-.339z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com/@princesscollection-qt9cj?si=Cwh_gEGSOYleiu88"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-primary-200 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 shadow-xs text-primary-600"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11C4.482 20.455 12 20.455 12 20.455s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Pinterest */}
              <a
                href="https://pin.it/1Nh065UHD"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-primary-200 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-xs text-primary-600"
                title="Pinterest"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.41 7.61 11.162-.102-.947-.195-2.404.04-3.443.214-.937 1.38-5.87 1.38-5.87s-.351-.71-.351-1.76c0-1.648.952-2.878 2.135-2.878 1.01 0 1.493.757 1.493 1.667 0 1.015-.647 2.537-.98 3.944-.279 1.18.59 2.146 1.753 2.146 2.107 0 3.728-2.227 3.728-5.441 0-2.846-2.045-4.831-4.96-4.831-3.379 0-5.36 2.536-5.36 5.156 0 1.02.395 2.117.886 2.712.097.117.11.22.081.342-.09.375-.289 1.18-.328 1.34-.052.213-.17.258-.393.154-1.468-.684-2.385-2.836-2.385-4.567 0-3.717 2.702-7.13 7.784-7.13 4.087 0 7.263 2.913 7.263 6.8 0 4.062-2.563 7.325-6.117 7.325-1.195 0-2.32-.62-2.705-1.355l-.737 2.81c-.267 1.025-.99 2.305-1.474 3.09 1.12.348 2.31.536 3.542.536 6.62 0 11.987-5.367 11.987-11.987C23.999 5.368 18.631 0 12.017 0z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-primary-800 mb-4 flex items-center gap-1">
              <span>Quick Explore</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary-600 transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary-600 transition-colors">
                  Shop Collection
                </Link>
              </li>
            
              
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif font-bold text-primary-800 mb-4 flex items-center gap-1">
              <span>Royal Services</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary-600 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary-600 transition-colors">
                  Your Wishlist
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="flex flex-col gap-4">
            <h4 className="font-serif font-bold text-primary-800 flex items-center gap-1">
              <Mail className="w-4 h-4 text-primary-500" />
              <span>Princess Club</span>
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Subscribe to get <b>10% off</b> on your first order, exclusive access to flash drops, and premium styling secrets.
            </p>
            {subscribed ? (
              <div className="bg-primary-50 border border-primary-200 text-primary-700 text-xs px-3 py-2 rounded-xl text-center font-medium animate-sparkle">
                ✨ Sparkling welcome! Check your inbox for code <b>PRINCESS10</b>!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white border border-primary-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-900"
                />
                <button
                  type="submit"
                  className="bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-primary-200/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <p>© 2026 Princess Collection. Built with ❤️ and elegant sparkles.</p>
            <span className="hidden sm:inline text-primary-250">•</span>
            <p>
              Build with 💓{' '}
              <a
                href="https://deestudio.it.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary-600 hover:text-primary-800 transition-colors"
              >
                DeeStudio
              </a>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span>Handmade Luxury Premium Jewellery Brand</span>
            <Heart className="w-3.5 h-3.5 fill-primary-400 text-primary-400 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
