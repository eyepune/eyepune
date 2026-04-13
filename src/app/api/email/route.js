/**
 * Next.js API Route: /api/email
 *
 * Sends transactional emails using Resend.
 * The API key is stored server-side and never exposed to the client.
 *
 * POST body:
 *   { to, subject, html, from?, replyTo? }
 *
 * Required env: RESEND_API_KEY
 */

import { NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = process.env.EMAIL_FROM || 'EyE PunE <connect@eyepune.com>';

// Simple in-memory rate limiter (same pattern as /api/llm)
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 emails per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimiter.set(ip, { timestamp: now, count: 1 });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Probabilistic cleanup
  if (Math.random() < 0.01) {
    const now = Date.now();
    for (const [key, value] of rateLimiter) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW * 2) {
        rateLimiter.delete(key);
      }
    }
  }

  try {
    const { to, subject, html, text, from, replyTo } = await request.json();

    if (!to || !subject) {
      return NextResponse.json({ error: 'Recipient (to) and subject are required' }, { status: 400 });
    }

    if (!html && !text) {
      return NextResponse.json({ error: 'Email body (html or text) is required' }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      console.error('[Email] RESEND_API_KEY is not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const emailPayload = {
      from: from || DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html && { html }),
      ...(text && { text }),
      ...(replyTo && { reply_to: replyTo }),
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Email] Resend API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Email API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Email] Sent successfully:', data.id);

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('[Email] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
