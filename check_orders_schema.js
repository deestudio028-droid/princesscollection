const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1].trim()] = match[2].trim();
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  // Login as admin to ensure we have permissions
  await supabase.auth.signInWithPassword({
    email: 'superadmin@princess.com',
    password: 'superadminpc'
  });

  const { data: orders } = await supabase.from('orders').select('id').limit(1);
  if (!orders || orders.length === 0) return console.log("No orders");
  
  const id = orders[0].id;
  console.log("Updating order", id);
  
  // Let's test different statuses
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  for (const s of statuses) {
    const { error } = await supabase.from('orders').update({ status: s }).eq('id', id);
    if (!error) {
      console.log(`Status '${s}' is VALID!`);
    } else {
      console.log(`Status '${s}' is INVALID.`);
    }
  }
}

checkSchema();
