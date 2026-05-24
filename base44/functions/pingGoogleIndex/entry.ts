import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const baseUrl = Deno.env.get("SITE_URL") || "https://eyepune.com";

        const urls = [
            `${baseUrl}/Service_SocialMedia`,
            `${baseUrl}/Service_WebDev`,
            `${baseUrl}/Service_AI`,
            `${baseUrl}/Service_PaidAds`,
            `${baseUrl}/Service_Branding`,
            `${baseUrl}/Services_Detail`,
        ];

        const results = [];

        for (const url of urls) {
            // Ping Google's ping endpoint for sitemap update notification
            const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`;
            const pingRes = await fetch(pingUrl);
            results.push({ url, sitemap_ping: pingRes.status });

            // Also ping Bing
            const bingPing = `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`;
            await fetch(bingPing);
        }

        return Response.json({
            success: true,
            message: 'Pinged Google & Bing with updated sitemap',
            urls_submitted: urls,
            results
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});