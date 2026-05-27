/**
 * Automation Service
 * Handles triggering automated emails based on system events.
 * Uses server-side Supabase client to bypass RLS policies.
 */

/**
 * Triggers an automation workflow via the API route (runs server-side)
 * @param {string} triggerType - The type of trigger (e.g., 'new_lead', 'new_inquiry')
 * @param {object} payload - Data to populate the template (e.g., { name, email, company })
 */
export async function triggerAutomation(triggerType, payload) {
  // This function is called from server-side API routes only.
  // It directly queries Supabase and sends email via the email service.
  console.log(`[AutomationService] Triggering: ${triggerType}`, payload);

  try {
    // Lazy-load server-only modules to avoid client-side bundling issues
    const { createClient } = await import('@supabase/supabase-js');
    const { sendEmail } = await import('./email-service.js');

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Fetch active automation rules for this trigger
    // Note: DB column is 'status' with value 'active' (not is_active boolean)
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('email_sequences')
      .select('*, template:email_templates(*)')
      .eq('trigger_type', triggerType)
      .eq('status', 'active');

    if (rulesError) throw rulesError;
    if (!rules || rules.length === 0) {
      console.log(`[AutomationService] No active rules for trigger: ${triggerType}`);
      return { success: true, message: 'No active rules found for this trigger' };
    }

    const results = [];

    // 2. Process Email Rules
    for (const rule of rules) {
      const template = rule.template;
      if (!template) continue;

      let subject = template.subject || '(No Subject)';
      let content = template.content || '';

      Object.entries(payload).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, String(value || ''));
        content = content.replace(regex, String(value || ''));
      });

      // Special handling for AI Assessment PDF attachment
      let attachments = [];
      if (triggerType === 'new_assessment' && payload.report) {
        try {
          const { generateStrategyPDF } = await import('./pdf-generator.js');
          const pdfBuffer = await generateStrategyPDF({
            name: payload.name,
            business: payload.business,
            score: payload.score,
            report: payload.report
          });
          
          attachments.push({
            content: Buffer.from(pdfBuffer).toString('base64'),
            filename: `EyE_PunE_Strategic_Roadmap.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          });
          console.log('[AutomationService] PDF generated and attached to email.');
        } catch (pdfErr) {
          console.warn('[AutomationService] Failed to generate PDF attachment:', pdfErr.message);
        }
      }

      try {
        const result = await sendEmail({ 
          to: payload.email, 
          subject, 
          html: content,
          attachments: attachments.length > 0 ? attachments : undefined 
        });
        results.push({ ruleId: rule.id, type: 'email', success: true });
      } catch (sendErr) {
        results.push({ ruleId: rule.id, type: 'email', success: false, error: sendErr.message });
      }
    }

    // 3. Process WhatsApp Nurture (if applicable)
    if (triggerType === 'new_assessment' && payload.phone) {
      try {
        const { sendWhatsAppText } = await import('./whatsapp-service.js');
        const messageText = `Hi ${payload.name || 'there'}! 👋\n\nI saw you just completed the AI Growth Assessment for ${payload.business || 'your business'} on EyE PunE. Your Growth Score is ${payload.score}/100.\n\nI have 2 slots open this week to review your custom blueprint on a quick strategy call. Are you free to hop on?\n\n- The EyE PunE Growth Team`;
        
        const waResult = await sendWhatsAppText({ 
          to: payload.phone, 
          text: messageText 
        });
        
        results.push({ type: 'whatsapp', success: waResult.success });
        if (waResult.success) {
          console.log(`[AutomationService] WhatsApp nurture sent to ${payload.phone}`);
        }
      } catch (waErr) {
        console.warn('[AutomationService] Failed to trigger WhatsApp nurture:', waErr.message);
        results.push({ type: 'whatsapp', success: false, error: waErr.message });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('[AutomationService] Fatal Error:', error.message);
    return { success: false, error: error.message };
  }
}
