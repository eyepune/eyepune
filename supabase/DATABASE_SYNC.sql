-- ============================================================
-- 💎 EYE PUNE — MASTER DATABASE SYNC
-- Run this once in the Supabase SQL Editor
-- ============================================================

-- 1. FIX BLOG POSTS TABLE
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for any posts that don't have them
UPDATE public.blog_posts 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- 2. FIX BLOG COMMENTS TABLE
-- Ensure we have created_at (Supabase default)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_comments' AND column_name='created_date') THEN
    ALTER TABLE public.blog_comments RENAME COLUMN created_date TO created_at;
  END IF;
END $$;

-- 3. ENSURE PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT SELECT, INSERT ON public.blog_comments TO anon, authenticated;

-- 4. VIEW TRACKER FUNCTION (RE-RUN)
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.blog_posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = post_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_post_views(UUID) TO anon, authenticated;

SELECT 'SYNC COMPLETE: Database now matches code requirements.' as status;
