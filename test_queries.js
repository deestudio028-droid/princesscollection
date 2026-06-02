const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kyihxeqarjqygjfveaqo.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTMzMTEsImV4cCI6MjA5NTUyOTMxMX0.BuTvOP2hmnzcY8atdZ6JyKHQNY4X2-tUBzBBUUwaN08';

const supabase = createClient(supabaseUrl, anonKey);

async function test() {
  console.log("Signing in...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@princess.com',
    password: 'adminpc'
  });

  if (authErr) {
    console.log("Auth Error:", authErr.message);
    return;
  }

  const userId = authData.session.user.id;
  console.log("User ID:", userId);

  console.log("Fetching Orders...");
  const { data: ords, error: ordErr } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  console.log("Orders:", ords ? ords.length : null, "Error:", ordErr?.message);
  if (ords) {
    ords.forEach(o => {
      console.log(`Order ${o.id}: user_id = ${o.user_id}`);
    });
  }

  console.log("Fetching Customers...");
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('*');
  console.log("Profiles:", profiles ? profiles.length : null, "Error:", profErr?.message);
  if (profiles) {
    profiles.forEach(p => {
      console.log(`User: ${p.email} | ID: ${p.id} | Role: ${p.role}`);
    });
  }

  console.log("Fetching Products...");
  const { data: prods, error: prodErr } = await supabase.from('products').select('*, product_images(image_url)').eq('is_deleted', false);
  console.log("Products:", prods ? prods.length : null, "Error:", prodErr?.message);
}

test();
