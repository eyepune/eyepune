import { NextResponse } from 'next/server';

/**
 * POST /api/email
 * Unified endpoint for sending single emails (admin notifications, manual sends, etc.)
 * Uses the shared email-service which auto-selects Zoho → Resend as fallback.
 */

// Simple in-memory rate limiter
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;

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

export async function POST(request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
  }

  try {
    const payload = await request.json();
    const { to, subject } = payload;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields: to, subject' }, { status: 400 });
    }

    const { sendEmail } = await import('@/lib/email-service');
    const result = await sendEmail(payload);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Email API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
