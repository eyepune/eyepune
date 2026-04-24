import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

// GET — List templates
export async function GET() {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — Create template
export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('email_templates')
      .insert([body])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PUT — Update template
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE — Delete template
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
