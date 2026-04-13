import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// GET — List all client logos (admin view, including inactive)
export async function GET() {
  try {
    const { data, error } = await getAdminClient()
      .from('client_logos')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching client logos:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST — Create a new client logo
export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await getAdminClient()
      .from('client_logos')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Error creating client logo:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
