import nodemailer from 'npm:nodemailer@6.9.8';

const ADMIN_EMAIL = Deno.env.get('ZOHO_MAIL_USERNAME') || 'connect@eyepune.com';

function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
        }) + ' IST';
    } catch {
        return dateStr;
    }
}

function createTransporter() {
    // Force port 587 with STARTTLS - port 465 is typically blocked in serverless environments
    return nodemailer.createTransport({
        host: 'smtp.zoho.in',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: ADMIN_EMAIL,
            pass: Deno.env.get('ZOHO_MAIL_PASSWORD')
        },
        tls: { rejectUnauthorized: false }
    });
}

function customerEmailHtml({ name, phone, company, scheduledDate, meetLink, notes }) {
    const dateStr = formatDate(scheduledDate);
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#dc2626;padding:32px 40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">EyE PunE</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Connect · Engage · Grow</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#111;font-size:22px;margin:0 0 8px;">Consultation Confirmed!</h2>
          <p style="color:#555;margin:0 0 24px;">Hi ${name}, your free consultation is all set. Here are your details:</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.05em;">Meeting Details</p>
              <p style="margin:0 0 8px;color:#333;font-size:15px;"><strong>Date &amp; Time:</strong> ${dateStr}</p>
              <p style="margin:0 0 8px;color:#333;font-size:15px;"><strong>Duration:</strong> 30 minutes</p>
              <p style="margin:0 0 8px;color:#333;font-size:15px;"><strong>Format:</strong> Google Meet (Video Call)</p>
              ${company ? `<p style="margin:0 0 8px;color:#333;font-size:15px;"><strong>Company:</strong> ${company}</p>` : ''}
              ${notes ? `<p style="margin:0;color:#333;font-size:15px;"><strong>Your notes:</strong> ${notes}</p>` : ''}
            </td></tr>
          </table>

          ${meetLink ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td align="center">
              <a href="${meetLink}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Join Google Meet</a>
              <p style="margin:8px 0 0;font-size:12px;color:#888;">Link: <a href="${meetLink}" style="color:#dc2626;">${meetLink}</a></p>
            </td></tr>
          </table>` : ''}

          <h3 style="color:#111;font-size:16px;margin:0 0 12px;">What to expect in your consultation:</h3>
          <ul style="color:#555;padding-left:20px;margin:0 0 24px;line-height:1.9;">
            <li>Deep dive into your current business challenges</li>
            <li>Personalized growth strategy recommendations</li>
            <li>Overview of services tailored to your goals</li>
            <li>Open Q&amp;A — ask us anything!</li>
          </ul>

          <p style="color:#555;margin:0 0 4px;">Need to reschedule? Reach us at:</p>
          <p style="margin:0 0 4px;"><a href="mailto:connect@eyepune.com" style="color:#dc2626;">connect@eyepune.com</a></p>
          <p style="margin:0;"><a href="https://wa.me/919284712033" style="color:#dc2626;">WhatsApp: +91 92847 12033</a></p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#999;">2026 EyE PunE · connect@eyepune.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function adminEmailHtml({ name, email, phone, company, scheduledDate, meetLink, notes }) {
    const dateStr = formatDate(scheduledDate);
    return `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f4f4f5;margin:0;padding:40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
      <tr><td style="background:#111;padding:24px 32px;">
        <h2 style="color:#fff;margin:0;font-size:18px;">New Consultation Booked</h2>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="color:#555;margin:0 0 20px;">A new free consultation has been scheduled:</p>
        <table width="100%" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:collapse;margin-bottom:20px;">
          <tr style="background:#f9fafb;"><td colspan="2" style="padding:12px 16px;font-weight:700;color:#111;font-size:13px;text-transform:uppercase;">Client Details</td></tr>
          <tr><td style="padding:10px 16px;color:#666;font-size:14px;width:35%;border-top:1px solid #e5e7eb;">Name</td><td style="padding:10px 16px;color:#111;font-size:14px;font-weight:600;border-top:1px solid #e5e7eb;">${name}</td></tr>
          <tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#666;font-size:14px;border-top:1px solid #e5e7eb;">Email</td><td style="padding:10px 16px;font-size:14px;border-top:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#dc2626;">${email}</a></td></tr>
          <tr><td style="padding:10px 16px;color:#666;font-size:14px;border-top:1px solid #e5e7eb;">Phone</td><td style="padding:10px 16px;color:#111;font-size:14px;border-top:1px solid #e5e7eb;">${phone || 'Not provided'}</td></tr>
          <tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#666;font-size:14px;border-top:1px solid #e5e7eb;">Company</td><td style="padding:10px 16px;color:#111;font-size:14px;border-top:1px solid #e5e7eb;">${company || 'Not provided'}</td></tr>
          <tr><td style="padding:10px 16px;color:#666;font-size:14px;border-top:1px solid #e5e7eb;">Date &amp; Time</td><td style="padding:10px 16px;color:#111;font-size:14px;font-weight:600;border-top:1px solid #e5e7eb;">${dateStr}</td></tr>
          ${notes ? `<tr style="background:#f9fafb;"><td style="padding:10px 16px;color:#666;font-size:14px;border-top:1px solid #e5e7eb;">Notes</td><td style="padding:10px 16px;color:#111;font-size:14px;border-top:1px solid #e5e7eb;">${notes}</td></tr>` : ''}
          ${meetLink ? `<tr><td style="padding:10px 16px;color:#666;font-size:14px;border-top:1px solid #e5e7eb;">Meet Link</td><td style="padding:10px 16px;font-size:14px;border-top:1px solid #e5e7eb;"><a href="${meetLink}" style="color:#dc2626;">${meetLink}</a></td></tr>` : ''}
        </table>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:12px;color:#999;">EyE PunE Admin Notification</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

Deno.serve(async (req) => {
    try {
        const body = await req.json();
        const { name, email, phone, company, scheduledDate, meetLink, notes, type } = body;

        if (!name || !email || !scheduledDate) {
            return Response.json({ error: 'Missing required fields: name, email, scheduledDate' }, { status: 400 });
        }

        const transporter = createTransporter();
        const dateLabel = new Date(scheduledDate).toLocaleDateString('en-IN', {
            weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata'
        });

        const results = [];
        const errors = [];

        // Send confirmation to customer
        if (type !== 'admin_only') {
            try {
                await transporter.sendMail({
                    from: `"EyE PunE" <${ADMIN_EMAIL}>`,
                    to: email,
                    subject: `Consultation Confirmed - ${dateLabel}`,
                    html: customerEmailHtml({ name, phone, company, scheduledDate, meetLink, notes })
                });
                results.push({ recipient: 'customer', email });
            } catch (err) {
                console.error('Customer email error:', err.message);
                errors.push({ recipient: 'customer', error: err.message });
            }
        }

        // Send alert to admin
        if (type !== 'customer_only') {
            try {
                await transporter.sendMail({
                    from: `"EyE PunE Bookings" <${ADMIN_EMAIL}>`,
                    to: ADMIN_EMAIL,
                    subject: `New Booking: ${name} - ${dateLabel}`,
                    html: adminEmailHtml({ name, email, phone, company, scheduledDate, meetLink, notes })
                });
                results.push({ recipient: 'admin', email: ADMIN_EMAIL });
            } catch (err) {
                console.error('Admin email error:', err.message);
                errors.push({ recipient: 'admin', error: err.message });
            }
        }

        return Response.json({ success: results.length > 0, sent: results, errors });

    } catch (error) {
        console.error('Booking notification error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});