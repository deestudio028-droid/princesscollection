const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1].trim()] = match[2].trim();
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupStorage() {
  console.log("Setting up Supabase Storage...");
  
  // Login as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'superadmin@princess.com',
    password: 'superadminpc'
  });
  
  if (authError) {
    console.error("Login failed:", authError);
    return;
  }
  
  // Create images bucket
  const { data, error } = await supabase.storage.createBucket('images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'],
    fileSizeLimit: 10485760 // 10MB
  });

  if (error) {
    if (error.message.includes('already exists') || error.error === 'Duplicate') {
      console.log("Bucket 'images' already exists. Skipping creation.");
    } else {
      console.error("Error creating bucket:", error);
    }
  } else {
    console.log("Successfully created 'images' bucket!", data);
  }

  // Update bucket to ensure it is public (in case it existed but wasn't public)
  await supabase.storage.updateBucket('images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'],
    fileSizeLimit: 10485760
  });
  
  console.log("Storage setup complete!");
}

setupStorage();
