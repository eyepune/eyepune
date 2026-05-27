import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const { data } = await supabaseAdmin.from('email_templates').select('*');
  return NextResponse.json(data);
}
