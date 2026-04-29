import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    const columns = data.length > 0 ? Object.keys(data[0]) : 'No data to infer columns';
    
    return NextResponse.json({ columns });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
