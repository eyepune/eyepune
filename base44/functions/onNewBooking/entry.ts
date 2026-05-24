import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getAccessToken() {
    const res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: Deno.env.get('ZOHO_CLIENT_ID'),
            client_secret: Deno.env.get('ZOHO_CLIENT_SECRET'),
            refresh_token: Deno.env.get('ZOHO_REFRESH_TOKEN'),
        })
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Token error');
    return data.access_token;
}

async function sendEmail(to, subject, html) {
    const accessToken = await getAccessToken();
    const accountId = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID');
    const fromAddress = Deno.env.get('ZOHO_MAIL_USERNAME') || 'connect@eyepune.com';
    const res = await fetch(`https://mail.zoho.in/api/accounts/${accountId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAddress, toAddress: to, subject, content: html, mailFormat: 'html' })
    });
    return res.json();
}

Deno.serve(async (req) => {
    try {
        const { data } = await req.json();
        const booking = data;

        if (!booking?.email || !booking?.scheduled_date) return Response.json({ skipped: true });

        const bookingDate = new Date(booking.scheduled_date);
        const dateStr = bookingDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
        const timeStr = bookingDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
        const typeLabels = { consultation: 'Strategy Consultation', demo: 'Product Demo', training: 'Training Session', other: 'Meeting' };
        const typeName = typeLabels[booking.booking_type] || 'Consultation';

        // Confirmation to client
        await sendEmail(booking.email, `📅 Your ${typeName} is Confirmed — ${dateStr}`, `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:48px;" />
                    <h1 style="color:#fff; margin:20px 0 5px;">Booking Confirmed! ✅</h1>
                </div>
                <div style="padding: 30px;">
                    <p>Hi <strong>${booking.name?.split(' ')[0] || 'there'}</strong>,</p>
                    <p>Your <strong>${typeName}</strong> with EyE PunE is confirmed. Here are the details:</p>
                    <div style="background:#f8f8f8; border-radius:12px; padding:20px; margin:20px 0;">
                        <p style="margin:8px 0;">📅 <strong>Date:</strong> ${dateStr}</p>
                        <p style="margin:8px 0;">⏰ <strong>Time:</strong> ${timeStr} IST</p>
                        <p style="margin:8px 0;">⏱ <strong>Duration:</strong> ${booking.duration_minutes || 30} minutes</p>
                        ${booking.google_meet_link ? `<p style="margin:8px 0;">🎥 <strong>Meet Link:</strong> <a href="${booking.google_meet_link}" style="color:#dc2626;">${booking.google_meet_link}</a></p>` : ''}
                    </div>
                    <p><strong>To prepare for our call:</strong></p>
                    <ul style="line-height:2; color:#444;">
                        <li>Think about your top 3 business challenges</li>
                        <li>Note your current monthly revenue range</li>
                        <li>List your primary marketing channels</li>
                    </ul>
                    <p style="color:#666; font-size:14px;">Need to reschedule? Reply to this email or WhatsApp us at <a href="https://wa.me/919284712033">+91 9284712033</a></p>
                </div>
                <div style="background:#f9f9f9; padding:20px; text-align:center; color:#999; font-size:12px;">
                    <p>EyE PunE · Pune, Maharashtra · connect@eyepune.com</p>
                </div>
            </div>
        `);

        // Admin notification
        await sendEmail('connect@eyepune.com', `📅 New Booking: ${booking.name} — ${dateStr} at ${timeStr}`, `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color:#dc2626;">New Booking Alert!</h2>
                <table style="width:100%; border-collapse:collapse;">
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Name</td><td style="padding:8px; border:1px solid #eee;">${booking.name}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Email</td><td style="padding:8px; border:1px solid #eee;">${booking.email}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Phone</td><td style="padding:8px; border:1px solid #eee;">${booking.phone || '-'}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Type</td><td style="padding:8px; border:1px solid #eee;">${typeName}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Date & Time</td><td style="padding:8px; border:1px solid #eee;">${dateStr} at ${timeStr}</td></tr>
                    <tr><td style="padding:8px; border:1px solid #eee; font-weight:bold;">Company</td><td style="padding:8px; border:1px solid #eee;">${booking.company || '-'}</td></tr>
                </table>
            </div>
        `);

        return Response.json({ success: true });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});