-- Create Automation Logs table
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'linkedin', 'blog', 'intel', 'email'
    status TEXT NOT NULL, -- 'success', 'failure'
    message TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Policy for Admin (connect@eyepune.com)
DROP POLICY IF EXISTS "Admins can do everything on automation_logs" ON automation_logs;
CREATE POLICY "Admins can do everything on automation_logs" 
ON automation_logs FOR ALL 
USING (auth.jwt() ->> 'email' = 'connect@eyepune.com');

-- Also allow service role for cron jobs
CREATE POLICY "Service role can insert logs"
ON automation_logs FOR INSERT
WITH CHECK (true);
