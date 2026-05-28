import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email-service';

export async function GET(request) {
  // CRON job route to process all active drip campaigns
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Daily Drip] Starting execution...');
    
    // 1. Get all active drip sequences
    const { data: sequences, error: seqError } = await supabaseAdmin
      .from('drip_sequences')
      .select('id, name')
      .eq('is_active', true);

    if (seqError) throw seqError;
    if (!sequences || sequences.length === 0) {
      return NextResponse.json({ message: 'No active sequences.' });
    }

    const sequenceIds = sequences.map(s => s.id);

    // 2. Get all steps for these sequences
    const { data: steps, error: stepsError } = await supabaseAdmin
      .from('drip_steps')
      .select('*')
      .in('sequence_id', sequenceIds);

    if (stepsError) throw stepsError;

    let emailsSent = 0;

    // 3. For each step, find eligible leads and send emails
    for (const step of steps) {
      const delayDays = step.delay_days;
      
      // Calculate target date (created_at should be exactly delayDays ago)
      const targetDateStart = new Date();
      targetDateStart.setDate(targetDateStart.getDate() - delayDays);
      targetDateStart.setHours(0, 0, 0, 0);
      
      const targetDateEnd = new Date(targetDateStart);
      targetDateEnd.setHours(23, 59, 59, 999);

      // Find leads created on the target date who haven't booked/closed yet
      const { data: leads, error: leadsError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .gte('created_at', targetDateStart.toISOString())
        .lte('created_at', targetDateEnd.toISOString())
        .not('status', 'in', '("closed", "lost")');

      if (leadsError) {
        console.warn(`[Daily Drip] Error fetching leads for step ${step.id}:`, leadsError);
        continue;
      }

      for (const lead of leads) {
        let subject = step.email_subject || '';
        let content = step.email_content || '';

        // Simple token replacement
        subject = subject.replace(/{{name}}/g, lead.full_name || 'there');
        subject = subject.replace(/{{company}}/g, lead.company || 'your business');
        content = content.replace(/{{name}}/g, lead.full_name || 'there');
        content = content.replace(/{{company}}/g, lead.company || 'your business');

        try {
          await sendEmail({
            to: lead.email,
            subject,
            html: content
          });
          emailsSent++;
          console.log(`[Daily Drip] Sent sequence step ${step.step_order} to ${lead.email}`);
        } catch (err) {
          console.error(`[Daily Drip] Failed to send email to ${lead.email}:`, err);
        }
      }
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (error) {
    console.error('[Daily Drip] Fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
