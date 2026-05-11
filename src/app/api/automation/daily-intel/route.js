import { NextResponse } from 'next/server';
import { getAdminNotificationTemplate } from '@/lib/email-templates';
import { generateAndPostToLinkedin } from '@/lib/linkedin-automation'; // Reusing LLM logic

export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { supabase } = await import('@/integrations/supabase/client');
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        // 1. Fetch leads from last 24h
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .gte('created_at', yesterday)
            .order('score', { ascending: false });

        if (error) throw error;
        if (!leads || leads.length === 0) {
            return NextResponse.json({ success: true, message: 'No new leads to report.' });
        }

        // 2. Identify Hot Leads
        const hotLeads = leads.filter(l => (l.score || 0) >= 60);
        
        // 3. Generate AI Strategy for each hot lead
        const strategies = await Promise.all(hotLeads.map(async (lead) => {
            const prompt = `You are the EyE PunE Sales Strategist. Analyze this lead and provide a 2-sentence follow-up strategy:
            Name: ${lead.full_name}
            Company: ${lead.company || 'Unknown'}
            Source: ${lead.source}
            Notes: ${lead.notes || 'No specific notes'}
            
            Strategy should be aggressive yet professional, highlighting our AI capabilities.`;
            
            // Reusing our LLM bridge
            const { content } = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://eyepune.com'}/api/llm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            }).then(res => res.json()).catch(() => ({ content: 'Focus on AI transformation benefits.' }));
            
            return { ...lead, ai_strategy: content };
        }));

        // 4. Send Intelligence Report Email
        const { sendEmail } = await import('@/lib/email-service');
        await sendEmail({
            to: 'connect@eyepune.com',
            subject: `🚀 Daily Intelligence Report: ${hotLeads.length} Hot Leads Identified`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background: #000; color: #fff;">
                    <h1 style="color: #ef4444;">🔥 Daily Sales Intel</h1>
                    <p style="color: #9ca3af;">Here is your strategic roadmap for the day.</p>
                    
                    ${strategies.map(s => `
                        <div style="background: #111; border: 1px solid #333; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <h2 style="margin: 0; color: #fff;">${s.full_name}</h2>
                            <p style="color: #ef4444; font-weight: bold; margin: 5px 0;">${s.company || 'Individual'}</p>
                            <div style="background: #ef444410; border-left: 4px solid #ef4444; padding: 10px; margin: 15px 0;">
                                <strong style="color: #ef4444; font-size: 12px; text-transform: uppercase;">AI Strategy:</strong>
                                <p style="margin: 5px 0; font-style: italic;">"${s.ai_strategy}"</p>
                            </div>
                            <a href="mailto:${s.email}" style="color: #9ca3af; text-decoration: none; font-size: 14px;">${s.email}</a>
                        </div>
                    `).join('')}
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://eyepune.com/Admin_CRM" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Open CRM Pipeline →</a>
                    </div>
                </div>
            `
        });

        // 5. Log Success
        await supabase.from('automation_logs').insert([{
            type: 'intel',
            status: 'success',
            message: `Processed ${leads.length} leads, identified ${hotLeads.length} hot targets.`,
            payload: { leads_processed: leads.length, hot_targets: hotLeads.length }
        }]);

        return NextResponse.json({ success: true, processed: leads.length, hot: hotLeads.length });
    } catch (error) {
        console.error('[Daily Intel] Error:', error);
        
        // Log Failure
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            await supabase.from('automation_logs').insert([{
                type: 'intel',
                status: 'failure',
                message: error.message
            }]);
        } catch (e) {}

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
