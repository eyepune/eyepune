import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const LLM_API_URL = process.env.LLM_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'qwen/qwen3.5-122b-a10b';

async function testLLM() {
    console.log('Testing LLM API...');
    if (!LLM_API_KEY) {
        console.error('Error: LLM_API_KEY not found in .env file');
        return;
    }

    try {
        const response = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`,
            },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, are you working?',
                    },
                ],
                max_tokens: 50,
            }),
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testLLM();
