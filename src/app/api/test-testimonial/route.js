import { createClient } from '@supabase/supabase-js';

export async function GET(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseKey) {
      return Response.json({ success: false, error: "No service role key" });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Create dummy user
    const email = `test_testimonial_${Date.now()}@example.com`;
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: 'password123',
      email_confirm: true
    });
    
    if (createError) return Response.json({ success: false, error: createError.message });
    
    // 2. Log in
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'password123'
    });
    
    if (loginError) return Response.json({ success: false, error: loginError.message });
    
    // 3. Create client with JWT
    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } }
    });
    
    // 4. Try insert
    const { data: insertData, error: insertError } = await userClient.from('testimonials').insert([{
      customer_name: 'AI Agent Test',
      customer_company: 'EyE PunE Diagnostics',
      content: 'This is an automated test testimonial to verify the RLS database fix on the live site!',
      rating: 5,
      service: 'full_service',
      status: 'pending'
    }]).select();
    
    // 5. Cleanup
    await supabase.auth.admin.deleteUser(user.user.id);
    
    if (insertError) {
      return Response.json({ success: false, error: insertError.message, details: insertError });
    }
    
    return Response.json({ success: true, data: insertData });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
