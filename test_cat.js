const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1].trim()] = match[2].trim();
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCategory() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'superadmin@princess.com',
    password: 'superadminpc'
  });
  
  if (authError) {
    console.error("Login fail:", authError);
    return;
  }
  
  const { data, error } = await supabase.from('categories').insert({
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test',
    image_url: 'https://test.com/test.jpg'
  });
  
  console.log("Insert Category Error:", error);
}

testCategory();
