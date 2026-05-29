'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Product } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingBag, ArrowRight, Trash2, Tag, Percent, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Cart() {
  const { 
    cart, 
    products, 
    coupons, 
    updateCartQuantity, 
    removeFromCart, 
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    minPurchase: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

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

  // Map cart items to full product data
  const cartItemsWithDetails = cart.map((cartItem) => {
    const product = products.find((p) => p.id === cartItem.product_id);
    return {
      ...cartItem,
      product
    };
  }).filter(item => item.product !== undefined && !item.product.is_deleted);

  // Subtotal Calculation
  const subtotal = cartItemsWithDetails.reduce((sum, item) => {
    const price = item.product!.discount_price || item.product!.price;
    return sum + price * item.quantity;
  }, 0);

  // Coupon calculations
  let discountAmount = 0;
  if (appliedCoupon) {
    if (subtotal < appliedCoupon.minPurchase) {
      setAppliedCoupon(null);
      setCouponError(`Coupon requires minimum purchase of $${appliedCoupon.minPurchase}`);
    } else {
      if (appliedCoupon.discountType === 'percentage') {
        discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      } else {
        discountAmount = appliedCoupon.discountValue;
      }
    }
  }

  const shipping = subtotal === 0 ? 0.00 : 50.00;
  const totalAmount = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode) return;

    const code = couponCode.toUpperCase().trim();
    const foundCoupon = coupons.find(c => c.code === code && c.is_active);

    if (!foundCoupon) {
      setCouponError('Invalid or inactive coupon code. Try PRINCESS10 or LOVELY20!');
      return;
    }

    // Expiry check
    if (foundCoupon.expiry_date && new Date(foundCoupon.expiry_date).getTime() < Date.now()) {
      setCouponError('This coupon code has expired.');
      return;
    }

    // Min purchase check
    if (subtotal < foundCoupon.min_purchase_amount) {
      setCouponError(`Minimum purchase of $${foundCoupon.min_purchase_amount.toFixed(2)} is required.`);
      return;
    }

    setAppliedCoupon({
      code: foundCoupon.code,
      discountType: foundCoupon.discount_type,
      discountValue: Number(foundCoupon.discount_value),
      minPurchase: Number(foundCoupon.min_purchase_amount)
    });
    setCouponCode('');
    
    // Sparkly success confetti!
    confetti({
      particleCount: 30,
      spread: 40,
      colors: ['#fbcfe8', '#db2777', '#f3e5ab']
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleQuantityIncrease = (productId: string, currentQty: number, maxQty: number) => {
    if (currentQty < maxQty) {
      updateCartQuantity(productId, currentQty + 1);
    }
  };

  const handleQuantityDecrease = (productId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateCartQuantity(productId, currentQty - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold text-primary-950 mb-8 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-primary-500" />
          Your Shopping Cart
        </h1>

        {cartItemsWithDetails.length === 0 ? (
          // Empty State
          <div className="bg-white border border-primary-100 rounded-3xl p-16 text-center shadow-2xs flex flex-col items-center justify-center gap-4">
            <span className="text-5xl">👑</span>
            <h2 className="font-serif text-xl font-bold text-primary-850">Your Cart is Empty</h2>
            <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
              Your crown is waiting! Explore our premium handmade rings, blush pearl necklaces, and sparkling studs to fill your casket.
            </p>
            <Link
              href="/shop"
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3 rounded-full text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: LIST OF ITEMS */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cartItemsWithDetails.map((item) => {
                const product = item.product!;
                const hasDisc = !!product.discount_price && product.discount_price < product.price;
                const unitPrice = hasDisc ? product.discount_price! : product.price;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-primary-100 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs transition-all duration-300 hover:border-primary-200"
                  >
                    {/* Product Image and Title */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-50 border border-primary-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <Link href={`/product/${product.id}`} className="font-serif text-sm font-bold text-primary-950 hover:text-primary-600 transition-colors line-clamp-1">
                          {product.title}
                        </Link>
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider mt-0.5">
                          Handmade Jewellery
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-xs font-bold text-primary-600">₹{unitPrice.toFixed(2)}</span>
                          {hasDisc && (
                            <span className="text-[10px] text-muted-foreground line-through">₹{product.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls & Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                      
                      {/* Quantity Adjuster */}
                      <div className="flex items-center border border-primary-200 rounded-xl bg-white p-0.5">
                        <button
                          onClick={() => handleQuantityDecrease(product.id, item.quantity)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-primary-700 hover:bg-primary-50 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-primary-950">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityIncrease(product.id, item.quantity, product.stock_quantity)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-primary-700 hover:bg-primary-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right min-w-[70px]">
                        <div className="text-xs font-bold text-primary-950">₹{itemTotal.toFixed(2)}</div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-primary-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Keep Shopping Link */}
              <Link href="/shop" className="text-xs font-bold text-primary-600 hover:text-primary-500 hover:underline flex items-center gap-1 mt-2 px-1">
                ← Return to Shop Collection
              </Link>
            </div>

            {/* RIGHT COLUMN: PRICE SUMMARY & COUPONS */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Coupon Panel */}
              <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs">
                <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-primary-500" />
                  Royal Coupons
                </h3>

                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl flex items-center justify-between text-xs font-semibold animate-sparkle">
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code <b>{appliedCoupon.code}</b> Applied</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-rose-600 underline text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white border border-primary-200 px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-bold focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950"
                      />
                      <button
                        type="submit"
                        className="bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <span className="text-[10px] text-rose-500 font-bold px-1">{couponError}</span>
                    )}
                    <div className="text-[10px] text-muted-foreground leading-relaxed px-1 mt-1">
                      💡 Try using: <b>PRINCESS10</b> (10% off) or <b>LOVELY20</b> ($20 off, orders &gt;$100).
                    </div>
                  </form>
                )}
              </div>

              {/* Order Calculations Summary */}
              <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col gap-4">
                <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest pb-3 border-b border-primary-50">
                  Casket Summary
                </h3>

                <div className="flex flex-col gap-2.5 text-xs text-muted-foreground border-b border-primary-50 pb-4">
                  <div className="flex justify-between items-center">
                    <span>Jewellery Subtotal</span>
                    <span className="font-bold text-primary-950">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        Coupon Savings
                      </span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Royal Shipping</span>
                    <span className="font-bold text-primary-950">
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>

                </div>

                <div className="flex justify-between items-center text-sm font-bold text-primary-950 pt-1">
                  <span>Grand Total</span>
                  <span className="text-lg font-serif font-black text-primary-600">₹{totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href={`/checkout?coupon=${appliedCoupon?.code || ''}`}
                  className="w-full bg-primary-500 hover:bg-primary-600 hover:scale-102 text-white font-bold py-3.5 rounded-full text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
