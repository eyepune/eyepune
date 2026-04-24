-- ============================================================
-- MASTER EMAIL & AUTOMATION SYSTEM FIX
-- ============================================================

-- 1. Fix email_templates table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='email_templates' AND column_name='body') THEN
    ALTER TABLE email_templates RENAME COLUMN body TO content;
  END IF;
END $$;

ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'marketing';
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]';

-- 2. Fix email_sequences table
ALTER TABLE email_sequences ADD COLUMN IF NOT EXISTS trigger_type TEXT;
ALTER TABLE email_sequences ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE;
ALTER TABLE email_sequences ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE email_sequences ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE email_sequences DROP CONSTRAINT IF EXISTS email_sequences_name_key;
ALTER TABLE email_sequences ADD CONSTRAINT email_sequences_name_key UNIQUE (name);

-- 2.1 Fix email_templates table unique constraint
ALTER TABLE email_templates DROP CONSTRAINT IF EXISTS email_templates_name_key;
ALTER TABLE email_templates ADD CONSTRAINT email_templates_name_key UNIQUE (name);

-- 2.5 Fix campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0;
-- Add 'sent' to the status check constraint if necessary, but altering check constraints is tricky. We can drop and recreate it:
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'active', 'paused', 'completed', 'sent'));

-- 3. Ensure leads table has correct columns for automation
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- 4. Ensure inquiries table exists and is linked
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

-- 5. Ensure ai_assessments table exists
CREATE TABLE IF NOT EXISTS ai_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT,
  email TEXT,
  business_name TEXT,
  business_type TEXT,
  revenue_range TEXT,
  team_size TEXT,
  lead_generation_method TEXT,
  sales_process TEXT,
  marketing_channels JSONB,
  online_presence TEXT,
  crm_usage TEXT,
  biggest_challenge TEXT,
  growth_goals TEXT,
  score INTEGER,
  ai_report TEXT,
  converted_to_lead BOOLEAN DEFAULT false,
  lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. RLS Policies (Admin Only)
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing to avoid conflicts
DROP POLICY IF EXISTS "Admin full access on templates" ON email_templates;
DROP POLICY IF EXISTS "Admin full access on sequences" ON email_sequences;
DROP POLICY IF EXISTS "Admin full access on inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admin full access on assessments" ON ai_assessments;
DROP POLICY IF EXISTS "Public insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Public insert assessments" ON ai_assessments;

CREATE POLICY "Admin full access on templates" ON email_templates FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access on sequences" ON email_sequences FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access on inquiries" ON inquiries FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access on assessments" ON ai_assessments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Public insert for lead capture
CREATE POLICY "Public insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert assessments" ON ai_assessments FOR INSERT WITH CHECK (true);

-- 7. Grant Permissions
GRANT ALL ON email_templates TO postgres, service_role, authenticated;
GRANT ALL ON email_sequences TO postgres, service_role, authenticated;
GRANT ALL ON inquiries TO postgres, service_role, authenticated, anon;
GRANT ALL ON ai_assessments TO postgres, service_role, authenticated, anon;
