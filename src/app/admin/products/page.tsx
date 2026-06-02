'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Product, Category } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Search, Edit2, Trash2, ShieldCheck, X, Sparkles, Filter, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminProducts() {
  const { 
    products, 
    categories, 
    userRole, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  
  // Search / Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form Fields (Common)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    const validImageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newImagesPromises = validImageFiles.map(async file => {
      // Compress image to prevent Supabase payload size limits
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      let width = bitmap.width;
      let height = bitmap.height;
      const max_size = 800; // max width/height

      if (width > height && width > max_size) {
        height *= max_size / width;
        width = max_size;
      } else if (height > max_size) {
        width *= max_size / height;
        height = max_size;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(bitmap, 0, 0, width, height);
      
      // Compress to 70% quality JPEG
      return canvas.toDataURL('image/jpeg', 0.7);
    });

    try {
      const newImages = await Promise.all(newImagesPromises);
      setImagesList(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  const removeImage = (index: number) => {
    setImagesList(prev => prev.filter((_, i) => i !== index));
  };

  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  // Auth Guard Gate
  useEffect(() => {
    if (mounted && userRole !== 'admin') {
      // Just in case, redirect or warning
    }
  }, [mounted, userRole]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-pink-50/20 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#fff8f9] items-center justify-center p-8 gap-4">
        <span className="text-4xl">🛡️</span>
        <h2 className="font-serif text-2xl font-bold text-primary-900">Access Denied</h2>
        <p className="text-muted-foreground text-sm">Please log in as Admin to access product controls.</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  // Filter products
  const activeProducts = products.filter(p => !p.is_deleted);
  
  const filteredProducts = activeProducts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (categoryFilter === 'all') return matchesSearch;
    return matchesSearch && p.category_id === categoryFilter;
  });

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setStockQuantity('10');
    setCategoryId(categories[0]?.id || '');
    setTagsInput('rings, gold, elegant');
    setImagesList([]);
    setIsFeatured(false);
    setIsBestseller(false);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !stockQuantity) return;

    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);

    await addProduct({
      title,
      slug: '',
      description,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : undefined,
      stock_quantity: Number(stockQuantity),
      category_id: categoryId,
      tags,
      images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'],
      is_featured: isFeatured,
      is_bestseller: isBestseller
    });

    setShowAddModal(false);
    
    confetti({
      particleCount: 30,
      spread: 40,
      colors: ['#a855f7', '#ec4899']
    });
  };

  const openEditModal = (p: Product) => {
    setSelectedProduct(p);
    setTitle(p.title);
    setDescription(p.description);
    setPrice(p.price.toString());
    setDiscountPrice(p.discount_price ? p.discount_price.toString() : '');
    setStockQuantity(p.stock_quantity.toString());
    setCategoryId(p.category_id);
    setTagsInput(p.tags.join(', '));
    setImagesList(p.images);
    setIsFeatured(p.is_featured);
    setIsBestseller(p.is_bestseller);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !title || !price || !stockQuantity) return;

    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);

    updateProduct(selectedProduct.id, {
      title,
      description,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : undefined,
      stock_quantity: Number(stockQuantity),
      category_id: categoryId,
      tags,
      images: imagesList,
      is_featured: isFeatured,
      is_bestseller: isBestseller
    });

    setShowEditModal(false);
    setSelectedProduct(null);

    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#a855f7', '#ec4899']
    });
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you absolutely sure you want to soft delete this premium jewellery piece from active stock?')) {
      deleteProduct(id);
      
      confetti({
        particleCount: 15,
        spread: 30,
        colors: ['#f43f5e', '#fda4af']
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
            <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title and Top CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary-950 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
              Jewellery Product Management
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Add new tiaras, edit pricing details, restock products, and toggle bestseller badges.
            </p>
          </div>
          
          <button
            onClick={openAddModal}
            className="bg-purple-600 hover:bg-purple-700 hover:scale-102 text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Jewellery Piece
          </button>
        </div>

        {/* Toolbar: Search and category filters */}
        <div className="bg-white border border-primary-100 rounded-3xl p-4 mb-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search products by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-primary-200 pl-9 pr-4 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-primary-950 font-medium"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-primary-200 text-xs px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-primary-950 font-semibold"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PRODUCTS DATA TABLE */}
        <div className="bg-white border border-primary-100 rounded-3xl overflow-hidden shadow-2xs">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted-foreground font-semibold">
              No products found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-primary-50/50 border-b border-primary-100 font-bold uppercase tracking-widest text-primary-900">
                    <th className="p-4">Jewellery details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock status</th>
                    <th className="p-4">Features</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {filteredProducts.map((p) => {
                    const cat = categories.find(c => c.id === p.category_id);
                    const hasDisc = !!p.discount_price && p.discount_price < p.price;

                    return (
                      <tr key={p.id} className="hover:bg-primary-50/10 transition-colors text-primary-950">
                        {/* Image & Title */}
                        <td className="p-4 font-semibold">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-10 h-10 rounded-lg object-cover border border-primary-100"
                            />
                            <div className="max-w-[200px]">
                              <span className="font-serif font-bold text-sm block truncate">{p.title}</span>
                              <span className="text-[10px] text-muted-foreground block font-mono uppercase mt-0.5">ID: {p.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category Name */}
                        <td className="p-4 font-semibold text-primary-850">
                          {cat?.name || 'Unassigned'}
                        </td>

                        {/* Price displays */}
                        <td className="p-4 font-bold">
                          {hasDisc ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-primary-600">₹{p.discount_price?.toFixed(2)}</span>
                              <span className="text-[10px] text-muted-foreground line-through font-medium">₹{p.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span>₹{p.price.toFixed(2)}</span>
                          )}
                        </td>

                        {/* Stock Quantity status */}
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            p.stock_quantity === 0
                              ? 'bg-neutral-100 text-neutral-500'
                              : p.stock_quantity <= 4
                              ? 'bg-rose-50 text-rose-600 animate-pulse'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} in stock`}
                          </span>
                        </td>

                        {/* Featured Bestseller toggles */}
                        <td className="p-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {p.is_featured && (
                              <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase">
                                Featured
                              </span>
                            )}
                            {p.is_bestseller && (
                              <span className="bg-primary-100 border border-primary-200 text-primary-800 text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase">
                                Best
                              </span>
                            )}
                            {!p.is_featured && !p.is_bestseller && (
                              <span className="text-muted-foreground italic text-[10px]">None</span>
                            )}
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => openEditModal(p)}
                              className="text-purple-600 hover:bg-purple-50 p-1.5 border border-purple-200 rounded-xl transition-all cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(p.id)}
                              className="text-rose-500 hover:bg-rose-50 p-1.5 border border-rose-200 rounded-xl transition-all cursor-pointer"
                              title="Soft Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =====================================================================
            MODAL: ADD PRODUCT FORM
        ===================================================================== */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-primary-150 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative flex flex-col gap-4 animate-scale">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-lg font-bold text-primary-950 flex items-center gap-1.5 pb-2 border-b border-primary-50">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Add Premium Jewellery Piece
              </h3>

              <form onSubmit={handleAddSubmit} className="flex flex-col gap-3.5 text-xs text-primary-950">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blossom Bow Studs"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={2.5}
                    placeholder="Describe design aesthetics, base metal, gems and styling secrets..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2 rounded-xl focus:outline-hidden text-primary-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="99.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Discount Price (₹) (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="79.00"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Product Images</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-purple-500 bg-purple-50/30'
                        : 'border-primary-200 hover:border-purple-400 hover:bg-[#fff8f9]/30'
                    }`}
                    onClick={() => document.getElementById('product-file-input-add')?.click()}
                  >
                    <input
                      id="product-file-input-add"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-[11px] text-primary-950 font-bold">
                      Drag & drop images here, or <span className="text-purple-600 underline">browse</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      Supports PNG, JPG, JPEG, WEBP (Max 5MB each)
                    </div>
                  </div>

                  {imagesList.length > 0 && (
                    <div className="grid grid-cols-4 gap-2.5 mt-3">
                      {imagesList.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-primary-100 group shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image}
                            alt={`Product preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-rose-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="rings, silver, quartz"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <div className="flex gap-4 items-center bg-primary-50/20 p-3 rounded-2xl border border-primary-100">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="accent-purple-600"
                    />
                    Featured choice
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={(e) => setIsBestseller(e.target.checked)}
                      className="accent-purple-600"
                    />
                    Bestseller ribbon
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-center mt-2"
                >
                  Create Product
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL: EDIT PRODUCT FORM
        ===================================================================== */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-primary-150 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative flex flex-col gap-4 animate-scale">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                }}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-lg font-bold text-primary-950 flex items-center gap-1.5 pb-2 border-b border-primary-50">
                <Edit2 className="w-5 h-5 text-purple-600" />
                Edit Jewellery Details
              </h3>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5 text-xs text-primary-950">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blossom Bow Studs"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={2.5}
                    placeholder="Describe design aesthetics..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2 rounded-xl focus:outline-hidden text-primary-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="99.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Discount Price (₹) (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="79.00"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900 font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Product Images</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-purple-500 bg-purple-50/30'
                        : 'border-primary-200 hover:border-purple-400 hover:bg-[#fff8f9]/30'
                    }`}
                    onClick={() => document.getElementById('product-file-input-edit')?.click()}
                  >
                    <input
                      id="product-file-input-edit"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-[11px] text-primary-950 font-bold">
                      Drag & drop images here, or <span className="text-purple-600 underline">browse</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      Supports PNG, JPG, JPEG, WEBP (Max 5MB each)
                    </div>
                  </div>

                  {imagesList.length > 0 && (
                    <div className="grid grid-cols-4 gap-2.5 mt-3">
                      {imagesList.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-primary-100 group shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image}
                            alt={`Product preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-rose-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="rings, silver, quartz"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <div className="flex gap-4 items-center bg-primary-50/20 p-3 rounded-2xl border border-primary-100">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="accent-purple-600"
                    />
                    Featured choice
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={(e) => setIsBestseller(e.target.checked)}
                      className="accent-purple-600"
                    />
                    Bestseller ribbon
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-center mt-2"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
