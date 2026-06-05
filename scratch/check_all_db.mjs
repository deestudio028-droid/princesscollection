import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyihxeqarjqygjfveaqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTMzMTEsImV4cCI6MjA5NTUyOTMxMX0.BuTvOP2hmnzcY8atdZ6JyKHQNY4X2-tUBzBBUUwaN08';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllSizes() {
  let totalSize = 0;
  
  const { data: cats } = await supabase.from('categories').select('name, image_url');
  if (cats) {
    for (const cat of cats) {
      if (cat.image_url && cat.image_url.startsWith('data:')) {
        const size = cat.image_url.length;
        totalSize += size;
        if (size > 1000000) console.log(`Category ${cat.name} image is ${(size/1024/1024).toFixed(2)} MB`);
      }
    }
  }

  const { data: prods } = await supabase.from('product_images').select('product_id, image_url');
  if (prods) {
    for (const prod of prods) {
      if (prod.image_url && prod.image_url.startsWith('data:')) {
        const size = prod.image_url.length;
        totalSize += size;
        if (size > 1000000) console.log(`Product Image for product_id ${prod.product_id} is ${(size/1024/1024).toFixed(2)} MB`);
      }
    }
  }

  const { data: social } = await supabase.from('social_feed').select('id, image_url');
  if (social) {
    for (const post of social) {
      if (post.image_url && post.image_url.startsWith('data:')) {
        const size = post.image_url.length;
        totalSize += size;
        if (size > 1000000) console.log(`Social Post ${post.id} image is ${(size/1024/1024).toFixed(2)} MB`);
      }
    }
  }

  console.log(`Total DB Base64 payload size: ${(totalSize/1024/1024).toFixed(2)} MB`);
}

checkAllSizes();
