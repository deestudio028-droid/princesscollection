'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Product } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Sparkles, ArrowRight, Heart, Gift, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Home() {
  const { products, categories, wishlist, toggleWishlist, hydrate, socialFeed } = useStore();
  const [mounted, setMounted] = useState(false);

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

  // Filter products
  const featuredProducts = products.filter(p => p.is_featured && !p.is_deleted).slice(0, 4);
  const bestSellers = products.filter(p => p.is_bestseller && !p.is_deleted).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-[#fff8f9] via-white to-[#fff8f9]">
            <Navbar />

      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-primary-100">
        {/* Pastel blob backgrounds */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-pastel-pink/40 blur-3xl -z-10 animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-pastel-lavender/50 blur-3xl -z-10 animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div className="flex flex-col gap-6 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-primary-100/60 border border-primary-200 px-3.5 py-1 rounded-full text-xs font-bold text-primary-700 w-fit mx-auto md:mx-0 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 fill-primary-100" />
              <span>Dainty Handmade Masterpieces</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary-900 leading-tight">
              Sparkle Like <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-500 via-primary-600 to-purple-600 animate-sparkle">
                Everyday Royalty
              </span>
            </h1>
            
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto md:mx-0 leading-relaxed">
              Exquisite luxury jewelry pieces custom-sculpted in natural quartz, brilliant tourmaline, and pink freshwater pearls. Gift yourself the sparkle you deserve.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 hover:scale-102 text-white font-bold px-8 py-3.5 rounded-full text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore Shop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
            </div>
            </div>
          {/* Hero Image Container */}
          <div className="relative flex justify-center items-center">
            {/* Elegant glass picture frame */}
            <div className="relative w-80 h-96 sm:w-96 sm:h-110 rounded-3xl p-3 bg-white/70 border border-primary-200/60 shadow-xl rotate-2 hover:rotate-0 transition-transform duration-700">
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80"
                  alt="Princess Jewelry Model"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/20 to-transparent" />
              </div>
              
              {/* Overlapping floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white border border-primary-200 p-3.5 rounded-2xl shadow-lg flex items-center gap-3 animate-float max-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold">Spend ₹1499 or more</div>
                  <div className="text-xs font-bold text-primary-800">Unlock a secret Princess Gift</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">Curated Collections</span>
          <h2 className="font-serif text-3xl font-bold text-primary-900 mt-1">Shop by Princess Style</h2>
          <div className="w-16 h-1 bg-primary-300 mx-auto mt-2.5 rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-48 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 border border-primary-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-900/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-serif text-sm sm:text-base font-bold tracking-wide">{cat.name}</h3>
                <p className="text-[10px] text-primary-100/90 line-clamp-1 mt-0.5 group-hover:underline">
                  View Collection →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-12 bg-primary-50/30 border-y border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">Sparkling Stars</span>
              <h2 className="font-serif text-3xl font-bold text-primary-900 mt-1">Featured Creations</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-primary-600 hover:text-primary-500 hover:underline flex items-center gap-1">
              <span>View All Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEST SELLERS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">Royal Favourites</span>
          <h2 className="font-serif text-3xl font-bold text-primary-900 mt-1">Our Best Sellers</h2>
          <div className="w-16 h-1 bg-primary-300 mx-auto mt-2.5 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. BRAND PROMISE / TESTIMONIALS */}
      <section className="py-14 bg-linear-to-r from-primary-50 via-pastel-lavender/30 to-primary-50/60 border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3 p-4 bg-white/60 rounded-3xl border border-primary-200/50 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-primary-800">Handmade with Love</h4>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
              Every ring, necklace, and charm is individually designed and detailed by artisan craftsmen.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 bg-white/60 rounded-3xl border border-primary-200/50 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-primary-800">Premium Materials</h4>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
              We Prioritize quality in every detail. Our Accessories are throughtfully Created To Provide Durability , style & touch of luxury for every occassion.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 bg-white/60 rounded-3xl border border-primary-200/50 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <Sparkles className="w-5 h-5 text-primary-500 fill-primary-100" />
            </div>
            <h4 className="font-serif font-bold text-primary-800">Sweet And Aesthetic</h4>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
              Every purchace is Carefully wrapped & Securely packed , ensuring your favourite pieces reach you safely & beautifully.
            </p>
          </div>
        </div>
      </section>

      {/* 6. INSTAGRAM GALLERY SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-primary-100">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">Social Feed</span>
          <h2 className="font-serif text-3xl font-bold text-primary-900 mt-1">#PrincessCollection Moments</h2>
          <p className="text-xs text-muted-foreground mt-1">Tag us on Instagram to get featured in our royal gallery!</p>
          <div className="w-16 h-1 bg-primary-300 mx-auto mt-2.5 rounded-full" />
        </div>

        {socialFeed && socialFeed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {socialFeed.map((item) => {
              const innerContent = (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt="Social Lifestyle Post"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                    <Heart className="w-4 h-4 fill-current text-primary-400" />
                    <span>{item.likes || 'View'}</span>
                  </div>
                </>
              );

              if (item.post_url) {
                return (
                  <a
                    key={item.id}
                    href={item.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-primary-100 shadow-2xs hover:shadow-md cursor-pointer block"
                  >
                    {innerContent}
                  </a>
                );
              }

              return (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-primary-100 shadow-2xs hover:shadow-md cursor-pointer"
                >
                  {innerContent}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl bg-primary-50/20 border border-dashed border-primary-200 max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-primary-400 mx-auto mb-2.5" />
            <p className="text-xs font-bold text-primary-950">Curating Moments Feed</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Our royal gallery of customer stories is currently being updated. Log in to the Admin Panel to customize this social feed!
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
