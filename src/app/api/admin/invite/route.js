import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// POST — Invite a new admin user
export async function POST(request) {
  try {
    const { email, full_name, role } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Create auth user with Supabase Admin API
    const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role: role || 'admin' },
    });

    if (authError) {
      // If user already exists, just update their role in the users table
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        const { data: existingUser } = await admin
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          const { error: updateError } = await admin
            .from('users')
            .update({ role: role || 'admin' })
            .eq('id', existingUser.id);

          if (updateError) throw updateError;
          return Response.json({ message: 'User promoted to admin', email });
        }
      } else {
        throw authError;
      }
    }

    // Also ensure the users table entry exists with admin role
    const userId = authData?.user?.id;
    if (userId) {
      const { error: upsertError } = await admin
        .from('users')
        .upsert({
          id: userId,
          email,
          full_name: full_name || email.split('@')[0],
          role: role || 'admin',
        }, { onConflict: 'id' });

      if (upsertError) console.warn('Users table upsert warning:', upsertError.message);
    }

    return Response.json({ message: 'Admin invited successfully', email });
  } catch (error) {
    console.error('Invite error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
