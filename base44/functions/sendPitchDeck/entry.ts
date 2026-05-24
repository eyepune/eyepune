import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import nodemailer from 'npm:nodemailer@6.9.9';

const PITCH_DECK_URL = 'https://media.base44.com/files/public/69697d1626923688ef1d9afa/cf0b23f7b_PitchDeck-PDF.pdf';
const WHATSAPP_NUMBER = '+919284712033';

function buildEmailHTML(name, message) {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <div style="background:#040404;padding:32px 40px;text-align:center;">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:50px;"/>
      <p style="color:#888;font-size:12px;margin:8px 0 0;">Connect · Engage · Grow</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="color:#1a1a1a;margin:0 0 8px;">Hi ${name},</h2>
      <p style="color:#444;line-height:1.7;font-size:15px;">${message}</p>

      <!-- Pitch Deck CTA -->
      <div style="background:#f8f8f8;border:1px solid #e8e8e8;border-radius:12px;padding:28px;margin:28px 0;text-align:center;">
        <p style="font-weight:700;font-size:18px;color:#1a1a1a;margin:0 0 6px;">📊 Our Pitch Deck</p>
        <p style="color:#666;font-size:14px;margin:0 0 20px;">The Architecture of Scaling — see exactly how we build growth engines for ambitious businesses.</p>
        <a href="${PITCH_DECK_URL}" style="display:inline-block;background:#e53e3e;color:white;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
          📥 Download Pitch Deck
        </a>
      </div>

      <!-- Stats -->
      <div style="display:flex;gap:12px;margin:24px 0;">
        <div style="flex:1;background:#fff5f5;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#e53e3e;">₹15L+</div>
          <div style="font-size:11px;color:#888;">Revenue Driven</div>
        </div>
        <div style="flex:1;background:#fff5f5;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#e53e3e;">5x</div>
          <div style="font-size:11px;color:#888;">Average ROI</div>
        </div>
        <div style="flex:1;background:#fff5f5;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#e53e3e;">98%</div>
          <div style="font-size:11px;color:#888;">Client Retention</div>
        </div>
      </div>

      <!-- Services -->
      <p style="font-weight:700;color:#1a1a1a;margin:24px 0 12px;">What We Can Build For You:</p>
      <ul style="color:#555;line-height:2;padding-left:20px;">
        <li>🌐 Web & App Development</li>
        <li>📱 Social Media & Paid Ads Management</li>
        <li>🤖 AI Automation & Custom Chatbots</li>
        <li>📈 CRM, Email & WhatsApp Automation</li>
        <li>🎨 Branding & Creative</li>
        <li>📊 Real-Time Analytics Dashboards</li>
      </ul>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="https://www.eyepune.com/Booking" style="display:inline-block;background:#040404;color:white;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;margin-right:12px;">
          📅 Book Free Consultation
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#040404;padding:24px 40px;text-align:center;">
      <p style="color:#666;font-size:12px;margin:0 0 8px;">EyE PunE | Pune, Maharashtra, India</p>
      <p style="color:#666;font-size:12px;margin:0;">
        <a href="mailto:connect@eyepune.com" style="color:#e53e3e;text-decoration:none;">connect@eyepune.com</a> &nbsp;|&nbsp;
        <a href="https://wa.me/919284712033" style="color:#e53e3e;text-decoration:none;">WhatsApp: +91 9284712033</a> &nbsp;|&nbsp;
        <a href="https://www.eyepune.com" style="color:#e53e3e;text-decoration:none;">www.eyepune.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildWhatsAppText(name, message, customServices) {
    const services = customServices?.length > 0 ? customServices.join(', ') : 'our full suite of services';
    return `Hi ${name}! 👋

${message}

📊 *Here's our Pitch Deck:*
${PITCH_DECK_URL}

We help businesses like yours with:
✅ Web & App Development
✅ Social Media & Paid Ads
✅ AI Automation & Chatbots
✅ CRM, Email & WhatsApp Automation

*Results we've delivered:*
💰 ₹15L+ Revenue Driven
📈 5x Average ROI
🏆 98% Client Retention

📅 Book a free consultation: https://www.eyepune.com/Booking

— *EyE PunE Team* | connect@eyepune.com`;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { recipients, channel = 'email', subject, message, custom_services } = body;

        if (!recipients || recipients.length === 0) {
            return Response.json({ error: 'No recipients provided' }, { status: 400 });
        }

        const results = { sent: [], failed: [] };

        if (channel === 'email' || channel === 'both') {
            const transporter = nodemailer.createTransport({
                host: Deno.env.get('ZOHO_MAIL_SMTP_HOST'),
                port: parseInt(Deno.env.get('ZOHO_MAIL_SMTP_PORT') || '587'),
                secure: false,
                auth: {
                    user: Deno.env.get('ZOHO_MAIL_USERNAME'),
                    pass: Deno.env.get('ZOHO_MAIL_PASSWORD'),
                },
            });

            for (const r of recipients) {
                try {
                    await transporter.sendMail({
                        from: `"EyE PunE" <${Deno.env.get('ZOHO_MAIL_USERNAME')}>`,
                        to: r.email,
                        subject: subject || `${r.name}, Here's How We Help Businesses Like Yours Scale 🚀`,
                        html: buildEmailHTML(r.name, message || `We wanted to share how we've been helping businesses in Pune and across India build complete growth engines — combining Sales Strategy, Marketing Automation, and AI. We'd love to explore how we can do the same for you.`),
                    });

                    // Log activity if lead_id exists
                    if (r.lead_id) {
                        await base44.asServiceRole.entities.Activity.create({
                            lead_id: r.lead_id,
                            activity_type: 'email',
                            title: 'Pitch Deck Sent',
                            description: `Pitch deck email sent to ${r.email}`,
                            performed_by: user.email,
                        });
                    }

                    results.sent.push({ email: r.email, channel: 'email' });
                } catch (err) {
                    results.failed.push({ email: r.email, error: err.message });
                }
            }
        }

        if (channel === 'whatsapp' || channel === 'both') {
            // Log WhatsApp outreach (actual sending requires WhatsApp API integration)
            for (const r of recipients) {
                if (r.phone) {
                    const waText = buildWhatsAppText(r.name, message || `We wanted to share how we help businesses scale with AI, Automation & Digital Marketing.`, custom_services);
                    const waLink = `https://wa.me/${r.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;

                    if (r.lead_id) {
                        await base44.asServiceRole.entities.Activity.create({
                            lead_id: r.lead_id,
                            activity_type: 'note',
                            title: 'WhatsApp Pitch Prepared',
                            description: `WhatsApp pitch deck message prepared for ${r.phone}`,
                            performed_by: user.email,
                            metadata: { whatsapp_link: waLink },
                        }).catch(() => {});
                    }

                    results.sent.push({ phone: r.phone, channel: 'whatsapp', wa_link: waLink });
                }
            }
        }

        return Response.json({
            success: true,
            total: recipients.length,
            sent_count: results.sent.length,
            failed_count: results.failed.length,
            results,
        });

    } catch (error) {
        console.error('sendPitchDeck error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});