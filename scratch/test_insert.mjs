import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kyihxeqarjqygjfveaqo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTMzMTEsImV4cCI6MjA5NTUyOTMxMX0.BuTvOP2hmnzcY8atdZ6JyKHQNY4X2-tUBzBBUUwaN08'
);

async function testInsert() {
  console.log("Starting insert test...");
  const start = Date.now();
  const slug = `test-category-${Date.now()}`;
  
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: `Test Category ${Date.now()}`,
      slug,
      description: "Test description",
      image_url: "https://example.com/image.jpg"
    })
    .select()
    .single();

  const timeTaken = Date.now() - start;
  console.log(`Insert completed in ${timeTaken}ms`);

  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Inserted data:", data);
    // Cleanup
    await supabase.from('categories').delete().eq('id', data.id);
  }
}

testInsert();
