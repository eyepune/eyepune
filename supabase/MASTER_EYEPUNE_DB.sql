-- ============================================================
-- 🚀 EYE PUNE — MASTER DATABASE SYNCHRONIZATION (2024)
-- Purpose: Complete infrastructure setup for CRM, Marketing, CMS, and Operations.
-- Instructions: Copy and run this entire script in the Supabase SQL Editor.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE IDENTITY & AUTH SYNC
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client', 'team')),
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Trigger for auth sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. CRM & LEAD CAPTURE
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost')),
  source TEXT DEFAULT 'website',
  score INTEGER DEFAULT 0,
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_interest TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  service_type TEXT,
  booking_date DATE,
  booking_time TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT,
  email TEXT NOT NULL,
  business_name TEXT,
  business_type TEXT,
  score INTEGER,
  ai_report TEXT,
  converted_to_lead BOOLEAN DEFAULT FALSE,
  lead_id UUID REFERENCES public.leads(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MARKETING & AUTOMATION
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'marketing',
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for legacy body column
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='email_templates' AND column_name='body') THEN
    UPDATE public.email_templates SET content = body WHERE content IS NULL;
    ALTER TABLE public.email_templates DROP COLUMN IF EXISTS body;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  trigger_type TEXT,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT TRUE,
  steps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  subject TEXT,
  content TEXT,
  target_audience TEXT DEFAULT 'all',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'sent')),
  metrics JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTENT & CMS
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views_count INTEGER DEFAULT 0,
  published_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_title TEXT,
  customer_company TEXT,
  customer_image TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.client_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. OPERATIONS & DOCUMENTS
CREATE TABLE IF NOT EXISTS public.client_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  status TEXT DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'in_progress', 'review', 'completed', 'on_hold')),
  budget DECIMAL(12,2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  start_date DATE,
  expected_completion_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.client_projects(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  contract_number TEXT,
  contract_type TEXT,
  contract_value DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  signature_data JSONB,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  proposal_number TEXT,
  pricing JSONB,
  status TEXT DEFAULT 'draft',
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employee_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  agreement_number TEXT,
  position TEXT,
  salary DECIMAL(12,2),
  agreement_type TEXT,
  start_date DATE,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offer_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  offer_number TEXT,
  position TEXT,
  salary DECIMAL(12,2),
  start_date DATE,
  offer_expiry_date DATE,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SECURITY POLICIES (RLS)
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Dynamic Cleanup of existing policies to avoid duplicates
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
  END LOOP;
END $$;

-- ADMIN: Master Policy (Admin can do everything)
CREATE POLICY "Admin All Access" ON public.users FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.leads FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.inquiries FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.bookings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.ai_assessments FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.email_templates FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.email_sequences FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.campaigns FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.blog_posts FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.blog_comments FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.testimonials FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.client_logos FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.client_projects FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.contracts FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.proposals FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.invoices FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.employee_agreements FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.offer_letters FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Access" ON public.system_settings FOR ALL USING (public.is_admin());

-- PUBLIC: Lead Capture (Insert only)
CREATE POLICY "Public Insert Inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Assessments" ON public.ai_assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Leads" ON public.leads FOR INSERT WITH CHECK (true);

-- PUBLIC: Read Access (Website visitors)
CREATE POLICY "Public Read Blog" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (status = 'approved');
CREATE POLICY "Public Read Logos" ON public.client_logos FOR SELECT USING (is_active = TRUE);

-- USER: Self-service
CREATE POLICY "User Read Self" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User Update Self" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 9. ANALYTICS HELPER FUNCTIONS (RPC)
-- These can be called via supabase.rpc('get_sales_metrics')
CREATE OR REPLACE FUNCTION public.get_sales_metrics()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalLeads', (SELECT COUNT(*) FROM leads),
    'newLeads', (SELECT COUNT(*) FROM leads WHERE status = 'new'),
    'wonLeads', (SELECT COUNT(*) FROM leads WHERE status = 'won'),
    'conversionRate', CASE WHEN (SELECT COUNT(*) FROM leads) > 0 
                      THEN ROUND(((SELECT COUNT(*) FROM leads WHERE status = 'won')::DECIMAL / (SELECT COUNT(*) FROM leads)) * 100, 2)
                      ELSE 0 END,
    'totalInquiries', (SELECT COUNT(*) FROM inquiries),
    'totalAssessments', (SELECT COUNT(*) FROM ai_assessments),
    'totalBookings', (SELECT COUNT(*) FROM bookings)
  ) INTO result;
  RETURN result;
END;
$$;

-- 10. PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated;
GRANT INSERT ON inquiries, bookings, ai_assessments, leads TO anon;
GRANT SELECT ON blog_posts, testimonials, client_logos TO anon;
GRANT EXECUTE ON FUNCTION get_sales_metrics() TO authenticated;

-- ============================================================
-- FINISHED! Please run the PROMOTE_FIRST_ADMIN tool if needed.
-- ============================================================
