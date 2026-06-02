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

async function checkRLS() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'superadmin@princess.com',
    password: 'superadminpc'
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }

  console.log("Logged in as Admin. Auth UID:", authData.user.id);
  
  // Check the public.profiles table to see if this user is marked as 'admin'
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  console.log("User data from public.users:", userData);
  console.log("User fetch error:", userError);

  const { data: policies, error: polError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'social_feeds');
  console.log("Policies:", policies, "Error:", polError);
}

checkRLS();
