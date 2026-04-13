import { createClient } from '@supabase/supabase-js';

// POST — Promote the first user to admin (only works if no admins exist)
// This calls the promote_first_admin() SQL function which is SECURITY DEFINER
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Use the anon key — the SQL function handles authorization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.rpc('promote_first_admin', {
      target_user_id: userId,
    });

    if (error) {
      console.error('Promote first admin error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data.success) {
      return Response.json({ error: data.message }, { status: 403 });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Promote first admin error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
