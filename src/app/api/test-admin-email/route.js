import { NextResponse } from 'next/server';
import { notifyAdmin } from '@/lib/admin-notifier';

export async function GET() {
  console.log('Starting test admin email...');
  try {
    const timeoutPromise = new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timeout!')), 5000));
    const result = await Promise.race([
        notifyAdmin('Test notification message'),
        timeoutPromise
    ]);
    console.log('Finished notifyAdmin');
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('Error in notifyAdmin:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 200 });
  }
}
