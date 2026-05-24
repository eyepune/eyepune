/**
 * LinkedIn Automation Service
 * Handles AI-powered content generation and publishing to LinkedIn.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Generates and publishes a LinkedIn post using AI.
 * @param {string} type - 'educational', 'promotional', 'news', or 'random'
 */
export async function generateAndPostToLinkedin(type = 'random') {
    console.log(`[LinkedIn-Automation] Starting ${type} post generation...`);

    try {
        // 1. Get LinkedIn Config
        const { data: config } = await supabase
            .from('crm_sync_configs')
            .select('api_key')
            .eq('provider', 'linkedin_config')
            .single();

        let token = process.env.LINKEDIN_ACCESS_TOKEN;
        let urn = null;

        if (config?.api_key) {
            try {
                const parsed = JSON.parse(config.api_key);
                token = parsed.token;
                urn = parsed.urn;
            } catch (e) {
                token = config.api_key;
            }
        }

        if (!token) {
            throw new Error('LinkedIn integration not connected. Please provide an Access Token in the Marketing Dashboard.');
        }

        // 2. Generate Content via LLM
        const prompt = `Act as an elite Global Social Media Manager for "EyE PunE", an enterprise AI Growth Partner.
Generate a high-impact LinkedIn post of type: ${type.toUpperCase()}.

Agency Context:
- Services: Multi-Model AI Automations (NVIDIA, OpenAI, Anthropic), Enterprise Web Architectures (Next.js, Vercel, Supabase), Performance Marketing.
- Value Prop: We build sub-2-second loading digital infrastructure and AI-driven sales engines to scale global B2B brands.
- Target: Founders, C-Suite executives, and Enterprise Directors.

Rules:
- Professional, authoritative, visionary, and highly technical tone.
- Include 3-5 relevant hashtags (e.g., #AIAutomation #EnterpriseGrowth).
- Include a clear call to action (e.g., Run a Free AI Assessment for your business at eyepune.com/AI-Assessment).
- Keep it engaging (use clean line breaks and spacing, avoid excessive emojis).
- Do NOT use placeholders like [Link] or [Company Name]. Use "EyE PunE" and "eyepune.com".

Return the result as a raw text string suitable for a LinkedIn post.`;

        const llmResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/llm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8
            })
        });

        const llmData = await llmResponse.json();
        const postContent = llmData.content;

        if (!postContent) throw new Error('Failed to generate content via AI');

        // 3. Resolve Author URN if missing
        let authorUrn = urn;
        if (!authorUrn) {
            const meRes = await fetch('https://api.linkedin.com/v2/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const meData = await meRes.json();
            if (meData.id) authorUrn = `urn:li:person:${meData.id}`;
        }

        if (!authorUrn) throw new Error('Could not resolve LinkedIn Author URN');

        // 4. Publish to LinkedIn
        const publishRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify({
                author: authorUrn,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: { text: postContent },
                        shareMediaCategory: "NONE"
                    }
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            })
        });

        const publishData = await publishRes.json();
        if (!publishRes.ok) throw new Error(publishData.message || 'LinkedIn publishing failed');

        // 5. Log the action
        await supabase.from('activity_logs').insert([{
            action: 'linkedin_auto_post',
            details: `Posted ${type} content to LinkedIn. ID: ${publishData.id}`,
            status: 'success'
        }]);

        return { success: true, postId: publishData.id, content: postContent };

    } catch (error) {
        console.error('[LinkedIn-Automation] Error:', error.message);
        
        // Log failure
        await supabase.from('activity_logs').insert([{
            action: 'linkedin_auto_post_failed',
            details: error.message,
            status: 'error'
        }]);

        return { success: false, error: error.message };
    }
}
