-- ============================================================
-- 🚀 EYE PUNE — SERVICES & PRICING SEED (FIXED UUIDs)
-- ============================================================

-- 1. CLEANUP
DELETE FROM public.pricing_plans;

-- 2. SOCIAL MEDIA MANAGEMENT
INSERT INTO public.pricing_plans (id, name, description, price, billing_cycle, features, is_active, is_popular)
VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Social Media Starter', 'Perfect for small businesses building a strong and consistent digital presence. Best for Startups & Local Brands.', 30000, 'monthly', 
 ARRAY['Management of 2 platforms (IG, FB)', '6 Static Posts + 4 Carousels + 2 Reels', 'Monthly Content Calendar Planning', 'Professional Graphic Design', 'Caption Writing & Hashtag Optimization', 'Basic Community Engagement', 'Monthly Performance Analytics Report'], true, false),
('550e8400-e29b-41d4-a716-446655440002', 'Social Media Growth', 'Performance-focused content system designed to scale reach and conversions. Best for Scaling Brands & B2B.', 60000, 'monthly', 
 ARRAY['Management of 3 platforms (IG, FB, LI)', '6 Static Posts + 6 Carousels + 6 Reels', 'Advanced Monthly Content Calendar', 'Active Community Management', 'Competitor & Industry Analysis', 'Bi-weekly Performance Reports', 'Growth Strategy Recommendations'], true, true),
('550e8400-e29b-41d4-a716-446655440003', 'Social Media Authority', 'Elite full-service content and authority-building system. Best for Premium Brands & High-Growth Founders.', 95000, 'monthly', 
 ARRAY['Management of any 4 Platforms', '8 Static Posts + 8 Carousels + 8 Reels', 'Advanced Content Funnel Strategy', 'Founder Personal Branding Strategy', 'PR & Influencer Coordination', 'Full Community Management', 'Weekly Deep-Dive Analytics & Strategy Calls'], true, false);

-- 3. PAID ADVERTISING
INSERT INTO public.pricing_plans (id, name, description, price, billing_cycle, features, is_active, is_popular)
VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Meta Ads Management', 'Targeted campaigns on Instagram and Facebook.', 45000, 'monthly', 
 ARRAY['Ad Creative Design', 'Advanced Audience Targeting', 'A/B Testing', 'Conversion Tracking Setup', 'Lead Quality Monitoring'], true, false),
('550e8400-e29b-41d4-a716-446655440005', 'Google Ads Management', 'Search and Display ads for high-intent leads.', 45000, 'monthly', 
 ARRAY['Keyword Research', 'Search & Display Campaigns', 'Negative Keyword Management', 'Landing Page Optimization Advice', 'Monthly Performance Audit'], true, false);

-- 4. WEBSITE DEVELOPMENT
INSERT INTO public.pricing_plans (id, name, description, price, billing_cycle, features, is_active, is_popular)
VALUES
('550e8400-e29b-41d4-a716-446655440006', 'Starter Website', 'Clean, modern 5-page business website.', 25000, 'one_time', 
 ARRAY['Next.js + Tailwind CSS', 'Fully Responsive', 'Basic SEO Setup', 'Contact Form Integration', '1 Month Support'], true, false),
('550e8400-e29b-41d4-a716-446655440007', 'Business Website', 'High-performance conversion-optimized site.', 65000, 'one_time', 
 ARRAY['Up to 15 Pages', 'Custom UI/UX Design', 'Advanced Animations', 'Blog/CMS Integration', 'Enhanced SEO Architecture'], true, true),
('550e8400-e29b-41d4-a716-446655440008', 'Advanced Website', 'Complex sites with custom functionality.', 150000, 'one_time', 
 ARRAY['Unlimited Pages', 'E-commerce or Booking Engine', 'Custom API Integrations', 'High-End Cinematic Visuals', 'Speed Optimization Guarantee'], true, false);

-- 5. AI SOLUTIONS & AUTOMATION
INSERT INTO public.pricing_plans (id, name, description, price, billing_cycle, features, is_active, is_popular)
VALUES
('550e8400-e29b-41d4-a716-446655440009', 'AI Starter', 'Basic AI integration for your business.', 40000, 'one_time', 
 ARRAY['AI Chatbot for Website', 'Automated Lead Routing', 'Basic CRM Sync', 'Email Auto-responders'], true, false),
('550e8400-e29b-41d4-a716-446655440010', 'AI Business Automation', 'Transform your workflows with intelligent automation.', 120000, 'one_time', 
 ARRAY['Advanced Multi-agent Chatbots', 'Automated Content Engine', 'Sales Pipeline Automation', 'Zapier/Make Workflow Setup', 'Training for Team'], true, true),
('550e8400-e29b-41d4-a716-446655440011', 'AI Custom Systems', 'Enterprise-grade custom AI development.', 250000, 'one_time', 
 ARRAY['Custom LLM Training', 'Deep System Integrations', 'Automated Customer Support Center', 'Predictive Analytics Dashboard', '24/7 Priority Support'], true, false);

-- 6. BRANDING & CREATIVE
INSERT INTO public.pricing_plans (id, name, description, price, billing_cycle, features, is_active, is_popular)
VALUES
('550e8400-e29b-41d4-a716-446655440012', 'Brand Starter', 'Essential identity for new startups.', 35000, 'one_time', 
 ARRAY['Logo Design (3 Concepts)', 'Color Palette', 'Typography Guidelines', 'Social Media Kit'], true, false),
('550e8400-e29b-41d4-a716-446655440013', 'Brand Identity', 'Complete brand ecosystem and guidelines.', 85000, 'one_time', 
 ARRAY['Full Brand Strategy', 'Premium Logo Suite', 'Comprehensive Brand Book', 'Stationery Design', 'Marketing Collateral Templates'], true, true);

SELECT 'SUCCESS: Services and Pricing have been seeded with valid UUIDs!' as status;
