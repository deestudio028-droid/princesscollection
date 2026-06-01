'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore, Product } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';

function ShopContent() {
  const { products, categories, hydrate } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(300);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Sync category state with search parameters
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, selectedSort]);

  // Get active products
  const activeProducts = products.filter(p => !p.is_deleted);

  // Apply filters
  const filteredProducts = activeProducts.filter((product) => {
    // 1. Category filter
    if (selectedCategory !== 'all') {
      const category = categories.find(c => c.slug === selectedCategory);
      if (product.category_id !== category?.id) return false;
    }

    // 2. Search search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(term);
      const matchDesc = product.description.toLowerCase().includes(term);
      const matchTags = product.tags.some(t => t.toLowerCase().includes(term));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // 3. Price Filter
    const productPrice = product.discount_price || product.price;
    if (productPrice > priceRange) return false;

    return true;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discount_price || a.price;
    const priceB = b.discount_price || b.price;

    if (selectedSort === 'price-low') return priceA - priceB;
    if (selectedSort === 'price-high') return priceB - priceA;
    if (selectedSort === 'bestseller') {
      if (a.is_bestseller && !b.is_bestseller) return -1;
      if (!a.is_bestseller && b.is_bestseller) return 1;
      return 0;
    }
    // 'newest' default
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Paginated products
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriceRange(300);
    setSelectedSort('newest');
    router.push('/shop');
  };

  const handleCategorySelect = (slug: string) => {
    if (slug === 'all') {
      router.push('/shop');
    } else {
      router.push(`/shop?category=${slug}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title Banner */}
        <div className="bg-linear-to-r from-primary-100/60 via-pastel-lavender/40 to-primary-100/60 border border-primary-200/50 rounded-3xl p-8 mb-8 text-center shadow-2xs relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-900">
              The Princess Vault
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
              Sparkling handcrafted rings, shimmering pearl chokers, and delicate flower drop studs to elevate your aura.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-pink/20 blur-xl rounded-full" />
        </div>

        {/* Filter and Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <div className="lg:col-span-1 bg-linear-to-b from-primary-50/50 via-pastel-lavender/10 to-primary-50/30 border border-primary-200/50 rounded-3xl p-6 h-fit sticky top-24 shadow-2xs">
            <div className="flex items-center justify-between border-b border-primary-100 pb-4 mb-5">
              <span className="font-serif font-bold text-primary-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                <SlidersHorizontal className="w-4 h-4 text-primary-500" />
                Filter Vault
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[10px] bg-primary-50 hover:bg-primary-100 border border-primary-200 font-semibold px-2.5 py-1 rounded-md text-primary-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* 1. Category Filter List */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-primary-900 uppercase tracking-widest mb-3">Category</h4>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all font-semibold ${
                    selectedCategory === 'all'
                      ? 'bg-primary-500 text-white font-bold shadow-xs'
                      : 'bg-white/45 text-primary-700 hover:bg-white/80 border border-primary-100/40'
                  }`}
                >
                  All Jewellery
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCategorySelect(c.slug)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all font-semibold ${
                      selectedCategory === c.slug
                        ? 'bg-primary-500 text-white font-bold shadow-xs'
                        : 'bg-white/45 text-primary-700 hover:bg-white/80 border border-primary-100/40'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Price Filter Range */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-primary-900 uppercase tracking-widest">Max Price</h4>
                <span className="text-xs font-bold text-primary-600">₹{priceRange}</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-primary-500 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>₹30</span>
                <span>₹300</span>
              </div>
            </div>

            {/* Quick Tag Info */}
            <div className="border-t border-primary-50 pt-4 text-center">
              <span className="text-[10px] text-muted-foreground italic font-semibold">
                ✨ Free luxury pink velvet drawer box included with every order!
              </span>
            </div>
          </div>

          {/* RIGHT SIDEBAR: PRODUCTS & CONTROLS */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Top Toolbar Controls */}
            <div className="bg-white border border-primary-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
              
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search rings, necklaces, studs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-primary-200 pl-9 pr-4 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-900"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Sort By:
                </span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-white border border-primary-200 text-xs px-3 py-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-primary-900 font-semibold"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="bestseller">Best Selling</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active filters status summary */}
            <div className="text-xs text-muted-foreground flex items-center justify-between px-1">
              <span>
                Found <b>{sortedProducts.length}</b> gorgeous jewelry pieces
              </span>
              {(searchTerm || selectedCategory !== 'all' || priceRange < 300) && (
                <span className="bg-primary-50 px-2 py-0.5 border border-primary-200 text-primary-600 rounded-md font-semibold">
                  Filters Active
                </span>
              )}
            </div>

            {/* Product Grid View */}
            {paginatedProducts.length === 0 ? (
              <div className="bg-white border border-primary-100 rounded-3xl p-16 text-center shadow-2xs flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">🪄</span>
                <h3 className="font-serif text-lg font-bold text-primary-800">No jewelry fits this spell</h3>
                <p className="text-muted-foreground text-xs max-w-xs">
                  We couldn&apos;t find any items matching your selected criteria. Try resetting filters to view all products!
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {paginatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl border border-primary-200 bg-white hover:bg-primary-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold text-primary-700 transition-colors disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      currentPage === i + 1
                        ? 'bg-primary-500 text-white'
                        : 'border border-primary-200 bg-white text-primary-700 hover:bg-primary-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl border border-primary-200 bg-white hover:bg-primary-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold text-primary-700 transition-colors disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pink-50/20 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
