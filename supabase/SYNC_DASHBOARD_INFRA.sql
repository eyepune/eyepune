-- ============================================================
-- 💎 EYE PUNE — FINAL DASHBOARD INFRASTRUCTURE SYNC & SEED
-- ============================================================

-- 1. TABLES SETUP & MIGRATIONS
-- ============================================================

-- Ensure client_projects has the correct structure
CREATE TABLE IF NOT EXISTS public.client_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    project_type TEXT DEFAULT 'web_app',
    status TEXT DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0,
    budget DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    expected_completion_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migration for existing client_projects table
DO $$ 
BEGIN
    -- Rename 'name' to 'project_name' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='client_projects' AND column_name='name') THEN
        ALTER TABLE public.client_projects RENAME COLUMN "name" TO "project_name";
    END IF;

    -- Add missing columns
    ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'web_app';
    ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;
    ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) DEFAULT 0;
    ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS expected_completion_date DATE;

    -- Update Check Constraint for Status
    -- Drop old restricted constraint if it exists
    ALTER TABLE public.client_projects DROP CONSTRAINT IF EXISTS client_projects_status_check;
    
    -- Apply new expanded constraint
    ALTER TABLE public.client_projects ADD CONSTRAINT client_projects_status_check 
    CHECK (status IN ('onboarding', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled', 'active'));
END $$;

CREATE TABLE IF NOT EXISTS public.client_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date DATE, -- Standardized
    completed_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration for existing client_milestones table
DO $$ 
BEGIN
    -- Rename 'target_date' to 'due_date' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='client_milestones' AND column_name='target_date') THEN
        ALTER TABLE public.client_milestones RENAME COLUMN "target_date" TO "due_date";
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.client_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category TEXT DEFAULT 'general',
    uploaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    task_type TEXT DEFAULT 'client', 
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    assignee TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deliverable_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
    deliverable_name TEXT NOT NULL,
    description TEXT,
    deliverable_url TEXT,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'changes_requested', 'rejected')),
    feedback_text TEXT,
    reviewed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration for existing deliverable_approvals table
DO $$ 
BEGIN
    -- Rename columns if they exist from SETUP_DATABASE.sql
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverable_approvals' AND column_name='title') THEN
        ALTER TABLE public.deliverable_approvals RENAME COLUMN "title" TO "deliverable_name";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverable_approvals' AND column_name='file_url') THEN
        ALTER TABLE public.deliverable_approvals RENAME COLUMN "file_url" TO "deliverable_url";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverable_approvals' AND column_name='client_feedback') THEN
        ALTER TABLE public.deliverable_approvals RENAME COLUMN "client_feedback" TO "feedback_text";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliverable_approvals' AND column_name='reviewed_at') THEN
        ALTER TABLE public.deliverable_approvals RENAME COLUMN "reviewed_at" TO "reviewed_date";
    END IF;

    -- Update Check Constraint for Status
    ALTER TABLE public.deliverable_approvals DROP CONSTRAINT IF EXISTS deliverable_approvals_status_check;
    ALTER TABLE public.deliverable_approvals ADD CONSTRAINT deliverable_approvals_status_check 
    CHECK (status IN ('pending_review', 'approved', 'changes_requested', 'rejected', 'pending', 'revision_requested'));
END $$;

CREATE TABLE IF NOT EXISTS public.project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL,
    project_type TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL UNIQUE,
    enabled_widgets TEXT[] DEFAULT ARRAY['progress', 'milestones', 'activity', 'deadlines', 'budget'],
    widget_order TEXT[] DEFAULT ARRAY['progress', 'milestones', 'deadlines', 'budget', 'activity'],
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS SETUP
-- ============================================================

ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Shared function for admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'connect@eyepune.com' OR 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Projects Policy
DROP POLICY IF EXISTS "Project Access Policy" ON public.client_projects;
CREATE POLICY "Project Access Policy" ON public.client_projects FOR ALL TO authenticated 
USING (client_email = auth.jwt() ->> 'email' OR public.is_admin());

-- Relational Access for Child Tables
DROP POLICY IF EXISTS "Milestone Access Policy" ON public.client_milestones;
CREATE POLICY "Milestone Access Policy" ON public.client_milestones FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.client_projects WHERE id = project_id AND (client_email = auth.jwt() ->> 'email' OR public.is_admin())));

DROP POLICY IF EXISTS "Task Access Policy" ON public.project_tasks;
CREATE POLICY "Task Access Policy" ON public.project_tasks FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.client_projects WHERE id = project_id AND (client_email = auth.jwt() ->> 'email' OR public.is_admin())));

DROP POLICY IF EXISTS "File Access Policy" ON public.client_files;
CREATE POLICY "File Access Policy" ON public.client_files FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.client_projects WHERE id = project_id AND (client_email = auth.jwt() ->> 'email' OR public.is_admin())));

DROP POLICY IF EXISTS "Approval Access Policy" ON public.deliverable_approvals;
CREATE POLICY "Approval Access Policy" ON public.deliverable_approvals FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.client_projects WHERE id = project_id AND (client_email = auth.jwt() ->> 'email' OR public.is_admin())));

-- 3. SEEDING
-- ============================================================

-- Clear existing demo to avoid duplicates during testing
-- We use a DO block here to be safe if the column rename just happened
DO $$ 
BEGIN
    DELETE FROM public.client_projects WHERE client_email = 'connect@eyepune.com' AND project_name = 'Elite E-commerce Platform';
EXCEPTION WHEN OTHERS THEN
    -- Fallback to 'name' if rename failed for some reason
    DELETE FROM public.client_projects WHERE client_email = 'connect@eyepune.com' AND name = 'Elite E-commerce Platform';
END $$;

-- Insert Admin Demo
DO $$ 
DECLARE 
    v_project_id UUID;
BEGIN
    INSERT INTO public.client_projects (project_name, client_name, client_email, project_type, status, progress_percentage, budget, description)
    VALUES ('Elite E-commerce Platform', 'EyE PunE Internal', 'connect@eyepune.com', 'web_app', 'in_progress', 75, 150000, 'A flagship e-commerce solution with integrated AI sales assistant.')
    RETURNING id INTO v_project_id;

    INSERT INTO public.client_milestones (project_id, title, description, status, due_date) VALUES
    (v_project_id, 'Phase 1: Architecture', 'Database schema and API routing.', 'completed', CURRENT_DATE - INTERVAL '10 days'),
    (v_project_id, 'Phase 2: UI/UX Design', 'High-fidelity mockups and prototype.', 'in_progress', CURRENT_DATE + INTERVAL '5 days'),
    (v_project_id, 'Phase 3: Launch', 'Live deployment and SEO audit.', 'pending', CURRENT_DATE + INTERVAL '20 days');

    INSERT INTO public.project_tasks (project_id, title, status, priority, due_date) VALUES
    (v_project_id, 'Finalize Brand Guidelines', 'done', 'high', CURRENT_DATE - INTERVAL '2 days'),
    (v_project_id, 'Develop Product Catalog', 'in_progress', 'medium', CURRENT_DATE + INTERVAL '3 days');

    INSERT INTO public.deliverable_approvals (project_id, deliverable_name, description, status) VALUES
    (v_project_id, 'Master Logo Suite', 'All formats for print and digital.', 'approved'),
    (v_project_id, 'Checkout Flow Prototype', 'Interactive Figma prototype of the cart.', 'pending_review');
END $$;

SELECT 'SYNC SUCCESS: Dashboard ready with Elite demo data.' as status;
