import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minute execution for LLM

const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'moonshotai/kimi-k2.6';

/**
 * Autonomous Cold Email Engine
 * Cron Job or Manual Trigger to read targeted outbound leads, 
 * use NVIDIA NIM / Llama to write a hyper-personalized outreach, and send via Zoho/Resend.
 */
export async function GET(request) {
  try {
    // 1. Verify Cron Secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    const isManualTrigger = request.nextUrl.searchParams.get('manual_trigger') === 'true';

    if (!isManualTrigger && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Pending Outbound Leads (Batch of 5 to prevent LLM rate limits)
    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .is('outbound_sent', null)
      .limit(5);

    if (error || !leads || leads.length === 0) {
      return NextResponse.json({ message: 'No pending outbound leads to process.' });
    }

    const results = [];

    // 3. Process each lead with the LLM
    for (const lead of leads) {
      if (!lead.email) continue;

      const systemPrompt = `You are the lead SDR for EyE PunE, an elite AI Automation and Web Development agency.
Your task is to write a hyper-personalized, 3-sentence cold email to a potential lead.
Lead Name: ${lead.full_name || 'Founder'}
Lead Company: ${lead.company || 'your business'}
Lead Interest/Notes: ${lead.notes || 'Scaling business operations'}

Rules:
1. No corporate jargon. Be extremely punchy, casual, but highly competent.
2. The email MUST be exactly 3 sentences.
3. Sentence 1: A customized observation about their company/industry.
4. Sentence 2: How EyE PunE's AI automation or Next.js development can solve a bottleneck for them.
5. Sentence 3: A low-friction call to action (e.g., "Mind if I send over a quick 2-minute loom video on how this would look?").
6. Output ONLY the email body. Do not include subject lines or placeholders.`;

      // Generate Personalized Email Body
      const llmResponse = await fetch(LLM_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LLM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [{ role: 'user', content: systemPrompt }],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      const llmData = await llmResponse.json();
      const generatedEmail = llmData.choices?.[0]?.message?.content?.trim();

      if (!generatedEmail) {
        console.warn(`[ColdEmail] LLM generation failed for ${lead.email}`);
        continue;
      }

      // 4. Send Email via Zoho
      try {
        await sendEmail({
          to: lead.email,
          subject: `Quick question about ${lead.company || 'your growth strategy'}`,
          text: `${generatedEmail}\n\nBest,\nEyE PunE Team\nhttps://www.eyepune.com`
        });

        // 5. Update Lead Status
        await supabaseAdmin
          .from('leads')
          .update({ outbound_sent: true, status: 'contacted' })
          .eq('id', lead.id);

        results.push({ email: lead.email, success: true });
      } catch (emailErr) {
        console.error(`[ColdEmail] Sending failed for ${lead.email}`, emailErr);
        results.push({ email: lead.email, success: false, error: emailErr.message });
      }
    }

    return NextResponse.json({ success: true, processed: results });

  } catch (err) {
    console.error('[ColdEmail API] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
