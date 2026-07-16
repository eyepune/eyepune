-- ============================================================
-- FIX: Create missing activity_logs table
-- Run this in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/nseaimfpxbegiiiltztp/sql
-- ============================================================

-- Create the activity_logs table (used by all automations for logging)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,           -- e.g. 'linkedin_auto_post', 'reddit_sniper_draft', 'linkedin_auto_comment'
    details TEXT,                   -- Full log message or draft content
    status TEXT DEFAULT 'success',  -- 'success', 'warning', 'error', 'pending_review', 'pending_linkedin_approval', 'approved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for common query patterns
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON activity_logs(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Service role can manage activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Authenticated admins can update activity_logs" ON activity_logs;

-- Policy: Authenticated admin users can read all logs
CREATE POLICY "Admins can view all activity_logs" 
ON activity_logs FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy: Service role (used by cron jobs / server-side) can do everything
CREATE POLICY "Service role can manage activity_logs" 
ON activity_logs FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow anon SELECT for the admin dashboard (which uses anon key)
-- Needed because /admin/growth/page.jsx uses the anon key, not service role
CREATE POLICY "Anon can read activity_logs for admin UI"
ON activity_logs FOR SELECT
USING (true);

-- Policy: Allow anon INSERT (for cron jobs that may use anon key by mistake)
CREATE POLICY "Anon can insert activity_logs"
ON activity_logs FOR INSERT
WITH CHECK (true);

-- Policy: Allow authenticated users to update (for approve/reject actions in admin UI)
CREATE POLICY "Authenticated admins can update activity_logs"
ON activity_logs FOR UPDATE
USING (auth.role() = 'authenticated');

-- Verify it was created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM activity_logs) as row_count
FROM information_schema.tables 
WHERE table_name = 'activity_logs' 
AND table_schema = 'public';
