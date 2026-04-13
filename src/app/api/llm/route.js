/**
 * Next.js API Route: /api/llm
 *
 * Proxies LLM requests to the NVIDIA API (OpenAI-compatible).
 * The API key is stored server-side and never exposed to the client.
 *
 * Supports NVIDIA NIM models like qwen/qwen3.5-122b-a10b
 */

import { NextResponse } from 'next/server';

const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'qwen/qwen3.5-122b-a10b';

// Simple in-memory rate limiter
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

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
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Probabilistic cleanup of stale rate-limit entries to prevent memory leaks
  if (Math.random() < 0.01) {
    const now = Date.now();
    for (const [key, value] of rateLimiter) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW * 2) {
        rateLimiter.delete(key);
      }
    }
  }

  try {
    const { prompt, model, max_tokens, temperature } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!LLM_API_KEY) {
      console.error('[LLM Proxy] LLM_API_KEY is not configured');
      return NextResponse.json({ error: 'LLM API key not configured' }, { status: 500 });
    }

    const useModel = model || LLM_MODEL;

    // Retry logic for transient upstream errors (502, 503, 504)
    const MAX_RETRIES = 2;
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`[LLM Proxy] Retry attempt ${attempt}/${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
      }

      try {
        const response = await fetch(LLM_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LLM_API_KEY}`,
          },
          body: JSON.stringify({
            model: useModel,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: temperature ?? 0.6,
            top_p: 0.95,
            max_tokens: max_tokens || 16384,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[LLM Proxy] API error:', response.status, errorText);

          // Retry on transient server errors
          if ([502, 503, 504, 429].includes(response.status) && attempt < MAX_RETRIES) {
            lastError = { status: response.status, text: errorText };
            continue;
          }

          return NextResponse.json(
            { error: `LLM API error: ${response.status}` },
            { status: response.status }
          );
        }

        const data = await response.json();

        // Extract the content from the OpenAI-compatible response
        let content = data.choices?.[0]?.message?.content || '';

        // For Qwen models with thinking enabled, strip out blocks
        // from the response content if present
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        return NextResponse.json({ content });
      } catch (fetchError) {
        lastError = fetchError;
        if (attempt < MAX_RETRIES) continue;
      }
    }

    // All retries exhausted
    throw lastError || new Error('All retries failed');
  } catch (error) {
    console.error('[LLM Proxy] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
