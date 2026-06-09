import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
    try {
        const body = await request.json();
        const { key, value, urn } = body;

        if (!key || !value) {
            return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
        }

        // We store settings in a dedicated 'system_settings' table
        // Schema: key (text, unique), value (jsonb), updated_at (timestamp)
        let payloadValue = value;
        if (typeof value === 'string') {
            payloadValue = { token: value, urn: urn || null };
        }

        const { error } = await supabase
            .from('system_settings')
            .upsert({ 
                key: key,
                value: payloadValue
            }, { onConflict: 'key' });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
