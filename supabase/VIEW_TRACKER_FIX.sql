-- ============================================================
-- 🚀 EYE PUNE — BLOG VIEW TRACKER FIX
-- Purpose: Add view increment function to Supabase
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.blog_posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_post_views(UUID) TO anon, authenticated;
