import { NextResponse } from 'next/server';
import { notifyNewLead, notifyNewAssessment, notifyNewInquiry } from '@/lib/admin-notifier';

/**
 * API Route: /api/admin/notify
 * Handles incoming notification requests from the frontend.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { type, payload } = body;

        if (!type || !payload) {
            return NextResponse.json({ error: 'Type and payload are required' }, { status: 400 });
        }

        let result;
        switch (type) {
            case 'lead':
                result = await notifyNewLead(payload);
                break;
            case 'assessment':
                result = await notifyNewAssessment(payload);
                break;
            case 'inquiry':
                result = await notifyNewInquiry(payload);
                break;
            default:
                return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
        }

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('[Admin Notify API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
