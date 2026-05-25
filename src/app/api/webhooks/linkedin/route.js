import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// This endpoint receives webhooks from LinkedIn automation tools (e.g. PhantomBuster, HeyReach, Zapier)
export async function POST(request) {
    try {
        const payload = await request.json();

        // Standardize the incoming payload from various tools
        const fullName = payload.full_name || payload.firstName + ' ' + payload.lastName || payload.name;
        const linkedinUrl = payload.linkedin_url || payload.profileUrl || payload.url;
        const company = payload.company || payload.companyName || payload.organization;
        const headline = payload.headline || payload.jobTitle || payload.title;

        if (!fullName || !linkedinUrl) {
            return NextResponse.json({ error: 'Missing required fields: name or linkedin_url' }, { status: 400 });
        }

        // Generate a random qualification score if none provided (simulating AI initial scoring)
        const intentScore = payload.score || Math.floor(Math.random() * (95 - 75 + 1)) + 75;

        const leadData = {
            full_name: fullName,
            linkedin_url: linkedinUrl,
            company: company || 'Unknown Company',
            status: 'sourcing', // Ready for AI pitching
            ai_qualification_score: intentScore,
            metadata: {
                headline,
                source: payload.source || 'linkedin_automation',
                raw_payload: payload
            }
        };

        // Insert into growth_leads using Service Role to bypass RLS
        const { data, error } = await supabaseAdmin
            .from('growth_leads')
            .insert([leadData])
            .select()
            .single();

        if (error) {
            console.error('[LinkedIn Webhook Error]', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Lead ingested successfully into Growth Engine',
            lead: data
        });
    } catch (error) {
        console.error('[LinkedIn Webhook Fatal Error]', error);
        return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
}
