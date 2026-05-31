import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Web Crypto API to generate SHA-256 hash
async function generateHash(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { contractId, partyName, documentText } = body;

        if (!contractId || !partyName || !documentText) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        // We use the service key to insert because we haven't set up INSERT RLS for this table yet
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        
        // Verify user token
        const token = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 1. Generate Cryptographic Hash of the document text
        const documentHash = await generateHash(documentText);

        // 2. Capture Network & Device Data
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown IP';
        const userAgent = request.headers.get('user-agent') || 'Unknown Device';

        // 3. Save to Audit Trails
        const { data: auditTrail, error: insertError } = await supabaseAdmin
            .from('lex_audit_trails')
            .insert([{
                contract_id: contractId,
                party_name: partyName,
                ip_address: ipAddress.split(',')[0].trim(), // Get the true client IP if forwarded
                user_agent: userAgent,
                document_hash: documentHash
            }])
            .select()
            .single();

        if (insertError) {
            throw new Error(`Failed to save audit trail: ${insertError.message}`);
        }

        return NextResponse.json({ success: true, auditTrail });

    } catch (err) {
        console.error('[Lex Pro Digital Sign] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
