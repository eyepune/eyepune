import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
    const { data, error } = await supabase
        .from('crm_sync_configs')
        .insert([{ provider: 'test' }])
        .select('*');
        
    // Rollback by deleting it
    if (data && data.length > 0) {
        await supabase.from('crm_sync_configs').delete().eq('provider', 'test');
    }
    
    return NextResponse.json({ data, error });
}
