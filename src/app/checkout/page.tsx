'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore, Address } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, CreditCard, Sparkles, Heart, CheckCircle2, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    cart, 
    products, 
    coupons, 
    savedAddresses, 
    createOrder, 
    hydrate 
  } = useStore();

  // Load store
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Listen for PhonePe redirection callbacks
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const orderIdParam = searchParams.get('orderId');
    if (statusParam === 'success' && orderIdParam) {
      // Find the order details from Supabase since it has been completed
      const fetchOrder = async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderIdParam)
            .single();
          if (data) {
            setPlacedOrderDetails({
              orderNumber: data.order_number,
              totalAmount: Number(data.total_amount),
              shippingAddress: typeof data.shipping_address === 'string' ? JSON.parse(data.shipping_address) : data.shipping_address
            });
            
            // Clear cart locally
            localStorage.removeItem('pc_cart');

            // Celebrate
            const end = Date.now() + (3 * 1000);
            const colors = ['#fbcfe8', '#f472b6', '#e8daef', '#d4af37'];
            (function frame() {
              confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
              });
              confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
              });
              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            }());
          }
        } catch (err) {
          console.error('Error fetching completed PhonePe order details:', err);
        }
      };
      fetchOrder();
    } else if (statusParam === 'failed') {
      alert('Your payment could not be processed. Please try again or use another payment method.');
      // Remove query parameters from URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('status');
      url.searchParams.delete('orderId');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Selections
  const [paymentMethod, setPaymentMethod] = useState<'phonepe' | 'razorpay'>('phonepe');
  
  // Checkout Statuses
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<{
    orderNumber: string;
    totalAmount: number;
    shippingAddress: Address;
  } | null>(null);

  // Sync / Prefill Lily Chen's address if logged in
  useEffect(() => {
    if (savedAddresses.length > 0) {
      const def = savedAddresses[0];
      setFullName(def.fullName);
      setAddressLine1(def.addressLine1);
      setAddressLine2(def.addressLine2 || '');
      setCity(def.city);
      setState(def.state);
      setPostalCode(def.postalCode);
      setPhone(def.phone);
    }
  }, [savedAddresses]);

  // Map cart items
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

  // Read applied coupon from URL query param
  const couponQuery = searchParams.get('coupon');
  const activeCoupon = couponQuery 
    ? coupons.find(c => c.code === couponQuery && c.is_active) 
    : null;

  let discountAmount = 0;
  if (activeCoupon) {
    if (subtotal >= activeCoupon.min_purchase_amount) {
      if (activeCoupon.discount_type === 'percentage') {
        discountAmount = (subtotal * Number(activeCoupon.discount_value)) / 100;
      } else {
        discountAmount = Number(activeCoupon.discount_value);
      }
    }
  }

  const shipping = subtotal === 0 ? 0.00 : 50.00;
  const totalAmount = Math.max(0, subtotal - discountAmount + shipping);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !addressLine1 || !city || !state || !postalCode || !phone) return;

    setPlacingOrder(true);

    const shippingAddress: Address = {
      id: 'addr-' + Date.now(),
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      phone
    };

    try {
      const order = await createOrder({
        shippingAddress,
        paymentMethod,
        subtotal,
        discountAmount,
        totalAmount,
        couponCode: activeCoupon?.code || undefined,
        notes: notes || undefined
      });

      if (paymentMethod === 'phonepe') {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: order.id,
            amount: order.total_amount,
            userEmail: 'customer@princess.com',
            userPhone: phone
          })
        });

        const data = await response.json();
        if (data && data.success && data.url) {
          // Redirect browser to PhonePe PayPage URL
          window.location.href = data.url;
        } else {
          alert('Failed to initiate payment with PhonePe. Please check if the backend service is running.');
          setPlacingOrder(false);
        }
        return;
      }

      setPlacedOrderDetails({
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        shippingAddress: order.shipping_address
      });

      // Majestic Full Screen Confetti cascading hearts!
      const end = Date.now() + (3 * 1000);
      const colors = ['#fbcfe8', '#f472b6', '#e8daef', '#d4af37'];
      
      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setPlacingOrder(false);
    }
  };

  // If order placed, show gorgeous success panel
  if (placedOrderDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fff8f9]">
        <Navbar />
        <div className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center text-center justify-center gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-500 shadow-sm animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-bold text-primary-950">Sparkling Order Placed!</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Your crown and jewelry pieces are registered successfully in our casket under order number: <br />
              <span className="font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1 border border-primary-200 rounded-md inline-block mt-2">
                {placedOrderDetails.orderNumber}
              </span>
            </p>
          </div>

          {/* Receipt Panel */}
          <div className="w-full bg-white border border-primary-100 p-5 rounded-3xl text-left shadow-xs flex flex-col gap-3">
            <h3 className="font-serif text-xs font-bold text-primary-950 uppercase tracking-widest border-b border-primary-50 pb-2">
              Royal Receipt
            </h3>
            
            <div className="text-xs text-muted-foreground flex flex-col gap-1.5 border-b border-primary-50 pb-3">
              <div className="flex justify-between">
                <span>Ship To</span>
                <span className="font-bold text-primary-900">{placedOrderDetails.shippingAddress.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>Address</span>
                <span className="font-semibold text-primary-800 text-right">
                  {placedOrderDetails.shippingAddress.addressLine1}, {placedOrderDetails.shippingAddress.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode</span>
                <span className="uppercase font-bold text-primary-900">{paymentMethod}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-primary-950">
              <span>Amount Paid</span>
              <span className="text-base text-primary-600">₹{placedOrderDetails.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/profile"
              className="flex-1 bg-white hover:bg-primary-50 border border-primary-200 text-primary-700 py-3 rounded-full text-xs font-bold shadow-2xs text-center transition-colors cursor-pointer"
            >
              View Order History
            </Link>
            <Link
              href="/shop"
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-full text-xs font-bold shadow-xs text-center transition-colors cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Title */}
        <h1 className="font-serif text-3xl font-bold text-primary-950 mb-8 flex items-center gap-1.5">
          <ShieldCheck className="w-8 h-8 text-primary-500" />
          Royal Secure Checkout
        </h1>

        {cartItemsWithDetails.length === 0 ? (
          <div className="bg-white border border-primary-100 rounded-3xl p-10 text-center max-w-md mx-auto shadow-xs flex flex-col items-center gap-4">
            <span className="text-4xl">🪄</span>
            <h3 className="font-serif text-sm font-bold text-primary-850">Empty checkout vault</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Your cart is empty. You must add items before checking out.
            </p>
            <Link href="/shop" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
              Go To Shop
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: SHIELD ADDRESS & PAYMENT CHANNELS */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Address Card */}
              <div className="bg-white border border-primary-100 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
                <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest pb-2 border-b border-primary-50 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-[10px] font-bold">1</span>
                  Delivery Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lily Chen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="House number, apartment, street name..."
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Apartment, Suite, Unit (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Apt 4B, 3rd Floor"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. San Francisco"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">State / Province</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 94102"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 (555) 382-9102"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Order Notes (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Notes about delivery, e.g. leave at reception or gate code..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-950 resize-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white border border-primary-100 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
                <h3 className="font-serif text-sm font-bold text-primary-950 uppercase tracking-widest pb-2 border-b border-primary-50 flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-[10px] font-bold">2</span>
                  Payment Gateway
                </h3>

                <div className="flex flex-col gap-3.5">
                  {/* PhonePe Standard Checkout */}
                  <div
                    onClick={() => setPaymentMethod('phonepe')}
                    className={`border rounded-2xl p-4 flex items-center gap-3 select-none cursor-pointer transition-all ${
                      paymentMethod === 'phonepe'
                        ? 'border-primary-500 bg-primary-50/30 font-bold shadow-2xs'
                        : 'border-primary-150 hover:bg-primary-50/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'phonepe'}
                      onChange={() => setPaymentMethod('phonepe')}
                      className="accent-primary-500 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-primary-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary-500 fill-primary-100" />
                        PhonePe Standard Checkout
                      </span>
                      <span className="text-[9px] text-muted-foreground mt-0.5">UPI, QR Code, Credit/Debit Cards, Netbanking (Real Gateway)</span>
                    </div>
                  </div>

                  {/* Razorpay Select */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`border rounded-2xl p-4 flex items-center gap-3 select-none cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-primary-500 bg-primary-50/30 font-bold shadow-2xs'
                        : 'border-primary-150 hover:bg-primary-50/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-primary-500 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs text-primary-900 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-primary-500" />
                        Razorpay Secure Card
                      </span>
                      <span className="text-[9px] text-muted-foreground mt-0.5">Credit/Debit Cards, UPI, Netbanking (Sandbox Simulator)</span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'phonepe' && (
                  <div className="border border-dashed border-primary-200 bg-primary-50/20 p-3.5 rounded-2xl text-[10px] text-primary-800 leading-relaxed font-medium">
                    ⚡ <b>PhonePe Gateway Active:</b> You will be securely redirected to PhonePe Merchant Payment Page to complete the transaction.
                  </div>
                )}

                {paymentMethod === 'razorpay' && (
                  <div className="border border-dashed border-primary-200 bg-primary-50/20 p-3.5 rounded-2xl text-[10px] text-primary-800 leading-relaxed font-medium">
                    💎 <b>Razorpay Sandbox Ready:</b> Safe credit card transaction simulator is active. Upon placing this order, a secure merchant callback is automatically triggered to confirm the transaction.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: RECEIPTS SUMMARY & CTA */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Casket list recap */}
              <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col gap-3">
                <h3 className="font-serif text-xs font-bold text-primary-950 uppercase tracking-widest border-b border-primary-50 pb-2">
                  Order Items ({cartItemsWithDetails.length})
                </h3>
                
                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {cartItemsWithDetails.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product!.images[0]}
                          alt={item.product!.title}
                          className="w-9 h-9 rounded-md object-cover border border-primary-100 shrink-0"
                        />
                        <div className="max-w-[130px]">
                          <span className="font-bold text-primary-900 block truncate">{item.product!.title}</span>
                          <span className="text-[9px] text-muted-foreground">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-primary-950">₹{((item.product!.discount_price || item.product!.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Details summary */}
              <div className="bg-white border border-primary-100 rounded-3xl p-5 shadow-2xs flex flex-col gap-4">
                <h3 className="font-serif text-xs font-bold text-primary-950 uppercase tracking-widest border-b border-primary-50 pb-2">
                  Summary recap
                </h3>

                <div className="flex flex-col gap-2.5 text-xs text-muted-foreground border-b border-primary-50 pb-4">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-bold text-primary-950">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {activeCoupon && (
                    <div className="flex justify-between items-center text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" />
                        Coupon ({activeCoupon.code})
                      </span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span className="font-bold text-primary-950">
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-primary-950">
                  <span>Grand Total</span>
                  <span className="text-lg font-serif font-black text-primary-600">₹{totalAmount.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className={`w-full bg-primary-500 hover:bg-primary-600 hover:scale-102 text-white font-bold py-3.5 rounded-full text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                    placingOrder ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {placingOrder ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Securing Order...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200" />
                      <span>Place Princess Order</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pink-50/20 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
