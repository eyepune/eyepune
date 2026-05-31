import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, contractType, content } = body;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized. No token provided.' }, { status: 401 });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } = await supabase.auth.getUser(token);

        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
        }

        const userId = userData.user.id;

        // Ensure the user has a profile to link to an organization
        let orgId = null;
        const { data: profiles } = await supabase.from('profiles').select('organization_id').eq('id', userId).limit(1);
        
        if (profiles && profiles.length > 0) {
            orgId = profiles[0].organization_id;
        } else {
             // If they don't have a profile/org yet, create a default personal org
             const { data: newOrg } = await supabase.from('organizations').insert([{ name: 'My Workspace', type: 'Law Firm' }]).select('id').single();
             orgId = newOrg.id;
             await supabase.from('profiles').insert([{ id: userId, organization_id: orgId, full_name: userData.user.email, role: 'Admin' }]);
        }

        const { data, error } = await supabase.from('lex_contracts').insert([
            {
                organization_id: orgId,
                created_by: userId,
                title: title || 'Untitled Contract',
                contract_type: contractType || 'General',
                content: content,
                status: 'Draft'
            }
        ]).select().single();

        if (error) {
            throw new Error(`Supabase insert failed: ${error.message}`);
        }

        return NextResponse.json({ success: true, contract: data });

    } catch (err) {
        console.error('[Lex Pro Save Draft] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
