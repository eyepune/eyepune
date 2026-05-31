import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, content, sourceType } = body;

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const token = authHeader.replace('Bearer ', '');
        
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = userData.user.id;

        // Get organization
        const { data: profiles } = await supabase.from('profiles').select('organization_id').eq('id', userId).single();
        const orgId = profiles?.organization_id;

        if (!orgId) {
            return NextResponse.json({ error: 'No organization found for user' }, { status: 400 });
        }

        // Generate Embedding using NVIDIA NIM
        const LLM_API_KEY = process.env.LLM_API_KEY;
        const embedResponse = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`
            },
            body: JSON.stringify({
                input: [content.substring(0, 8000)], // simple truncation for safety
                model: "snowflake/arctic-embed-l",
                input_type: "passage"
            })
        });

        if (!embedResponse.ok) {
            const errText = await embedResponse.text();
            throw new Error(`Embedding API failed: ${errText}`);
        }

        const embedData = await embedResponse.json();
        const embedding = embedData.data[0].embedding;

        // Save to Supabase
        const { error: insertError } = await supabase.from('lex_knowledge_base').insert([{
            organization_id: orgId,
            title,
            content,
            source_type: sourceType,
            embedding
        }]);

        if (insertError) {
            throw new Error(`Supabase insert failed: ${insertError.message}`);
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('[Lex Pro Embed] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
