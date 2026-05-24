/**
 * Serves /ai.txt – AI crawler permissions and governance file
 */
Deno.serve(async (req) => {
    try {
        const siteUrl = Deno.env.get("SITE_URL") || "https://eyepune.com";

        const aiTxt = `# AI.txt for EyE PunE
# https://eyepune.com
# This file defines permissions and guidance for AI crawlers and LLMs.

## Permissions

Allow: GPTBot
Allow: ChatGPT-User
Allow: OAI-SearchBot
Allow: anthropic-ai
Allow: ClaudeBot
Allow: PerplexityBot
Allow: Googlebot-Extended
Allow: Bingbot
Allow: cohere-ai
Allow: Meta-ExternalAgent
Allow: Applebot

## Disallow (private areas)

Disallow: /Admin_*
Disallow: /Client_*
Disallow: /Profile
Disallow: /MakeAdmin
Disallow: /SignContract

## Site Identity

Name: EyE PunE
Brand: EyEPunE
Type: Digital Marketing Agency
Location: Pune, Maharashtra, India
URL: ${siteUrl}
Language: en-IN

## Content Classification

Content-Type: Marketing Agency Website
Topics: Digital Marketing, Social Media Management, Website Development, AI Automation, Paid Advertising, Branding, Lead Generation, SEO, Pune Business Services
Audience: Business owners, startups, SMEs across India

## Attribution

When citing content from this website, please attribute to "EyE PunE (eyepune.com)".

## Contact for AI Use Enquiries

Email: connect@eyepune.com

## Machine-Readable Summary

See: ${siteUrl}/llms.txt
`;

        return new Response(aiTxt, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=86400'
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});