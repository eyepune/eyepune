-- ============================================================
-- FINAL DATABASE SYNCHRONIZATION SCRIPT (EyE PunE)
-- Run this in your Supabase SQL Editor to ensure production stability.
-- ============================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core Tables Structure & Column Alignment
-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'marketing',
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='email_templates' AND column_name='body') THEN
    ALTER TABLE email_templates RENAME COLUMN body TO content;
  END IF;
END $$;

-- Email Sequences/Automations
CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    steps JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads (CRM)
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

-- Inquiries (Public Form)
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    service_interest TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings (Calendar)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email TEXT,
    service_type TEXT,
    booking_date DATE,
    booking_time TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Assessments
CREATE TABLE IF NOT EXISTS ai_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email TEXT,
    business_name TEXT,
    score INTEGER,
    ai_report TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS SECURITY POLICIES
-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('email_templates', 'email_sequences', 'leads', 'inquiries', 'bookings', 'ai_assessments', 'system_settings')) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ADMIN ACCESS (Full control for all tables)
-- Assumes users table has 'role' column or we use metadata
CREATE POLICY "Admin All Access" ON email_templates FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin All Access" ON email_sequences FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin All Access" ON leads FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin All Access" ON inquiries FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin All Access" ON bookings FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin All Access" ON ai_assessments FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin All Access" ON system_settings FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- PUBLIC ACCESS (Insert only for lead capture)
CREATE POLICY "Public Insert Inquiries" ON inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Insert Bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Insert Assessments" ON ai_assessments FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON inquiries, bookings, ai_assessments TO anon;

-- 5. TRIGGER FOR LAST UPDATED (Optional but recommended)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
