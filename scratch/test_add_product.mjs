import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyihxeqarjqygjfveaqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTMzMTEsImV4cCI6MjA5NTUyOTMxMX0.BuTvOP2hmnzcY8atdZ6JyKHQNY4X2-tUBzBBUUwaN08';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Starting test insert...");
  try {
    const { data: insertedProduct, error: prodErr } = await supabase
      .from('products')
      .insert({
        title: "Test Product " + Date.now(),
        slug: "test-product-" + Date.now(),
        description: "Test description",
        price: 100,
        discount_price: null,
        stock_quantity: 1,
        category_id: null,
        tags: [],
        is_featured: false,
        is_bestseller: false,
        is_deleted: false
      })
      .select()
      .single();

    if (prodErr || !insertedProduct) {
      console.error("Error inserting product:", prodErr);
      return;
    }

    console.log("Inserted product successfully:", insertedProduct.id);

    const productId = insertedProduct.id;

    // Insert image records
    const imageRecords = [{
      product_id: productId,
      image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500',
      display_order: 0
    }];
    const { error: imgErr } = await supabase.from('product_images').insert(imageRecords);
    if (imgErr) console.error("Error inserting images:", imgErr);
    else console.log("Images inserted.");

    // Register initial stock inventory log
    const { error: logErr } = await supabase.from('inventory_logs').insert({
      product_id: productId,
      quantity_changed: 1,
      reason: 'restock'
    });
    if (logErr) console.error("Error inserting log:", logErr);
    else console.log("Log inserted.");

    console.log("Done!");
  } catch (err) {
    console.error("addProduct error:", err);
  }
}

testInsert();
