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

    // 2. Process each matching rule
    for (const rule of rules) {
      const template = rule.template;
      if (!template) {
        console.warn(`[AutomationService] Rule ${rule.id} has no linked template — skipping`);
        continue;
      }

      // 3. Populate template variables in subject and content
      let subject = template.subject || '(No Subject)';
      let content = template.content || '';

      Object.entries(payload).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, String(value || ''));
        content = content.replace(regex, String(value || ''));
      });

      // 4. Send the email
      try {
        const result = await sendEmail({
          to: payload.email,
          subject,
          html: content,
        });
        console.log(`[AutomationService] ✅ Email sent for rule "${rule.name}" to ${payload.email}`);
        results.push({ ruleId: rule.id, ruleName: rule.name, success: true, result });
      } catch (sendErr) {
        console.error(`[AutomationService] ❌ Failed to send email for rule ${rule.id}:`, sendErr.message);
        results.push({ ruleId: rule.id, ruleName: rule.name, success: false, error: sendErr.message });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('[AutomationService] Fatal Error:', error.message);
    return { success: false, error: error.message };
  }
}
