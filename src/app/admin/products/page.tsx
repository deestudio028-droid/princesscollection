'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct, hydrate } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) return null;

  const processFiles = async (files: File[]) => {
    const validImageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newImagesPromises = validImageFiles.map(async file => {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      let width = bitmap.width;
      let height = bitmap.height;
      const max_size = 800; 

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
      return canvas.toDataURL('image/jpeg', 0.7);
    });

    try {
      const newImages = await Promise.all(newImagesPromises);
      setImagesList(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error("Error compressing images:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !stockQuantity || !categoryId) return;
    setSaving(true);

    await addProduct({
      title,
      slug: '',
      description,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : undefined,
      stock_quantity: Number(stockQuantity),
      category_id: categoryId,
      tags: [],
      images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'],
      is_featured: false,
      is_bestseller: false
    });

    setSaving(false);
    setShowAddModal(false);
    confetti({ particleCount: 30, spread: 50, colors: ['#a855f7', '#ec4899'] });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage jewelry pieces and stock levels.</p>
        </div>
        <button
          onClick={() => {
            setTitle(''); setDescription(''); setPrice(''); setDiscountPrice(''); setStockQuantity(''); setCategoryId(categories[0]?.id || ''); setImagesList([]);
            setShowAddModal(true);
          }}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {categories.find(c => c.id === p.category_id)?.name || 'Unknown'}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">₹{p.price}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${p.stock_quantity > 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button onClick={() => handleDelete(p.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-6">Add New Jewelry Piece</h3>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Title</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Price (₹)</label>
                  <input type="number" required min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Category</label>
                  <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden">
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Stock Quantity</label>
                  <input type="number" required min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Description</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Images</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagesList.map((src, i) => (
                      <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setImagesList(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-200 hover:border-fuchsia-400 bg-slate-50 flex items-center justify-center cursor-pointer transition-colors">
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                      <Upload className="w-5 h-5 text-slate-400" />
                    </label>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 text-sm disabled:opacity-75">
                {saving ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
