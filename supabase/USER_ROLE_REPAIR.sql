-- ============================================================
-- 🔑 EYE PUNE — USER ROLE & PERMISSIONS REPAIR (V3 - NO RECURSION)
-- Run this in the Supabase SQL Editor to fix 'Access Denied'
-- ============================================================

-- 1. Ensure the users table exists
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'team', 'client')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create recursion-safe check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Using a subquery that bypasses RLS by running as the owner (SECURITY DEFINER)
  RETURN (
    SELECT role = 'admin' 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Repair Permissions (RLS)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles" 
ON public.users FOR SELECT 
USING (is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow public insertion during signup" ON public.users;
CREATE POLICY "Allow public insertion during signup" 
ON public.users FOR INSERT 
WITH CHECK (true);

-- 4. GRANT PERMISSIONS
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT ON public.users TO anon;

-- 5. PROMOTE MASTER ADMIN
INSERT INTO public.users (id, email, role, full_name)
SELECT id, email, 'admin', 'Master Admin'
FROM auth.users
WHERE email = 'connect@eyepune.com'
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 6. VERIFY
SELECT email, role FROM public.users WHERE email = 'connect@eyepune.com';
