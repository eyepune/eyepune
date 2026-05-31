import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        
        if (!id) {
            return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
        }

        // We use the service key because this endpoint powers both the authenticated dashboard 
        // AND the public secure sign portal. The UUID itself acts as the secure token for the public portal.
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch contract details
        const { data: contract, error: contractError } = await supabaseAdmin
            .from('lex_contracts')
            .select('*')
            .eq('id', id)
            .single();

        if (contractError || !contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        // Fetch associated audit trails (signatures)
        const { data: auditTrails, error: auditError } = await supabaseAdmin
            .from('lex_audit_trails')
            .select('*')
            .eq('contract_id', id)
            .order('signed_at', { ascending: true });

        if (auditError) {
            console.error('[Lex Pro Get Contract] Failed to fetch audit trails:', auditError);
            // Fail silently on trails to still return the contract
        }

        return NextResponse.json({ 
            success: true, 
            contract,
            auditTrails: auditTrails || []
        });

    } catch (err) {
        console.error('[Lex Pro Get Contract] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
