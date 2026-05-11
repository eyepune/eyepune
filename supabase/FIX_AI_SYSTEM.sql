-- ============================================================
-- AI & LEAD CAPTURE SYSTEM REPAIR
-- Resolves schema mismatches and RLS policy restrictions
-- ============================================================

-- 1. FIX AI_ASSESSMENTS TABLE
-- Add missing columns expected by AI_Assessment.jsx
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS revenue_range TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS lead_generation_method TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS sales_process TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS marketing_channels TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS online_presence TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS crm_usage TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS biggest_challenge TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS growth_goals TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS ai_report TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;

-- Rename legacy columns if they exist and are empty to avoid confusion
-- (Optional, based on schema analysis)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_assessments' AND column_name='industry') THEN
    UPDATE ai_assessments SET business_type = industry WHERE business_type IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_assessments' AND column_name='current_challenges') THEN
    UPDATE ai_assessments SET biggest_challenge = current_challenges WHERE biggest_challenge IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_assessments' AND column_name='goals') THEN
    UPDATE ai_assessments SET growth_goals = goals WHERE growth_goals IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_assessments' AND column_name='report_data') THEN
    ALTER TABLE ai_assessments RENAME COLUMN report_data TO ai_report;
  END IF;
END $$;

-- 2. FIX LEADS TABLE
-- Add missing columns for consistent data flow
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_interest TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message TEXT;

-- 3. FIX RLS POLICIES
-- Drop restrictive policies
DROP POLICY IF EXISTS "Clients can create inquiries" ON inquiries;
DROP POLICY IF EXISTS "Clients can create bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can create assessments" ON ai_assessments;
DROP POLICY IF EXISTS "Public Insert Inquiries" ON inquiries;
DROP POLICY IF EXISTS "Public Insert Bookings" ON bookings;
DROP POLICY IF EXISTS "Public Insert Assessments" ON ai_assessments;

-- Create inclusive policies for lead capture (allows anonymous users)
CREATE POLICY "Public Insert Inquiries" ON inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Insert Bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Insert Assessments" ON ai_assessments FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Ensure public can also read their own newly created records if needed (optional but helpful for some flows)
-- For now, keep it to INSERT only for security.

-- 4. PERMISSIONS
GRANT ALL ON inquiries TO anon, authenticated, service_role;
GRANT ALL ON bookings TO anon, authenticated, service_role;
GRANT ALL ON ai_assessments TO anon, authenticated, service_role;
GRANT ALL ON leads TO anon, authenticated, service_role;

-- 5. REPAIR ADMIN PERMISSIONS (ensure admin can see everything)
DROP POLICY IF EXISTS "Admin All Access" ON ai_assessments;
CREATE POLICY "Admin All Access" ON ai_assessments FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role' = 'admin') OR 
    (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
);
