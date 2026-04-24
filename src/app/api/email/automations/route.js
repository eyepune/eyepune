import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*, template:email_templates(*)');

    if (error) {
      console.error('[API Automations] GET Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Automations] GET Exception:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('email_sequences')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('[API Automations] POST Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Automations] POST Exception:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request) {
  return PATCH(request);
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { data, error } = await supabase
      .from('email_sequences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API Automations] PATCH Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Automations] PATCH Exception:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
