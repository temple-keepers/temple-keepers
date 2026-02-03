-- ================================================
-- FIX RLS SECURITY ISSUES
-- ================================================
-- Run this in your Supabase SQL Editor to fix security warnings
-- ================================================

-- ================================================
-- 1. PROFILES TABLE - Enable RLS
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "Service role can manage all profiles"
  ON public.profiles
  FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- 2. POD_CHALLENGES TABLE - Enable RLS
-- ================================================

ALTER TABLE public.pod_challenges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Pod members can view challenges" ON public.pod_challenges;
DROP POLICY IF EXISTS "Pod creators can manage challenges" ON public.pod_challenges;

-- Create RLS Policies for pod_challenges
CREATE POLICY "Pod members can view challenges"
  ON public.pod_challenges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pod_challenges.pod_id
      AND pod_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Pod creators can manage challenges"
  ON public.pod_challenges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pods
      WHERE pods.id = pod_challenges.pod_id
      AND pods.created_by = auth.uid()
    )
  );

-- Allow service role to manage all challenges
CREATE POLICY "Service role can manage all challenges"
  ON public.pod_challenges
  FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- 3. WEEKLY_THEMES TABLE - Enable RLS
-- ================================================

ALTER TABLE public.weekly_themes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view weekly themes" ON public.weekly_themes;
DROP POLICY IF EXISTS "Only admins can manage themes" ON public.weekly_themes;

-- Create RLS Policies for weekly_themes
-- These are public content, so all authenticated users can view
CREATE POLICY "Anyone can view weekly themes"
  ON public.weekly_themes
  FOR SELECT
  USING (true); -- All authenticated users can view

-- Only users with admin role can create/update/delete themes
CREATE POLICY "Only admins can manage themes"
  ON public.weekly_themes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow service role to manage all themes
CREATE POLICY "Service role can manage all themes"
  ON public.weekly_themes
  FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- 4. TIER_FEATURES TABLE - Enable RLS
-- ================================================

ALTER TABLE public.tier_features ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view tier features" ON public.tier_features;
DROP POLICY IF EXISTS "Only admins can manage tier features" ON public.tier_features;

-- Create RLS Policies for tier_features
-- These define what features are available, so all users can view
CREATE POLICY "Anyone can view tier features"
  ON public.tier_features
  FOR SELECT
  USING (true); -- All authenticated users can view

-- Only admins can create/update/delete features
CREATE POLICY "Only admins can manage tier features"
  ON public.tier_features
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow service role to manage all tier features
CREATE POLICY "Service role can manage all tier features"
  ON public.tier_features
  FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- VERIFICATION
-- ================================================

-- Run this to verify RLS is enabled on all tables:
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'pod_challenges', 'weekly_themes', 'tier_features')
ORDER BY tablename;

-- Expected result: All tables should have rls_enabled = true

-- ================================================
-- POLICY VERIFICATION
-- ================================================

-- Run this to see all policies created:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'pod_challenges', 'weekly_themes', 'tier_features')
ORDER BY tablename, policyname;

-- ================================================
-- NOTES
-- ================================================

-- 1. PROFILES:
--    - Users can only see/edit their own profile
--    - Admin operations use service role

-- 2. POD_CHALLENGES:
--    - Only pod members can view challenges
--    - Only pod creators can create/edit challenges
--    - If you're not using pods yet, these tables won't affect your app

-- 3. WEEKLY_THEMES:
--    - All users can view (public content)
--    - Only admins can create/edit
--    - If you're not using this feature, it won't affect users

-- 4. TIER_FEATURES:
--    - All users can view (defines available features)
--    - Only admins can modify
--    - If you're not using paid tiers yet, won't affect users

-- ================================================
-- TROUBLESHOOTING
-- ================================================

-- If you get permission errors after running this:

-- 1. Make sure the user has a profile:
--    SELECT * FROM public.profiles WHERE id = auth.uid();

-- 2. Check if policies are working:
--    SELECT * FROM public.profiles; -- Should only see your own

-- 3. If you need to disable RLS temporarily (NOT recommended):
--    -- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. To re-enable:
--    -- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
