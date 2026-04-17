-- ============================================================
-- FIX DATABASE SCHEMA DISCREPANCIES
-- Matches database columns with component expectations (full_name, service_interest, etc.)
-- ============================================================

-- 1. Update inquiries table
-- Components expect 'full_name' instead of 'name' and 'service_interest' instead of 'service'
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS service_interest TEXT;

-- Migration: Copy data if columns were already partially populated
UPDATE inquiries SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;
UPDATE inquiries SET service_interest = service WHERE service_interest IS NULL AND service IS NOT NULL;

-- 2. Update ai_assessments table
-- Components expect 'full_name', 'email', 'business_name'
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Migration
UPDATE ai_assessments SET full_name = lead_name WHERE full_name IS NULL AND lead_name IS NOT NULL;
UPDATE ai_assessments SET email = lead_email WHERE email IS NULL AND lead_email IS NOT NULL;
UPDATE ai_assessments SET business_name = company_name WHERE business_name IS NULL AND company_name IS NOT NULL;

-- 3. Ensure 'leads' table has consistent naming
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_interest TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message TEXT;

-- 4. Re-grant permissions (just in case)
GRANT ALL ON inquiries TO postgres, anon, authenticated, service_role;
GRANT ALL ON ai_assessments TO postgres, anon, authenticated, service_role;
GRANT ALL ON leads TO postgres, anon, authenticated, service_role;
