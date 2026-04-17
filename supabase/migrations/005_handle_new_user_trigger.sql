-- ============================================================
-- EyE PunE — Auto-create user profile on signup
-- This trigger fires whenever a new user signs up in Supabase Auth
-- and automatically creates a corresponding row in the public.users table.
-- ============================================================

-- Create an auth trigger function that runs AFTER INSERT on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Don't fail if user already exists
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any (safe to re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also add policies for user_activities (needed for page tracking)
DROP POLICY IF EXISTS "Users can create own activities" ON user_activities;
CREATE POLICY "Users can create own activities" ON user_activities 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read activities" ON user_activities;
CREATE POLICY "Admin read activities" ON user_activities 
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Allow public users to create inquiries (contact form)
DROP POLICY IF EXISTS "Public can create inquiries" ON inquiries;
CREATE POLICY "Public can create inquiries" ON inquiries FOR INSERT WITH CHECK (true);

-- Allow public users to create bookings (booking form)
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Allow users to insert themselves (needed for signup flow)
DROP POLICY IF EXISTS "Users can insert own row" ON users;
CREATE POLICY "Users can insert own row" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);
