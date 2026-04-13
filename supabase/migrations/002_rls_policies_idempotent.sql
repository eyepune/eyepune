-- ============================================================
-- EyE PunE — Idempotent RLS Policies & Indexes
-- Run this AFTER 001_initial_schema.sql (tables already created)
-- This version is safe to re-run multiple times
-- ============================================================

-- ── Enable RLS on all tables (safe to re-run) ─────────────────
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

-- ── Public read policies (drop first, then create) ──────────
DROP POLICY IF EXISTS "Public read blog posts" ON blog_posts;
CREATE POLICY "Public read blog posts" ON blog_posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public read testimonials" ON testimonials;
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Public read pricing plans" ON pricing_plans;
CREATE POLICY "Public read pricing plans" ON pricing_plans FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public read client logos" ON client_logos;
CREATE POLICY "Public read client logos" ON client_logos FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public read CMS pages" ON cms_pages;
CREATE POLICY "Public read CMS pages" ON cms_pages FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public read service addons" ON service_addons;
CREATE POLICY "Public read service addons" ON service_addons FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public read service packages" ON service_packages;
CREATE POLICY "Public read service packages" ON service_packages FOR SELECT USING (is_active = TRUE);

-- ── Authenticated user policies ─────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can read own profile" ON users;
CREATE POLICY "Authenticated users can read own profile" ON users FOR SELECT USING (auth.uid()::text = id::text OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ── Admin full access policies ──────────────────────────────
DROP POLICY IF EXISTS "Admin full access leads" ON leads;
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access inquiries" ON inquiries;
CREATE POLICY "Admin full access inquiries" ON inquiries FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access bookings" ON bookings;
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access projects" ON client_projects;
CREATE POLICY "Admin full access projects" ON client_projects FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access campaigns" ON campaigns;
CREATE POLICY "Admin full access campaigns" ON campaigns FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access blog" ON blog_posts;
CREATE POLICY "Admin full access blog" ON blog_posts FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access contracts" ON contracts;
CREATE POLICY "Admin full access contracts" ON contracts FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access proposals" ON proposals;
CREATE POLICY "Admin full access proposals" ON proposals FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access invoices" ON invoices;
CREATE POLICY "Admin full access invoices" ON invoices FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access assessments" ON ai_assessments;
CREATE POLICY "Admin full access assessments" ON ai_assessments FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin full access payments" ON payments;
CREATE POLICY "Admin full access payments" ON payments FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ── Client access policies ──────────────────────────────────
DROP POLICY IF EXISTS "Clients can create inquiries" ON inquiries;
CREATE POLICY "Clients can create inquiries" ON inquiries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Clients can create bookings" ON bookings;
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Clients can create assessments" ON ai_assessments;
CREATE POLICY "Clients can create assessments" ON ai_assessments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Clients can read own projects" ON client_projects;
CREATE POLICY "Clients can read own projects" ON client_projects FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Clients can read own proposals" ON proposals;
CREATE POLICY "Clients can read own proposals" ON proposals FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Clients can read own invoices" ON invoices;
CREATE POLICY "Clients can read own invoices" ON invoices FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Clients can read own contracts" ON contracts;
CREATE POLICY "Clients can read own contracts" ON contracts FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ── Public INSERT policies for lead generation ──────────────────
DROP POLICY IF EXISTS "Public can create assessments" ON ai_assessments;
CREATE POLICY "Public can create assessments" ON ai_assessments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can create leads" ON leads;
CREATE POLICY "Public can create leads" ON leads FOR INSERT WITH CHECK (true);

-- ── Realtime subscriptions ──────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE client_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE client_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE shared_documents;

-- ── Indexes (safe to re-run — CREATE INDEX IF NOT EXISTS) ───
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON client_projects(client_email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON client_projects(status);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON client_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_invoices_client_email ON invoices(client_email);
CREATE INDEX IF NOT EXISTS idx_proposals_client_email ON proposals(client_email);
CREATE INDEX IF NOT EXISTS idx_contracts_client_email ON contracts(client_email);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON client_notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON client_messages(project_id);
