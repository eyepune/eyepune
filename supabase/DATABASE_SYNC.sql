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

  -- 4. FIX USER ACTIVITIES (Add RLS to prevent 403s)
  ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activities' AND policyname = 'Allow anonymous and authenticated to insert activity') THEN
      CREATE POLICY "Allow anonymous and authenticated to insert activity" 
      ON public.user_activities FOR INSERT 
      TO anon, authenticated
      WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activities' AND policyname = 'Allow authenticated to select their own activity') THEN
      CREATE POLICY "Allow authenticated to select their own activity" 
      ON public.user_activities FOR SELECT 
      TO authenticated
      USING (user_email = auth.jwt() ->> 'email' OR (auth.jwt() ->> 'email') = 'connect@eyepune.com');
    END IF;
  END $$;

  GRANT INSERT ON public.user_activities TO anon, authenticated;
  GRANT SELECT ON public.user_activities TO authenticated;

  -- 5. AI AGENT TABLES (For Sales Assistant & WhatsApp)
  CREATE TABLE IF NOT EXISTS public.ai_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agent_name TEXT NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.ai_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL, -- 'user', 'assistant', 'system'
      content TEXT NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  -- RLS for AI Tables
  ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Allow authenticated to manage conversations') THEN
      CREATE POLICY "Allow authenticated to manage conversations" ON public.ai_conversations FOR ALL TO authenticated USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_messages' AND policyname = 'Allow authenticated to manage messages') THEN
      CREATE POLICY "Allow authenticated to manage messages" ON public.ai_messages FOR ALL TO authenticated USING (true);
    END IF;
  END $$;

  GRANT ALL ON public.ai_conversations TO authenticated;
  GRANT ALL ON public.ai_messages TO authenticated;

  -- 6. VIEW TRACKER FUNCTION (RE-RUN)
  CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
  BEGIN
    UPDATE public.blog_posts
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = post_id;
  END;
  $$;
  GRANT EXECUTE ON FUNCTION public.increment_post_views(UUID) TO anon, authenticated;

  -- 7. PRICING & SERVICES PERMISSIONS
  ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
  
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pricing_plans' AND policyname = 'Allow public to view pricing plans') THEN
      CREATE POLICY "Allow public to view pricing plans" ON public.pricing_plans FOR SELECT TO anon, authenticated USING (true);
    END IF;
  END $$;
  
  GRANT SELECT ON public.pricing_plans TO anon, authenticated;

  -- 8. INQUIRIES & LEADS PERMISSIONS (For public forms)
  ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inquiries' AND policyname = 'Allow public to submit inquiries') THEN
      CREATE POLICY "Allow public to submit inquiries" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Allow public to submit leads') THEN
      CREATE POLICY "Allow public to submit leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
  END $$;

  GRANT INSERT ON public.inquiries TO anon, authenticated;
  GRANT INSERT ON public.leads TO anon, authenticated;

  -- 9. WHATSAPP SEQUENCES TABLE
  CREATE TABLE IF NOT EXISTS public.whatsapp_sequences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      trigger_type TEXT NOT NULL, -- 'new_lead', 'new_inquiry', etc.
      template_name TEXT NOT NULL, -- The approved Meta template name
      language_code TEXT DEFAULT 'en_US',
      components JSONB DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now()
  );

  ALTER TABLE public.whatsapp_sequences ENABLE ROW LEVEL SECURITY;
  
  DO $$ 
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_sequences' AND policyname = 'Allow authenticated to manage whatsapp sequences') THEN
      CREATE POLICY "Allow authenticated to manage whatsapp sequences" ON public.whatsapp_sequences FOR ALL TO authenticated USING (true);
    END IF;
  END $$;

  GRANT ALL ON public.whatsapp_sequences TO authenticated;

  SELECT 'SYNC COMPLETE: Database now matches code requirements.' as status;
