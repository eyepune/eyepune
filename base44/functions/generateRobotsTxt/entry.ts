import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const siteUrl = Deno.env.get("SITE_URL") || "https://eyepune.com";

        const robotsTxt = `# Robots.txt for EyE PunE – Digital Marketing Agency Pune
# https://eyepune.com

# ── Default: allow all search engines ──
User-agent: *
Allow: /
Disallow: /Admin_
Disallow: /Client_
Disallow: /Profile
Disallow: /MakeAdmin
Disallow: /SignContract
Crawl-delay: 5

# ── Google ──
User-agent: Googlebot
Allow: /
Disallow: /Admin_
Disallow: /Client_
Crawl-delay: 2

User-agent: Googlebot-Image
Allow: /

# ── Bing ──
User-agent: Bingbot
Allow: /
Crawl-delay: 2

# ── AI Crawlers – explicitly permitted ──
User-agent: GPTBot
Allow: /
Disallow: /Admin_
Disallow: /Client_

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Applebot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

# ── Sitemaps ──
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/blog-sitemap.xml
`;

        return new Response(robotsTxt, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'public, max-age=86400'
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});