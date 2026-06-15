import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return new Response('Missing Supabase credentials', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_date', { ascending: false })
        .limit(20);

    if (error) {
        return new Response('Error fetching posts', { status: 500 });
    }

    const baseUrl = 'https://www.eyepune.com';

    const rssItems = posts.map(post => `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>${baseUrl}/Blog-Post?id=${post.slug}</link>
            <guid isPermaLink="true">${baseUrl}/Blog-Post?id=${post.slug}</guid>
            <pubDate>${new Date(post.published_date || new Date()).toUTCString()}</pubDate>
            <description><![CDATA[${post.excerpt || post.title}]]></description>
            ${post.featured_image ? `<media:content url="${post.featured_image.replace(/&/g, '&amp;')}" medium="image"/>` : ''}
            <dc:creator><![CDATA[${post.author_name || 'EyE PunE Insights'}]]></dc:creator>
        </item>
    `).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
        <title>EyE PunE Insights</title>
        <link>${baseUrl}/Blog</link>
        <description>Insights on AI Automation, Web Development, and Digital Marketing by EyE PunE.</description>
        <language>en-us</language>
        <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
        ${rssItems}
    </channel>
</rss>`;

    return new Response(rssFeed, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
    });
}
