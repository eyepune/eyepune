import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * WhatsApp Cloud API Webhook Handler
 * 
 * GET  → Meta webhook verification (handshake)
 * POST → Incoming messages from customers
 * 
 * Set your webhook URL in Meta Developer Dashboard to:
 *   https://eyepune.com/api/whatsapp/webhook
 * 
 * Verify Token: matches WHATSAPP_VERIFY_TOKEN env variable
 */

// ── Webhook Verification (Meta sends GET to verify your endpoint) ────
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'eyepune_whatsapp_verify_2026';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[WhatsApp Webhook] Verified successfully');
        return new Response(challenge, { status: 200 });
    }

    console.warn('[WhatsApp Webhook] Verification failed — token mismatch');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ── Incoming Messages ─────────────────────────────────────────────────
export async function POST(request) {
    try {
        const body = await request.json();

        // Meta sends notifications in this structure
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) {
            return NextResponse.json({ status: 'no_data' }, { status: 200 });
        }

        // Handle incoming messages
        if (value.messages && value.messages.length > 0) {
            for (const msg of value.messages) {
                const from = msg.from; // sender's WhatsApp number (e.g. "919284712033")
                const messageType = msg.type; // text, image, document, etc.
                const timestamp = msg.timestamp;
                const messageId = msg.id;

                let messageBody = '';
                if (messageType === 'text') {
                    messageBody = msg.text?.body || '';
                } else if (messageType === 'button') {
                    messageBody = msg.button?.text || '[Button Reply]';
                } else if (messageType === 'interactive') {
                    messageBody = msg.interactive?.button_reply?.title || 
                                  msg.interactive?.list_reply?.title || '[Interactive Reply]';
                } else {
                    messageBody = `[${messageType} message]`;
                }

                console.log(`[WhatsApp Webhook] Message from ${from}: "${messageBody}"`);

                // Store the inbound message in the database
                try {
                    await supabaseAdmin.from('whatsapp_messages').insert([{
                        wa_message_id: messageId,
                        from_number: from,
                        to_number: value.metadata?.display_phone_number || '',
                        direction: 'inbound',
                        message_type: messageType,
                        content: messageBody,
                        timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
                        raw_payload: JSON.stringify(msg),
                        status: 'received'
                    }]);
                } catch (dbErr) {
                    console.warn('[WhatsApp Webhook] DB insert failed (table may not exist yet):', dbErr.message);
                }

                // Auto-reply logic for common queries (within the 24h window)
                let WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
                let WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

                if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
                    const { data: config } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'whatsapp_config').single();
                    if (config?.value) {
                        WHATSAPP_PHONE_ID = config.value.phone_id || WHATSAPP_PHONE_ID;
                        WHATSAPP_TOKEN = config.value.token || WHATSAPP_TOKEN;
                    }
                }

                if (WHATSAPP_PHONE_ID && WHATSAPP_TOKEN) {
                    const lowerMsg = messageBody.toLowerCase().trim();
                    let autoReply = null;

                    if (['hi', 'hello', 'hey', 'start', 'help'].some(w => lowerMsg === w || lowerMsg.startsWith(w + ' '))) {
                        autoReply = `👋 Hello! Welcome to *EyE PunE* — Pune's #1 AI-Powered Digital Marketing Agency.\n\n` +
                            `How can we help you today?\n\n` +
                            `1️⃣ *Services* — What we offer\n` +
                            `2️⃣ *Pricing* — Get a custom quote\n` +
                            `3️⃣ *Book* — Schedule a free consultation\n` +
                            `4️⃣ *Portfolio* — See our work\n\n` +
                            `Just reply with a number or type your question! 🚀`;
                    } else if (['1', 'services', 'what do you do', 'offerings'].some(w => lowerMsg.includes(w))) {
                        autoReply = `🔥 *Our Services:*\n\n` +
                            `🌐 Website Development\n` +
                            `📱 Social Media Management\n` +
                            `🤖 AI Automation & Chatbots\n` +
                            `📈 Google & Meta Ads\n` +
                            `🎨 Branding & Design\n` +
                            `💼 Sales Funnels\n` +
                            `📝 Content Marketing\n\n` +
                            `Visit https://eyepune.com/Services-Detail for details.\n\n` +
                            `Want a custom quote? Just say *"pricing"* or *"book"* a free call! 💡`;
                    } else if (['2', 'pricing', 'price', 'cost', 'rate', 'quote'].some(w => lowerMsg.includes(w))) {
                        autoReply = `💰 *Custom Pricing*\n\n` +
                            `Every business is unique — we tailor our packages to your goals.\n\n` +
                            `📞 Let's do a quick 15-min discovery call to understand your needs and create a custom proposal.\n\n` +
                            `Book now: https://eyepune.com/Booking\n\n` +
                            `Or reply with your *email* and we'll send you a detailed package breakdown! 📧`;
                    } else if (['3', 'book', 'call', 'schedule', 'meeting', 'consultation'].some(w => lowerMsg.includes(w))) {
                        autoReply = `📅 *Book a Free Consultation*\n\n` +
                            `Pick a time that works for you:\n` +
                            `🔗 https://eyepune.com/Booking\n\n` +
                            `We'll discuss your business goals and create a custom growth strategy. No obligation! 🚀`;
                    } else if (['4', 'portfolio', 'work', 'clients', 'case study'].some(w => lowerMsg.includes(w))) {
                        autoReply = `🏆 *Our Work*\n\n` +
                            `Check out our portfolio and client success stories:\n` +
                            `🔗 https://eyepune.com/Testimonials\n\n` +
                            `We've helped businesses achieve 3-10x growth with AI-powered strategies! 📊`;
                    }

                    if (autoReply) {
                        try {
                            await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    messaging_product: 'whatsapp',
                                    to: from,
                                    type: 'text',
                                    text: { body: autoReply },
                                }),
                            });

                            // Log the outbound reply
                            await supabaseAdmin.from('whatsapp_messages').insert([{
                                wa_message_id: `auto_${Date.now()}`,
                                from_number: value.metadata?.display_phone_number || '',
                                to_number: from,
                                direction: 'outbound',
                                message_type: 'text',
                                content: autoReply,
                                timestamp: new Date().toISOString(),
                                status: 'sent'
                            }]).catch(() => {});
                        } catch (replyErr) {
                            console.warn('[WhatsApp Webhook] Auto-reply failed:', replyErr.message);
                        }
                    }
                }
            }
        }

        // Handle message status updates (sent, delivered, read)
        if (value.statuses && value.statuses.length > 0) {
            for (const status of value.statuses) {
                console.log(`[WhatsApp Webhook] Status update: ${status.id} → ${status.status}`);
                try {
                    await supabaseAdmin.from('whatsapp_messages')
                        .update({ status: status.status })
                        .eq('wa_message_id', status.id);
                } catch (e) {
                    // Non-critical — status tracking
                }
            }
        }

        // Always return 200 to Meta (they'll retry on failures)
        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('[WhatsApp Webhook] Error:', error);
        // Still return 200 so Meta doesn't disable the webhook
        return NextResponse.json({ status: 'error_logged' }, { status: 200 });
    }
}
