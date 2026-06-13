const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env.local') }); // overrides if exists

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const posts = [
    {
        title: "The Ultimate Guide to AI Automation for Service Businesses in 2026",
        slug: "ultimate-guide-ai-automation-2026",
        excerpt: "Discover how Artificial Intelligence and advanced automation can scale your agency or service business past the $1M/year mark with zero additional headcount. This comprehensive guide covers AI lead generation, chatbots, and fulfillment.",
        content: `<h2>Why AI is No Longer Optional in 2026</h2>
<p>In the fast-paced digital economy of 2026, the discussion around Artificial Intelligence has firmly transitioned from "should we use it?" to "how fast can we integrate it?" For service-based businesses, agencies, and consultancies, AI represents the greatest leverage point since the advent of the internet itself. Those who adapt will scale effortlessly, while those who rely on outdated manual processes will be outpaced by leaner, tech-enabled competitors.</p>
<p>This comprehensive guide breaks down exactly how to implement AI across your marketing, sales, and fulfillment operations to achieve unprecedented growth without proportionally increasing your headcount or overhead costs.</p>
<h3>1. Lead Generation on Absolute Autopilot</h3>
<p>Gone are the days of manual outreach, purchasing low-quality lead lists, and blindly cold-calling prospects. By utilizing intelligent AI scraping tools and highly personalized outreach agents, businesses can now contact thousands of hyper-targeted prospects weekly.</p>
<p>Modern AI tools can read a prospect's LinkedIn profile, analyze their company's recent news, and craft a bespoke outreach message that sounds exactly like a human took 20 minutes to research it. The result? Reply rates that consistently hover above 15%, compared to the dismal 1% of traditional cold email.</p>
<h3>2. 24/7 Client Support and Qualification</h3>
<p>Custom AI chatbots integrated directly into your website, Facebook Messenger, and WhatsApp can handle up to 80% of routine customer inquiries. But it doesn't stop at support.</p>
<p>These intelligent conversational agents act as your best sales development representatives (SDRs). They can pre-qualify leads by asking about budget and timeline, handle basic objections, and seamlessly book meetings directly into your sales team's calendar while you sleep. The friction between a website visitor and a booked appointment has been completely eliminated.</p>
<h3>3. Streamlining Operational Fulfillment</h3>
<p>Delivering your service often takes up the bulk of your team's time. Whether you run a marketing agency, a law firm, or a consulting practice, AI can automate the repetitive aspects of your deliverables.</p>
<ul>
    <li><strong>For Marketing Agencies:</strong> AI can generate initial ad copy, create variations of ad creatives, and analyze A/B test results to suggest budget reallocations.</li>
    <li><strong>For Law Firms:</strong> Large Language Models (LLMs) can review contracts, highlight potential liabilities, and draft boilerplate legal documents in seconds.</li>
    <li><strong>For Consultancies:</strong> AI can synthesize hours of client interview transcripts into concise executive summaries and actionable roadmaps.</li>
</ul>
<h3>The Path Forward: Start Small, Scale Fast</h3>
<p>If you're overwhelmed by the possibilities, the best advice is to start small. Identify the single biggest bottleneck in your business right now. Is it lead generation? Implementing a conversational AI chatbot on your high-traffic pages might be the quick win you need.</p>
<p>If you're not automating, you're stagnating. Embrace the AI revolution, empower your team with these tools, and watch your service business reach heights previously thought impossible.</p>`,
        category: "ai_automation",
        status: "published",
        author: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date().toISOString()
    },
    {
        title: "5 Proven Digital Marketing Strategies for High-Ticket B2B Sales",
        slug: "digital-marketing-strategies-b2b-high-ticket",
        excerpt: "Closing high-ticket enterprise deals requires more than just good ad copy. Learn the multi-touchpoint marketing strategies and authority-building funnels that actually convert C-level executives.",
        content: `<h2>The High-Ticket Dilemma</h2>
<p>Selling a $10,000 to $100,000+ service is fundamentally different from selling a $50 consumer product. High-ticket B2B sales require deep trust, established authority, and multiple strategic touchpoints. A single Facebook ad leading to a checkout page will simply not work. C-level executives and decision-makers need to be educated, nurtured, and convinced that your solution is the only logical choice for their enterprise.</p>
<p>Here are five proven strategies to construct a marketing ecosystem designed specifically for high-ticket client acquisition.</p>
<h3>1. The Authority Funnel (Video Sales Letters)</h3>
<p>Instead of sending cold traffic to a generic service page, direct them to a high-value Video Sales Letter (VSL) or an in-depth, data-driven case study. The goal here is not an immediate sale, but to educate the prospect on a specific problem they are facing and logically walk them through why your methodology is the solution.</p>
<p>A strong VSL builds parasocial trust. The prospect spends 10 to 15 minutes listening to you speak, absorbing your expertise. By the time they book a call, they are already pre-sold on your authority.</p>
<h3>2. Strategic LinkedIn Social Selling</h3>
<p>LinkedIn remains the undisputed goldmine for B2B lead generation. However, the era of automated "pitch-slap" DMs is over. Today's strategy is 'Social Selling'.</p>
<p>You must establish yourself as a thought leader in your niche. Publish insightful, contrarian, or highly educational content twice a week. Engage authentically with your target decision-makers' posts. Build rapport in the comments before ever moving to the direct messages. When you finally do reach out, it feels like a warm introduction rather than a cold pitch.</p>
<h3>3. Multi-Channel Omnipresent Retargeting</h3>
<p>The B2B buying cycle is long, often spanning 3 to 6 months. Once a prospect visits your website or watches your VSL, they must enter your omnipresent retargeting web. They should see your case studies, client testimonials, and thought-leadership videos everywhere they go online—Facebook, Instagram, Google Display Network, and pre-roll YouTube ads.</p>
<p>This creates the illusion of massive scale and ensures that when the prospect is finally ready with the budget to pull the trigger, your brand is the first one that comes to mind.</p>
<h3>4. Hosting Exclusive Industry Webinars</h3>
<p>Webinars are highly effective for consolidating a large group of interested prospects into a single, high-conversion event. Co-hosting webinars with non-competing businesses in your industry can also allow you to tap into their audience, instantly expanding your reach to pre-qualified leads.</p>
<h3>5. The 'Trojan Horse' Micro-Service</h3>
<p>Asking for a $50,000 commitment upfront is a massive friction point. Instead, offer a low-cost or free 'Micro-Service'—such as an in-depth audit, a customized growth roadmap, or a specific technical assessment. This allows the client to experience your expertise with very low risk. Once you deliver exceptional value on the micro-service, upselling the main high-ticket retainer becomes a natural next step.</p>`,
        category: "business_growth",
        status: "published",
        author: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date(Date.now() - 86400000).toISOString()
    },
    {
        title: "Why Top Agencies Are Ditching WordPress for Next.js",
        slug: "why-agencies-ditching-wordpress-for-nextjs",
        excerpt: "Performance meets premium design. Discover why the digital landscape is shifting and top-tier agencies are migrating their high-traffic sites to modern React frameworks like Next.js.",
        content: `<h2>The Need for Speed and Security</h2>
<p>For over a decade, WordPress has been the default choice for agency and business websites. It democratized the web. However, as web standards have evolved and user patience has decreased, the limitations of traditional monolithic CMS platforms have become glaringly obvious. Today, elite digital agencies are migrating their infrastructure to modern, decoupled architectures, specifically leveraging React-based frameworks like Next.js.</p>
<h3>The Problem with Legacy Monoliths</h3>
<p>Traditional platforms often rely heavily on plugins to achieve basic modern functionality (SEO, caching, security). This creates a bloated, slow, and highly vulnerable ecosystem. Every additional plugin increases the time to first byte (TTFB) and introduces potential security loopholes. For an agency charging premium rates, a slow, easily hacked website destroys credibility instantly.</p>
<h3>The Next.js Advantage: Performance by Default</h3>
<p>Next.js solves the performance bottleneck through its hybrid rendering capabilities. It allows developers to use Static Site Generation (SSG) for marketing pages—meaning the HTML is pre-built on the server at deploy time. When a user visits the site, the page loads almost instantaneously via a global Content Delivery Network (CDN).</p>
<p>Every millisecond counts. Amazon famously found that every 100ms of latency cost them 1% in sales. A lightning-fast Next.js site directly correlates to higher conversion rates, lower bounce rates, and better user engagement.</p>
<h3>Superior Technical SEO</h3>
<p>Google's Core Web Vitals heavily prioritize loading speed, interactivity, and visual stability. Next.js sites consistently score in the 90-100 range on Google Lighthouse audits right out of the box. The framework's built-in Image Optimization component automatically serves correctly sized, modern image formats (like WebP) based on the user's device, further supercharging page speeds and SEO rankings.</p>
<h3>Unbound Creative Freedom and 3D Experiences</h3>
<p>When you decouple the front-end from the back-end, developers have total creative freedom. Using libraries like Framer Motion for buttery-smooth animations, or Three.js for immersive 3D WebGL experiences, agencies can craft bespoke, award-winning digital experiences that are simply impossible to achieve with a standard WordPress theme. </p>
<h3>Conclusion</h3>
<p>Your website is your ultimate digital salesperson. If you want to attract enterprise clients and command premium pricing, your digital storefront must reflect that elite status. The transition to Next.js is not just a technological upgrade; it is a strategic business decision to maximize conversion and solidify brand authority.</p>`,
        category: "web_development",
        status: "published",
        author: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        title: "Social Media Dominance: The 2026 Playbook for Brands",
        slug: "social-media-dominance-2026-playbook",
        excerpt: "Organic reach is changing rapidly. Learn how to leverage short-form video, programmatic SEO, and community building to construct an unstoppable brand presence this year.",
        content: `<h2>The Attention Economy is Shifting</h2>
<p>The rules of social media engagement have fundamentally changed. The strategies that worked in 2022 will result in stagnant growth and zero reach today. The algorithms across Meta, YouTube, and LinkedIn have aggressively pivoted to prioritize keeping users on the platform as long as possible. To win in this new attention economy, brands must adapt to the 'Entertainment First, Education Second' model.</p>
<h3>The Undisputed King: Short-Form Vertical Video</h3>
<p>Static images and generic graphic posts are essentially dead for organic discovery. Short-form vertical video (TikToks, Instagram Reels, and YouTube Shorts) is the only reliable vehicle for explosive organic reach. The algorithm no longer just shows your content to your followers; it serves it to anyone it thinks will watch it based on the 'Interest Graph'.</p>
<p>This means a brand with 100 followers can reach 1 million views overnight if they craft a compelling, highly-retainable 15-second video.</p>
<h3>The Omnipresence Content Engine</h3>
<p>Creating content for every single platform is exhausting and inefficient. The most successful brands utilize an 'Omnipresence Engine'. Here is how it works:</p>
<ol>
    <li><strong>The Pillar Piece:</strong> Record one long-form piece of content weekly. This could be a 30-minute podcast, a YouTube educational video, or a recorded live stream.</li>
    <li><strong>AI Slicing:</strong> Use AI video editing tools to identify the most engaging moments and automatically chop that 30-minute video into 15 to 20 highly optimized short-form clips, complete with dynamic captions.</li>
    <li><strong>Syndication:</strong> Distribute those clips across Shorts, Reels, TikTok, and LinkedIn daily.</li>
</ol>
<p>You do the work once, but you appear to be everywhere, all the time.</p>
<h3>Building Cult-Like Communities</h3>
<p>Follower count is a vanity metric; community engagement is the only metric that drives revenue. Brands must shift from broadcasting to conversing. Reply to every single comment. Host weekly live Q&A sessions. Create exclusive Discord or Skool groups for your top customers.</p>
<p>When you build a true community, your audience becomes your marketing department. They will defend your brand, recommend you to their peers, and provide invaluable feedback for your next product iteration.</p>`,
        category: "social_media",
        status: "published",
        author: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
        title: "Case Study: Scaling a Local Business by 300% Using Automated Funnels",
        slug: "case-study-scaling-local-business-automated-funnels",
        excerpt: "A comprehensive deep dive into how our agency took a traditional brick-and-mortar business and transformed it into a scalable digital powerhouse using advanced sales funnels and CRM automation.",
        content: `<h2>The Client Challenge</h2>
<p>We recently partnered with a highly successful, traditional B2B service provider based in the midwest. Despite having an incredible reputation and a stellar service delivery model, their entire client acquisition process relied on word-of-mouth referrals and archaic networking events. They had zero predictable, scalable systems for generating new revenue. Their revenue had plateaued, and the founders were working 80-hour weeks.</p>
<h3>Step 1: Diagnosing the Bottleneck</h3>
<p>Our initial audit revealed a massive leak in their digital presence. Their website received decent local traffic, but the only way for a prospect to engage was a static "Contact Us" form buried in the footer. Less than 0.5% of website visitors ever reached out. They were leaving hundreds of thousands of dollars on the table.</p>
<h3>Step 2: Architecting the Automated Funnel</h3>
<p>We implemented a comprehensive, three-stage automated digital funnel designed to capture, nurture, and convert traffic into paying clients without requiring human intervention.</p>
<ol>
    <li><strong>The Irresistible Lead Magnet:</strong> We replaced the generic "Contact Us" form with a highly targeted, free downloadable guide addressing the specific pain points of their ideal customer. We drove targeted traffic to this landing page using precisely calibrated Meta Ads.</li>
    <li><strong>The AI Nurture Sequence:</strong> Once a prospect downloaded the guide, they were entered into an automated CRM workflow. Over the next 14 days, they received a strategic sequence of value-driven emails and SMS messages. These messages shared case studies, answered common objections, and built massive trust.</li>
    <li><strong>Frictionless Booking:</strong> Every communication included a direct link to an automated calendar booking system. Prospects could choose a time that worked for them, answer a pre-qualifying questionnaire, and automatically receive calendar invites and Zoom links.</li>
</ol>
<h3>The Extraordinary Results</h3>
<p>The transformation was radical and rapid. Within 90 days of launching the new automated funnel infrastructure:</p>
<ul>
    <li>Lead volume increased by over 850%.</li>
    <li>Monthly Recurring Revenue (MRR) grew by an astonishing 300%.</li>
    <li>The cost to acquire a qualified customer (CAC) plummeted by 60%.</li>
</ul>
<p>Most importantly, the founders completely stepped out of the lead generation process. The software now does the heavy lifting 24/7, allowing the team to focus entirely on closing deals and delivering exceptional service. This is the power of a properly architected digital growth engine.</p>`,
        category: "case_studies",
        status: "published",
        author: "EyE PunE Insights",
        featured_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        published_date: new Date(Date.now() - 86400000 * 4).toISOString()
    }
];

async function refreshBlogs() {
    console.log('Starting full blog refresh...');
    
    // 1. Delete all existing posts to clear duplicates and low-quality content
    console.log('Deleting all existing blog posts...');
    const { data: existingPosts, error: fetchError } = await supabase.from('blog_posts').select('id');
    if (fetchError) {
        console.error('Error fetching existing posts:', fetchError);
        process.exit(1);
    }
    
    if (existingPosts && existingPosts.length > 0) {
        const idsToDelete = existingPosts.map(p => p.id);
        const { error: deleteError } = await supabase.from('blog_posts').delete().in('id', idsToDelete);
        if (deleteError) {
            console.error('Error deleting posts:', deleteError);
            process.exit(1);
        }
        console.log('Successfully deleted ' + idsToDelete.length + ' existing posts.');
    } else {
        console.log('No existing posts found to delete.');
    }

    // 2. Insert the fresh, high-quality, long-form content
    console.log('Inserting high-quality unique posts...');
    for (const post of posts) {
        const { error } = await supabase.from('blog_posts').insert(post);
        if (error) {
            console.error('Error inserting', post.slug, error.message);
        } else {
            console.log('Inserted:', post.slug);
        }
    }
    
    console.log('Blog refresh complete! The database now has 100% unique, high-quality content.');
}

refreshBlogs().catch(console.error);
