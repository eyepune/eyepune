import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function POST() {
  try {
    // 1. Create Professional Templates
    const templates = [
      {
        name: 'Welcome & Next Steps',
        category: 'marketing',
        subject: 'Welcome to EyE PunE! 👋 Let\'s get started',
        content: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
            <h2 style="color: #ef4444;">Hello {{name}},</h2>
            <p>Thanks for reaching out to EyE PunE! We've received your inquiry regarding <strong>{{service}}</strong>.</p>
            <p>Our team is currently reviewing your details and will get back to you within 24 hours. In the meantime, here is what you can expect:</p>
            <ul style="color: #555;">
              <li>A custom growth audit for {{company}}</li>
              <li>A 30-minute discovery call invitation</li>
              <li>A personalized strategy breakdown</li>
            </ul>
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://eyepune.com/Booking" style="background: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Book Your Discovery Call Now</a>
            </div>
            <p style="color: #888; font-size: 12px;">Best regards,<br>The EyE PunE Growth Team</p>
          </div>
        `,
        variables: ['name', 'service', 'company']
      },
      {
        name: 'AI Assessment Report',
        category: 'automation',
        subject: 'Your Growth Potential Report is Ready! 📊',
        content: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
            <h2 style="color: #ef4444;">Your Growth Score: {{score}}/100</h2>
            <p>Hi {{name}},</p>
            <p>We've analyzed {{business}} and identified some major automation opportunities.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <h3 style="margin-top: 0;">Next Step: Strategy Session</h3>
              <p>Based on your score of {{score}}, we recommend an immediate focus on sales automation to recapture lost leads.</p>
            </div>
            <p>Would you like to walk through the full report with one of our AI consultants?</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://eyepune.com/Booking" style="background: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Claim Your Free Strategy Session</a>
            </div>
          </div>
        `,
        variables: ['name', 'score', 'business']
      },
      {
        name: 'Consultation Confirmed',
        category: 'service',
        subject: 'Confirmed: Your Strategy Session with EyE PunE',
        content: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
            <h2 style="color: #22c55e;">You're Booked! ✅</h2>
            <p>Hi {{name}},</p>
            <p>Your free consultation has been confirmed for <strong>{{date}} at {{time}}</strong>.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border: 1px solid #bbf7d0; margin: 20px 0;">
              <p style="margin: 0;"><strong>Meeting Link:</strong> <a href="https://meet.google.com/lookup/eyepune">Join Google Meet</a></p>
            </div>
            <p>Please make sure to have your business goals ready so we can make the most of our 30 minutes.</p>
            <p>See you then!</p>
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

    // 2. Create Default Automation Rules
    const welcomeTemplate = createdTemplates.find(t => t.name === 'Welcome & Next Steps');
    const aiTemplate = createdTemplates.find(t => t.name === 'AI Assessment Report');
    const bookingTemplate = createdTemplates.find(t => t.name === 'Consultation Confirmed');

    const sequences = [
      {
        name: 'New Inquiry Welcome',
        trigger_type: 'new_inquiry',
        template_id: welcomeTemplate?.id,
        is_active: true
      },
      {
        name: 'AI Assessment Follow-up',
        trigger_type: 'new_assessment',
        template_id: aiTemplate?.id,
        is_active: true
      },
      {
        name: 'Booking Confirmation Email',
        trigger_type: 'new_booking',
        template_id: bookingTemplate?.id,
        is_active: true
      }
    ];

    const { error: sError } = await supabase
      .from('email_sequences')
      .upsert(sequences, { onConflict: 'name' });

    if (sError) throw sError;

    return NextResponse.json({ success: true, message: 'Marketing defaults installed successfully' });
  } catch (error) {
    console.error('[Seed Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
