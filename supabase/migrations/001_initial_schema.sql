-- ============================================================
-- EyE PunE — Supabase Database Schema
-- Migration: 001_initial_schema.sql
-- 
-- This creates all tables needed to replace the Base44 entities.
-- Table names follow snake_case convention.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client', 'team')),
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── USER PROFILES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_number TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── USER ACTIVITIES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  page_name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── LEADS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost')),
  assigned_to TEXT,
  score INTEGER DEFAULT 0,
  tags TEXT[],
  notes TEXT,
  billing_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_pincode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INQUIRIES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI ASSESSMENTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_name TEXT,
  lead_email TEXT NOT NULL,
  company_name TEXT,
  industry TEXT,
  business_stage TEXT,
  team_size TEXT,
  current_challenges TEXT,
  goals TEXT,
  budget_range TEXT,
  timeline TEXT,
  ai_report TEXT,
  score INTEGER,
  converted_to_lead BOOLEAN DEFAULT FALSE,
  lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOOKINGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service TEXT,
  date TEXT,
  time TEXT,
  duration TEXT DEFAULT '30 min',
  type TEXT DEFAULT 'consultation',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACTIVITIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  type TEXT NOT NULL,
  description TEXT,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENT PROJECTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  services TEXT[],
  progress INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENT MILESTONES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENT FILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ONBOARDING TASKS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  assignee TEXT,
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ONBOARDING PROGRESS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  project_id UUID REFERENCES client_projects(id),
  current_step INTEGER DEFAULT 0,
  completed_steps INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 5,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROJECT TASKS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee TEXT,
  due_date DATE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TIME LOGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id),
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  description TEXT,
  billable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DELIVERABLE APPROVALS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS deliverable_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision_requested', 'rejected')),
  client_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ── CLIENT FEEDBACK ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  category TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'addressed', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DASHBOARD PREFERENCES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  enabled_widgets TEXT[] DEFAULT ARRAY['progress', 'milestones', 'activity', 'deadlines', 'budget'],
  layout JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENT NOTIFICATIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENT MESSAGES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENT REPORT SUBSCRIPTIONS ─────────────────────────────
CREATE TABLE IF NOT EXISTS client_report_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  include_financial BOOLEAN DEFAULT TRUE,
  include_tasks BOOLEAN DEFAULT TRUE,
  include_milestones BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOG POSTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  author_name TEXT,
  author_email TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views_count INTEGER DEFAULT 0,
  published_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLOG COMMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CMS PAGES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TESTIMONIALS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_title TEXT,
  customer_company TEXT,
  customer_image TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT FALSE,
  service TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENT LOGOS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SERVICE PACKAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  services TEXT[],
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SERVICE ADDONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRICING PLANS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT DEFAULT 'monthly',
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CAMPAIGNS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  description TEXT,
  plan_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTRACTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  scope_of_work TEXT,
  deliverables TEXT,
  terms TEXT,
  value DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'cancelled')),
  signed_date TIMESTAMPTZ,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROPOSALS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  pricing_items JSONB DEFAULT '[]',
  total_value DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  valid_until DATE,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INVOICES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── EMPLOYEE AGREEMENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  job_title TEXT,
  department TEXT,
  start_date DATE,
  salary DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired')),
  signed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── OFFER LETTERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offer_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  job_title TEXT,
  department TEXT,
  start_date DATE,
  salary DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired')),
  signed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DOCUMENT TEMPLATES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  content TEXT,
  variables TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROJECT TEMPLATES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  services TEXT[],
  default_milestones JSONB DEFAULT '[]',
  default_tasks JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CRM SYNC CONFIGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_sync_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  crm_type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── EMAIL TEMPLATES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  variables TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── EMAIL SEQUENCES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  steps JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  trigger_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── EMAIL ANALYTICS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES email_templates(id),
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced')),
  sent_date TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- ── SHARED DOCUMENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shared_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by TEXT NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TASK COMMENTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID,
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES task_comments(id),
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RESOURCE ALLOCATIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT,
  hours_per_week DECIMAL(5,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_report_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;

-- ── Public read policies (for public-facing content) ────────
CREATE POLICY "Public read blog posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read pricing plans" ON pricing_plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read client logos" ON client_logos FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read CMS pages" ON cms_pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public read service addons" ON service_addons FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read service packages" ON service_packages FOR SELECT USING (is_active = TRUE);

-- ── Authenticated user policies ─────────────────────────────
CREATE POLICY "Authenticated users can read own profile" ON users FOR SELECT USING (auth.uid()::text = id::text OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ── Admin full access policies ──────────────────────────────
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access inquiries" ON inquiries FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access projects" ON client_projects FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access campaigns" ON campaigns FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access blog" ON blog_posts FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access contracts" ON contracts FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access proposals" ON proposals FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access invoices" ON invoices FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access assessments" ON ai_assessments FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access payments" ON payments FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ── Client access policies ──────────────────────────────────
CREATE POLICY "Clients can create inquiries" ON inquiries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Clients can create assessments" ON ai_assessments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Clients can read own projects" ON client_projects FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can read own proposals" ON proposals FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can read own invoices" ON invoices FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Clients can read own contracts" ON contracts FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ── Realtime subscriptions ──────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE client_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE client_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE shared_documents;

-- ============================================================
-- INDEXES ─────────────────────────────────────────────────────
-- ============================================================

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_projects_client_email ON client_projects(client_email);
CREATE INDEX idx_projects_status ON client_projects(status);
CREATE INDEX idx_milestones_project_id ON client_milestones(project_id);
CREATE INDEX idx_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_tasks_status ON project_tasks(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_invoices_client_email ON invoices(client_email);
CREATE INDEX idx_proposals_client_email ON proposals(client_email);
CREATE INDEX idx_contracts_client_email ON contracts(client_email);
CREATE INDEX idx_payments_customer_email ON payments(customer_email);
CREATE INDEX idx_notifications_user_email ON client_notifications(user_email);
CREATE INDEX idx_messages_project_id ON client_messages(project_id);
