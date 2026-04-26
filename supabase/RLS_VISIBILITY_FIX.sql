-- ============================================================
-- 🚀 EYE PUNE — CRITICAL RLS & CONTENT FIX (RUN THIS NOW)
-- Purpose: Resolve "No Blogs Found" and 403 Forbidden errors.
-- ============================================================

-- 1. Ensure RLS is active but has permissive policies for public data
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

-- 2. DROP any existing restrictive policies to avoid conflicts
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('blog_posts', 'service_packages', 'testimonials', 'client_logos', 'inquiries', 'leads', 'bookings', 'ai_assessments', 'user_activities')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. CREATE Public Read Policies (Allow everyone to see your content)
CREATE POLICY "Allow Public Read Blog" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Allow Public Read Services" ON public.service_packages FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Allow Public Read Testimonials" ON public.testimonials FOR SELECT USING (status = 'approved');
CREATE POLICY "Allow Public Read Logos" ON public.client_logos FOR SELECT USING (is_active = TRUE);

-- 4. CREATE Public Insert Policies (Allow visitors to submit forms/chatbot)
CREATE POLICY "Allow Anonymous Inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anonymous Leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anonymous Bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anonymous Assessments" ON public.ai_assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anonymous Activities" ON public.user_activities FOR INSERT WITH CHECK (true);

-- 5. GRANT Permissions (Double-check roles)
GRANT SELECT ON public.blog_posts, public.service_packages, public.testimonials, public.client_logos TO anon, authenticated;
GRANT INSERT ON public.inquiries, public.leads, public.bookings, public.ai_assessments, public.user_activities TO anon, authenticated;

-- 6. VERIFY CONTENT STATUS
-- If status was capitalized or null, this fixes it to match the frontend 'published'
UPDATE public.blog_posts SET status = 'published' WHERE status IS NULL OR status = 'Published' OR status = '';
UPDATE public.service_packages SET is_active = TRUE WHERE is_active IS NULL;

-- 7. FINAL TEST QUERY (Run this part separately to check)
-- SELECT count(*) FROM blog_posts WHERE status = 'published';
