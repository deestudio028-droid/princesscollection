import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyihxeqarjqygjfveaqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTMzMTEsImV4cCI6MjA5NTUyOTMxMX0.BuTvOP2hmnzcY8atdZ6JyKHQNY4X2-tUBzBBUUwaN08';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetchAll() {
  console.log("Fetching all data...");
  const start = Date.now();
  
  const [prods, cats, imgs, revs, inventory, coupons, social] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('created_at', { ascending: false }),
    supabase.from('product_images').select('*').order('display_order', { ascending: true }),
    supabase.from('reviews').select('*').order('created_at', { ascending: false }),
    supabase.from('inventory_logs').select('*').order('created_at', { ascending: false }),
    supabase.from('coupons').select('*').order('created_at', { ascending: false }),
    supabase.from('social_feed').select('*').order('created_at', { ascending: false })
  ]);
  
  const end = Date.now();
  console.log(`Fetched everything in ${end - start}ms`);
}

testFetchAll();
