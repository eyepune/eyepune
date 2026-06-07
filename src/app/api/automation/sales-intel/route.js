import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, company, industry, id, tableType } = body;

        if (!email || !id || !tableType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Extract domain from email if company isn't provided
        const domain = email.split('@')[1];
        const targetCompany = company || domain;
        
        // Skip free email providers
        const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        if (freeProviders.includes(domain) && !company) {
            return NextResponse.json({ message: 'Skipped intel generation for generic email address' });
        }

        console.log(`[Sales Intel] Generating dossier for: ${targetCompany}`);

        const prompt = `
You are an elite Sales Engineer for EyE PunE (a premium Digital Marketing & AI Agency).
A new lead just booked a consultation.

Target Company / Domain: ${targetCompany}
Industry (if known): ${industry || 'Unknown'}

Provide a highly technical, 3-part "Sales Attack Brief" to help the closer win the deal.
Format as simple text/markdown:
1. Probable Weaknesses (What are companies like this usually failing at regarding SEO, Speed, or AI?)
2. The Pitch Angle (How should EyE PunE position our high-ticket services to them?)
3. Immediate Value Add (What is one mind-blowing insight we can give them on the call to establish instant authority?)

Be concise, aggressive, and highly strategic.
`;

        // Generate intel using the LLM
        const llmResponse = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${LLM_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.LLM_MODEL || 'meta/llama-3.1-8b-instruct',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        const llmData = await llmResponse.json();
        const intelReport = llmData.choices?.[0]?.message?.content || "Intel generation failed.";

        // Append to database
        // Assuming tableType is 'bookings' or 'inquiries'
        const { error } = await supabase
            .from(tableType)
            .update({ 
                notes: `[AI SALES INTEL DOSSIER]\n${intelReport}\n\n[Original Notes:]\n` 
            })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Intel Dossier Attached.' });

    } catch (error) {
        console.error('[Sales Intel] Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
