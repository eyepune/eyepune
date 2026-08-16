import { NextResponse } from 'next/server';
import { fetchWixContacts } from '@/lib/wix-api';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    // Basic auth check can go here if needed
    try {
        const contacts = await fetchWixContacts();
        return NextResponse.json({ past_clients: contacts });
    } catch (error) {
        console.error('[Wix API Route] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
