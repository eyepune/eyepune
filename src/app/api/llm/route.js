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

// Enhanced in-memory rate limiter for better user experience
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 50; // Increased from 5 to 50 requests per minute

function checkRateLimit(ip) {
        const now = Date.now();
        const record = rateLimiter.get(ip);

    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
                rateLimiter.set(ip, { timestamp: now, count: 1 });
                return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
                console.warn(`[LLM Proxy] Rate limit reached for IP: ${ip}`);
                return false;
    }

    record.count++;
        return true;
}

export async function POST(request) {

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      if (!checkRateLimit(clientIp)) {
              return new Response(JSON.stringify({ 
                                                         error: 'Rate limit exceeded. We are processing many requests right now. Please try again in a minute.',
                          code: 'rate_limit_exceeded'
              }), {
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
          const body = await request.json();
          const { prompt, model, max_tokens, temperature } = body;

        console.log(`[LLM Proxy] Request received. Model: ${model || LLM_MODEL}. Prompt length: ${prompt?.length || 0}`);

        if (!prompt) {
                  return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (!LLM_API_KEY) {
                  console.error('[LLM Proxy] LLM_API_KEY is not configured in environment variables');
                  return NextResponse.json({ error: 'LLM API key not configured on server' }, { status: 500 });
        }

        const useModel = model || LLM_MODEL;

        // Retry logic for transient upstream errors (502, 503, 504)
        const MAX_RETRIES = 2;
          let lastError = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                  if (attempt > 0) {
            console.log(`[LLM Proxy] Retry attempt ${attempt}/${MAX_RETRIES} for model ${useModel}...`);
                              await new Promise(resolve => setTimeout(resolve, 1500 * attempt)); // Exponential backoff
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
                                                      top_p: 0.9,
                                                      max_tokens: max_tokens || 4096, // Reduced from 16k to 4k for better stability on NIMs
                                                      stream: false,
                                      }),
                        });

                    if (!response.ok) {
                                  const errorText = await response.text();
                                  console.error(`[LLM Proxy] Upstream API error (${response.status}):`, errorText);

                          // Retry on transient server errors or rate limits
                          if ([502, 503, 504, 429].includes(response.status) && attempt < MAX_RETRIES) {
                                          lastError = { status: response.status, text: errorText };
                                          continue;
                          }

                          return NextResponse.json(
                              { error: `AI Service Error: ${response.status}`, details: errorText },
                              { status: response.status }
                                        );
                    }

                    const data = await response.json();
                        console.log('[LLM Proxy] Successfully received response from upstream');

                    // Extract the content from the OpenAI-compatible response
                    // Some NVIDIA NIMs (like reasoning models) might return 'reasoning_content' instead of 'content'
                    let content = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || '';

                    if (!content && data.error) {
                                    console.error('[LLM Proxy] API returned error in body:', data.error);
                                    return NextResponse.json({ error: data.error.message || 'AI error' }, { status: 400 });
                    }

                    // For models with thinking enabled, strip out blocks if present
                    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

                    return NextResponse.json({ content });
            } catch (fetchError) {
                        console.error('[LLM Proxy] Fetch execution error:', fetchError);
                        lastError = fetchError;
                        if (attempt < MAX_RETRIES) continue;
            }
        }

        // All retries exhausted
        throw lastError || new Error('All retries failed');
  } catch (error) {
          console.error('[LLM Proxy] Internal Error:', error);
          return NextResponse.json(
              { error: error.message || 'Internal server error' },
              { status: 500 }
                  );
  }
}
