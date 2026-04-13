import { createClient } from '@supabase/supabase-js';

// POST — Promote the first user to admin
// Tries multiple approaches:
// 1. SECURITY DEFINER SQL function (promote_first_admin) if the migration has been run
// 2. Falls back to service role key if available
// 3. Returns instructions if neither works
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      return Response.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }

    // Approach 1: Try the SECURITY DEFINER SQL function
    if (supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase.rpc('promote_first_admin', {
          target_user_id: userId,
        });

        if (!error && data?.success) {
          return Response.json(data);
        }
        // Function doesn't exist or returned failure — try next approach
        console.log('RPC promote_first_admin not available:', error?.message || data?.message);
      } catch (e) {
        console.log('RPC approach failed:', e.message);
      }
    }

    // Approach 2: Use service role key if available
    if (serviceRoleKey) {
      try {
        const admin = createClient(supabaseUrl, serviceRoleKey);

        // Check if any admins exist
        const { data: admins } = await admin
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1);

        if (admins && admins.length > 0) {
          return Response.json({
            success: false,
            error: 'Admin users already exist. Use the admin panel to manage roles.',
          }, { status: 403 });
        }

        // Promote the user
        const { error: updateError } = await admin
          .from('users')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (updateError) throw updateError;

        return Response.json({
          success: true,
          message: 'User promoted to admin successfully.',
        });
      } catch (e) {
        console.log('Service role approach failed:', e.message);
      }
    }

    // Approach 3: Neither worked — return instructions (200 so client can read them)
    return Response.json({
      success: false,
      message: 'Could not promote to admin automatically. Follow the instructions below.',
      instructions: [
        '1. Go to Supabase Dashboard → SQL Editor',
        '2. Run the migration file: supabase/migrations/004_promote_first_admin.sql',
        '3. Or add SUPABASE_SERVICE_ROLE_KEY to your .env file',
        '4. Or run this SQL directly: UPDATE users SET role = \'admin\' WHERE id = \'' + userId + '\'',
      ],
    });
  } catch (error) {
    console.error('Promote first admin error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
