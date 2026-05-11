import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp-service';

export async function POST(request) {
    try {
        const { phone } = await request.json();
        
        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Test using a common "hello_world" template (usually pre-approved by Meta for testing)
        const result = await sendWhatsAppMessage({
            to: phone,
            templateName: 'hello_world', // Default Meta test template
            languageCode: 'en_US'
        });

        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                error: result.error,
                details: 'Make sure your WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_ID are correct in your environment variables.'
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Test message sent successfully via hello_world template!' 
        });
    } catch (error) {
        console.error('[WhatsApp-Test] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
