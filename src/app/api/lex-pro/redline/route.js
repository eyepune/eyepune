import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request) {
    try {
        const body = await request.json();
        const { contractText, analysis } = body;

        if (!contractText || !analysis) {
            return NextResponse.json({ error: 'Contract text and analysis result are required' }, { status: 400 });
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

        const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
        const LLM_API_KEY = process.env.LLM_API_KEY;

        if (!LLM_API_KEY) {
            return NextResponse.json({ error: 'LLM configuration missing' }, { status: 500 });
        }

        const prompt = `You are a Senior Corporate Legal Counsel. Based on the following Risk Analysis and the original Contract Text, generate a polite but firm Redline Response Email to the counterparty, and an array of suggested edits for the contract.

Risk Analysis:
${JSON.stringify(analysis)}

Return your output STRICTLY as a JSON object with the following structure:
{
  "email": "<The full text of the email. Keep it professional, referencing the core commercial alignment but stating that some clauses need modification to meet internal policies.>",
  "changes": [
    {
      "original": "<Exact snippet of the original risky clause>",
      "new": "<The newly rewritten safe clause>",
      "reason": "<Brief rationale for why this change is necessary>"
    }
  ]
}

Provide 2 to 4 key changes based on the high/medium risks identified.
Do NOT wrap the JSON in Markdown formatting like \`\`\`json. Output ONLY the raw JSON object.

Original Contract Text:
"""
${contractText.substring(0, 80000)}
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
                temperature: 0.2,
                max_tokens: 3000
            })
        });

        if (!llmResponse.ok) {
            throw new Error(`LLM API failed: ${llmResponse.statusText}`);
        }

        const llmData = await llmResponse.json();
        let resultText = llmData.choices?.[0]?.message?.content || '';
        
        // Strip markdown blocks if the LLM adds them
        resultText = resultText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

        let redlineResult;
        try {
            redlineResult = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse LLM JSON:", resultText);
            throw new Error("Failed to parse redline results from AI.");
        }

        return NextResponse.json({ success: true, redline: redlineResult });
    } catch (err) {
        console.error('[Lex Pro Redline] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
