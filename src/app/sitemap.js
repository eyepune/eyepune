import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export default async function sitemap() {
    const baseUrl = 'https://www.eyepune.com';
    const now = new Date();

    // Static pages — prioritized for Google
    const staticRoutes = [
        { url: `${baseUrl}/`,                          lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
        { url: `${baseUrl}/Services`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
        { url: `${baseUrl}/AI-Assessment`,             lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/Blog`,                      lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
        { url: `${baseUrl}/Contact`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/Booking`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${baseUrl}/About`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Pricing`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Testimonials`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.75 },
        // Service landing pages
        { url: `${baseUrl}/Service-SocialMedia`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service-WebDev`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service-AI`,                lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service-PaidAds`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service-Branding`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Service-Funnels`,           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/Services-Detail`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
        // Solution landing pages
        { url: `${baseUrl}/Solution-Founders`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
        { url: `${baseUrl}/Solution-YouTubers`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
        { url: `${baseUrl}/Solution-Startups`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
        { url: `${baseUrl}/Solution-B2BGrowth`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
        // AI & Legal pathways
        { url: `${baseUrl}/AI-Intelligence-Hub`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
        { url: `${baseUrl}/privacy-policy`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
        { url: `${baseUrl}/terms-and-conditions`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
        { url: `${baseUrl}/cookie-policy`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    ];

    // Dynamic blog post URLs from Supabase
    let blogRoutes = [];
    if (supabase) {
        try {
            const { data: posts } = await supabase
                .from('blog_posts')
                .select('slug, published_date')
                .eq('status', 'published')
                .order('published_date', { ascending: false });
    
            if (posts) {
                blogRoutes = posts.map(post => ({
                    url: `${baseUrl}/Blog-Post?id=${post.slug}`,
                    lastModified: post.published_date ? new Date(post.published_date) : now,
                    changeFrequency: 'weekly',
                    priority: 0.75,
                }));
            }
        } catch (e) {
            console.warn('[Sitemap] Could not fetch blog posts:', e.message);
        }
    }

    // Programmatic SEO Pages
    const programmaticSeoQueries = [
        "Best Digital Marketing Agencies",
        "Top 100 Digital Marketing Companies in India",
        "Top Digital Marketing Agencies in India",
        "Top 30 Digital Marketing Agencies",
        "Digital Marketing Asia Region",
        "Digital Marketing Middle East",
        "Digital Marketing Western Europe",
        "Digital Marketing South USA",
        "Digital Marketing West USA",
        "Digital Marketing Canada",
        "Digital Marketing Latin America",
        "Digital Marketing Australia New Zealand",
        "Digital Marketing Central USA",
        "Digital Marketing Northeast USA",
        "Digital Marketing UK Ireland",
        "B2B paid ads agency India",
        "Best Google Ads agency for startups",
        "Meta Ads management services global",
        "B2B SaaS performance marketing agency",
        "Account-based marketing (ABM) paid advertising Pune",
        "Top paid advertising company for lead generation",
        "Performance-based marketing agency India",
        "Website development AI tools in Pune",
        "Website development and design services Pune",
        "Free website development consultation Pune",
        "Best website development company Pune",
        "Website development course and training",
        "Custom AI website development company",
        "E-commerce website development services",
        "Sales funnel optimization services India",
        "Conversion rate optimization (CRO) agency global",
        "B2B lead generation funnel builder",
        "Top landing page optimization services Pune",
        "Automated sales funnel strategy",
        "E-commerce UX and funnel optimization",
        "High-ticket client acquisition funnels",
        "Social media marketing services in India",
        "Best social media agency for global brands",
        "B2B LinkedIn marketing agency Pune",
        "Instagram marketing and management services",
        "Social media content creation agency",
        "Affordable digital marketing agency for startups",
        "Influencer marketing and social analytics company",
        "Brand identity design agency India",
        "Startup branding agencies global",
        "Custom logo design services Pune",
        "Top brand strategy agencies",
        "SaaS and Tech branding agency",
        "Corporate B2B brand identity design",
        "Brand style guide and positioning company",
        "Top AI automation agencies India",
        "AI business automation consultants global",
        "Hire AI automation specialist Pune",
        "Generative AI integration services",
        "Best AI agency for small businesses",
        "Business Process Automation (BPA) companies India",
        "Custom AI agent development company"
    ];

    const programmaticRoutes = programmaticSeoQueries.map(query => ({
        url: `${baseUrl}/Solutions/${query.split(' ').join('-')}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    // Target Cities for Local Programmatic SEO
    const targetCities = [
        "Mumbai", "Bangalore", "Delhi", "Hyderabad", "Chennai", "Kolkata", 
        "Ahmedabad", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", 
        "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", 
        "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", 
        "Ranchi", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", 
        "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi-Mumbai", 
        "Allahabad", "Howrah", "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada", 
        "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", 
        "Dubai", "Singapore", "London", "New-York", "Toronto", "Sydney"
    ];

    const locationRoutes = targetCities.map(city => ({
        url: `${baseUrl}/Locations/${city}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    return [...staticRoutes, ...blogRoutes, ...programmaticRoutes, ...locationRoutes];
}
