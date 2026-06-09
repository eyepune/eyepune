import { NextResponse } from 'next/server';
import { triggerAutomation } from '@/lib/automation-service';

export async function POST(request) {
  try {
    const body = await request.json();
    const triggerType = body.triggerType || body.trigger;
    const payload = body.payload;

    if (!triggerType || !payload) {
      return NextResponse.json({ error: 'Trigger type and payload are required' }, { status: 400 });
    }

    const result = await triggerAutomation(triggerType, payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Automation API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const test = url.searchParams.get('test');

  if (test === 'linkedin') {
    try {
      const { generateAndPostToLinkedin } = await import('@/lib/linkedin-automation.js');
      const result = await generateAndPostToLinkedin('educational');
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
  }

  if (test === 'blog') {
    try {
      const { generateAndPostBlog } = await import('./../ai-blog/route.js');
      // ai-blog route exports the logic in generateAndPostBlog or POST
      // Wait, ai-blog doesn't export generateAndPostBlog, it's just inside POST.
      // So let's just trigger it by making a POST to ourselves? Or just return that it needs POST.
      return NextResponse.json({ message: 'Blog test must be via POST to /api/automation/ai-blog' });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ 
    status: 'ok', 
    message: 'Automation trigger API is live. Use POST with { triggerType, payload } to trigger automations.'
  });
}
