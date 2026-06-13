const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local or .env for Supabase credentials
const envPath = path.join(__dirname, '.env.local');
const envStr = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : fs.readFileSync(path.join(__dirname, '.env'), 'utf8');

const envVars = {};
envStr.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const posts = [
    {
        title: "The Ultimate Guide to AI Automation for Service Businesses in 2026",
        slug: "ultimate-guide-ai-automation-2026",
        excerpt: "Discover how Artificial Intelligence and advanced automation can scale your agency or service business past the $1M/year mark with zero additional headcount.",
        content: `<h2>Why AI is No Longer Optional</h2><p>In 2026, the discussion around Artificial Intelligence has moved from "should we use it?" to "how fast can we integrate it?" For service-based businesses, AI represents the greatest leverage point since the internet.</p><p>This guide breaks down exactly how to implement AI across your marketing, sales, and fulfillment operations.</p><h3>1. Lead Generation on Autopilot</h3><p>Gone are the days of manual outreach. By utilizing intelligent AI scraping and personalized outreach agents, businesses can now contact thousands of prospects weekly with highly personalized messages that look like they took hours to write.</p><h3>2. 24/7 Client Support</h3><p>Custom AI chatbots integrated directly into your website and WhatsApp can handle up to 80% of customer inquiries, book meetings directly into your calendar, and qualify leads while you sleep.</p><h3>Conclusion</h3><p>If you're not automating, you're stagnating. Start small—perhaps with a simple website chatbot—and scale your AI operations as you see the ROI.</p>`,
        category: "ai_automation",
        status: "published",
        author_name: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date().toISOString()
    },
    {
        title: "5 Proven Digital Marketing Strategies for High-Ticket B2B Sales",
        slug: "digital-marketing-strategies-b2b-high-ticket",
        excerpt: "Closing high-ticket deals requires more than just good ads. Learn the multi-touchpoint marketing strategies that actually convert enterprise clients.",
        content: `<h2>The High-Ticket Dilemma</h2><p>Selling a $10,000+ service is fundamentally different from selling a $50 product. It requires trust, authority, and multiple touchpoints.</p><h3>1. The Authority Funnel</h3><p>Instead of sending cold traffic to a sales page, send them to a high-value Video Sales Letter (VSL) or an in-depth case study. Educate them before you sell them.</p><h3>2. LinkedIn Social Selling</h3><p>LinkedIn is the goldmine for B2B. Don't just spam connections. Publish insightful content twice a week and engage with decision-makers' posts before sliding into their DMs.</p><h3>3. Multi-Channel Retargeting</h3><p>Once a prospect visits your site, they should see you everywhere—Facebook, Instagram, Google Display, and YouTube. Stay top of mind until they are ready to buy.</p>`,
        category: "business_growth",
        status: "published",
        author_name: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date(Date.now() - 86400000).toISOString()
    },
    {
        title: "How to Build a High-Converting Agency Website in Next.js",
        slug: "build-high-converting-agency-website-nextjs",
        excerpt: "Performance meets design. Why top-tier agencies are ditching WordPress for modern React frameworks like Next.js to maximize conversion rates.",
        content: `<h2>Speed Equals Revenue</h2><p>Every second your website takes to load, your conversion rate drops by up to 20%. This is why the best agencies use Next.js for their own sites.</p><h3>The Benefits of Next.js</h3><ul><li><strong>Lightning Fast:</strong> Static Site Generation (SSG) means your pages load instantly.</li><li><strong>Superior SEO:</strong> Next.js is fully optimized for Google's Core Web Vitals.</li><li><strong>Custom Animations:</strong> Framer Motion combined with React allows for immersive, premium 3D experiences that WordPress simply cannot match.</li></ul><p>If you want to charge premium prices, your website needs to look and feel premium.</p>`,
        category: "web_development",
        status: "published",
        author_name: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        title: "Social Media Dominance: The 2026 Playbook for Brands",
        slug: "social-media-dominance-2026-playbook",
        excerpt: "Organic reach is changing. Learn how to leverage short-form video, programmatic SEO, and AI to build an unstoppable brand presence.",
        content: `<h2>The End of Static Images</h2><p>Static posts are dying. In 2026, short-form video is the undisputed king of organic reach across all platforms—TikTok, Instagram Reels, and YouTube Shorts.</p><h3>Omnipresence Strategy</h3><p>You don't need to create new content for every platform. Create one pillar piece of content (like a podcast or YouTube video) and use AI tools to chop it into 15-20 short clips.</p><h3>Community Over Followers</h3><p>Follower count is a vanity metric. What matters is community engagement. Reply to every comment, host live Q&A sessions, and build a tribe around your brand.</p>`,
        category: "social_media",
        status: "published",
        author_name: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
        title: "Case Study: Scaling a Local Business by 300% Using AI Funnels",
        slug: "case-study-scaling-local-business-ai-funnels",
        excerpt: "A deep dive into how we took a traditional brick-and-mortar business and transformed it into a digital powerhouse using automated sales funnels.",
        content: `<h2>The Challenge</h2><p>A local service provider was relying entirely on word-of-mouth. They had no predictable system for acquiring new clients.</p><h3>The Solution</h3><p>We implemented a 3-step AI funnel:</p><ol><li><strong>Lead Magnet:</strong> A highly targeted free guide promoted via Meta Ads.</li><li><strong>Automated Nurture:</strong> A 7-day email and WhatsApp drip sequence driven by AI.</li><li><strong>Seamless Booking:</strong> An integrated calendar system allowing prospects to book directly.</li></ol><h3>The Results</h3><p>Within 90 days, their monthly recurring revenue increased by 300%, and the owner was working fewer hours because the software was doing the heavy lifting.</p>`,
        category: "case_studies",
        status: "published",
        author_name: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date(Date.now() - 86400000 * 4).toISOString()
    }
];

async function seed() {
    console.log('Starting seed...');
    for (const post of posts) {
        // Check if post exists
        const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', post.slug).single();
        if (existing) {
            console.log(\`Skipping \${post.slug}, already exists.\`);
            continue;
        }
        const { data, error } = await supabase.from('blog_posts').insert(post);
        if (error) {
            console.error('Error inserting', post.slug, error.message);
        } else {
            console.log('Inserted', post.slug);
        }
    }
    console.log('Done!');
}

seed().catch(console.error);
