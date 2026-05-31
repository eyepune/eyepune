import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request) {
    try {
        const body = await request.json();
        const { contractType, partyA, partyB, jurisdiction, governingLaw, additionalTerms } = body;

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const token = authHeader.replace('Bearer ', '');
        
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !userData?.user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get organization for RAG search
        const { data: profiles } = await supabase.from('profiles').select('organization_id').eq('id', userData.user.id).single();
        const orgId = profiles?.organization_id;

        const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
        const LLM_API_KEY = process.env.LLM_API_KEY;

        let contextText = '';

        // 1. RAG Retrieval Phase
        if (orgId && LLM_API_KEY) {
            try {
                const searchQuery = `Legal precedent for ${contractType} in ${jurisdiction}`;
                
                const embedResponse = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LLM_API_KEY}` },
                    body: JSON.stringify({ input: [searchQuery], model: "snowflake/arctic-embed-l", input_type: "query" })
                });

                if (embedResponse.ok) {
                    const embedData = await embedResponse.json();
                    const queryEmbedding = embedData.data[0].embedding;

                    const { data: contexts } = await supabase.rpc('match_legal_context', {
                        query_embedding: queryEmbedding,
                        match_threshold: 0.5,
                        match_count: 3,
                        org_id: orgId
                    });

                    if (contexts && contexts.length > 0) {
                        contextText = "\n\nCRITICAL KNOWLEDGE BASE PRECEDENTS TO FOLLOW:\n" + 
                                      contexts.map((c, i) => `[Precedent ${i+1}: ${c.title}]\n${c.content}`).join("\n\n");
                    }
                }
            } catch (ragErr) {
                console.error('[Lex Pro RAG] Error during retrieval:', ragErr);
                // Fail silently and fallback to base LLM knowledge
            }
        }

        // 2. LLM Drafting Phase
        const prompt = `You are an expert Indian corporate lawyer. Draft a legally binding ${contractType} between Party A (${partyA}) and Party B (${partyB}). 
The jurisdiction is ${jurisdiction} and the governing law is ${governingLaw}. 
${additionalTerms ? `Ensure you include the following specific terms: ${additionalTerms}` : ''}${contextText}

CRITICAL EXECUTION RULE: At the very end of the contract, you MUST include a dedicated Signature Block for both Party A and Party B. 
- If the "Signature Method" in the specific details is "Wet Signature" or "Manual Wet Signature", you MUST create explicit physical signature lines (e.g., "Signature: _______________________").
- If the "Signature Method" is "E-Signature", you MUST include digital placeholders (e.g., "[Digitally Signed via Aadhaar/DSC]").

Output ONLY the raw text of the contract. Make it professional, comprehensive, and strictly compliant with Indian law. 
CRITICAL RULE: DO NOT use any Markdown formatting whatsoever (no **, no *, no #). Return purely plain text with standard spacing and capitalized headers.`;

        const llmResponse = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-8b-instruct',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2, // Lower temperature for legal text to ensure determinism and professionalism
                max_tokens: 3000
            })
        });

        if (!llmResponse.ok) {
            throw new Error(`LLM API failed: ${llmResponse.statusText}`);
        }

        const llmData = await llmResponse.json();
        let draftContent = llmData.choices?.[0]?.message?.content || '';
        
        // Strip out any remaining markdown tokens (bold, italics, headers) to ensure a clean plain text output for the UI and PDF
        draftContent = draftContent.replace(/[*#_`]/g, '');

        return NextResponse.json({ success: true, draft: draftContent.trim() });
    } catch (err) {
        console.error('[Lex Pro Draft] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
