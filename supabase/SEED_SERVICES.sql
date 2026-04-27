-- ============================================================
-- 🚀 EYE PUNE — SERVICES & PRICING SEED (FIXED UUIDs)
-- ============================================================

-- 1. CLEANUP
DELETE FROM public.pricing_plans;

-- 2. SOCIAL MEDIA MANAGEMENT
INSERT INTO public.pricing_plans (id, name, description, price, billing_cycle, features, is_active, is_popular)
VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Social Media Starter', 'Perfect for small businesses starting their digital journey.', 30000, 'monthly', 
 ARRAY['3 Platforms (IG, FB, LI)', '12 High-Quality Posts/mo', 'Basic Engagement', 'Monthly Analytics Report'], true, false),
('550e8400-e29b-41d4-a716-446655440002', 'Social Media Growth', 'Aggressive growth strategy for scaling brands.', 55000, 'monthly', 
 ARRAY['4 Platforms', '20 Posts + 8 Reels/mo', 'Active Community Management', 'Competitor Analysis', 'Bi-weekly Reports'], true, true),
('550e8400-e29b-41d4-a716-446655440003', 'Social Media Authority', 'Full-service brand authority and thought leadership.', 95000, 'monthly', 
 ARRAY['All Major Platforms', 'Daily Content + Cinematic Reels', 'PR & Influencer Coordination', 'Personal Branding for Founders', 'Weekly Deep-dive Analytics'], true, false);

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
