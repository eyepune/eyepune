-- ============================================================
-- FIX EMAIL AUTOMATION SYSTEM
-- Corrects schema discrepancies and adds missing RLS policies
-- ============================================================

-- 1. Fix email_templates table
-- Rename 'body' to 'content' to match the application code
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='email_templates' AND column_name='body') THEN
    ALTER TABLE email_templates RENAME COLUMN body TO content;
  END IF;
END $$;

-- 2. Fix email_sequences table
-- Add 'template_id' and 'status' (if missing/different)
ALTER TABLE email_sequences ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES email_templates(id);
ALTER TABLE email_sequences ADD COLUMN IF NOT EXISTS trigger_type TEXT;

-- 3. Add RLS Policies for Email System
-- Allow admins full access
DROP POLICY IF EXISTS "Admin full access email_templates" ON email_templates;
CREATE POLICY "Admin full access email_templates" ON email_templates FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access email_sequences" ON email_sequences;
CREATE POLICY "Admin full access email_sequences" ON email_sequences FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access email_analytics" ON email_analytics;
CREATE POLICY "Admin full access email_analytics" ON email_analytics FOR ALL USING (public.is_admin());

-- Allow public read of templates (for automation triggers that might run in different contexts)
-- Or better, allow service_role / authenticated
DROP POLICY IF EXISTS "Authenticated read email_templates" ON email_templates;
CREATE POLICY "Authenticated read email_templates" ON email_templates FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Grant Permissions
GRANT ALL ON email_templates TO postgres, service_role, authenticated;
GRANT ALL ON email_sequences TO postgres, service_role, authenticated;
GRANT ALL ON email_analytics TO postgres, service_role, authenticated;
