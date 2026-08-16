import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendEmail } from '@/lib/email-service';
import { fetchWixContacts } from '@/lib/wix-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    const isLocalDev = process.env.NODE_ENV === 'development';
    const manualBypass = new URL(request.url).searchParams.get('manual_trigger') === 'true';

    if (!isLocalDev && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}` && !manualBypass) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRM-Sync] Starting Automated Email Marketing Sequences...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Supabase credentials missing.' }, { status: 500 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: { getAll() { return []; }, setAll() { } }
    });

    const results = {
        nurtured_leads: 0,
        promotions_sent: 0,
        errors: []
    };

    try {
        // ── SEQUENCE 1: NEW LEAD NURTURING ──
        // Fetch all "new" leads that haven't been nurtured yet
        // Assuming a standard 'leads' table. We will update status to 'nurtured' after sending.
        const { data: newLeads, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .eq('status', 'new')
            .limit(10); // Batch limit to prevent Zoho Mail rate limits

        if (leadsError) throw leadsError;

        for (const lead of newLeads || []) {
            try {
                // Determine context based on what they inquired about
                const isAI = lead.notes?.toLowerCase().includes('ai') || lead.source?.toLowerCase().includes('ai');
                
                let subject = "Quick Question regarding your Digital Growth";
                let content = `Hi ${lead.full_name?.split(' ')[0] || 'there'},\n\nI noticed you recently reached out to EyE PunE regarding digital growth solutions.\n\nWhile our team reviews your specific inquiry, I wanted to share this brief, high-level blueprint on how elite global brands are currently leveraging custom web architecture and automation to scale.\n\nWould you be open to a quick 10-minute strategy call this week to discuss how this applies to ${lead.company || 'your business'}?\n\nBest,\nEyE PunE Strategic Team`;

                if (isAI) {
                    subject = "Your AI Automation Blueprint";
                    content = `Hi ${lead.full_name?.split(' ')[0] || 'there'},\n\nThanks for your interest in AI Automation at EyE PunE.\n\nThe majority of our clients see a 5x ROI within the first 6 months of deploying our autonomous sales and operational pipelines.\n\nI'd love to show you a live demo of how we can integrate this into ${lead.company || 'your infrastructure'}. Let me know if you have 10 minutes this week.\n\nBest,\nEyE PunE AI Team`;
                }

                await sendEmail(lead.email, subject, content);
                
                // Mark as nurtured
                await supabase.from('leads').update({ status: 'nurtured' }).eq('id', lead.id);
                results.nurtured_leads++;
                
                // Delay to prevent rate limits
                await new Promise(res => setTimeout(res, 2000));
            } catch (err) {
                results.errors.push(`Lead Nurture Error (${lead.email}): ${err.message}`);
            }
        }

        // ── SEQUENCE 2: SMART PROMOTIONS (WIX PAST CLIENTS & CSV LEADS) ──
        // We fetch past clients directly from the Universal Data Parser to send them promotional offers.
        
        let crmProspects = [];
        try {
            crmProspects = await fetchWixContacts();
        } catch (e) {
            console.warn('[CRM-Sync] Failed to fetch CSV prospects:', e.message);
        }

        if (crmProspects && crmProspects.length > 0) {
            // Limit to 50 for rate limiting purposes
            const prospectsToEmail = crmProspects.slice(0, 50);
            
            for (const prospect of prospectsToEmail) {
                if (!prospect.customer_email) continue;
                
                try {
                    // Check if already emailed in Supabase to prevent CSV duplicate spam
                    const { data: existing } = await supabase
                        .from('leads')
                        .select('id, status')
                        .eq('email', prospect.customer_email)
                        .single();

                    if (existing && existing.status === 'promo_sent') {
                        continue; // Skip if they already got the promo
                    }

                    const firstName = prospect.customer_name?.split(' ')[0] || 'there';
                    const subject = "Exclusive Upgrade: AI Sales Automation";
                    let content = `Hey ${firstName},\n\nJust checking in. We just rolled out our Autonomous AI Sales Engines that are literally putting customer acquisition on autopilot for scaling brands.\n\nIt bolts directly onto your existing setup and multiplies your inbound conversion rate without increasing your ad spend.\n\nAre you open to a quick 10-minute chat this week to see how it works under the hood?\n\nBest,\nEyE PunE Strategic Team`;

                    // AI Hyper-Personalization if Company Name exists
                    if (prospect.company_name) {
                        try {
                            console.log(`[CRM-Sync] Generating hyper-personalized copy for ${prospect.company_name}...`);
                            const llmUrl = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
                            const llmKey = process.env.LLM_API_KEY || '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';
                            
                            const aiResponse = await fetch(llmUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${llmKey}`,
                                },
                                body: JSON.stringify({
                                    model: process.env.LLM_MODEL || 'meta/llama-3.1-8b-instruct',
                                    messages: [
                                        {
                                            role: 'user',
                                            content: `Write a 3-sentence, highly conversational, modern, and punchy B2B cold email to a prospect named ${firstName} who works at ${prospect.company_name}. The goal is to pitch our "Autonomous AI Sales Engine" that puts customer acquisition on autopilot. Tailor the pitch specifically to the industry of ${prospect.company_name}. Do not include any placeholders like [Your Name]. Sign off with "Best,\nEyE PunE Strategic Team". Make it sound extremely natural and focused on conversion. No subject line, just the email body.`
                                        }
                                    ],
                                    temperature: 0.7,
                                    max_tokens: 500
                                })
                            });

                            if (aiResponse.ok) {
                                const aiData = await aiResponse.json();
                                let aiContent = aiData.choices?.[0]?.message?.content || aiData.choices?.[0]?.message?.reasoning_content || '';
                                aiContent = aiContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                                if (aiContent.length > 50) { // basic validation
                                    content = aiContent;
                                }
                            }
                        } catch (aiErr) {
                            console.warn(`[CRM-Sync] AI Personalization failed for ${prospect.company_name}, using fallback.`, aiErr.message);
                        }
                    }
                    
                    await sendEmail(prospect.customer_email, subject, content);
                    results.promotions_sent++;

                    // Log to activity_logs
                    await supabase.from('activity_logs').insert([{
                        action: 'automated_promotion_sent',
                        details: `Sent AI Promo to CSV Prospect: ${prospect.customer_email} (${prospect.company_name || 'Generic'})`,
                        status: 'success'
                    }]);

                    // Upsert into leads table to mark as promo_sent
                    if (existing) {
                        await supabase.from('leads').update({ status: 'promo_sent' }).eq('id', existing.id);
                    } else {
                        await supabase.from('leads').insert([{
                            full_name: prospect.customer_name,
                            email: prospect.customer_email,
                            phone: prospect.customer_phone || null,
                            company: prospect.company_name || null,
                            status: 'promo_sent',
                            source: prospect.source || 'universal_csv'
                        }]);
                    }

                    await new Promise(res => setTimeout(res, 2000));
                } catch (err) {
                    results.errors.push(`Promo Error (${prospect.customer_email}): ${err.message}`);
                }
            }
        }

        // Log the final execution
        try {
            await supabase.from('automation_logs').insert([{
                type: 'crm_sync',
                status: 'success',
                message: `Automated CRM Sync Complete. Nurtured: ${results.nurtured_leads}. Promotions: ${results.promotions_sent}.`,
                payload: results
            }]);
        } catch (e) {
            console.warn('[CRM-Sync] Failed to write to automation_logs:', e.message);
        }

        return NextResponse.json({ success: true, ...results });

    } catch (error) {
        console.error('[CRM-Sync] Critical Failure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
