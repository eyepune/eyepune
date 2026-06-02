import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// NOTE: Removed `export const runtime = 'edge'` — edge runtime has issues with
// Supabase client and long-running LLM calls. Node.js runtime is more reliable.

const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;

// Ordered list of models to try — primary first, then fallbacks
const MODEL_PRIORITY = [
    'meta/llama-3.1-8b-instruct',
    'meta/llama-3.1-70b-instruct',
    'mistralai/mistral-7b-instruct-v0.3',
];

/**
 * Attempts to call the LLM with a specific model and a 25-second timeout.
 * Returns the draft text or throws an error.
 */
async function callLLM(prompt, model) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    try {
        const response = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 3000,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`LLM responded with ${response.status}: ${errText.slice(0, 200)}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        if (!content) throw new Error('LLM returned empty content');
        return content;

    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

/**
 * Tries each model in MODEL_PRIORITY in sequence until one succeeds.
 */
async function callLLMWithFallback(prompt) {
    let lastError = null;

    for (const model of MODEL_PRIORITY) {
        try {
            console.log(`[Lex Pro Draft] Trying model: ${model}`);
            const content = await callLLM(prompt, model);
            console.log(`[Lex Pro Draft] Success with model: ${model}`);
            return content;
        } catch (err) {
            console.warn(`[Lex Pro Draft] Model ${model} failed: ${err.message}`);
            lastError = err;
            // Brief pause before trying next model
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    throw lastError || new Error('All LLM models failed');
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { contractType, partyA, partyB, jurisdiction, governingLaw, additionalTerms } = body;

        // --- Auth Validation ---
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized — please log in to draft contracts.' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[Lex Pro Draft] Missing Supabase environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const token = authHeader.replace('Bearer ', '');

        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
        }

        if (!LLM_API_KEY) {
            console.error('[Lex Pro Draft] LLM_API_KEY not configured');
            return NextResponse.json({ error: 'AI service not configured on server' }, { status: 500 });
        }

        // --- Optional RAG Phase (non-blocking) ---
        let contextText = '';
        try {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', userData.user.id)
                .single();
            const orgId = profiles?.organization_id;

            if (orgId) {
                const searchQuery = `Legal precedent for ${contractType} in ${jurisdiction}`;
                const embedResponse = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LLM_API_KEY}` },
                    body: JSON.stringify({ input: [searchQuery], model: 'snowflake/arctic-embed-l', input_type: 'query' }),
                    signal: AbortSignal.timeout(8000), // 8s max for RAG — don't let it block drafting
                });

                if (embedResponse.ok) {
                    const embedData = await embedResponse.json();
                    const queryEmbedding = embedData.data?.[0]?.embedding;

                    if (queryEmbedding) {
                        const { data: contexts } = await supabase.rpc('match_legal_context', {
                            query_embedding: queryEmbedding,
                            match_threshold: 0.5,
                            match_count: 3,
                            org_id: orgId,
                        });

                        if (contexts?.length > 0) {
                            contextText = '\n\nCRITICAL KNOWLEDGE BASE PRECEDENTS TO FOLLOW:\n' +
                                contexts.map((c, i) => `[Precedent ${i + 1}: ${c.title}]\n${c.content}`).join('\n\n');
                        }
                    }
                }
            }
        } catch (ragErr) {
            // RAG failure is non-fatal — drafting proceeds without context
            console.warn('[Lex Pro Draft] RAG retrieval failed (non-fatal):', ragErr.message);
        }

        // --- Build Prompt ---
        const prompt = `You are an expert Indian corporate lawyer. Draft a legally binding ${contractType} between Party A (${partyA}) and Party B (${partyB}).
The jurisdiction is ${jurisdiction} and the governing law is ${governingLaw}.
${additionalTerms ? `Ensure you include the following specific terms: ${additionalTerms}` : ''}${contextText}

CRITICAL EXECUTION RULE: At the very end of the contract, you MUST include a dedicated Signature Block for both Party A and Party B.
- If the "Signature Method" in the specific details is "Wet Signature" or "Manual Wet Signature", you MUST create explicit physical signature lines (e.g., "Signature: _______________________").
- If the "Signature Method" is "E-Signature", you MUST include digital placeholders indicating execution via Lex Pro's Audit Trail (e.g., "[Digitally Executed via IP & Geo-Tag Audit Trail]").

Output ONLY the raw text of the contract. Make it professional, comprehensive, and strictly compliant with Indian law.
CRITICAL RULE: DO NOT use any Markdown formatting whatsoever (no **, no *, no #). Return purely plain text with standard spacing and capitalized headers.`;

        // --- LLM Generation with Fallback ---
        let draftContent = await callLLMWithFallback(prompt);

        // Strip any residual markdown tokens
        draftContent = draftContent.replace(/[*#_`]/g, '').trim();

        if (!draftContent) {
            throw new Error('AI generated an empty draft. Please try again.');
        }

        return NextResponse.json({ success: true, draft: draftContent });

    } catch (err) {
        console.error('[Lex Pro Draft] Fatal error:', err.message);
        return NextResponse.json(
            { success: false, error: err.message || 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
