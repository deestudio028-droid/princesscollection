import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kyihxeqarjqygjfveaqo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTMzMTEsImV4cCI6MjA5NTUyOTMxMX0.BuTvOP2hmnzcY8atdZ6JyKHQNY4X2-tUBzBBUUwaN08'
);

async function checkDB() {
  const { data, error } = await supabase.from('categories').select('id, name, image_url');
  if (error) {
    console.log("Error:", error);
    return;
  }
  
  for (const cat of data) {
    const size = cat.image_url ? (cat.image_url.length / 1024 / 1024).toFixed(2) : 0;
    console.log(`Category: ${cat.name}, Image Size: ${size} MB`);
  }
}

checkDB();
