'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, SocialPost } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Plus, Trash2, ShieldCheck, X, Upload, Heart, ExternalLink, Sparkles, Edit2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminSocialFeed() {
  const {
    socialFeed,
    userRole,
    addSocialPost,
    updateSocialPost,
    deleteSocialPost,
    hydrate
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  // Form Fields
  const [imageUrl, setImageUrl] = useState('');
  const [likes, setLikes] = useState('');
  const [postUrl, setPostUrl] = useState('');

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
        <p className="text-muted-foreground text-sm">Please log in as Admin to access the Social Feed manager.</p>
        <Link href="/" className="bg-primary-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const openAddModal = () => {
    setImageUrl('');
    setLikes('');
    setPostUrl('');
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload an image!');
      return;
    }

    await addSocialPost({
      image_url: imageUrl,
      likes: likes || undefined,
      post_url: postUrl || undefined
    });

    setShowAddModal(false);
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#a855f7', '#ec4899']
    });
  };

  const openEditModal = (post: SocialPost) => {
    setSelectedPost(post);
    setImageUrl(post.image_url);
    setLikes(post.likes || '');
    setPostUrl(post.post_url || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    if (!imageUrl) {
      alert('Please upload an image!');
      return;
    }

    await updateSocialPost(selectedPost.id, {
      image_url: imageUrl,
      likes: likes || undefined,
      post_url: postUrl || undefined
    });

    setShowEditModal(false);
    setSelectedPost(null);
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#a855f7', '#ec4899']
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Are you sure you want to delete this post from the storefront social feed?')) {
      await deleteSocialPost(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f9]/15">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title and CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary-950 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
              Princess Social Feed Management
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Add customizable posts, configure likes counter, and set redirection links for customer stories.
            </p>
          </div>
          
          <button
            onClick={openAddModal}
            className="bg-purple-600 hover:bg-purple-700 hover:scale-102 text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Social Post
          </button>
        </div>

        {/* Social Feed Grid */}
        {socialFeed && socialFeed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {socialFeed.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-primary-100 rounded-3xl p-3 flex flex-col justify-between hover:shadow-xs transition-shadow shadow-2xs group relative overflow-hidden"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-primary-50 border border-primary-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt="Social Feed Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {item.post_url && (
                      <a
                        href={item.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 rounded-full bg-white/90 hover:bg-white text-purple-600 flex items-center justify-center shadow-xs transition-colors"
                        title="View Original Post"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-primary-600 font-bold">
                    <Heart className="w-3.5 h-3.5 fill-primary-500 text-primary-500" />
                    <span>{item.likes || 'N/A'}</span>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-purple-600 hover:bg-purple-50 p-1 border border-purple-200 rounded-lg transition-all cursor-pointer"
                      title="Edit Post"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="text-rose-500 hover:bg-rose-50 p-1 border border-rose-200 rounded-lg transition-all cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-primary-100 rounded-3xl max-w-lg mx-auto p-8 flex flex-col items-center gap-3">
            <Sparkles className="w-10 h-10 text-primary-400 animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-primary-950">No Social Posts Yet</h3>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
              Your homepage momentos gallery is empty. Create beautiful custom moments posts with image uploads to engage store customers!
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-full text-xs"
            >
              Add Your First Post
            </button>
          </div>
        )}

        {/* MODAL: ADD SOCIAL POST */}
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
                Add Social Post
              </h3>

              <form onSubmit={handleAddSubmit} className="flex flex-col gap-3.5 text-xs text-primary-950">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                    Upload Lifestyle Image
                  </label>
                  
                  {imageUrl ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-primary-100 bg-primary-50 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Preview Upload"
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
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer aspect-square ${
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
                        Drag & Drop Lifestyle Photo
                      </span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">
                        or click to browse local files
                      </span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Likes Metric (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.2k, 940, 3.4k"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Redirect Post URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://instagram.com/p/your-post"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-center mt-2"
                >
                  Publish Moment
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT SOCIAL POST */}
        {showEditModal && selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-primary-150 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPost(null);
                }}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-lg font-bold text-primary-950 pb-1 border-b border-primary-50">
                Edit Social Post
              </h3>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5 text-xs text-primary-950">
                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                    Upload Lifestyle Image
                  </label>
                  
                  {imageUrl ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-primary-100 bg-primary-50 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Preview Upload"
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
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer aspect-square ${
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
                        Drag & Drop Lifestyle Photo
                      </span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">
                        or click to browse local files
                      </span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Likes Metric (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.2k, 940, 3.4k"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Redirect Post URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://instagram.com/p/your-post"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    className="w-full bg-white border border-primary-200 px-3 py-2.5 rounded-xl focus:outline-hidden text-primary-900"
                  />
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
