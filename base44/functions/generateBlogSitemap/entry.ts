import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Fetch all published blog posts
        const posts = await base44.asServiceRole.entities.BlogPost.filter(
            { status: 'published' },
            '-published_date',
            1000
        );

        // Get the base URL from the request
        const url = new URL(req.url);
        const baseUrl = `${url.protocol}//${url.host}`;

        // Generate XML sitemap
        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add blog listing page
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/#/Blog</loc>\n`;
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>0.9</priority>\n';
        sitemap += '  </url>\n';

        // Add each blog post
        for (const post of posts) {
            const postUrl = post.slug 
                ? `${baseUrl}/#/Blog_Post?slug=${post.slug}`
                : `${baseUrl}/#/Blog_Post?id=${post.id}`;
            
            const lastmod = post.updated_date || post.published_date;
            
            sitemap += '  <url>\n';
            sitemap += `    <loc>${postUrl}</loc>\n`;
            sitemap += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
            sitemap += '    <changefreq>weekly</changefreq>\n';
            sitemap += '    <priority>0.8</priority>\n';
            sitemap += '  </url>\n';
        }

        sitemap += '</urlset>';

        return new Response(sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Content-Disposition': 'attachment; filename=blog-sitemap.xml'
            }
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});