import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';

// Simple in-memory rate limiter
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
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
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const payload = await request.json();
    const { to, subject } = payload;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields (to, subject)' }, { status: 400 });
    }

    const result = await sendEmail(payload);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[Email API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
