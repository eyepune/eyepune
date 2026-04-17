-- ============================================================
-- FIX RLS RECURSION ERROR
-- This script fixes the "infinite recursion" error in users table policies.
-- ============================================================

-- 1. Create a SECURITY DEFINER function to check admin role.
-- This Bypasses RLS, thus breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Update users table policies
DROP POLICY IF EXISTS "Authenticated users can read own profile" ON users;
CREATE POLICY "Authenticated users can read own profile" ON users 
FOR SELECT USING (
  auth.uid() = id 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users" ON users 
FOR ALL USING (public.is_admin());

-- 3. Update other table policies to use the function (more efficient and cleaner)
DROP POLICY IF EXISTS "Admin full access leads" ON leads;
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access inquiries" ON inquiries;
CREATE POLICY "Admin full access inquiries" ON inquiries FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access bookings" ON bookings;
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access projects" ON client_projects;
CREATE POLICY "Admin full access projects" ON client_projects FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access campaigns" ON campaigns;
CREATE POLICY "Admin full access campaigns" ON campaigns FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access blog" ON blog_posts;
CREATE POLICY "Admin full access blog" ON blog_posts FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access contracts" ON contracts;
CREATE POLICY "Admin full access contracts" ON contracts FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access proposals" ON proposals;
CREATE POLICY "Admin full access proposals" ON proposals FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access invoices" ON invoices;
CREATE POLICY "Admin full access invoices" ON invoices FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access assessments" ON ai_assessments;
CREATE POLICY "Admin full access assessments" ON ai_assessments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access payments" ON payments;
CREATE POLICY "Admin full access payments" ON payments FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access client logos" ON client_logos;
CREATE POLICY "Admin full access client logos" ON client_logos FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin read activities" ON user_activities;
CREATE POLICY "Admin read activities" ON user_activities FOR SELECT USING (public.is_admin());

-- Also fix other client policies
DROP POLICY IF EXISTS "Clients can read own projects" ON client_projects;
CREATE POLICY "Clients can read own projects" ON client_projects 
FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR public.is_admin());

DROP POLICY IF EXISTS "Clients can read own proposals" ON proposals;
CREATE POLICY "Clients can read own proposals" ON proposals 
FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR public.is_admin());

DROP POLICY IF EXISTS "Clients can read own invoices" ON invoices;
CREATE POLICY "Clients can read own invoices" ON invoices 
FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR public.is_admin());

DROP POLICY IF EXISTS "Clients can read own contracts" ON contracts;
CREATE POLICY "Clients can read own contracts" ON contracts 
FOR SELECT USING (client_email = auth.jwt() ->> 'email' OR public.is_admin());
