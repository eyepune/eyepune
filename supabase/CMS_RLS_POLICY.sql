-- ============================================================
-- 🚀 EYE PUNE — CMS PAGES RLS & PUBLIC READ POLICY
-- Run this in your Supabase SQL Editor to make legal pages public.
-- ============================================================

-- 1. Enable RLS on cms_pages table
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if present
DROP POLICY IF EXISTS "Allow Public Read CMS Pages" ON public.cms_pages;

-- 3. Create permissive SELECT policy for public (anon) and authenticated users
CREATE POLICY "Allow Public Read CMS Pages" ON public.cms_pages 
FOR SELECT 
USING (status = 'published');

-- 4. Grant SELECT permissions explicitly
GRANT SELECT ON public.cms_pages TO anon, authenticated;

-- 5. Verification check
-- SELECT count(*) FROM public.cms_pages WHERE status = 'published';
