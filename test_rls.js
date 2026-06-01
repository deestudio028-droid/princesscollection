const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kyihxeqarjqygjfveaqo.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTMzMTEsImV4cCI6MjA5NTUyOTMxMX0.BuTvOP2hmnzcY8atdZ6JyKHQNY4X2-tUBzBBUUwaN08';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk1MzMxMSwiZXhwIjoyMDk1NTI5MzExfQ.OTf1A1XgAyJqDKaEuaWfDErC5226gT0AdK7Ssm2LL3A';

async function test() {
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { data: wishListItems, error: wishErr } = await supabaseAdmin.from('wishlist').select('product_id');
  const { data: cartItems, error: cartErr } = await supabaseAdmin.from('cart_items').select('id');
  console.log("Wishlist Error:", wishErr);
  console.log("Cart Error:", cartErr);

  const supabaseAnon = createClient(supabaseUrl, anonKey);
  const { data: authData, error: authErr } = await supabaseAnon.auth.signInWithPassword({
    email: 'admin@princess.com',
    password: 'adminpc'
  });

  if (authErr) {
    console.log("Anon auth error:", authErr.message);
  } else {
    const { data: anonOrders } = await supabaseAnon.from('orders').select('id');
    console.log(`Total orders (Anon as admin): ${anonOrders ? anonOrders.length : 0}`);
  }
}

test();
