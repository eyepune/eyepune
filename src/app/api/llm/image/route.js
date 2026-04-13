/**
 * Next.js API Route: /api/llm/image
 * 
 * Securely proxies image generation requests to the Modal API.
 */

import { NextResponse } from 'next/server';

const MODAL_LLM_URL = process.env.MODAL_LLM_URL || 'https://api.us-west-2.modal.direct/v1/images/generations';
const MODAL_LLM_API_KEY = process.env.MODAL_LLM_API_KEY;

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!MODAL_LLM_API_KEY) {
      console.error('[LLM Image Proxy] MODAL_LLM_API_KEY is not configured');
      return NextResponse.json({ error: 'LLM API key not configured' }, { status: 500 });
    }

    const response = await fetch(MODAL_LLM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODAL_LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LLM Image Proxy] API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Image generation API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      image_url: data.data?.[0]?.url || '',
      revised_prompt: data.data?.[0]?.revised_prompt || '',
    });
  } catch (error) {
    console.error('[LLM Image Proxy] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
