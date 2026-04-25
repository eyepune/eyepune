// WhatsApp Business API notification endpoint
// Called from Contact/Booking forms to send instant WhatsApp alerts to admin

export async function POST(request) {
    try {
        const { type, name, email, phone, message, date, time } = await request.json();

        const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
        const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
        const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP_NUMBER; // e.g. "919876543210"

        if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN || !ADMIN_WHATSAPP) {
            // Silently skip if not configured — non-critical feature
            return Response.json({ success: true, skipped: 'WhatsApp not configured' });
        }

        const messages = {
            contact: `🔔 *New Inquiry — EyE PunE*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📱 *Phone:* ${phone || '—'}\n💬 *Message:* ${message || '—'}\n\n_Reply here to respond directly._`,
            booking: `📅 *New Booking — EyE PunE*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📱 *Phone:* ${phone || '—'}\n🗓 *Date:* ${date}\n🕐 *Time:* ${time}\n\n_Reply here to confirm or reschedule._`,
            assessment: `🤖 *New AI Assessment — EyE PunE*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📊 *Score:* ${message}/100\n\n_High-intent lead — respond within 1 hour._`,
        };

        const text = messages[type] || messages.contact;

        const res = await fetch(
            `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: ADMIN_WHATSAPP,
                    type: 'text',
                    text: { body: text },
                }),
            }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'WhatsApp API error');

        return Response.json({ success: true, messageId: data.messages?.[0]?.id });
    } catch (error) {
        console.error('[WhatsApp] Notification failed:', error.message);
        // Non-critical — always return 200 so forms don't break
        return Response.json({ success: false, error: error.message });
    }
}
