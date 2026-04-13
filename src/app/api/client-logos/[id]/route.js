import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// PUT — Update a client logo
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await getAdminClient()
      .from('client_logos')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Error updating client logo:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — Delete a client logo
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const { error } = await getAdminClient()
      .from('client_logos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting client logo:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
