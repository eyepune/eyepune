import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function GET(request) {
    // Auth Check
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV !== 'development' && CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[Outbound Sniper] Initiating cold outreach sequence...');

        // 1. Fetch leads from database that haven't been contacted
        // Note: You must create an 'outbound_leads' table for this to pull from.
        const { data: leads, error: fetchError } = await supabase
            .from('outbound_leads')
            .select('*')
            .eq('status', 'pending')
            .limit(5); // Only do small batches to protect sender reputation

        if (fetchError || !leads || leads.length === 0) {
            return NextResponse.json({ message: 'No pending leads found.' });
        }

        const results = [];

        for (const lead of leads) {
            console.log(`[Outbound Sniper] Drafting attack for: ${lead.company_name}`);

            // 2. AI Cold Email Generation
            const prompt = `
You are the elite Founder of EyE PunE (Digital Marketing & AI Agency).
Write a 4-sentence, highly aggressive but professional cold email to ${lead.first_name} at ${lead.company_name}.
Industry: ${lead.industry || 'Tech / Services'}.

Rules:
1. NO generic openings (No "I hope this finds you well").
2. Sentence 1: The Hook (Point out a massive flaw in their competitors or a missed AI opportunity).
3. Sentence 2: The Credibility (Mention we build custom NextJS/AI systems that solve this).
4. Sentence 3: The Pitch.
5. Sentence 4: Low-friction Call to Action.
6. Return a JSON object: {"subject": "Subject Line Here", "body": "HTML email body"}
`;

            const llmResponse = await fetch(LLM_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${LLM_API_KEY}`
                },
                body: JSON.stringify({
                    model: process.env.LLM_MODEL || 'meta/llama-3.1-8b-instruct',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7
                })
            });

            const llmData = await llmResponse.json();
            const rawContent = llmData.choices?.[0]?.message?.content || "";
            const cleanJson = rawContent.replace(/```(?:json)?\s*([\s\S]*?)```/i, '$1').trim();
            
            let emailDraft;
            try {
                emailDraft = JSON.parse(cleanJson);
            } catch (e) {
                console.warn(`[Outbound Sniper] Failed to parse JSON for ${lead.email}`);
                continue;
            }

            // 3. Send Email via Zoho Mail
            const emailSent = await sendZohoEmail(lead.email, emailDraft.subject, emailDraft.body);

            // 4. Update Lead Status
            if (emailSent) {
                await supabase
                    .from('outbound_leads')
                    .update({ status: 'contacted', contacted_at: new Date().toISOString() })
                    .eq('id', lead.id);
                
                results.push({ email: lead.email, success: true });
            } else {
                await supabase
                    .from('outbound_leads')
                    .update({ status: 'failed' })
                    .eq('id', lead.id);
            }
            
            // Artificial delay to prevent API rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return NextResponse.json({ success: true, processed: results });

    } catch (error) {
        console.error('[Outbound Sniper] Critical failure:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 200 });
    }
}

async function sendZohoEmail(toEmail, subject, htmlBody) {
    try {
        const clientId = process.env.ZOHO_CLIENT_ID;
        const clientSecret = process.env.ZOHO_CLIENT_SECRET;
        const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
        const accountId = process.env.ZOHO_MAIL_ACCOUNT_ID;
        const fromAddress = process.env.ZOHO_MAIL_USERNAME;

        if (!clientId || !refreshToken || !accountId) {
            console.warn('[Zoho Mail] Missing credentials. Simulating send.');
            return true;
        }

        let domain = 'in';
        let tokenRes = await fetch(`https://accounts.zoho.in/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`, { method: 'POST' });
        let tokenData = await tokenRes.json();
        
        if (tokenData.error) {
            // Fallback to .com
            domain = 'com';
            tokenRes = await fetch(`https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`, { method: 'POST' });
            tokenData = await tokenRes.json();
        }

        if (!tokenData.access_token) {
            throw new Error(`Failed to refresh token: ${JSON.stringify(tokenData)}`);
        }

        const emailPayload = {
            fromAddress: fromAddress,
            toAddress: toEmail,
            subject: subject,
            content: htmlBody,
            mailFormat: 'html'
        };

        const sendRes = await fetch(`https://mail.zoho.${domain}/api/accounts/${accountId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailPayload)
        });

        const sendData = await sendRes.json();
        if (sendData.status?.code !== 200) {
            throw new Error(`Send API failed: ${JSON.stringify(sendData)}`);
        }

        console.log(`[Zoho Mail] Successfully sent email to ${toEmail}`);
        return true; 
    } catch (e) {
        console.error('[Zoho Mail] Send Failed:', e.message);
        return false;
    }
}
