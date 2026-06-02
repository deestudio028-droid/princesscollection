const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kyihxeqarjqygjfveaqo.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWh4ZXFhcmpxeWdqZnZlYXFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk1MzMxMSwiZXhwIjoyMDk1NTI5MzExfQ.OTf1A1XgAyJqDKaEuaWfDErC5226gT0AdK7Ssm2LL3A';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', 'princesscollection7799@gmail.com');
  console.log("Update princesscollection7799:", data, error);
}

run();
