-- ============================================================
-- MASTER DATABASE SYNCHRONIZATION & REPAIR (EyE PunE)
-- Run this in your Supabase SQL Editor to ensure production stability.
-- This script merges all previous fixes and ensures schema parity.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LEADS TABLE (CRM CORE)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'new',
    score INTEGER DEFAULT 0,
    notes TEXT,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist in leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_interest TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message TEXT;

-- 3. AI_ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS ai_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email TEXT,
    business_name TEXT,
    score INTEGER,
    ai_report TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns used by AI_Assessment.jsx exist
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
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS converted_to_lead BOOLEAN DEFAULT FALSE;

-- Aliases to support legacy or alternative naming in JSX
-- (Supabase doesn't support column aliases in table structure, so we just ensure the ones used exist)
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS lead_name TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS lead_email TEXT;
ALTER TABLE ai_assessments ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    service_type TEXT,
    booking_date DATE,
    booking_time TEXT,
    duration TEXT DEFAULT '30 min',
    notes TEXT,
    status TEXT DEFAULT 'pending',
    meeting_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns used by Booking.jsx exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS name TEXT; -- support 'name' as alias for 'full_name'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS date TEXT; -- support 'date' as alias for 'booking_date'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time TEXT; -- support 'time' as alias for 'booking_time'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service TEXT; -- support 'service' as alias for 'service_type'

-- 5. INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    service_interest TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    source TEXT DEFAULT 'contact_form',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS name TEXT; -- support 'name' as alias

-- 6. SECURITY POLICIES (RLS)
-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Reset policies to avoid conflicts
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('leads', 'ai_assessments', 'bookings', 'inquiries')) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- PUBLIC INSERT POLICIES (Allows leads to be captured)
CREATE POLICY "Public Insert Leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Insert Assessments" ON ai_assessments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Insert Bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Insert Inquiries" ON inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ADMIN ALL ACCESS POLICIES
-- Uses both JWT role check and a lookup in the users table for robustness
CREATE POLICY "Admin All Access Leads" ON leads FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role' = 'admin') OR 
    (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Admin All Access Assessments" ON ai_assessments FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role' = 'admin') OR 
    (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Admin All Access Bookings" ON bookings FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role' = 'admin') OR 
    (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Admin All Access Inquiries" ON inquiries FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role' = 'admin') OR 
    (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
);

-- 7. PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON leads, ai_assessments, bookings, inquiries TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, anon;

-- 8. VIEW PERMISSIONS (Optional but helpful if using views)
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- 9. CLEANUP LEGACY DATA (Optional)
-- UPDATE ai_assessments SET full_name = lead_name WHERE full_name IS NULL AND lead_name IS NOT NULL;
-- UPDATE ai_assessments SET email = lead_email WHERE email IS NULL AND lead_email IS NOT NULL;
-- UPDATE ai_assessments SET business_name = company_name WHERE business_name IS NULL AND company_name IS NOT NULL;
