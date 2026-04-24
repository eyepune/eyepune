/**
 * Automation Service
 * Handles triggering automated emails based on system events
 */

import { supabase } from '@/integrations/supabase/client';
import { sendEmail } from './email-service';

/**
 * Triggers an automation workflow
 * @param {string} triggerType - The type of trigger (e.g., 'new_lead', 'new_inquiry')
 * @param {object} payload - Data to populate the template (e.g., { name, email, company })
 */
export async function triggerAutomation(triggerType, payload) {
  console.log(`[AutomationService] Triggering: ${triggerType}`, payload);

  try {
    // 1. Fetch active automation rules for this trigger
    const { data: rules, error: rulesError } = await supabase
      .from('email_sequences')
      .select('*, template:email_templates(*)')
      .eq('trigger_type', triggerType)
      .eq('status', 'active');

    if (rulesError) throw rulesError;
    if (!rules || rules.length === 0) {
      console.log(`[AutomationService] No active rules for trigger: ${triggerType}`);
      return { success: true, message: 'No active rules' };
    }

    const results = [];

    // 2. Process each rule
    for (const rule of rules) {
      const template = rule.template;
      if (!template) continue;

      // 3. Populate variables in subject and content
      let subject = template.subject || '';
      let content = template.content || '';

      Object.entries(payload).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value || '');
        content = content.replace(regex, value || '');
      });

      // 4. Send the email
      try {
        const result = await sendEmail({
          to: payload.email,
          subject,
          html: content
        });
        results.push({ ruleId: rule.id, success: true, result });
      } catch (sendErr) {
        console.error(`[AutomationService] Failed to send email for rule ${rule.id}:`, sendErr.message);
        results.push({ ruleId: rule.id, success: false, error: sendErr.message });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('[AutomationService] Error:', error.message);
    return { success: false, error: error.message };
  }
}
