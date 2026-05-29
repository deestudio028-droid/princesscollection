'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Category } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Edit2, Trash2, ShieldCheck, X, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminCategories() {
  const { 
    categories, 
    userRole, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    hydrate 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Drag and Drop States and Helpers
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
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

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#fff8f9] items-center justify-center p-8 gap-4">
        <span className="text-4xl">🛡️</span>
        <h2 className="font-serif text-2xl font-bold text-primary-900">Access Denied</h2>
        <p className="text-muted-foreground text-sm">Please log in as Admin to access categories.</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const openAddModal = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCategory({
      name,
      description,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'
    });

    setShowAddModal(false);
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#a855f7', '#ec4899']
    });
  };

  const openEditModal = (c: Category) => {
    setSelectedCategory(c);
    setName(c.name);
    setDescription(c.description);
    setImageUrl(c.image_url);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !name) return;

    updateCategory(selectedCategory.id, {
      name,
      description,
      image_url: imageUrl
    });

    setShowEditModal(false);
    setSelectedCategory(null);
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#a855f7', '#ec4899']
    });
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Warning! Deleting this category will unassign all products under it. Continue?')) {
      deleteCategory(id);
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
              Princess Category Management
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Add new jewelry types, edit descriptions, and replace default category cover photos.
            </p>
          </div>
          
          <button
            onClick={openAddModal}
            className="bg-purple-600 hover:bg-purple-700 hover:scale-102 text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </button>
        </div>

        {/* Categories List Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-primary-100 rounded-3xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow shadow-2xs group relative overflow-hidden"
            >
              <div className="w-full h-36 rounded-2xl overflow-hidden mb-3.5 bg-primary-50 border border-primary-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-serif text-base font-bold text-primary-950">{c.name}</h3>
                <span className="text-[9px] bg-primary-100 text-primary-700 px-1.5 py-0.2 rounded-md font-mono mt-1 inline-block">
                  /{c.slug}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-2.5 line-clamp-3">
                  {c.description || 'No description provided.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-primary-50 justify-end">
                <button
                  onClick={() => openEditModal(c)}
                  className="text-purple-600 hover:bg-purple-50 p-1.5 border border-purple-200 rounded-xl transition-all cursor-pointer"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(c.id)}
                  className="text-rose-500 hover:bg-rose-50 p-1.5 border border-rose-200 rounded-xl transition-all cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL: ADD CATEGORY */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-primary-150 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-lg font-bold text-primary-950 pb-1 border-b border-primary-50">
                Add New Category
              </h3>

              <form onSubmit={handleAddSubmit} className="flex flex-col gap-3.5 text-xs text-primary-950">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blossom Chokers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe this product collection design theme..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2 rounded-xl focus:outline-hidden text-primary-900 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                    Category Cover Image
                  </label>
                  
                  {imageUrl ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary-100 bg-primary-50 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Category Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer aspect-video ${
                        dragActive
                          ? 'border-purple-500 bg-purple-50/20'
                          : 'border-primary-200 hover:border-purple-400 bg-primary-50/5'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Upload className="w-8 h-8 text-primary-400 mb-2" />
                      <span className="text-[11px] font-bold text-primary-950 block">
                        Drag & Drop Cover Image
                      </span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">
                        or click to browse caskets
                      </span>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-center mt-2"
                >
                  Create Category
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT CATEGORY */}
        {showEditModal && selectedCategory && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-primary-150 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                }}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-lg font-bold text-primary-950 pb-1 border-b border-primary-50">
                Edit Category
              </h3>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5 text-xs text-primary-950">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blossom Chokers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe this product collection design theme..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2 rounded-xl focus:outline-hidden text-primary-900 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                    Category Cover Image
                  </label>
                  
                  {imageUrl ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary-100 bg-primary-50 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Category Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer aspect-video ${
                        dragActive
                          ? 'border-purple-500 bg-purple-50/20'
                          : 'border-primary-200 hover:border-purple-400 bg-primary-50/5'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Upload className="w-8 h-8 text-primary-400 mb-2" />
                      <span className="text-[11px] font-bold text-primary-950 block">
                        Drag & Drop Cover Image
                      </span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">
                        or click to browse caskets
                      </span>
                    </label>
                  )}
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

