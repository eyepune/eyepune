/**
 * WhatsApp Service
 * Handles sending WhatsApp Business API messages to leads and customers.
 * Requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_ID environment variables.
 */

export async function sendWhatsAppMessage({ to, templateName, components, languageCode = 'en_US' }) {
    console.log(`[WhatsAppService] Sending template "${templateName}" to ${to}`);

    const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
        console.warn('[WhatsAppService] WhatsApp credentials missing — skipping');
        return { success: false, error: 'WhatsApp not configured' };
    }

    // Clean phone number (ensure no + or spaces, and has country code)
    const cleanTo = to.replace(/\D/g, '');

    try {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: cleanTo,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: {
                            code: languageCode
                        },
                        components: components || []
                    },
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'WhatsApp API error');
        }

        return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
        console.error('[WhatsAppService] Send failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Sends a generic text message (only allowed if there's an active 24h window)
 */
export async function sendWhatsAppText({ to, text }) {
    const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) return { success: false };

    const cleanTo = to.replace(/\D/g, '');

    try {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: cleanTo,
                    type: 'text',
                    text: { body: text },
                }),
            }
        );

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
