import { create } from 'zustand';
import { supabase } from './supabase';
import toast from 'react-hot-toast';

// =========================================================================
// TYPES
// =========================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone_number: string;
  role: 'customer' | 'admin';
  saved_addresses: Address[];
  created_at?: string;
}

export interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface SocialPost {
  id: string;
  image_url: string;
  likes?: string;
  post_url?: string;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  category_id: string;
  tags: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_deleted: boolean;
  images: string[]; // local helper array of urls
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  expiry_date?: string;
  usage_limit?: number;
  used_count: number;
  min_purchase_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  order_number: string;
  status: 'pending' | 'packing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_address: Address;
  payment_method: 'cod' | 'razorpay' | 'phonepe';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  product_title: string;
  user_id?: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  product_title: string;
  quantity_changed: number; // positive for restock, negative for sale
  reason: 'restock' | 'sale' | 'refund' | 'adjustment';
  created_at: string;
}

// =========================================================================
// INITIAL SEED DATA
// =========================================================================

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  phone: string;
  joined: string;
  totalOrders: number;
  totalSpending: number;
  address: string;
}

const SEED_CATEGORIES: Category[] = [];
const SEED_PRODUCTS: Product[] = [];
const SEED_COUPONS: Coupon[] = [];
const SEED_REVIEWS: Review[] = [];
const SEED_ORDERS: Order[] = [];
const SEED_INVENTORY_LOGS: InventoryLog[] = [];
const SEED_CUSTOMERS: Customer[] = [];


// =========================================================================
// ZUSTAND STORE INTERFACE
// =========================================================================

interface DashboardStore {
  // Roles and Auth
  userRole: 'guest' | 'customer' | 'admin';
  activeUser: Profile | null;
  savedAddresses: Address[];
  setRole: (role: 'guest' | 'customer' | 'admin') => void;

  // Tables
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  reviews: Review[];
  orders: Order[];
  inventoryLogs: InventoryLog[];
  customers: typeof SEED_CUSTOMERS;
  socialFeed: SocialPost[];
  
  // Interactions
  cart: CartItem[];
  wishlist: string[]; // array of product ids

  // Database/Fetch Methods
  fetchCatalogFromSupabase: () => Promise<void>;
  fetchUserDataFromSupabase: (userId: string) => Promise<void>;
  updateUserProfile: (profile: Partial<Profile>) => Promise<void>;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>; // soft delete

  // Category CRUD
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Social Feed CRUD
  fetchSocialFeedFromSupabase: () => Promise<void>;
  addSocialPost: (post: Omit<SocialPost, 'id' | 'created_at'>) => Promise<void>;
  updateSocialPost: (id: string, post: Partial<SocialPost>) => Promise<void>;
  deleteSocialPost: (id: string) => Promise<void>;

  // Review management
  addReview: (review: Omit<Review, 'id' | 'is_approved' | 'created_at'>) => Promise<void>;
  approveReview: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Coupon System
  addCoupon: (coupon: Omit<Coupon, 'id' | 'used_count' | 'created_at'>) => void;
  toggleCoupon: (id: string) => void;
  deleteCoupon: (id: string) => void;

  // Order management
  createOrder: (orderData: {
    shippingAddress: Address;
    paymentMethod: 'cod' | 'razorpay' | 'phonepe';
    subtotal: number;
    discountAmount: number;
    totalAmount: number;
    couponCode?: string;
    notes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updateOrderPaymentStatus: (id: string, status: Order['payment_status']) => void;

  // Inventory movement log
  addInventoryLog: (product_id: string, quantity: number, reason: InventoryLog['reason']) => void;
  restockProduct: (product_id: string, quantity: number) => void;

  // Customer Interactions
  addToCart: (product_id: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (product_id: string, quantity: number) => Promise<void>;
  removeFromCart: (product_id: string) => Promise<void>;
  clearCart: () => void;
  
  toggleWishlist: (product_id: string) => Promise<void>;
  isInWishlist: (product_id: string) => boolean;

  // Address
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  
  // Hydrate Store
  hydrate: () => void;
}

// =========================================================================
// STORE CREATION
// =========================================================================

export const useStore = create<DashboardStore>((set, get) => {
  return {
    userRole: 'guest',
    activeUser: null,
    savedAddresses: [],

    categories: SEED_CATEGORIES,
    products: SEED_PRODUCTS,
    coupons: SEED_COUPONS,
    reviews: SEED_REVIEWS,
    orders: SEED_ORDERS,
    inventoryLogs: SEED_INVENTORY_LOGS,
    customers: SEED_CUSTOMERS,
    socialFeed: [],
    
    cart: [],
    wishlist: [],

    // SET ROLE (Guest, Customer, Admin switcher)
    setRole: (role) => {
      const activeUser: Profile | null = role === 'admin' 
        ? {
            id: 'admin-1',
            email: 'owner@princesscollection.com',
            full_name: 'Princess Owner',
            avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
            phone_number: '+1 (800) PRINCESS',
            role: 'admin',
            saved_addresses: []
          }
        : role === 'customer' 
        ? {
            id: 'cust-1',
            email: 'lily@princess.com',
            full_name: 'Lily Chen',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            phone_number: '+1 (555) 382-9102',
            role: 'customer',
            saved_addresses: []
          }
        : null;
      set({ userRole: role, activeUser });
    },

    // DATABASE CATALOG FETCH
    fetchCatalogFromSupabase: async () => {
      try {
        const [catsRes, prodsRes, revsRes, coupsRes, _socialRes] = await Promise.all([
          supabase.from('categories').select('*').order('name', { ascending: true }),
          supabase.from('products').select('*, product_images(image_url)').eq('is_deleted', false).order('created_at', { ascending: false }),
          supabase.from('reviews').select('*').order('created_at', { ascending: false }),
          supabase.from('coupons').select('*'),
          get().fetchSocialFeedFromSupabase()
        ]);

        if (catsRes.data) {
          set({ categories: catsRes.data });
        }

        if (prodsRes.data) {
          const formattedProducts = prodsRes.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description || '',
            price: Number(p.price),
            discount_price: p.discount_price ? Number(p.discount_price) : undefined,
            stock_quantity: Number(p.stock_quantity),
            category_id: p.category_id || '',
            tags: p.tags || [],
            is_featured: !!p.is_featured,
            is_bestseller: !!p.is_bestseller,
            is_deleted: !!p.is_deleted,
            images: p.product_images?.map((img: any) => img.image_url) || [],
            created_at: p.created_at,
            updated_at: p.updated_at
          }));
          set({ products: formattedProducts });
        }

        if (revsRes.data) {
          set({ reviews: revsRes.data });
        }

        if (coupsRes.data) {
          const formattedCoupons = coupsRes.data.map((c: any) => ({
            id: c.id,
            code: c.code,
            discount_type: c.discount_type,
            discount_value: Number(c.discount_value),
            expiry_date: c.expiry_date,
            usage_limit: c.usage_limit,
            used_count: Number(c.used_count || 0),
            min_purchase_amount: Number(c.min_purchase_amount || 0),
            is_active: !!c.is_active,
            created_at: c.created_at
          }));
          set({ coupons: formattedCoupons });
        }

      } catch (err) {
        console.error("Error fetching catalog from Supabase:", err);
      }
    },

    // DATABASE USER DETAILS FETCH
    fetchUserDataFromSupabase: async (userId: string) => {
      try {
        // 1. Fetch Wishlist
        const { data: wishListItems } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', userId);
        if (wishListItems) {
          set({ wishlist: wishListItems.map((w: any) => w.product_id) });
        }

        // 2. Fetch Cart Items
        const { data: cartItems } = await supabase
          .from('cart_items')
          .select('id, product_id, quantity')
          .eq('user_id', userId);
        if (cartItems) {
          set({ cart: cartItems.map((c: any) => ({ id: c.id, product_id: c.product_id, quantity: c.quantity })) });
        }

        // 3. Fetch Orders
        let ordersQuery = supabase.from('orders').select('*, order_items(*)');
        if (get().userRole !== 'admin') {
          ordersQuery = ordersQuery.eq('user_id', userId);
        }
        const { data: ords } = await ordersQuery.order('created_at', { ascending: false });

        if (ords) {
          const formattedOrders: Order[] = await Promise.all(ords.map(async (o: any) => {
            const items = o.order_items.map((item: any) => {
              const p = get().products.find(prod => prod.id === item.product_id);
              return {
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id,
                product_title: p?.title || 'Unknown Jewelry Piece',
                product_image: p?.images[0] || '',
                quantity: item.quantity,
                price: Number(item.price)
              };
            });
            return {
              id: o.id,
              user_id: o.user_id || '',
              user_email: get().activeUser?.email || 'customer@princess.com',
              order_number: o.order_number,
              status: o.status,
              total_amount: Number(o.total_amount),
              subtotal: Number(o.subtotal),
              discount_amount: Number(o.discount_amount),
              shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
              payment_method: o.payment_method,
              payment_status: o.payment_status,
              notes: o.notes || '',
              items,
              created_at: o.created_at,
              updated_at: o.updated_at
            };
          }));
          set({ orders: formattedOrders });
        }

        // 4. Fetch Customers if Admin
        if (get().userRole === 'admin') {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (profilesData) {
            const formattedCustomers = profilesData.map((p: any) => ({
              id: p.id,
              fullName: p.full_name || 'Guest User',
              email: p.email || 'guest@example.com',
              avatar: p.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
              phone: p.phone_number || 'N/A',
              joined: p.created_at || new Date().toISOString(),
              totalOrders: 0,
              totalSpending: 0,
              address: ''
            }));
            set({ customers: formattedCustomers });
          }
        }
      } catch (err) {
        console.error("Error fetching user data from Supabase:", err);
      }
    },

    updateUserProfile: async (updatedFields) => {
      try {
        const user = get().activeUser;
        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .update(updatedFields)
          .eq('id', user.id);

        if (error) {
          console.error("Error updating user profile:", error);
          return;
        }

        set({
          activeUser: {
            ...user,
            ...updatedFields
          }
        });
      } catch (err) {
        console.error("updateUserProfile error:", err);
      }
    },

    // PRODUCT CRUD
    addProduct: async (p) => {
      try {
        const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { data: insertedProduct, error: prodErr } = await supabase
          .from('products')
          .insert({
            title: p.title,
            slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: p.description,
            price: p.price,
            discount_price: p.discount_price || null,
            stock_quantity: p.stock_quantity,
            category_id: p.category_id || null,
            tags: p.tags,
            is_featured: p.is_featured,
            is_bestseller: p.is_bestseller,
            is_deleted: false
          })
          .select()
          .single();

        if (prodErr || !insertedProduct) {
          console.error("Error inserting product:", prodErr);
          toast.error("Failed to insert product: " + (prodErr?.message || "Verify your admin permissions."));
          return;
        }

        const productId = insertedProduct.id;

        // Insert image records
        if (p.images && p.images.length > 0) {
          const imageRecords = p.images.map((url, index) => ({
            product_id: productId,
            image_url: url,
            display_order: index
          }));
          const { error: imgErr } = await supabase.from('product_images').insert(imageRecords);
          if (imgErr) console.error("Error inserting images:", imgErr);
        }

        // Register initial stock inventory log
        if (p.stock_quantity > 0) {
          await supabase.from('inventory_logs').insert({
            product_id: productId,
            quantity_changed: p.stock_quantity,
            reason: 'restock'
          });
        }

        // Optimistic update
        set(state => ({
          products: [{
            id: productId,
            title: p.title,
            slug: insertedProduct.slug,
            description: p.description || '',
            price: Number(p.price),
            discount_price: p.discount_price ? Number(p.discount_price) : undefined,
            stock_quantity: Number(p.stock_quantity),
            category_id: p.category_id || '',
            tags: p.tags || [],
            is_featured: !!p.is_featured,
            is_bestseller: !!p.is_bestseller,
            is_deleted: false,
            images: p.images || [],
            created_at: insertedProduct.created_at,
            updated_at: insertedProduct.updated_at
          }, ...state.products]
        }));
      } catch (err: any) {
        console.error("addProduct error:", err);
        toast.error("Error: " + (err?.message || "Failed to add product"));
      }
    },

    updateProduct: async (id, updatedFields) => {
      try {
        const updateData: any = {};
        if (updatedFields.title !== undefined) {
          updateData.title = updatedFields.title;
          updateData.slug = updatedFields.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (updatedFields.description !== undefined) updateData.description = updatedFields.description;
        if (updatedFields.price !== undefined) updateData.price = updatedFields.price;
        if (updatedFields.discount_price !== undefined) updateData.discount_price = updatedFields.discount_price || null;
        if (updatedFields.stock_quantity !== undefined) updateData.stock_quantity = updatedFields.stock_quantity;
        if (updatedFields.category_id !== undefined) updateData.category_id = updatedFields.category_id || null;
        if (updatedFields.tags !== undefined) updateData.tags = updatedFields.tags;
        if (updatedFields.is_featured !== undefined) updateData.is_featured = updatedFields.is_featured;
        if (updatedFields.is_bestseller !== undefined) updateData.is_bestseller = updatedFields.is_bestseller;

        if (Object.keys(updateData).length > 0) {
          const { error: prodErr } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id);
          if (prodErr) {
            console.error("Error updating product:", prodErr);
            toast.error("Failed to update product: " + prodErr.message);
            return;
          }
        }

        // Update product images
        if (updatedFields.images !== undefined) {
          await supabase.from('product_images').delete().eq('product_id', id);
          if (updatedFields.images.length > 0) {
            const imageRecords = updatedFields.images.map((url, index) => ({
              product_id: id,
              image_url: url,
              display_order: index
            }));
            await supabase.from('product_images').insert(imageRecords);
          }
        }

        // Log stock changes
        const oldProduct = get().products.find(p => p.id === id);
        if (oldProduct && updatedFields.stock_quantity !== undefined && updatedFields.stock_quantity !== oldProduct.stock_quantity) {
          const difference = updatedFields.stock_quantity - oldProduct.stock_quantity;
          await supabase.from('inventory_logs').insert({
            product_id: id,
            quantity_changed: difference,
            reason: 'adjustment'
          });
        }

        // Optimistic update
        set(state => ({
          products: state.products.map(p => {
            if (p.id === id) {
              return {
                ...p,
                ...updatedFields,
                images: updatedFields.images !== undefined ? updatedFields.images : p.images
              };
            }
            return p;
          })
        }));
      } catch (err: any) {
        console.error("updateProduct error:", err);
        toast.error("Error: " + (err?.message || "Failed to update product"));
      }
    },

    deleteProduct: async (id) => {
      try {
        const { error } = await supabase
          .from('products')
          .update({ is_deleted: true })
          .eq('id', id);
        if (error) {
          console.error("Error soft deleting product:", error);
          alert("Failed to delete product: " + error.message);
        }
        // Optimistic update
        set(state => ({
          products: state.products.filter(p => p.id !== id)
        }));
      } catch (err: any) {
        console.error("deleteProduct error:", err);
        alert("deleteProduct Exception: " + (err?.message || JSON.stringify(err)));
      }
    },

    // CATEGORY CRUD
    addCategory: async (cat) => {
      try {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: cat.name,
            slug,
            description: cat.description,
            image_url: cat.image_url
          })
          .select()
          .single();
        if (error) {
          console.error("Error adding category:", error);
          alert("Failed to add category: " + error.message);
        } else if (data) {
          set(state => ({ categories: [...state.categories, data].sort((a, b) => a.name.localeCompare(b.name)) }));
        }
      } catch (err: any) {
        console.error("addCategory error:", err);
        toast.error("Error: " + (err?.message || "Failed to add category"));
      }
    },

    updateCategory: async (id, updatedFields) => {
      try {
        const updateData: any = { ...updatedFields };
        if (updatedFields.name !== undefined) {
          updateData.slug = updatedFields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const { error } = await supabase
          .from('categories')
          .update(updateData)
          .eq('id', id);
        if (error) {
          console.error("Error updating category:", error);
          alert("Failed to update category: " + error.message);
        }
        // Optimistic update
        set(state => ({
          categories: state.categories.map(c => c.id === id ? { ...c, ...updatedFields } : c)
        }));
      } catch (err: any) {
        console.error("updateCategory error:", err);
        alert("updateCategory Exception: " + (err?.message || JSON.stringify(err)));
      }
    },

    deleteCategory: async (id) => {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        if (error) {
          console.error("Error deleting category:", error);
          alert("Failed to delete category: " + error.message);
        }
        // Optimistic update
        set(state => ({
          categories: state.categories.filter(c => c.id !== id)
        }));
      } catch (err: any) {
        console.error("deleteCategory error:", err);
        alert("deleteCategory Exception: " + (err?.message || JSON.stringify(err)));
      }
    },

    // SOCIAL FEED
    fetchSocialFeedFromSupabase: async () => {
      try {
        const { data, error } = await supabase
          .from('social_feeds')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error("Error fetching social feeds:", error);
          return;
        }
        if (data) {
          set({ socialFeed: data });
        }
      } catch (err) {
        console.error("fetchSocialFeedFromSupabase error:", err);
      }
    },

    addSocialPost: async (post) => {
      try {
        const { error } = await supabase
          .from('social_feeds')
          .insert({
            image_url: post.image_url,
            likes: post.likes || null,
            post_url: post.post_url || null
          });
        if (error) {
          console.error("Error adding social post:", error);
          return;
        }
        await get().fetchSocialFeedFromSupabase();
      } catch (err) {
        console.error("addSocialPost error:", err);
      }
    },

    deleteSocialPost: async (id) => {
      try {
        const { error } = await supabase
          .from('social_feeds')
          .delete()
          .eq('id', id);
        if (error) {
          console.error("Error deleting social post:", error);
          return;
        }
        await get().fetchSocialFeedFromSupabase();
      } catch (err) {
        console.error("deleteSocialPost error:", err);
      }
    },

    updateSocialPost: async (id, updatedFields) => {
      try {
        const updateData: any = {};
        if (updatedFields.image_url !== undefined) updateData.image_url = updatedFields.image_url;
        if (updatedFields.likes !== undefined) updateData.likes = updatedFields.likes || null;
        if (updatedFields.post_url !== undefined) updateData.post_url = updatedFields.post_url || null;

        const { error } = await supabase
          .from('social_feeds')
          .update(updateData)
          .eq('id', id);
        if (error) {
          console.error("Error updating social post:", error);
          return;
        }
        await get().fetchSocialFeedFromSupabase();
      } catch (err) {
        console.error("updateSocialPost error:", err);
      }
    },

    // REVIEWS
    addReview: async (r) => {
      try {
        const { error } = await supabase
          .from('reviews')
          .insert({
            product_id: r.product_id,
            user_id: get().activeUser?.id || null,
            reviewer_name: r.reviewer_name,
            rating: r.rating,
            comment: r.comment,
            is_approved: false
          });
        if (error) console.error("Error adding review:", error);
        await get().fetchCatalogFromSupabase();
      } catch (err) {
        console.error("addReview error:", err);
      }
    },

    approveReview: async (id) => {
      try {
        const { error } = await supabase
          .from('reviews')
          .update({ is_approved: true })
          .eq('id', id);
        if (error) {
          console.error("Error approving review:", error);
          return;
        }
        await get().fetchCatalogFromSupabase();
      } catch (err) {
        console.error("approveReview error:", err);
      }
    },

    deleteReview: async (id) => {
      try {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', id);
        if (error) {
          console.error("Error deleting review:", error);
          return;
        }
        await get().fetchCatalogFromSupabase();
      } catch (err) {
        console.error("deleteReview error:", err);
      }
    },

    // COUPONS
    addCoupon: async (c) => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .insert({
            code: c.code,
            discount_type: c.discount_type,
            discount_value: c.discount_value,
            expiry_date: c.expiry_date || null,
            usage_limit: c.usage_limit || null,
            min_purchase_amount: c.min_purchase_amount || 0,
            is_active: c.is_active
          })
          .select()
          .single();
        if (error) console.error("Error adding coupon:", error);
        else if (data) {
          set(state => ({
            coupons: [...state.coupons, {
              id: data.id,
              code: data.code,
              discount_type: data.discount_type,
              discount_value: Number(data.discount_value),
              expiry_date: data.expiry_date,
              usage_limit: data.usage_limit,
              used_count: Number(data.used_count || 0),
              min_purchase_amount: Number(data.min_purchase_amount || 0),
              is_active: !!data.is_active,
              created_at: data.created_at
            }]
          }));
        }
      } catch (err) {
        console.error("addCoupon error:", err);
      }
    },

    toggleCoupon: async (id) => {
      try {
        const coupon = get().coupons.find(c => c.id === id);
        if (!coupon) return;
        const { error } = await supabase
          .from('coupons')
          .update({ is_active: !coupon.is_active })
          .eq('id', id);
        if (error) console.error("Error toggling coupon:", error);
        else {
          set(state => ({
            coupons: state.coupons.map(c => c.id === id ? { ...c, is_active: !coupon.is_active } : c)
          }));
        }
      } catch (err) {
        console.error("toggleCoupon error:", err);
      }
    },

    deleteCoupon: async (id) => {
      try {
        const { error } = await supabase
          .from('coupons')
          .delete()
          .eq('id', id);
        if (error) console.error("Error deleting coupon:", error);
        else {
          set(state => ({
            coupons: state.coupons.filter(c => c.id !== id)
          }));
        }
      } catch (err) {
        console.error("deleteCoupon error:", err);
      }
    },

    // INVENTORY LOGS
    addInventoryLog: (product_id, quantity_changed, reason) => {
      // Handled inside DB queries
    },

    restockProduct: (product_id, quantity) => {
      get().updateProduct(product_id, {
        stock_quantity: Math.max(0, (get().products.find(p => p.id === product_id)?.stock_quantity || 0) + quantity)
      });
    },

    // CUSTOMER ACTIONS
    addToCart: async (product_id, quantity = 1) => {
      const user = get().activeUser;
      const isDbUser = user && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

      if (isDbUser) {
        try {
          const { data: existing } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', product_id)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('cart_items')
              .update({ quantity: existing.quantity + quantity })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id,
                quantity
              });
          }
          await get().fetchUserDataFromSupabase(user.id);
        } catch (err) {
          console.error("addToCart error:", err);
        }
      } else {
        set((state) => {
          const existing = state.cart.find(c => c.product_id === product_id);
          let cart: CartItem[];
          if (existing) {
            cart = state.cart.map(c => 
              c.product_id === product_id ? { ...c, quantity: c.quantity + quantity } : c
            );
          } else {
            cart = [...state.cart, { id: 'cart-' + Date.now(), product_id, quantity }];
          }
          localStorage.setItem('pc_cart', JSON.stringify(cart));
          return { cart };
        });
      }
    },

    updateCartQuantity: async (product_id, quantity) => {
      const user = get().activeUser;
      const isDbUser = user && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

      if (isDbUser) {
        try {
          await supabase
            .from('cart_items')
            .update({ quantity: Math.max(1, quantity) })
            .eq('user_id', user.id)
            .eq('product_id', product_id);
          await get().fetchUserDataFromSupabase(user.id);
        } catch (err) {
          console.error("updateCartQuantity error:", err);
        }
      } else {
        set((state) => {
          const cart = state.cart.map(c => 
            c.product_id === product_id ? { ...c, quantity: Math.max(1, quantity) } : c
          );
          localStorage.setItem('pc_cart', JSON.stringify(cart));
          return { cart };
        });
      }
    },

    removeFromCart: async (product_id) => {
      const user = get().activeUser;
      const isDbUser = user && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

      if (isDbUser) {
        try {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', product_id);
          await get().fetchUserDataFromSupabase(user.id);
        } catch (err) {
          console.error("removeFromCart error:", err);
        }
      } else {
        set((state) => {
          const cart = state.cart.filter(c => c.product_id !== product_id);
          localStorage.setItem('pc_cart', JSON.stringify(cart));
          return { cart };
        });
      }
    },

    clearCart: async () => {
      const user = get().activeUser;
      const isDbUser = user && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

      localStorage.removeItem('pc_cart');
      set({ cart: [] });

      if (isDbUser) {
        try {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);
        } catch (err) {
          console.error("clearCart error:", err);
        }
      }
    },

    toggleWishlist: async (product_id) => {
      const user = get().activeUser;
      const isDbUser = user && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

      if (isDbUser) {
        try {
          const exists = get().wishlist.includes(product_id);
          if (exists) {
            await supabase
              .from('wishlist')
              .delete()
              .eq('user_id', user.id)
              .eq('product_id', product_id);
          } else {
            await supabase
              .from('wishlist')
              .insert({
                user_id: user.id,
                product_id
              });
          }
          await get().fetchUserDataFromSupabase(user.id);
        } catch (err) {
          console.error("toggleWishlist error:", err);
        }
      } else {
        set((state) => {
          const exists = state.wishlist.includes(product_id);
          const wishlist = exists 
            ? state.wishlist.filter(id => id !== product_id)
            : [...state.wishlist, product_id];
          localStorage.setItem('pc_wishlist', JSON.stringify(wishlist));
          return { wishlist };
        });
      }
    },

    isInWishlist: (product_id) => {
      return get().wishlist.includes(product_id);
    },

    // SAVED ADDRESSES
    addAddress: (address) => {
      const newAddress: Address = {
        ...address,
        id: 'addr-' + Date.now()
      };
      set((state) => {
        const savedAddresses = [...state.savedAddresses, newAddress];
        localStorage.setItem('pc_addresses', JSON.stringify(savedAddresses));
        return { savedAddresses };
      });
    },

    deleteAddress: (id) => {
      set((state) => {
        const savedAddresses = state.savedAddresses.filter(a => a.id !== id);
        localStorage.setItem('pc_addresses', JSON.stringify(savedAddresses));
        return { savedAddresses };
      });
    },

    // PLACE ORDER
    createOrder: async (orderData) => {
      try {
        const orderNumber = 'PRNC-' + Math.floor(10000 + Math.random() * 90000);
        
        // 1. Insert order record
        const { data: insertedOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            user_id: get().activeUser?.id || null,
            order_number: orderNumber,
            status: 'pending',
            total_amount: orderData.totalAmount,
            subtotal: orderData.subtotal,
            discount_amount: orderData.discountAmount,
            shipping_address: orderData.shippingAddress,
            payment_method: orderData.paymentMethod,
            payment_status: 'pending',
            notes: orderData.notes
          })
          .select()
          .single();

        if (orderErr || !insertedOrder) {
          console.error("Error creating order in Supabase:", orderErr);
          throw orderErr;
        }

        // 2. Insert order items
        const orderItemsData = get().cart.map((cartItem) => {
          const p = get().products.find(prod => prod.id === cartItem.product_id)!;
          return {
            order_id: insertedOrder.id,
            product_id: p.id,
            quantity: cartItem.quantity,
            price: p.discount_price || p.price
          };
        });

        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(orderItemsData);

        if (itemsErr) console.error("Error saving order items:", itemsErr);

        // 3. Log stock changes and update inventory logs
        for (const item of orderItemsData) {
          await supabase.from('inventory_logs').insert({
            product_id: item.product_id,
            quantity_changed: -item.quantity,
            reason: 'sale'
          });
          const p = get().products.find(prod => prod.id === item.product_id)!;
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, p.stock_quantity - item.quantity) })
            .eq('id', p.id);
        }

        // 4. Delete cart items from Supabase if authenticated
        if (get().activeUser) {
          await supabase.from('cart_items').delete().eq('user_id', get().activeUser!.id);
        }

        // Clear cart locally
        get().clearCart();

        // Refresh state
        if (get().activeUser) {
          await get().fetchUserDataFromSupabase(get().activeUser!.id);
        }
        await get().fetchCatalogFromSupabase();

        // Return order object matching TypeScript interface
        const formattedItems = orderItemsData.map((item) => {
          const p = get().products.find(prod => prod.id === item.product_id)!;
          return {
            id: 'item-temp',
            order_id: insertedOrder.id,
            product_id: item.product_id,
            product_title: p.title,
            product_image: p.images[0] || '',
            quantity: item.quantity,
            price: item.price
          };
        });

        return {
          id: insertedOrder.id,
          user_id: insertedOrder.user_id || '',
          user_email: get().activeUser?.email || 'guest@example.com',
          order_number: orderNumber,
          status: insertedOrder.status,
          total_amount: Number(insertedOrder.total_amount),
          subtotal: Number(insertedOrder.subtotal),
          discount_amount: Number(insertedOrder.discount_amount),
          shipping_address: insertedOrder.shipping_address,
          payment_method: insertedOrder.payment_method,
          payment_status: insertedOrder.payment_status,
          notes: insertedOrder.notes || '',
          items: formattedItems,
          created_at: insertedOrder.created_at,
          updated_at: insertedOrder.updated_at
        };
      } catch (err) {
        console.error("createOrder error:", err);
        throw err;
      }
    },

    updateOrderStatus: async (id, status) => {
      try {
        if (status === 'cancelled') {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

          if (items) {
            for (const item of items) {
              const p = get().products.find(prod => prod.id === item.product_id);
              if (p) {
                await supabase
                  .from('products')
                  .update({ stock_quantity: p.stock_quantity + item.quantity })
                  .eq('id', p.id);
              }
              await supabase.from('inventory_logs').insert({
                product_id: item.product_id,
                quantity_changed: item.quantity,
                reason: 'refund'
              });
            }
          }
        }

        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id);
        if (error) console.error("Error updating order status:", error);

        if (get().activeUser) {
          await get().fetchUserDataFromSupabase(get().activeUser!.id);
        }
        await get().fetchCatalogFromSupabase();
      } catch (err) {
        console.error("updateOrderStatus error:", err);
      }
    },

    updateOrderPaymentStatus: (id, payment_status) => {
      // Stub or local state logic if needed
    },

    // HYDRATE AND SETUP AUTH EVENT LISTENER
    hydrate: () => {
      if (typeof window === 'undefined') return;

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        alert("CRITICAL: Supabase URL or Anon Key environment variables are missing from your browser environment. Your site will not connect to the database!");
      }

      if (!(globalThis as any).__isAuthSubscribed) {
        (globalThis as any).__isAuthSubscribed = true;

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            let { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (!profile) {
              const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || '',
                  role: session.user.email === 'admin@princess.com' ? 'admin' : 'customer'
                })
                .select()
                .single();
              
              if (newProfile) {
                profile = newProfile;
              }
            } else if (session.user.email === 'admin@princess.com' && profile.role !== 'admin') {
              // Fix for existing profile with wrong role
              await supabase.from('profiles').update({ role: 'admin' }).eq('id', session.user.id);
              profile.role = 'admin';
            }

            const userProfile = profile || {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || '',
              avatar_url: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              phone_number: session.user.phone || '',
              role: 'customer',
              created_at: session.user.created_at
            };

            set({
              activeUser: {
                id: userProfile.id,
                email: userProfile.email,
                full_name: userProfile.full_name || '',
                avatar_url: userProfile.avatar_url || session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                phone_number: userProfile.phone_number || '',
                role: userProfile.role || 'customer',
                saved_addresses: [],
                created_at: userProfile.created_at || session.user.created_at
              },
              userRole: userProfile.role || 'customer'
            });
            get().fetchUserDataFromSupabase(userProfile.id);
          } else {
            set({
              activeUser: null,
              userRole: 'guest',
              orders: [],
              cart: [],
              wishlist: []
            });
          }
        });
      }

      get().fetchCatalogFromSupabase();

      try {
        const localAddresses = localStorage.getItem('pc_addresses');
        if (localAddresses) {
          set({ savedAddresses: JSON.parse(localAddresses) });
        }
      } catch (e) {
        console.error("Hydration addresses load error:", e);
      }

      try {
        const localCart = localStorage.getItem('pc_cart');
        if (localCart && !get().activeUser) {
          set({ cart: JSON.parse(localCart) });
        }
      } catch (e) {
        console.error("Hydration cart load error:", e);
      }

      try {
        const localWishlist = localStorage.getItem('pc_wishlist');
        if (localWishlist && !get().activeUser) {
          set({ wishlist: JSON.parse(localWishlist) });
        }
      } catch (e) {
        console.error("Hydration wishlist load error:", e);
      }
    }
  };
});
