-- ============================================================
-- EyE PunE — Content Seed + Schema Additions
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. Add missing columns to blog_posts ──────────────────
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'EyE PunE Team';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ── 2. Ensure service_packages table exists ───────────────
CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    category TEXT,
    features TEXT[] DEFAULT '{}',
    is_popular BOOLEAN DEFAULT FALSE,
    billing_cycle TEXT DEFAULT 'monthly',
    delivery_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin All service_packages" ON public.service_packages;
DROP POLICY IF EXISTS "Public Read service_packages" ON public.service_packages;
CREATE POLICY "Admin All service_packages" ON public.service_packages FOR ALL USING (public.is_admin());
CREATE POLICY "Public Read service_packages" ON public.service_packages FOR SELECT USING (is_active = TRUE);
GRANT SELECT ON public.service_packages TO anon;

-- ── 3. FIX user_activities RLS 403 ───────────────────────
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, activity_type TEXT, page_path TEXT,
    metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_anon_insert_activities" ON public.user_activities;
CREATE POLICY "allow_anon_insert_activities"
    ON public.user_activities FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT INSERT ON public.user_activities TO anon;

-- ── 4. SEED BLOG POSTS ─────────────────────────────────────
INSERT INTO public.blog_posts (title, excerpt, content, category, status, published_date, tags, author, slug)
VALUES

('5 Ways AI is Transforming Digital Marketing in 2025',
'Artificial intelligence is the engine driving modern marketing. Here''s how forward-thinking brands in India are using AI to outpace competitors.',
'AI has moved from science fiction to boardroom strategy. For businesses in Pune and across India, AI-powered marketing is no longer optional — it is the competitive baseline.

**1. Hyper-Personalized Content at Scale** — AI tools can generate hundreds of personalized emails and social posts in minutes. Brands report 40% lower content costs while doubling output.

**2. Predictive Lead Scoring** — Instead of chasing every lead equally, AI models score prospects based on behavior and demographics, letting your sales team focus on the top 20% that drives 80% of revenue.

**3. Automated Customer Journeys** — From first website visit to sale, AI orchestrates the entire journey — chatbots qualify leads 24/7, automation triggers the right email at the right time.

**4. Real-Time Ad Optimization** — Meta and Google AI adjust bids, creatives, and audiences in real-time. Brands pairing human strategy with AI optimization see 20–35% lower cost per acquisition.

**5. Sentiment Analysis** — AI monitors thousands of social mentions, flagging negative sentiment before it becomes a PR crisis.

At EyE PunE, we help brands implement these systems without technical complexity. [Book a free consultation →](https://eyepune.com/Booking)',
'ai_automation', 'published', NOW() - INTERVAL ''2 days'',
ARRAY[''AI'', ''Digital Marketing'', ''Automation'', ''2025''],
'EyE PunE Team', 'ai-transforming-digital-marketing-2025'),

('How to Get 10x More Leads Without Spending More on Ads',
'Most businesses focus on driving more traffic. The smarter play? Converting the traffic you already have. 7 proven optimizations that consistently double lead generation.',
'The average website converts only 1–2% of visitors. Top performers hit 8–12%. The difference is conversion architecture.

**1. Replace Generic CTAs** — "Get Your Free Growth Audit" converts at 6–8%. "Contact Us" converts at 0.5%.

**2. Add Social Proof Above the Fold** — Logos, review counts, and testimonials in the first screen reduce bounce rate by 30%.

**3. Speed Matters** — Every second of load time costs 7% in conversions. Optimize images, use a CDN, minify code.

**4. Install a Qualifying Chatbot** — A chatbot that captures email and qualifies prospects 24/7. EyE PunE clients see 3–5x more leads after adding one.

**5. Lead Magnet Funnel** — Offer a free resource (checklist, audit) in exchange for an email. Grows your list automatically.

**6. Exit-Intent Popups** — Recover 5–10% of bouncing visitors with a well-timed offer.

**7. A/B Test Your Hero Section** — Test 2 headline variants for 2 weeks and implement the winner.

Fix your foundation before scaling ad spend — it is the highest-ROI marketing move you can make.',
'business_growth', 'published', NOW() - INTERVAL ''5 days'',
ARRAY[''Lead Generation'', ''CRO'', ''Marketing''],
'EyE PunE Team', '10x-leads-without-more-ads'),

('Social Media Marketing Guide for Pune Businesses in 2025',
'Local businesses in Pune are unlocking massive growth through strategic social media. Here is the exact playbook we use with our clients.',
'Pune is one of India''s fastest-growing markets. Here is the platform strategy by business type:

**Restaurants & F&B** — Instagram + Zomato + Google My Business. Daily Reels + Stories.

**Real Estate** — Instagram + LinkedIn + YouTube. Property tours and neighborhood guides.

**Professional Services** — LinkedIn + YouTube. Educational content 3x/week.

**Education & Coaching** — Instagram + YouTube + WhatsApp. Daily Instagram, weekly YouTube.

**The Content Pillars Framework:**
- 40% Educational (how-tos, tips, guides)
- 20% Social Proof (client results, testimonials)
- 15% Behind-the-Scenes (team, process)
- 15% Promotional (offers, services)
- 10% Entertainment/Trends

**Hashtag Strategy:** Combine #PuneBusinesses + niche + 2–3 high-volume broad tags.

**Metrics to Track:** Reach growth (15% MoM), Engagement rate (2.5%+ good, 5%+ excellent), DM leads generated.',
'social_media', 'published', NOW() - INTERVAL ''8 days'',
ARRAY[''Social Media'', ''Pune'', ''Instagram'', ''Local Business''],
'EyE PunE Team', 'social-media-guide-pune-2025'),

('Why Your Website is Losing Customers (And How to Fix It)',
'Website mistakes are silent revenue killers. Here are the 6 most common mistakes we see in Pune business websites — and the exact fixes.',
'A bad website is worse than no website. The 6 silent killers:

**1. No Clear Value Proposition** — Visitors need to know in 3 seconds: what you do, for whom, and why you. "Welcome to [Company]" costs you 60% of visitors.

**2. Poor Mobile Experience** — 75% of Indian traffic is mobile. If your site was designed desktop-first, you are losing the majority of potential customers.

**3. No Social Proof** — Add at least 3 testimonials with real names and photos to your homepage this week.

**4. Forms That Ask Too Much** — Every extra field costs 11% of submissions. Strip to: Name, Email, Phone.

**5. No Live Chat** — Visitors leave when they can''t get instant answers. Add a chatbot or WhatsApp button today.

**6. Missing Trust Signals** — GST number, physical address, team photos, years in business — all dramatically increase conversions.

**This Week''s Action Plan:** Rewrite hero headline (Day 1) → Mobile audit (Days 2-3) → Add testimonials (Day 4) → Simplify form (Day 5) → Add WhatsApp button (Day 6) → Add trust badges (Day 7).',
'web_development', 'published', NOW() - INTERVAL ''12 days'',
ARRAY[''Website'', ''CRO'', ''Conversion'', ''Business Growth''],
'EyE PunE Team', 'website-losing-customers-fixes'),

('Case Study: 300 Leads in 30 Days for a Pune SaaS Startup',
'Real numbers, real strategy, real results. Exactly how we took a Pune HR-tech startup from 0 to 312 qualified leads in one month with a ₹50,000 budget.',
'Client: B2B SaaS (HR tech), Pune. Budget: ₹50,000/month. Result: 312 leads at ₹160 CPL.

**Week 1 — Foundation:** Landing page overhaul (one focused offer), lead magnet creation (HR Compliance Checklist), CRM + automated follow-up setup.

**Week 2 — Campaign Launch:**
- Meta Ads (₹25k) → 180 leads at ₹138 CPL — video testimonial creative
- Google Search (₹20k) → 98 leads at ₹204 CPL — keyword-specific landing pages
- LinkedIn Organic (free) → 34 leads — founder posting 3x/week

**Week 3–4 — Optimization:** Killed lowest-performing ad sets, scaled top performer 40%, A/B tested 3 video thumbnails, optimized landing page from heat map data.

**Results:** 312 leads total. 28 converted to paid customers in 60 days (9% close rate).

**Key Takeaways:**
- Landing pages beat homepages for campaign traffic — always
- Video creatives outperformed static images by 3x
- Founder LinkedIn is the highest-ROI B2B channel in India
- Daily optimization is non-negotiable

[Book a strategy call →](https://eyepune.com/Booking)',
'case_studies', 'published', NOW() - INTERVAL ''15 days'',
ARRAY[''Case Study'', ''Lead Generation'', ''Meta Ads'', ''Results''],
'EyE PunE Team', 'case-study-300-leads-30-days')

ON CONFLICT (slug) DO NOTHING;

-- ── 5. SEED SERVICE PACKAGES ──────────────────────────────
INSERT INTO public.service_packages (name, description, price, currency, category, features, is_popular, billing_cycle, delivery_days)
VALUES

('Social Media Starter', 'Build your brand on Instagram and Facebook with consistent, professional content.', 15000, 'INR', 'social_media',
ARRAY['2 platforms (Instagram + Facebook)','12 posts per month','8 Stories per month','Custom-designed graphics','Caption copywriting with hashtags','Monthly performance report'],
false, 'monthly', 30),

('Social Media Growth', 'Multi-platform management with Reels, community building, and monthly strategy calls.', 35000, 'INR', 'social_media',
ARRAY['3 platforms (Instagram + Facebook + LinkedIn)','20 posts per month','20 Stories per month','4 Reels per month (scripted + edited)','Community management (replies + DMs)','Monthly strategy call (60 min)','Performance dashboard access'],
true, 'monthly', 30),

('Website Starter', 'Professional 5-page website that converts visitors to leads. Built on Next.js for speed and SEO.', 45000, 'INR', 'web_app',
ARRAY['5-page custom website','Mobile-first responsive design','Next.js for speed & SEO','Contact form with email automation','Google Analytics + SEO setup','WhatsApp chat button','3 months free support'],
false, 'one_time', 21),

('Sales Funnel Pro', 'Complete lead-generation system with landing pages, email automation, and retargeting.', 75000, 'INR', 'web_app',
ARRAY['Conversion-optimized landing page','5-email automation sequence','Lead magnet design (PDF/checklist)','Meta Pixel + Google Tag setup','CRM integration','A/B testing framework','6 months support'],
true, 'one_time', 30),

('AI Automation Starter', 'Automate your top 3 business workflows with AI — from lead capture to follow-up.', 25000, 'INR', 'ai_automation',
ARRAY['3 custom AI automation workflows','Lead capture → CRM → Email sequence','WhatsApp Business API integration','Zapier / n8n workflow setup','Training session (2 hours)','30 days post-launch support'],
false, 'one_time', 21),

('AI Growth Engine', 'Full-stack AI automation — every touchpoint from first visit to repeat purchase automated.', 65000, 'INR', 'ai_automation',
ARRAY['10+ custom AI workflows','AI chatbot trained on your business','Automated lead scoring & routing','Email + WhatsApp + SMS automation','Analytics dashboard with AI insights','Monthly AI strategy review','3 months dedicated support'],
true, 'monthly', 45),

('Brand Identity Package', 'Complete visual identity from logo to brand guidelines — ready for digital and print.', 30000, 'INR', 'branding',
ARRAY['Logo design (3 concepts, 2 revisions)','Brand color palette + typography','Business card + letterhead design','Social media profile templates','Brand guidelines document','All source files (AI, PSD, PNG, SVG)'],
false, 'one_time', 14),

('Full Growth Bundle', 'Our flagship package — social media + website + AI automations + ads, all unified.', 125000, 'INR', 'social_media',
ARRAY['Everything in Social Media Growth','Custom website (8 pages)','AI chatbot + lead automation','Meta & Google Ads management','Monthly brand photography','Dedicated account manager','Weekly strategy calls','12-month roadmap'],
true, 'monthly', 45)

ON CONFLICT DO NOTHING;

-- ── 6. VERIFY ─────────────────────────────────────────────
SELECT 'Blog posts: ' || COUNT(*) FROM public.blog_posts WHERE status = 'published'
UNION ALL
SELECT 'Service packages: ' || COUNT(*) FROM public.service_packages WHERE is_active = TRUE
UNION ALL
SELECT 'user_activities RLS: OK' WHERE EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_activities' AND policyname = 'allow_anon_insert_activities'
);
