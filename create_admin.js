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

async function createAdmin() {
  const email = 'superadmin@princess.com';
  const password = 'superadminpc';

  console.log(`Creating user: ${email}...`);

  // Create user in auth schema
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
  } else {
    console.log('Auth user created or already exists:', authData?.user?.id);
  }

  // Update or insert into profiles table
  const userId = authData?.user?.id;
  
  if (!userId) {
    console.log("Could not get user ID. Searching for existing user is not possible with anon key without login. Let's try to login to get ID.");
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      console.error('Login failed:', loginError.message);
      return;
    }
    
    console.log('Logged in successfully. User ID:', loginData.user.id);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: loginData.user.id, role: 'admin', email: email });
      
    if (profileError) {
      console.error('Error updating profile:', profileError.message);
    } else {
      console.log('Profile created/updated successfully as admin!');
    }
  } else {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, role: 'admin', email: email });
      
    if (profileError) {
      console.error('Error updating profile:', profileError.message);
    } else {
      console.log('Profile created/updated successfully as admin!');
    }
  }
}

createAdmin();
