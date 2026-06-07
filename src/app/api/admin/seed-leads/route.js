import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/admin/seed-leads
// Body: { leads: [{first_name, email, company_name, industry, website, linkedin_url}] }
// OR upload a CSV body with header: first_name,email,company_name,industry
export async function POST(request) {
    const authHeader = request.headers.get('authorization');
    const CRON_SECRET = process.env.CRON_SECRET;
    if (process.env.NODE_ENV !== 'development' && CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const contentType = request.headers.get('content-type') || '';
        let leads = [];

        if (contentType.includes('application/json')) {
            const body = await request.json();
            leads = body.leads || [];
        } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
            const csv = await request.text();
            const lines = csv.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const lead = {};
                headers.forEach((h, idx) => { lead[h] = values[idx] || ''; });
                if (lead.email) leads.push(lead);
            }
        }

        if (!leads.length) {
            return NextResponse.json({ error: 'No leads provided.' }, { status: 400 });
        }

        // Upsert leads (skip duplicates by email)
        const { data, error } = await supabase
            .from('outbound_leads')
            .upsert(leads, { onConflict: 'email', ignoreDuplicates: true });

        if (error) throw error;

        return NextResponse.json({ success: true, message: `Seeded ${leads.length} leads into the outbound queue.` });
    } catch (error) {
        console.error('[Seed Leads] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
