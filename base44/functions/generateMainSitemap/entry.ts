import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const baseUrl = Deno.env.get("SITE_URL") || "https://eyepune.com";

        // Static pages with priority and change frequency
        const staticPages = [
            { path: '/', priority: '1.0', changefreq: 'daily' },
            { path: '/Services_Detail', priority: '0.9', changefreq: 'weekly' },
            { path: '/Pricing', priority: '0.9', changefreq: 'weekly' },
            { path: '/AI_Assessment', priority: '0.9', changefreq: 'weekly' },
            { path: '/About', priority: '0.8', changefreq: 'monthly' },
            { path: '/Contact', priority: '0.8', changefreq: 'monthly' },
            { path: '/Blog', priority: '0.8', changefreq: 'daily' },
            { path: '/Booking', priority: '0.7', changefreq: 'weekly' },
            { path: '/Testimonials', priority: '0.6', changefreq: 'weekly' },
            { path: '/Service_SocialMedia', priority: '0.85', changefreq: 'weekly' },
            { path: '/Service_WebDev', priority: '0.85', changefreq: 'weekly' },
            { path: '/Service_AI', priority: '0.85', changefreq: 'weekly' },
            { path: '/Service_PaidAds', priority: '0.85', changefreq: 'weekly' },
            { path: '/Service_Branding', priority: '0.85', changefreq: 'weekly' },
        ];

        // Fetch dynamic content
        const [blogPosts, services, cmsPages] = await Promise.all([
            base44.entities.BlogPost.filter({ status: 'published' }, '-published_date'),
            base44.entities.ServicePackage.filter({ is_active: true }),
            base44.entities.CMS_Page.filter({ published: true })
        ]);

        // Build sitemap XML
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static pages
        for (const page of staticPages) {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
            sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
            sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
            sitemap += `    <priority>${page.priority}</priority>\n`;
            sitemap += '  </url>\n';
        }

        // Add blog posts
        for (const post of blogPosts) {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseUrl}/Blog_Post?id=${post.id}</loc>\n`;
            sitemap += `    <lastmod>${post.updated_date || post.published_date}</lastmod>\n`;
            sitemap += '    <changefreq>monthly</changefreq>\n';
            sitemap += '    <priority>0.7</priority>\n';
            sitemap += '  </url>\n';
        }

        // Add CMS pages
        for (const page of cmsPages) {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseUrl}/CMSPage?slug=${page.slug}</loc>\n`;
            sitemap += `    <lastmod>${page.updated_date}</lastmod>\n`;
            sitemap += '    <changefreq>monthly</changefreq>\n';
            sitemap += '    <priority>0.6</priority>\n';
            sitemap += '  </url>\n';
        }

        sitemap += '</urlset>';

        return new Response(sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});