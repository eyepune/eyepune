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
        const base44 = createClientFromRequest(req);

        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

        // Get bookings scheduled in the next 24-25 hours that haven't had reminder sent
        const bookings = await base44.asServiceRole.entities.Booking.filter({ status: 'scheduled', reminder_sent: false });

        let sent = 0;
        for (const booking of bookings) {
            const bookingTime = new Date(booking.scheduled_date);
            if (bookingTime >= in24h && bookingTime <= in25h) {
                const dateStr = bookingTime.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
                const timeStr = bookingTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });

                await sendEmail(booking.email, `⏰ Reminder: Your consultation is tomorrow at ${timeStr} IST`, `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 24px; text-align: center;">
                            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69697d1626923688ef1d9afa/627f406e8_Free_Sample_By_Wix_edited-removebg-preview.png" alt="EyE PunE" style="height:40px;" />
                        </div>
                        <div style="padding: 30px;">
                            <h2>⏰ Your consultation is tomorrow!</h2>
                            <p>Hi <strong>${booking.name?.split(' ')[0] || 'there'}</strong>,</p>
                            <p>Just a reminder that your session with EyE PunE is scheduled for:</p>
                            <div style="background:#fff5f5; border-radius:12px; padding:20px; margin:20px 0; text-align:center;">
                                <p style="font-size:20px; font-weight:bold; color:#dc2626; margin:0;">${dateStr}</p>
                                <p style="font-size:28px; font-weight:bold; margin:8px 0;">${timeStr} IST</p>
                                ${booking.google_meet_link ? `<a href="${booking.google_meet_link}" style="background:#dc2626; color:#fff; text-decoration:none; padding:12px 28px; border-radius:50px; font-weight:bold; display:inline-block; margin-top:12px;">Join Google Meet →</a>` : ''}
                            </div>
                            <p style="color:#666; font-size:14px;">Questions? WhatsApp: <a href="https://wa.me/919284712033">+91 9284712033</a></p>
                        </div>
                    </div>
                `);

                await base44.asServiceRole.entities.Booking.update(booking.id, { reminder_sent: true });
                sent++;
            }
        }

        return Response.json({ success: true, reminders_sent: sent });
    } catch (error) {
        console.error(error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});