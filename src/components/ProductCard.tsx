'use client';

import React from 'react';
import Link from 'next/link';
import { useStore, Product } from '@/lib/store';
import { ShoppingBag, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const activeInWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    
    // Tiny burst of pink sparkles!
    confetti({
      particleCount: 20,
      spread: 40,
      origin: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      },
      colors: ['#fbcfe8', '#ec4899', '#f3e5ab']
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const hasDiscount = !!product.discount_price && product.discount_price < product.price;

  return (
    <div className="group relative bg-white border border-primary-100 hover:border-primary-300 rounded-3xl p-3 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg shadow-xs overflow-hidden">
      
      {/* Badges and Wishlist Button overlay */}
      <div className="relative w-full aspect-square bg-linear-to-b from-primary-50 to-white rounded-2xl overflow-hidden mb-3">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.is_bestseller && (
            <span className="bg-primary-500 text-white font-medium text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Bestseller
            </span>
          )}
          {product.is_featured && (
            <span className="bg-amber-400 text-amber-950 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              ✨ Premium
            </span>
          )}
          {product.stock_quantity === 0 && (
            <span className="bg-neutral-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
          {product.stock_quantity > 0 && product.stock_quantity <= 4 && (
            <span className="bg-rose-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm animate-pulse">
              Low Stock ({product.stock_quantity})
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shadow-xs z-10 cursor-pointer ${
            activeInWishlist
              ? 'bg-primary-500 border-primary-500 text-white hover:scale-110'
              : 'bg-white/80 border-primary-200 text-primary-400 hover:bg-white hover:text-primary-500'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${activeInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="px-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">
            Handmade Jewelry
          </div>
          <Link href={`/product/${product.id}`} className="block group-hover:text-primary-600 transition-colors duration-200">
            <h3 className="font-serif text-sm font-bold text-primary-800 line-clamp-1">
              {product.title}
            </h3>
          </Link>
          
          {/* Price tags */}
          <div className="flex items-baseline gap-1.5 mt-1.5 mb-2.5">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-primary-600">₹{product.discount_price?.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground line-through font-medium">₹{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-primary-700">₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
            product.stock_quantity === 0
              ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
              : 'bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white border border-primary-200 hover:border-primary-500 shadow-2xs hover:shadow-xs'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
