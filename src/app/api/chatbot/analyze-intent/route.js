import { NextResponse } from 'next/server';
import { sendWhatsAppText } from '@/lib/whatsapp-service';

/**
 * AI Sales Sniper: Intent Analysis API
 * Analyzes chatbot messages in real-time and alerts the admin for high-value leads.
 */
export async function POST(request) {
    try {
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
            const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER || '919511210191';
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
