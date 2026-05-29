-- =========================================================================
-- SUPABASE RLS POLICIES REPAIR SCRIPT FOR PRINCESS COLLECTION
-- =========================================================================
-- 
-- Run this entire script in your Supabase Dashboard SQL Editor to solve the
-- "infinite recursion detected in policy for relation 'profiles'" error.
--

-- 1. Create the `is_admin` security definer function.
--    Because it uses `SECURITY DEFINER`, it runs with superuser privileges
--    and bypasses Row Level Security (RLS), preventing infinite recursion loops.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Dynamically drop all existing policies on the `profiles` table to start fresh.
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 3. Create clean, non-recursive RLS policies for `profiles` table.
--    Allows public reading of basic profiles (or user reading own, and admins all),
--    allows users to register/insert their own profile, and admins/users to update.
CREATE POLICY "Enable select for users and admins" ON public.profiles 
  FOR SELECT 
  USING ( auth.uid() = id OR public.is_admin() );

CREATE POLICY "Enable insert for users own profile" ON public.profiles 
  FOR INSERT 
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Enable update for own profile or admins" ON public.profiles 
  FOR UPDATE 
  USING ( auth.uid() = id OR public.is_admin() );

-- 4. Dynamically drop all existing policies on the `categories` table.
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'categories' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', pol.policyname);
    END LOOP;
END $$;

-- 5. Create clean RLS policies for `categories` table.
--    Allows public (anonymous customers) to browse category list,
--    and restricts writes (insert, update, delete) to administrators.
CREATE POLICY "Allow public select on categories" ON public.categories 
  FOR SELECT 
  USING ( true );

CREATE POLICY "Allow admins write on categories" ON public.categories 
  FOR ALL 
  USING ( public.is_admin() );

-- =========================================================================
-- 6. Create social_feeds table and policies
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.social_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  likes TEXT,
  post_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_feeds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on social_feeds if any
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'social_feeds' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.social_feeds', pol.policyname);
    END LOOP;
END $$;

-- Create policies for social_feeds
CREATE POLICY "Allow public select on social_feeds" ON public.social_feeds 
  FOR SELECT 
  USING ( true );

CREATE POLICY "Allow admins write on social_feeds" ON public.social_feeds 
  FOR ALL 
  USING ( public.is_admin() );

-- =========================================================================
-- 7. Update orders payment_method check constraint to allow 'phonepe'
-- =========================================================================
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('cod', 'razorpay', 'phonepe'));

-- =========================================================================
-- 8. Add Checkout & Inventory RLS Policies
-- =========================================================================

-- Enable insert/select policies for public.orders (allowing guest checkouts)
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Enable insert for all orders" ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Enable select for all orders" ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

-- Enable insert/select policies for public.order_items (allowing order creation)
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Enable select for all order_items" ON public.order_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    ) OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users can create their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for all order_items" ON public.order_items;
CREATE POLICY "Enable insert for all order_items" ON public.order_items 
  FOR INSERT 
  WITH CHECK (true);

-- Enable public insert for inventory logs during purchase
DROP POLICY IF EXISTS "Admins can view and manage inventory logs" ON public.inventory_logs;
CREATE POLICY "Allow public insert on inventory_logs" ON public.inventory_logs 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow admins all on inventory_logs" ON public.inventory_logs 
  FOR ALL 
  USING (public.is_admin());

-- Enable public stock quantity update on products
DROP POLICY IF EXISTS "Allow public update on products stock" ON public.products;
CREATE POLICY "Allow public update on products stock" ON public.products 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- =========================================================================
-- 9. Add Cart Items RLS Policies
-- =========================================================================

-- Enable cart_items policies for authenticated users and admins
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;
CREATE POLICY "Enable select for users own cart" ON public.cart_items
  FOR SELECT
  USING ( auth.uid() = user_id OR public.is_admin() );

CREATE POLICY "Enable insert for users own cart" ON public.cart_items
  FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Enable update for users own cart" ON public.cart_items
  FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Enable delete for users own cart" ON public.cart_items
  FOR DELETE
  USING ( auth.uid() = user_id );




