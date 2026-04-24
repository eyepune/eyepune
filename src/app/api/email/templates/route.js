import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API Templates] GET Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Templates] GET Exception:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('email_templates')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('[API Templates] POST Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Templates] POST Exception:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API Templates] DELETE Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API Templates] DELETE Exception:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
