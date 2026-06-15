import { NextResponse } from 'next/server';
import { sendWhatsAppText } from '@/lib/whatsapp-service';

// In-memory rate limiter
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000 * 5; // 5 minutes
const RATE_LIMIT_MAX = 5; // Chatbot needs slightly higher limits, but still protected

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimiter.get(ip);
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimiter.set(ip, { timestamp: now, count: 1 });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

/**
 * AI Sales Sniper: Intent Analysis API
 * Analyzes chatbot messages in real-time and alerts the admin for high-value leads.
 */
export async function POST(request) {
    try {
        // ── ORIGIN / CORS ENFORCEMENT ──
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const isLocalDev = process.env.NODE_ENV === 'development';
        
        if (!isLocalDev) {
            const allowedDomain = 'eyepune.com';
            const isValidOrigin = origin && origin.includes(allowedDomain);
            const isValidReferer = referer && referer.includes(allowedDomain);
            
            if (!isValidOrigin && !isValidReferer) {
                return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
            }
        }

        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        if (!checkRateLimit(clientIp)) {
            return NextResponse.json({ success: true, isHot: false }); // Silently throttle
        }

        const { sessionId, message, userIdentifier } = await request.json();
        
        if (!message) return NextResponse.json({ success: true });

        // 1. High Intent Keywords
        const hotKeywords = [
            'price', 'pricing', 'cost', 'expensive', 'budget',
            'book', 'schedule', 'meeting', 'call', 'consultation',
            'hire', 'services', 'packages', 'implementation',
            'whatsapp', 'phone', 'contact'
        ];

        const isHot = hotKeywords.some(kw => message.toLowerCase().includes(kw));
        
        if (isHot) {
            console.log(`[SalesSniper] High intent detected: "${message}"`);
            
            // 2. Trigger WhatsApp Alert to Admin
            // We use sendWhatsAppText for direct alerts to the admin
            const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER || '919284712033';
            const alertText = `🔥 *AI SALES SNIPER* 🔥\n\n*User:* ${userIdentifier || 'Anonymous'}\n*Message:* "${message}"\n\n*Action:* Jump into CRM now to see live feed!\nhttps://eyepune.com/Admin-Dashboard`;

            await sendWhatsAppText({
                to: adminNumber,
                text: alertText
            }).catch(err => console.warn('[SalesSniper] WhatsApp failed:', err.message));

            // 3. Update Session Score
            const { supabase } = await import('@/integrations/supabase/client');
            await supabase.from('chat_sessions')
                .update({ intent_score: 90, last_active: new Date().toISOString() })
                .eq('id', sessionId);
        }

        return NextResponse.json({ success: true, isHot });
    } catch (error) {
        console.error('[SalesSniper] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
