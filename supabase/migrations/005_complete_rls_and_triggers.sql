-- ============================================================
-- EyE PunE — Complete RLS Policies, Auth Trigger & Storage
-- Migration: 005_complete_rls_and_triggers.sql
--
-- 1. Auto-create a `users` row when someone signs up via Supabase Auth
-- 2. Add missing admin full-access RLS policies for ALL tables
-- 3. Add missing client access policies
-- 4. Add public INSERT policies for lead-gen forms
-- 5. Create the general-purpose `uploads` storage bucket
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- 1. AUTO-CREATE USER ROW ON AUTH SIGN-UP
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'client',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ════════════════════════════════════════════════════════════
-- 2. ADMIN FULL-ACCESS POLICIES (missing from earlier migrations)
-- ════════════════════════════════════════════════════════════

-- Helper: reusable admin check expression
-- EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')

-- user_profiles
DROP POLICY IF EXISTS "Admin full access user_profiles" ON user_profiles;
CREATE POLICY "Admin full access user_profiles" ON user_profiles
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- user_activities
DROP POLICY IF EXISTS "Admin full access user_activities" ON user_activities;
CREATE POLICY "Admin full access user_activities" ON user_activities
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- activities
DROP POLICY IF EXISTS "Admin full access activities" ON activities;
CREATE POLICY "Admin full access activities" ON activities
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- client_milestones
DROP POLICY IF EXISTS "Admin full access client_milestones" ON client_milestones;
CREATE POLICY "Admin full access client_milestones" ON client_milestones
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- client_files
DROP POLICY IF EXISTS "Admin full access client_files" ON client_files;
CREATE POLICY "Admin full access client_files" ON client_files
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- onboarding_tasks
DROP POLICY IF EXISTS "Admin full access onboarding_tasks" ON onboarding_tasks;
CREATE POLICY "Admin full access onboarding_tasks" ON onboarding_tasks
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- onboarding_progress
DROP POLICY IF EXISTS "Admin full access onboarding_progress" ON onboarding_progress;
CREATE POLICY "Admin full access onboarding_progress" ON onboarding_progress
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- project_tasks
DROP POLICY IF EXISTS "Admin full access project_tasks" ON project_tasks;
CREATE POLICY "Admin full access project_tasks" ON project_tasks
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- time_logs
DROP POLICY IF EXISTS "Admin full access time_logs" ON time_logs;
CREATE POLICY "Admin full access time_logs" ON time_logs
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- deliverable_approvals
DROP POLICY IF EXISTS "Admin full access deliverable_approvals" ON deliverable_approvals;
CREATE POLICY "Admin full access deliverable_approvals" ON deliverable_approvals
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- client_feedback
DROP POLICY IF EXISTS "Admin full access client_feedback" ON client_feedback;
CREATE POLICY "Admin full access client_feedback" ON client_feedback
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- dashboard_preferences
DROP POLICY IF EXISTS "Admin full access dashboard_preferences" ON dashboard_preferences;
CREATE POLICY "Admin full access dashboard_preferences" ON dashboard_preferences
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- client_notifications
DROP POLICY IF EXISTS "Admin full access client_notifications" ON client_notifications;
CREATE POLICY "Admin full access client_notifications" ON client_notifications
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- client_messages
DROP POLICY IF EXISTS "Admin full access client_messages" ON client_messages;
CREATE POLICY "Admin full access client_messages" ON client_messages
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- client_report_subscriptions
DROP POLICY IF EXISTS "Admin full access client_report_subscriptions" ON client_report_subscriptions;
CREATE POLICY "Admin full access client_report_subscriptions" ON client_report_subscriptions
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- blog_comments
DROP POLICY IF EXISTS "Admin full access blog_comments" ON blog_comments;
CREATE POLICY "Admin full access blog_comments" ON blog_comments
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- testimonials
DROP POLICY IF EXISTS "Admin full access testimonials" ON testimonials;
CREATE POLICY "Admin full access testimonials" ON testimonials
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- service_packages
DROP POLICY IF EXISTS "Admin full access service_packages" ON service_packages;
CREATE POLICY "Admin full access service_packages" ON service_packages
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- service_addons
DROP POLICY IF EXISTS "Admin full access service_addons" ON service_addons;
CREATE POLICY "Admin full access service_addons" ON service_addons
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- pricing_plans
DROP POLICY IF EXISTS "Admin full access pricing_plans" ON pricing_plans;
CREATE POLICY "Admin full access pricing_plans" ON pricing_plans
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- employee_agreements
DROP POLICY IF EXISTS "Admin full access employee_agreements" ON employee_agreements;
CREATE POLICY "Admin full access employee_agreements" ON employee_agreements
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- offer_letters
DROP POLICY IF EXISTS "Admin full access offer_letters" ON offer_letters;
CREATE POLICY "Admin full access offer_letters" ON offer_letters
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- document_templates
DROP POLICY IF EXISTS "Admin full access document_templates" ON document_templates;
CREATE POLICY "Admin full access document_templates" ON document_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- project_templates
DROP POLICY IF EXISTS "Admin full access project_templates" ON project_templates;
CREATE POLICY "Admin full access project_templates" ON project_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- crm_sync_configs
DROP POLICY IF EXISTS "Admin full access crm_sync_configs" ON crm_sync_configs;
CREATE POLICY "Admin full access crm_sync_configs" ON crm_sync_configs
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- email_templates
DROP POLICY IF EXISTS "Admin full access email_templates" ON email_templates;
CREATE POLICY "Admin full access email_templates" ON email_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- email_sequences
DROP POLICY IF EXISTS "Admin full access email_sequences" ON email_sequences;
CREATE POLICY "Admin full access email_sequences" ON email_sequences
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- email_analytics
DROP POLICY IF EXISTS "Admin full access email_analytics" ON email_analytics;
CREATE POLICY "Admin full access email_analytics" ON email_analytics
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- shared_documents
DROP POLICY IF EXISTS "Admin full access shared_documents" ON shared_documents;
CREATE POLICY "Admin full access shared_documents" ON shared_documents
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- task_comments
DROP POLICY IF EXISTS "Admin full access task_comments" ON task_comments;
CREATE POLICY "Admin full access task_comments" ON task_comments
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- resource_allocations
DROP POLICY IF EXISTS "Admin full access resource_allocations" ON resource_allocations;
CREATE POLICY "Admin full access resource_allocations" ON resource_allocations
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ════════════════════════════════════════════════════════════
-- 3. CLIENT ACCESS POLICIES
-- ════════════════════════════════════════════════════════════

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Clients can read own milestones (via project)
DROP POLICY IF EXISTS "Clients read own milestones" ON client_milestones;
CREATE POLICY "Clients read own milestones" ON client_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = client_milestones.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can read own files
DROP POLICY IF EXISTS "Clients read own files" ON client_files;
CREATE POLICY "Clients read own files" ON client_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = client_files.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can read own onboarding tasks
DROP POLICY IF EXISTS "Clients read own onboarding_tasks" ON onboarding_tasks;
CREATE POLICY "Clients read own onboarding_tasks" ON onboarding_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = onboarding_tasks.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can update own onboarding tasks (mark complete)
DROP POLICY IF EXISTS "Clients update own onboarding_tasks" ON onboarding_tasks;
CREATE POLICY "Clients update own onboarding_tasks" ON onboarding_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = onboarding_tasks.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
  );

-- Clients can read own project tasks
DROP POLICY IF EXISTS "Clients read own project_tasks" ON project_tasks;
CREATE POLICY "Clients read own project_tasks" ON project_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = project_tasks.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can read own deliverable approvals
DROP POLICY IF EXISTS "Clients read own deliverable_approvals" ON deliverable_approvals;
CREATE POLICY "Clients read own deliverable_approvals" ON deliverable_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = deliverable_approvals.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can update deliverable approvals (approve/request revision)
DROP POLICY IF EXISTS "Clients update own deliverable_approvals" ON deliverable_approvals;
CREATE POLICY "Clients update own deliverable_approvals" ON deliverable_approvals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = deliverable_approvals.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
  );

-- Clients can manage own feedback
DROP POLICY IF EXISTS "Clients manage own feedback" ON client_feedback;
CREATE POLICY "Clients manage own feedback" ON client_feedback
  FOR ALL USING (
    created_by = auth.jwt() ->> 'email'
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can manage own dashboard preferences
DROP POLICY IF EXISTS "Clients manage own dashboard_preferences" ON dashboard_preferences;
CREATE POLICY "Clients manage own dashboard_preferences" ON dashboard_preferences
  FOR ALL USING (
    user_email = auth.jwt() ->> 'email'
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can read own notifications
DROP POLICY IF EXISTS "Clients manage own notifications" ON client_notifications;
CREATE POLICY "Clients manage own notifications" ON client_notifications
  FOR ALL USING (
    user_email = auth.jwt() ->> 'email'
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can manage own messages
DROP POLICY IF EXISTS "Clients manage own messages" ON client_messages;
CREATE POLICY "Clients manage own messages" ON client_messages
  FOR ALL USING (
    sender_email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = client_messages.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can manage own report subscriptions
DROP POLICY IF EXISTS "Clients manage own report_subscriptions" ON client_report_subscriptions;
CREATE POLICY "Clients manage own report_subscriptions" ON client_report_subscriptions
  FOR ALL USING (
    client_email = auth.jwt() ->> 'email'
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can manage own onboarding progress
DROP POLICY IF EXISTS "Clients manage own onboarding_progress" ON onboarding_progress;
CREATE POLICY "Clients manage own onboarding_progress" ON onboarding_progress
  FOR ALL USING (
    user_email = auth.jwt() ->> 'email'
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can manage own user profiles
DROP POLICY IF EXISTS "Clients manage own user_profiles" ON user_profiles;
CREATE POLICY "Clients manage own user_profiles" ON user_profiles
  FOR ALL USING (
    user_email = auth.jwt() ->> 'email'
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can create user activities
DROP POLICY IF EXISTS "Authenticated users create activities" ON user_activities;
CREATE POLICY "Authenticated users create activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Clients can read own time logs
DROP POLICY IF EXISTS "Clients read own time_logs" ON time_logs;
CREATE POLICY "Clients read own time_logs" ON time_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = time_logs.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can read shared documents for their projects
DROP POLICY IF EXISTS "Clients read own shared_documents" ON shared_documents;
CREATE POLICY "Clients read own shared_documents" ON shared_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = shared_documents.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can read task comments for their projects
DROP POLICY IF EXISTS "Clients read own task_comments" ON task_comments;
CREATE POLICY "Clients read own task_comments" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = task_comments.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Clients can create task comments on their projects
DROP POLICY IF EXISTS "Clients create task_comments" ON task_comments;
CREATE POLICY "Clients create task_comments" ON task_comments
  FOR INSERT WITH CHECK (
    author_email = auth.jwt() ->> 'email'
    AND EXISTS (
      SELECT 1 FROM client_projects
      WHERE client_projects.id = task_comments.project_id
        AND client_projects.client_email = auth.jwt() ->> 'email'
    )
  );

-- ════════════════════════════════════════════════════════════
-- 4. PUBLIC INSERT POLICIES FOR LEAD-GEN FORMS
-- ════════════════════════════════════════════════════════════

-- Allow anonymous visitors to submit inquiries (contact form)
DROP POLICY IF EXISTS "Public can create inquiries" ON inquiries;
CREATE POLICY "Public can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Allow anonymous visitors to create bookings
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Allow anonymous visitors to create activities (tied to leads)
DROP POLICY IF EXISTS "Public can create activities" ON activities;
CREATE POLICY "Public can create activities" ON activities
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to submit testimonials
DROP POLICY IF EXISTS "Authenticated users create testimonials" ON testimonials;
CREATE POLICY "Authenticated users create testimonials" ON testimonials
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to create blog comments
DROP POLICY IF EXISTS "Public can create blog_comments" ON blog_comments;
CREATE POLICY "Public can create blog_comments" ON blog_comments
  FOR INSERT WITH CHECK (true);

-- Allow public to read approved blog comments
DROP POLICY IF EXISTS "Public read approved blog_comments" ON blog_comments;
CREATE POLICY "Public read approved blog_comments" ON blog_comments
  FOR SELECT USING (status = 'approved');

-- Allow authenticated users to create payments
DROP POLICY IF EXISTS "Authenticated users create payments" ON payments;
CREATE POLICY "Authenticated users create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Clients can read own payments
DROP POLICY IF EXISTS "Clients read own payments" ON payments;
CREATE POLICY "Clients read own payments" ON payments
  FOR SELECT USING (
    customer_email = auth.jwt() ->> 'email'
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ════════════════════════════════════════════════════════════
-- 5. GENERAL-PURPOSE UPLOADS STORAGE BUCKET
-- ════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  10485760,  -- 10MB
  ARRAY[
    'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Public can view uploaded files
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
CREATE POLICY "Public read uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Authenticated users can upload files
DROP POLICY IF EXISTS "Authenticated upload files" ON storage.objects;
CREATE POLICY "Authenticated upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads'
    AND auth.uid() IS NOT NULL
  );

-- Users can delete their own uploads (admin can delete any)
DROP POLICY IF EXISTS "Users delete own uploads" ON storage.objects;
CREATE POLICY "Users delete own uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );
