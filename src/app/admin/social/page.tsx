'use client';

import React, { useEffect, useState } from 'react';
import { useStore, SocialPost } from '@/lib/store';
import { Plus, Edit2, Trash2, X, Upload, Camera, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminSocialFeed() {
  const { socialFeed, fetchSocialFeedFromSupabase, addSocialPost, deleteSocialPost, hydrate } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [postUrl, setPostUrl] = useState('');
  const [likes, setLikes] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hydrate();
    fetchSocialFeedFromSupabase();
    setMounted(true);
  }, [hydrate, fetchSocialFeedFromSupabase]);

  if (!mounted) return null;

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
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
    setImageUrl(canvas.toDataURL('image/jpeg', 0.7));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    setSaving(true);

    await addSocialPost({
      image_url: imageUrl,
      post_url: postUrl || undefined,
      likes: likes || '0'
    });

    setSaving(false);
    setShowAddModal(false);
    confetti({ particleCount: 30, spread: 50, colors: ['#a855f7', '#ec4899'] });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this social post?')) {
      await deleteSocialPost(id);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900">#PrincessCollection Moments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your Instagram social feed on the homepage.</p>
        </div>
        <button
          onClick={() => {
            setPostUrl(''); setLikes(''); setImageUrl('');
            setShowAddModal(true);
          }}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Post
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {socialFeed.map(post => (
          <div key={post.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs group relative">
            <div className="aspect-square w-full relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt="Social Feed" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                {post.post_url && (
                  <a href={post.post_url} target="_blank" rel="noreferrer" className="bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm transition-colors text-white">
                    <Camera className="w-5 h-5" />
                  </a>
                )}
                <button onClick={() => handleDelete(post.id)} className="bg-rose-500/80 hover:bg-rose-500 p-3 rounded-full backdrop-blur-sm transition-colors text-white" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                {post.likes || '0'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {socialFeed.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
          <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No social posts yet</h3>
          <p className="text-slate-500 text-sm mt-1">Add moments from Instagram to show on your storefront.</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-6">Add Social Post</h3>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Image</label>
                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-square border border-slate-200 group w-32 h-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImageUrl('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 hover:border-fuchsia-400 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-fuchsia-500">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm font-bold">Upload Image</span>
                  </label>
                )}
              </div>
              
              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Instagram Post URL (Optional)</label>
                <input type="url" value={postUrl} onChange={(e) => setPostUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" placeholder="https://instagram.com/p/..." />
              </div>
              
              <div>
                <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Likes Count</label>
                <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-hidden" placeholder="e.g. 1.2k or 350" />
              </div>

              <button type="submit" disabled={saving || !imageUrl} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 text-sm disabled:opacity-75">
                {saving ? 'Adding Post...' : 'Add Social Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
