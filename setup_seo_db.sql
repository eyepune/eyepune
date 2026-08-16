-- 1. Create the SEO Experiments table
CREATE TABLE IF NOT EXISTS public.seo_experiments (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    page_url TEXT NOT NULL,
    variant_type TEXT NOT NULL CHECK (variant_type IN ('champion', 'challenger')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    pageviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add an index for faster lookups by page_url
CREATE INDEX IF NOT EXISTS idx_seo_experiments_page_url ON public.seo_experiments(page_url);

-- 3. Create a function to securely increment page views
CREATE OR REPLACE FUNCTION increment_seo_variant_view(v_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.seo_experiments
  SET pageviews = pageviews + 1
  WHERE id = v_id;
$$;

-- 4. Set RLS policies
ALTER TABLE public.seo_experiments ENABLE ROW LEVEL SECURITY;

-- Allow public read access so the frontend can fetch variants
CREATE POLICY "Enable read access for all users" ON public.seo_experiments
    FOR SELECT
    USING (true);

-- Allow service role to insert/update/delete (used by our API)
CREATE POLICY "Enable insert for service role" ON public.seo_experiments
    FOR INSERT
    WITH CHECK (true);
    
CREATE POLICY "Enable update for service role" ON public.seo_experiments
    FOR UPDATE
    USING (true);
