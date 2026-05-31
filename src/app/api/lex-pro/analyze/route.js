import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request) {
    try {
        const body = await request.json();
        const { contractText } = body;

        if (!contractText) {
            return NextResponse.json({ error: 'Contract text is required' }, { status: 400 });
        }

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

        // 1. RAG Retrieval Phase - Check contract against internal knowledge base
        if (orgId && LLM_API_KEY) {
            try {
                // We embed a summary/first chunk of the contract to find related precedents
                const searchQuery = contractText.substring(0, 1000); 
                
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
                        match_threshold: 0.4,
                        match_count: 2,
                        org_id: orgId
                    });

                    if (contexts && contexts.length > 0) {
                        contextText = "\n\nCRITICAL INTERNAL PRECEDENTS & POLICIES:\n" + 
                                      contexts.map((c, i) => `[Standard Document ${i+1}: ${c.title}]\n${c.content}`).join("\n\n") + 
                                      "\n\nIf the uploaded contract deviates negatively from these internal policies, flag it as a risk.";
                    }
                }
            } catch (ragErr) {
                console.error('[Lex Pro Analyze RAG] Error during retrieval:', ragErr);
            }
        }

        const prompt = `You are an expert Indian corporate lawyer. Review the following contract text and provide a risk analysis.
Evaluate it against the Indian Contract Act, 1872, standard Indian corporate practices, and the provided INTERNAL PRECEDENTS (if any).
${contextText}

Return your analysis strictly as a JSON object with the following structure:
{
  "score": <integer from 0 to 100, where 100 is perfectly safe and 0 is extremely risky>,
  "summary": "<A 2-3 sentence overall summary of the contract's risk profile, mentioning internal policy alignment if applicable>",
  "clauses": [
    {
      "title": "<Name of the clause, e.g. 'Indemnification (Clause 4)'>",
      "risk": "<High, Medium, or Low>",
      "description": "<Why this clause is risky or safe under Indian law or internal policy>",
      "recommendation": "<Actionable recommendation to improve or fix the clause>"
    }
  ]
}

Provide 3 to 5 key clauses in the "clauses" array. Do NOT wrap the JSON in Markdown formatting like \`\`\`json. Output ONLY the raw JSON object.

Contract Text to Analyze:
"""
${contractText.substring(0, 80000)} // Increased limit (Llama 3.1 supports up to 128k tokens)
"""`;

        const llmResponse = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-8b-instruct',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 2500
            })
        });

        if (!llmResponse.ok) {
            throw new Error(`LLM API failed: ${llmResponse.statusText}`);
        }

        const llmData = await llmResponse.json();
        let resultText = llmData.choices?.[0]?.message?.content || '';
        
        // Ensure we parse the JSON correctly even if the model adds markdown code blocks
        resultText = resultText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

        let analysisResult;
        try {
            analysisResult = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse LLM JSON:", resultText);
            throw new Error("Failed to parse analysis results from AI.");
        }

        return NextResponse.json({ success: true, analysis: analysisResult });
    } catch (err) {
        console.error('[Lex Pro Analyze] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
