-- ============================================================
-- EyE PunE — Promote First Admin Function
-- Creates a SECURITY DEFINER function that allows the first
-- user to promote themselves to admin (only if no admins exist)
-- ============================================================

-- Function to promote the first user to admin
-- This runs as SECURITY DEFINER (database owner), bypassing RLS
-- It only works if there are NO existing admin users
CREATE OR REPLACE FUNCTION promote_first_admin(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count INTEGER;
  user_exists BOOLEAN;
  user_email TEXT;
BEGIN
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
  
  IF admin_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Admin users already exist. Use the admin panel to manage roles.'
    );
  END IF;
  
  -- Check if the target user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE id = target_user_id), email
  INTO user_exists, user_email
  FROM users WHERE id = target_user_id;
  
  IF NOT user_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found. Please sign up first.'
    );
  END IF;
  
  -- Promote the user to admin
  UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User promoted to admin successfully.',
    'email', user_email
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION promote_first_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION promote_first_admin(UUID) TO anon;
