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
    const { sendWhatsAppMessage } = await import('./whatsapp-service.js');

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

      try {
        const result = await sendEmail({ to: payload.email, subject, html: content });
        results.push({ ruleId: rule.id, type: 'email', success: true });
      } catch (sendErr) {
        results.push({ ruleId: rule.id, type: 'email', success: false, error: sendErr.message });
      }
    }

    // 3. Fetch and process WhatsApp Rules
    const { data: waRules } = await supabaseAdmin
      .from('whatsapp_sequences')
      .select('*')
      .eq('trigger_type', triggerType)
      .eq('status', 'active');

    if (waRules && waRules.length > 0 && payload.phone) {
      for (const rule of waRules) {
        try {
          // Note: WhatsApp templates usually require pre-approval on Meta Panel
          const result = await sendWhatsAppMessage({
            to: payload.phone,
            templateName: rule.template_name,
            languageCode: rule.language_code || 'en_US',
            components: rule.components || [] // You can pass dynamic components here
          });
          results.push({ ruleId: rule.id, type: 'whatsapp', success: result.success });
        } catch (err) {
          results.push({ ruleId: rule.id, type: 'whatsapp', success: false, error: err.message });
        }
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('[AutomationService] Fatal Error:', error.message);
    return { success: false, error: error.message };
  }
}
