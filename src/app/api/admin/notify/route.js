import { NextResponse } from 'next/server';
import { notifyNewLead, notifyNewAssessment, notifyNewInquiry, notifyNewBooking } from '@/lib/admin-notifier';

// In-memory rate limiter for notifications: max 10 requests per minute per IP
const notifyRateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip) {
    const now = Date.now();
    const record = notifyRateLimiter.get(ip);
    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        notifyRateLimiter.set(ip, { timestamp: now, count: 1 });
        return true;
    }
    if (record.count >= RATE_LIMIT_MAX) return false;
    record.count++;
    return true;
}

/**
 * API Route: /api/admin/notify
 * Handles incoming notification requests from the frontend with strict origin checks and rate limiting.
 */
export async function POST(request) {
    try {
        // Enforce Origin & Referer to prevent unauthorized external cross-site abuse
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const isLocalDev = process.env.NODE_ENV === 'development';

        if (!isLocalDev) {
            const isAllowed = 
                !origin && !referer // direct internal server-to-server call
                || (origin && (origin.includes('eyepune.com') || origin.includes('vercel.app') || origin.includes('localhost')))
                || (referer && (referer.includes('eyepune.com') || referer.includes('vercel.app') || referer.includes('localhost')));

            if (!isAllowed) {
                console.warn(`[Admin Notify API] Blocked unauthorized origin: ${origin || referer}`);
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        if (!checkRateLimit(clientIp)) {
            console.warn(`[Admin Notify API] Rate limit exceeded for IP: ${clientIp}`);
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

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
            case 'booking':
                result = await notifyNewBooking(payload);
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
