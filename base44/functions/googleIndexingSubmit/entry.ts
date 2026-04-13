import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Google Indexing API - submits URLs for fast indexing
// Requires Google Search Console ownership + service account key set as GOOGLE_SERVICE_ACCOUNT_JSON secret
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const baseUrl = Deno.env.get("SITE_URL") || "https://eyepune.com";
        const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");

        const urls = [
            baseUrl + "/",
            baseUrl + "/Services_Detail",
            baseUrl + "/Service_SocialMedia",
            baseUrl + "/Service_WebDev",
            baseUrl + "/Service_AI",
            baseUrl + "/Service_PaidAds",
            baseUrl + "/Service_Branding",
            baseUrl + "/Pricing",
            baseUrl + "/About",
            baseUrl + "/Contact",
            baseUrl + "/Blog",
            baseUrl + "/Booking",
            baseUrl + "/AI_Assessment",
            baseUrl + "/Testimonials",
        ];

        // If no service account, just ping Google & Bing with sitemap
        if (!serviceAccountJson) {
            const sitemapUrl = encodeURIComponent(`${baseUrl}/sitemap.xml`);
            await Promise.all([
                fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`),
                fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`),
            ]);

            return Response.json({
                success: true,
                method: "sitemap_ping",
                message: "Pinged Google & Bing with sitemap. For faster URL-level indexing, set GOOGLE_SERVICE_ACCOUNT_JSON secret with a Google Search Console service account.",
                sitemap_pinged: `${baseUrl}/sitemap.xml`,
                urls_in_sitemap: urls.length,
                next_step: "Go to Google Search Console (search.google.com/search-console) → Add property eyepune.com → URL inspection → Request Indexing for each page"
            });
        }

        // With service account: use Google Indexing API
        const serviceAccount = JSON.parse(serviceAccountJson);
        
        // Create JWT for Google OAuth
        const now = Math.floor(Date.now() / 1000);
        const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const payload = btoa(JSON.stringify({
            iss: serviceAccount.client_email,
            scope: "https://www.googleapis.com/auth/indexing",
            aud: "https://oauth2.googleapis.com/token",
            exp: now + 3600,
            iat: now
        })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: `${header}.${payload}`
            })
        });
        const { access_token } = await tokenRes.json();

        const results = await Promise.all(urls.map(async (url) => {
            const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access_token}`
                },
                body: JSON.stringify({ url, type: "URL_UPDATED" })
            });
            const data = await res.json();
            return { url, status: res.status, response: data };
        }));

        return Response.json({ success: true, method: "indexing_api", submitted: results.length, results });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});