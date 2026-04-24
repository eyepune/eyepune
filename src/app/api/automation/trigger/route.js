import { NextResponse } from 'next/server';
import { triggerAutomation } from '@/lib/automation-service';

export async function POST(request) {
  try {
    const { trigger, payload } = await request.json();

    if (!trigger || !payload) {
      return NextResponse.json({ error: 'Trigger type and payload are required' }, { status: 400 });
    }

    const result = await triggerAutomation(trigger, payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Automation API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
