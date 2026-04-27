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
