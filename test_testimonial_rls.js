const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nseaimfpxbegiiiltztp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("No service role key provided in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  console.log("Testing live Testimonial insertion as an authenticated user...");
  
  // 1. Create a dummy user
  const email = `test_testimonial_${Date.now()}@example.com`;
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: 'password123',
    email_confirm: true
  });
  
  if (createError) {
    console.error("Failed to create test user:", createError);
    return;
  }
  
  console.log("Created test user:", user.user.id);
  
  // 2. Log in as that user to get a real session
  const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
    email: email,
    password: 'password123'
  });
  
  if (loginError) {
    console.error("Failed to login as test user:", loginError);
    return;
  }
  
  // Create a client with the user's JWT to test RLS
  const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } }
  });
  
  // 3. Try inserting a testimonial
  console.log("Attempting to insert testimonial...");
  const { data: insertData, error: insertError } = await userClient.from('testimonials').insert([{
    customer_name: 'AI Test User',
    customer_company: 'Test Corp',
    content: 'This is a test testimonial to verify RLS!',
    rating: 5,
    service: 'full_service',
    status: 'pending'
  }]).select();
  
  if (insertError) {
    console.error("INSERT FAILED (RLS is still blocking):", insertError);
  } else {
    console.log("INSERT SUCCESS! Testimonial submitted successfully:", insertData);
  }
  
  // 4. Cleanup test user
  await supabase.auth.admin.deleteUser(user.user.id);
  console.log("Cleanup complete.");
}

testRLS();
