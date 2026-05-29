'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, Product, Review } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, Heart, Star, Sparkles, ShieldCheck, Truck, RefreshCw, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetail({ params }: PageProps) {
  // Resolve params using React.use()
  const { id } = use(params);
  
  const router = useRouter();
  const { 
    products, 
    categories, 
    reviews, 
    addReview, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    hydrate 
  } = useStore();

  // State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Find product
  const product = products.find((p) => p.id === id && !p.is_deleted);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fff8f9]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
          <span className="text-4xl">👑</span>
          <h2 className="font-serif text-2xl font-bold text-primary-900">Jewellery Not Found</h2>
          <p className="text-muted-foreground text-sm">The jewellery piece you are seeking does not exist or has been deleted.</p>
          <Link href="/shop" className="bg-primary-500 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md">
            Return to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Related Products
  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id && !p.is_deleted)
    .slice(0, 4);

  // Reviews for this product
  const productReviews = reviews.filter((r) => r.product_id === product.id && r.is_approved);
  const totalReviewsCount = productReviews.length;
  
  const averageRating = totalReviewsCount > 0
    ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1))
    : 5;

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    confetti({
      particleCount: 30,
      spread: 50,
      colors: ['#fbcfe8', '#ec4899', '#f3e5ab']
    });
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    router.push('/cart');
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !comment) return;

    addReview({
      product_id: product.id,
      product_title: product.title,
      reviewer_name: reviewerName,
      rating,
      comment
    });

    setReviewerName('');
    setComment('');
    setReviewSubmitted(true);

    // Fire cute pink sparkles!
    confetti({
      particleCount: 40,
      spread: 60,
      colors: ['#fbcfe8', '#f1ebfc']
    });

    setTimeout(() => {
      setReviewSubmitted(false);
    }, 4000);
  };

  const hasDiscount = !!product.discount_price && product.discount_price < product.price;
  const currentPrice = hasDiscount ? product.discount_price! : product.price;
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 4;
  const activeWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 font-semibold">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary-600">Shop Vault</Link>
          <span>/</span>
          <span className="text-primary-800 truncate">{product.title}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white border border-primary-100 rounded-3xl p-6 sm:p-8 shadow-2xs mb-12">
          
          {/* LEFT COLUMN: MULTIPLE IMAGE GALLERY */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-primary-50 border border-primary-100 relative group">
              {/* Main Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[activeImageIndex] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.is_bestseller && (
                  <span className="bg-primary-500 text-white font-medium text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-0.5 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    Bestseller
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-amber-400 text-amber-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                    ✨ Premium Choice
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === index
                        ? 'border-primary-500 scale-102 shadow-xs'
                        : 'border-primary-100 hover:border-primary-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="Jewellery View" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAIL VALUES & ACTIONS */}
          <div className="flex flex-col gap-5 justify-between">
            <div>
              <div className="text-xs text-primary-600 font-bold uppercase tracking-widest mb-1.5">
                Ornaments As Unique As You
              </div>
              <h1 className="font-serif text-3xl font-bold text-primary-950 leading-tight">
                {product.title}
              </h1>

              {/* Star Ratings Summary */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-amber-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-primary-800">{averageRating} out of 5</span>
                <span className="text-xs text-muted-foreground">({totalReviewsCount} moderated reviews)</span>
              </div>

              {/* Prices Section */}
              <div className="flex items-baseline gap-2 mt-4 pb-4 border-b border-primary-50">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-serif font-black text-primary-600">₹{product.discount_price?.toFixed(2)}
                    </span>
                    <span className="text-base text-muted-foreground line-through font-medium">₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full font-bold">
                      Save ₹{(product.price - product.discount_price!).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-serif font-black text-primary-700">₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-4">
                {product.description}
              </p>

              {/* Product tags */}
              <div className="flex items-center gap-1.5 flex-wrap mt-4">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tags:</span>
                {product.tags.map((t) => (
                  <span key={t} className="text-[10px] bg-primary-50 border border-primary-200/60 text-primary-600 px-2 py-0.5 rounded-md font-semibold">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Inventory Alerts & Action Toggles */}
            <div className="mt-4 pt-4 border-t border-primary-50 flex flex-col gap-4">
              
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-wider">Stock Status:</span>
                {isOutOfStock ? (
                  <span className="text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md animate-pulse">
                    Low Stock! Only {product.stock_quantity} left
                  </span>
                ) : (
                  <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    In Stock ({product.stock_quantity} units)
                  </span>
                )}
              </div>

              {/* Actions panels */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-semibold">Quantity:</span>
                  <div className="flex items-center border border-primary-200 rounded-xl bg-white p-0.5">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-primary-700 hover:bg-primary-50 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-primary-950">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((prev) => Math.min(product.stock_quantity, prev + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-primary-700 hover:bg-primary-50 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-4 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white border border-primary-200 hover:border-primary-500 shadow-2xs'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-4 rounded-full text-xs font-bold transition-all duration-300 text-center cursor-pointer ${
                    isOutOfStock
                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  Buy It Now
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`w-12 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    activeWishlist
                      ? 'bg-primary-500 border-primary-500 text-white scale-105'
                      : 'bg-white border-primary-200 text-primary-400 hover:bg-primary-50 hover:text-primary-500'
                  }`}
                  title="Toggle Wishlist"
                >
                  <Heart className={`w-5 h-5 ${activeWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 mt-4 border-t border-primary-50 pt-4 text-center text-[10px] text-muted-foreground">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary-500" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-primary-500" />
                <span>Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span>Secured Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white border border-primary-100 rounded-3xl p-6 sm:p-8 shadow-2xs mb-12">
          
          {/* Reviews Score Panel */}
          <div className="lg:col-span-1 border-r border-primary-50 pr-6">
            <h3 className="font-serif text-xl font-bold text-primary-900 mb-4">Princess Feedback</h3>
            
            <div className="flex items-center gap-3 mb-6 bg-primary-50/50 p-4 rounded-2xl border border-primary-100">
              <div className="text-4xl font-serif font-black text-primary-600">{averageRating}</div>
              <div>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-amber-200'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Product Rating</span>
              </div>
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-3.5">
              <h4 className="text-xs font-bold text-primary-900 uppercase tracking-widest flex items-center gap-1">
                <span>Leave a Review</span>
              </h4>
              
              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Your Rating</label>
                <div className="flex gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="cursor-pointer focus:outline-hidden hover:scale-120 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (hoverRating ?? rating) ? 'fill-current' : 'text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lilly Watson"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-white border border-primary-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-900"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Comment</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your royalty experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-primary-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-900 resize-none"
                />
              </div>

              {reviewSubmitted && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 rounded-xl font-medium text-center animate-pulse">
                  ✨ Submitted! Pending Admin Approval.
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">Verified Purchases</h3>
            
            {productReviews.length === 0 ? (
              <div className="bg-primary-50/20 border border-primary-100/60 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">✨</span>
                <span className="text-xs font-bold text-primary-800">Be the first to sparkle!</span>
                <span className="text-[10px] text-muted-foreground max-w-xs">
                  This handmade masterpiece has no approved reviews yet. Write a review to share your experience with the world!
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 max-h-[380px] overflow-y-auto pr-2">
                {productReviews.map((r) => (
                  <div key={r.id} className="border border-primary-100 rounded-2xl p-4 bg-primary-50/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-primary-900">{r.reviewer_name}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-amber-200'}`} />
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed italic pr-2">
                      &quot;{r.comment}&quot;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-2xl font-bold text-primary-900 mb-6 flex items-center gap-1.5">
              <span>Complete The Royal Vibe</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
