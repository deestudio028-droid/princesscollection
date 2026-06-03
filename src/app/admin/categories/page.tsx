'use client';

import React, { useEffect, useState } from 'react';
import { useStore, Category } from '@/lib/store';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { uploadImageToSupabase } from '@/lib/uploadImage';

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory, hydrate } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) return null; // Handled by layout loader

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }
    
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
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          const url = await uploadImageToSupabase(blob);
          setImageUrl(url);
        } catch (error) {
          console.error("Upload failed", error);
          alert("Failed to upload image.");
        }
      }
    }, 'image/jpeg', 0.7);
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

  const openAddModal = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    
    await addCategory({
      name,
      description,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'
    });

    setSaving(false);
    setShowAddModal(false);
    confetti({ particleCount: 30, spread: 50, colors: ['#a855f7', '#ec4899'] });
  };

  const openEditModal = (c: Category) => {
    setSelectedCategory(c);
    setName(c.name);
    setDescription(c.description);
    setImageUrl(c.image_url);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !name) return;
    setSaving(true);
    
    await updateCategory(selectedCategory.id, {
      name,
      description,
      image_url: imageUrl
    });

    setSaving(false);
    setShowEditModal(false);
    setSelectedCategory(null);
    confetti({ particleCount: 30, spread: 50, colors: ['#a855f7', '#ec4899'] });
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Warning! Deleting this category will unassign all products under it. Continue?')) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">Manage jewelry collections and styles.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col group relative overflow-hidden">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>

            <div className="flex-1">
              <h3 className="font-serif text-lg font-bold text-slate-900">{c.name}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{c.description || 'No description provided.'}</p>
            </div>

            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-50 justify-end">
              <button onClick={() => openEditModal(c)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDeleteClick(c.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reusable Modal Form */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-slate-900 mb-6">
              {showAddModal ? 'Add New Category' : 'Edit Category'}
            </h3>

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diamond Chokers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Cover Image</label>
                {imageUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer aspect-video ${
                      dragActive ? 'border-fuchsia-500 bg-fuchsia-50' : 'border-slate-200 hover:border-fuchsia-400 bg-slate-50'
                    }`}
                  >
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Upload className="w-8 h-8 text-slate-400 mb-3" />
                    <span className="text-sm font-bold text-slate-900 block">Drag & Drop Image</span>
                    <span className="text-xs text-slate-500 block mt-1">or click to browse</span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 text-sm"
              >
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
