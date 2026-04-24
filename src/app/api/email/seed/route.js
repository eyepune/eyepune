import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/email/seed
 * Installs default professional email templates and automation sequences.
 * Uses service role key to bypass RLS.
 */
export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Create Professional Templates
    const templates = [
      {
        name: 'Welcome & Next Steps',
        category: 'marketing',
        subject: 'We received your inquiry! Here\'s what happens next 👋',
        content: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
            <div style="border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 28px;">
              <h1 style="margin: 0; font-size: 28px; color: #111827;">EyE PunE <span style="color: #ef4444;">●</span></h1>
            </div>
            <h2 style="font-size: 22px; color: #111827; margin-bottom: 8px;">Hi {{name}},</h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for reaching out! We've received your inquiry about <strong style="color: #111827;">{{service}}</strong> and our team is already on it.
            </p>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 28px;">
              <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">⏱ Expected Response: Within 24 hours</p>
              <p style="margin: 6px 0 0; color: #6b7280; font-size: 14px;">Our team typically responds within 2-4 hours on business days (Mon–Sat, 9AM–8PM IST).</p>
            </div>
            <h3 style="font-size: 17px; color: #111827; margin-bottom: 12px;">What happens next?</h3>
            <ol style="color: #6b7280; font-size: 15px; line-height: 1.8; padding-left: 20px; margin-bottom: 28px;">
              <li>Our strategist reviews your inquiry for <strong style="color: #111827;">{{company}}</strong></li>
              <li>We schedule a free 30-minute discovery call</li>
              <li>You receive a custom growth strategy tailored to your business</li>
            </ol>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://eyepune.com/Booking" style="background: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">Book a Free Discovery Call →</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
              EyE PunE | Pune, Maharashtra, India | <a href="https://eyepune.com" style="color: #ef4444;">eyepune.com</a>
            </p>
          </div>
        `,
        variables: ['name', 'service', 'company']
      },
      {
        name: 'AI Assessment Report',
        category: 'automation',
        subject: 'Your Business Growth Report is Ready! 📊 Score: {{score}}/100',
        content: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
            <div style="border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 28px;">
              <h1 style="margin: 0; font-size: 28px; color: #111827;">EyE PunE <span style="color: #ef4444;">●</span></h1>
            </div>
            <div style="background: linear-gradient(135deg, #ef4444, #f97316); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 28px; color: white;">
              <p style="margin: 0 0 8px; font-size: 14px; opacity: 0.85; text-transform: uppercase; letter-spacing: 1px;">Your Business Growth Score</p>
              <div style="font-size: 80px; font-weight: 900; line-height: 1; margin-bottom: 8px;">{{score}}</div>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">out of 100</p>
            </div>
            <h2 style="font-size: 22px; color: #111827; margin-bottom: 8px;">Hi {{name}},</h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We've analyzed <strong style="color: #111827;">{{business}}</strong> and identified significant opportunities for AI-powered growth.
            </p>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; color: #111827;">🎯 Priority Action</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Based on your score of <strong>{{score}}/100</strong>, we recommend an immediate focus on sales automation and lead nurturing to significantly increase your conversion rate.
              </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://eyepune.com/Booking" style="background: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">Claim Your Free Strategy Session →</a>
              <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0;">Limited slots available. No obligation.</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
              EyE PunE | <a href="https://eyepune.com" style="color: #ef4444;">eyepune.com</a>
            </p>
          </div>
        `,
        variables: ['name', 'score', 'business']
      },
      {
        name: 'Consultation Confirmed',
        category: 'service',
        subject: '✅ Your Discovery Call is Confirmed — {{date}} at {{time}}',
        content: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
            <div style="border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 28px;">
              <h1 style="margin: 0; font-size: 28px; color: #111827;">EyE PunE <span style="color: #22c55e;">●</span></h1>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
              <div style="font-size: 48px; margin-bottom: 8px;">✅</div>
              <h2 style="margin: 0; font-size: 22px; color: #15803d;">You're Booked!</h2>
            </div>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi <strong style="color: #111827;">{{name}}</strong>,</p>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your free 30-minute strategy consultation has been confirmed. We're looking forward to speaking with you!
            </p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 14px;">📅 Date</span>
                <strong style="color: #111827; font-size: 14px;">{{date}}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 14px;">🕐 Time</span>
                <strong style="color: #111827; font-size: 14px;">{{time}} IST</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280; font-size: 14px;">⏱ Duration</span>
                <strong style="color: #111827; font-size: 14px;">30 Minutes</strong>
              </div>
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://meet.google.com/lookup/eyepune" style="background: #22c55e; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">Join Google Meet →</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              Please prepare a brief overview of your business goals. See you then!
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
              EyE PunE | <a href="https://eyepune.com" style="color: #ef4444;">eyepune.com</a>
            </p>
          </div>
        `,
        variables: ['name', 'date', 'time']
      }
    ];

    const { data: createdTemplates, error: tError } = await supabase
      .from('email_templates')
      .upsert(templates, { onConflict: 'name' })
      .select();

    if (tError) throw tError;

    // 2. Create Default Automation Sequences
    // CRITICAL: Use 'status' column (not 'is_active') to match the automation-service query
    const welcomeTemplate = createdTemplates.find(t => t.name === 'Welcome & Next Steps');
    const aiTemplate = createdTemplates.find(t => t.name === 'AI Assessment Report');
    const bookingTemplate = createdTemplates.find(t => t.name === 'Consultation Confirmed');

    const sequences = [
      {
        name: 'New Inquiry Welcome',
        trigger_type: 'new_inquiry',
        template_id: welcomeTemplate?.id,
        status: 'active'  // ← MUST be 'status', not 'is_active'
      },
      {
        name: 'AI Assessment Follow-up',
        trigger_type: 'new_assessment',
        template_id: aiTemplate?.id,
        status: 'active'
      },
      {
        name: 'Booking Confirmation Email',
        trigger_type: 'new_booking',
        template_id: bookingTemplate?.id,
        status: 'active'
      }
    ];

    const { error: sError } = await supabase
      .from('email_sequences')
      .upsert(sequences, { onConflict: 'name' });

    if (sError) throw sError;

    return NextResponse.json({
      success: true,
      message: 'Professional email suite installed successfully',
      templates: createdTemplates.map(t => t.name),
      sequences: sequences.map(s => `${s.name} → ${s.trigger_type}`)
    });
  } catch (error) {
    console.error('[Seed Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
