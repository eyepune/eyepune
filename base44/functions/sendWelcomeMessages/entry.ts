import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import nodemailer from 'npm:nodemailer@6.9.7';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { event, data } = await req.json();

        if (event.type !== 'create' || event.entity_name !== 'Lead') {
            return Response.json({ error: 'Invalid event' }, { status: 400 });
        }

        const lead = data;

        // Send welcome email via Zoho SMTP
        const port = Deno.env.get('ZOHO_MAIL_SMTP_PORT') || '587';
        const transporter = nodemailer.createTransport({
            host: Deno.env.get('ZOHO_MAIL_SMTP_HOST'),
            port: parseInt(port),
            secure: port === '465',
            auth: {
                user: Deno.env.get('ZOHO_MAIL_USERNAME'),
                pass: Deno.env.get('ZOHO_MAIL_PASSWORD')
            }
        });

        await transporter.sendMail({
            from: `EyE PunE <${Deno.env.get('ZOHO_MAIL_USERNAME')}>`,
            to: lead.email,
            subject: '🎯 Welcome to EyE PunE - Your Growth Journey Starts Now',
            text: `Hi ${lead.full_name},

Welcome to EyE PunE! We're excited to partner with you on your business growth journey.

Here's what happens next:

✅ Our team will review your information
✅ We'll reach out within 24 hours to discuss your goals
✅ You'll get a personalized growth roadmap

In the meantime, check out:
🔗 Our Services: https://eyepune.com/Services_Detail
🔗 Book a Free Consultation: https://eyepune.com/Booking
🔗 Take Our AI Assessment: https://eyepune.com/AI_Assessment

Questions? Just reply to this email or WhatsApp us at +91 9284712033

To your growth,
The EyE PunE Team

---
Connect - Engage - Grow
EyE PunE | Your All-in-One Growth Partner`
        });

        // Log activity
        await base44.asServiceRole.entities.Activity.create({
            lead_id: lead.id,
            activity_type: 'email',
            title: 'Welcome email sent',
            description: 'Automated welcome email delivered',
            performed_by: 'system'
        });

        return Response.json({ 
            success: true, 
            message: 'Welcome messages sent',
            lead_id: lead.id 
        });
    } catch (error) {
        console.error('Error sending welcome messages:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});