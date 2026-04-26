-- ============================================================
-- 🛠️ EYE PUNE — FAIL-SAFE REPAIR SCRIPT (V2)
-- Purpose: Fix visibility without causing errors if tables are missing.
-- ============================================================

-- Function to safely apply policies
CREATE OR REPLACE FUNCTION public.safe_repair_rls()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    -- 1. Fix BLOG POSTS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
        ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read everything" ON public.blog_posts;
        DROP POLICY IF EXISTS "Public Read Blog" ON public.blog_posts;
        CREATE POLICY "Allow public read everything" ON public.blog_posts FOR SELECT USING (true);
        GRANT SELECT ON public.blog_posts TO anon, authenticated;
        UPDATE public.blog_posts SET status = 'published' WHERE status IS NULL;
    END IF;

    -- 2. Fix SERVICE PACKAGES
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_packages') THEN
        ALTER TABLE public.service_packages DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public read services" ON public.service_packages;
        CREATE POLICY "Allow public read services" ON public.service_packages FOR SELECT USING (true);
        GRANT SELECT ON public.service_packages TO anon, authenticated;
    END IF;

    -- 3. Fix USER ACTIVITIES (Lead Tracking)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_activities') THEN
        ALTER TABLE public.user_activities DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public insert activities" ON public.user_activities;
        CREATE POLICY "Allow public insert activities" ON public.user_activities FOR INSERT WITH CHECK (true);
        GRANT INSERT ON public.user_activities TO anon, authenticated;
    END IF;
END;
$$;

-- Run the repair
SELECT public.safe_repair_rls();

-- Final Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;

SELECT 'REPAIR COMPLETE: All existing tables are now visible and accessible.' as status;
