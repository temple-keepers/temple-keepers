-- ============================================
-- FIX: Admin Users RLS Infinite Recursion
-- ============================================
-- The previous policies created infinite recursion because they queried
-- the same table they were protecting. Solution: Use a helper function
-- with SECURITY DEFINER to bypass RLS when checking admin status.

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
DROP FUNCTION IF EXISTS update_admin_users_updated_at();

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Service role can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON admin_users;

-- Create a helper function that bypasses RLS to check if a user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FIXED: Simple policies that don't cause recursion
-- Users can always check their own admin status
CREATE POLICY "Users can check own admin status" 
  ON admin_users FOR SELECT 
  USING (user_id = auth.uid());

-- Super admins can view all admin users (uses helper function to avoid recursion)
CREATE POLICY "Super admins can view all admin users" 
  ON admin_users FOR SELECT 
  USING (is_super_admin(auth.uid()));

-- Super admins can insert new admin users
CREATE POLICY "Super admins can insert admin users" 
  ON admin_users FOR INSERT 
  WITH CHECK (is_super_admin(auth.uid()));

-- Super admins can update admin users
CREATE POLICY "Super admins can update admin users" 
  ON admin_users FOR UPDATE 
  USING (is_super_admin(auth.uid()));

-- Super admins can delete admin users
CREATE POLICY "Super admins can delete admin users" 
  ON admin_users FOR DELETE 
  USING (is_super_admin(auth.uid()));
