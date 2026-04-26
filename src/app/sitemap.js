import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function sitemap() {
    const baseUrl = 'https://www.eyepune.com';
    const now = new Date();

    // Static pages — prioritized for Google
    const staticRoutes = [
        { url: `${baseUrl}/`,                          lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
        { url: `${baseUrl}/Services`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
        { url: `${baseUrl}/AI_Assessment`,             lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/Blog`,                      lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
        { url: `${baseUrl}/Contact`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/Booking`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/About`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Pricing`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Testimonials`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.75 },
        // Service landing pages
        { url: `${baseUrl}/Service_SocialMedia`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service_WebDev`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service_AI`,                lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service_PaidAds`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service_Branding`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service_Funnels`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ];

    // Dynamic blog post URLs from Supabase
    let blogRoutes = [];
    try {
        const { data: posts } = await supabase
            .from('blog_posts')
            .select('slug, published_date')
            .eq('status', 'published')
            .order('published_date', { ascending: false });

        if (posts) {
            blogRoutes = posts.map(post => ({
                url: `${baseUrl}/Blog_Post?id=${post.slug}`,
                lastModified: post.published_date ? new Date(post.published_date) : now,
                changeFrequency: 'weekly',
                priority: 0.75,
            }));
        }
    } catch (e) {
        console.warn('[Sitemap] Could not fetch blog posts:', e.message);
    }

    return [...staticRoutes, ...blogRoutes];
}
