import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // MVP: Fetch the latest 10 contracts from ANY organization for the dashboard view
        const { data: contracts, error } = await supabase
            .from('lex_contracts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            if (error.code === '42P01') {
                return NextResponse.json({ error: 'Database tables not found. Please run the supabase_lex_pro_schema.sql script in your Supabase SQL editor first.' }, { status: 400 });
            }
            throw new Error(error.message);
        }

        return NextResponse.json({ success: true, contracts });

    } catch (err) {
        console.error('[Lex Pro Get Contracts] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
