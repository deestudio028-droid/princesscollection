-- Princess Collection Supabase Database Schema
-- A premium cute girly jewellery brand database schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES & USERS
-- Handled partly by Supabase Auth, but we track profile information here
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    full_name text,
    avatar_url text,
    phone_number text,
    role text default 'customer' check (role in ('customer', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- 2. CATEGORIES
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text not null unique,
    description text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

-- 3. PRODUCTS
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    slug text not null unique,
    description text,
    price decimal(10,2) not null,
    discount_price decimal(10,2),
    stock_quantity integer not null default 0,
    category_id uuid references public.categories(id) on delete set null,
    tags text[],
    is_featured boolean default false,
    is_bestseller boolean default false,
    is_deleted boolean default false, -- Soft delete support
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

-- 4. PRODUCT IMAGES
create table if not exists public.product_images (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    image_url text not null,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_images enable row level security;

-- 5. COUPONS
create table if not exists public.coupons (
    id uuid default uuid_generate_v4() primary key,
    code text not null unique,
    discount_type text not null check (discount_type in ('percentage', 'flat')),
    discount_value decimal(10,2) not null,
    expiry_date timestamp with time zone,
    usage_limit integer,
    used_count integer default 0,
    min_purchase_amount decimal(10,2) default 0.00,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coupons enable row level security;

-- 6. ORDERS
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    order_number text not null unique,
    status text default 'pending' check (status in ('pending', 'packing', 'shipped', 'delivered', 'cancelled')),
    total_amount decimal(10,2) not null,
    subtotal decimal(10,2) not null,
    discount_amount decimal(10,2) default 0.00,
    coupon_id uuid references public.coupons(id) on delete set null,
    shipping_address jsonb not null, -- {fullName, addressLine1, addressLine2, city, state, postalCode, phone}
    payment_method text not null check (payment_method in ('cod', 'razorpay', 'phonepe')),
    payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- 7. ORDER ITEMS
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    quantity integer not null,
    price decimal(10,2) not null, -- Price at the time of purchase
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;

-- 8. REVIEWS
create table if not exists public.reviews (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete set null,
    reviewer_name text not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    is_approved boolean default false, -- Review moderation
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

-- 9. WISHLIST
create table if not exists public.wishlist (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, product_id)
);

alter table public.wishlist enable row level security;

-- 10. CART ITEMS
create table if not exists public.cart_items (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    quantity integer not null default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, product_id)
);

alter table public.cart_items enable row level security;

-- 11. INVENTORY LOGS
create table if not exists public.inventory_logs (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    quantity_changed integer not null, -- positive for restock, negative for sale
    reason text not null, -- 'restock', 'sale', 'refund', 'adjustment'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inventory_logs enable row level security;

-- 12. PAYMENTS
create table if not exists public.payments (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    payment_gateway text not null default 'razorpay',
    transaction_id text,
    payment_status text not null,
    amount decimal(10,2) not null,
    response_payload jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;


-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_featured on public.products(is_featured) where is_featured = true;
create index if not exists idx_products_bestseller on public.products(is_bestseller) where is_bestseller = true;
create index if not exists idx_product_images_product on public.product_images(product_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_approved on public.reviews(is_approved);
create index if not exists idx_wishlist_user on public.wishlist(user_id);
create index if not exists idx_cart_items_user on public.cart_items(user_id);
create index if not exists idx_inventory_logs_product on public.inventory_logs(product_id);
create index if not exists idx_payments_order on public.payments(order_id);


-- =========================================================================
-- AUTOMATIC TIMESTAMPS TRIGGERS
-- =========================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trigger_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger trigger_categories_updated_at before update on public.categories for each row execute procedure public.handle_updated_at();
create trigger trigger_products_updated_at before update on public.products for each row execute procedure public.handle_updated_at();
create trigger trigger_coupons_updated_at before update on public.coupons for each row execute procedure public.handle_updated_at();
create trigger trigger_orders_updated_at before update on public.orders for each row execute procedure public.handle_updated_at();
create trigger trigger_reviews_updated_at before update on public.reviews for each row execute procedure public.handle_updated_at();
create trigger trigger_cart_items_updated_at before update on public.cart_items for each row execute procedure public.handle_updated_at();


-- =========================================================================
-- TRIGGER FOR USER SIGNUP (Auto profile creation)
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url, role)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        coalesce(new.raw_user_meta_data->>'role', 'customer')
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Profiles RLS
create policy "Public profiles are viewable by everyone" on public.profiles
    for select using (true);

create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id);

create policy "Admins can manage all profiles" on public.profiles
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Categories RLS
create policy "Categories are viewable by everyone" on public.categories
    for select using (true);

create policy "Admins can manage categories" on public.categories
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Products RLS
create policy "Products are viewable by everyone" on public.products
    for select using (is_deleted = false);

create policy "Admins can manage products" on public.products
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Product Images RLS
create policy "Product images are viewable by everyone" on public.product_images
    for select using (true);

create policy "Admins can manage product images" on public.product_images
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Coupons RLS
create policy "Coupons are viewable by authenticated users" on public.coupons
    for select using (auth.role() = 'authenticated');

create policy "Admins can manage coupons" on public.coupons
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Orders RLS
create policy "Users can view their own orders" on public.orders
    for select using (auth.uid() = user_id);

create policy "Users can create their own orders" on public.orders
    for insert with check (auth.uid() = user_id);

create policy "Admins can manage all orders" on public.orders
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Order Items RLS
create policy "Users can view their own order items" on public.order_items
    for select using (
        exists (
            select 1 from public.orders
            where id = order_items.order_id and user_id = auth.uid()
        )
    );

create policy "Admins can manage all order items" on public.order_items
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Reviews RLS
create policy "Approved reviews are viewable by everyone" on public.reviews
    for select using (is_approved = true or auth.uid() = user_id);

create policy "Users can insert reviews" on public.reviews
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews" on public.reviews
    for update using (auth.uid() = user_id);

create policy "Admins can manage all reviews" on public.reviews
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Wishlist RLS
create policy "Users can manage their own wishlist" on public.wishlist
    for all using (auth.uid() = user_id);

-- Cart Items RLS
create policy "Users can manage their own cart" on public.cart_items
    for all using (auth.uid() = user_id);

-- Inventory Logs RLS
create policy "Admins can view and manage inventory logs" on public.inventory_logs
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- Payments RLS
create policy "Users can view their own payments" on public.payments
    for select using (
        exists (
            select 1 from public.orders
            where id = payments.order_id and user_id = auth.uid()
        )
    );

create policy "Admins can view and manage payments" on public.payments
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- 13. SOCIAL FEEDS
create table if not exists public.social_feeds (
    id uuid default gen_random_uuid() primary key,
    image_url text not null,
    likes text,
    post_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.social_feeds enable row level security;

create policy "Social feeds are viewable by everyone" on public.social_feeds
    for select using (true);

create policy "Admins can manage social feeds" on public.social_feeds
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

