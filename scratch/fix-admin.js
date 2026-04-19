
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('CRITICAL: Missing credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdmin() {
  const email = 'connect@eyepune.com';
  console.log(`Checking for user: ${email}...`);

  // 1. Get user ID from auth.users (via admin API)
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error listing auth users:', authError.message);
    return;
  }

  const authUser = users.find(u => u.email === email);

  if (!authUser) {
    console.error(`User ${email} not found in Supabase Auth!`);
    return;
  }

  console.log(`Found Auth User: ${authUser.id}`);

  // 2. Insert into public.users
  const { data, error: insertError } = await supabase
    .from('users')
    .upsert({
      id: authUser.id,
      email: email,
      full_name: 'Admin',
      role: 'admin'
    }, { onConflict: 'id' });

  if (insertError) {
    console.error('Error upserting into public.users:', insertError.message);
  } else {
    console.log(`SUCCESS: User ${email} is now a row in public.users with role 'admin'.`);
  }
}

fixAdmin();
