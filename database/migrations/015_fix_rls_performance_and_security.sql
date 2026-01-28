-- Migration: Fix RLS performance and security issues
-- Addresses: auth_rls_initplan, multiple_permissive_policies, rls_disabled, function_search_path

-- ============================================================================
-- 1. FIX FUNCTION SEARCH PATHS (Security)
-- ============================================================================

-- Fix is_admin function search path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = (SELECT auth.uid())
  );
$$;

-- Fix handle_new_user_subscription function search path
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. ENABLE RLS ON admin_users TABLE
-- ============================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. FIX admin_users POLICIES (Remove duplicates)
-- ============================================================================

-- Drop all existing admin_users policies
DROP POLICY IF EXISTS "Admins can view" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view" ON public.admin_users;

-- Create single optimized policy
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (
    (SELECT auth.uid()) IN (SELECT user_id FROM public.admin_users)
  );

-- ============================================================================
-- 4. FIX profiles TABLE POLICIES
-- ============================================================================

-- Drop duplicate policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;

-- Create single optimized policy for all operations
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================================
-- 5. FIX recipes TABLE POLICIES
-- ============================================================================

-- Drop all duplicate policies
DROP POLICY IF EXISTS "Users and admins can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users and admins can delete recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can modify own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view approved recipes and own recipes" ON public.recipes;

-- Create optimized policies
CREATE POLICY "Users can view recipes"
  ON public.recipes FOR SELECT
  USING (
    status = 'approved' 
    OR user_id = (SELECT auth.uid())
    OR (SELECT public.is_admin())
  );

CREATE POLICY "Users can insert recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update recipes"
  ON public.recipes FOR UPDATE
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
  WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

CREATE POLICY "Users can delete recipes"
  ON public.recipes FOR DELETE
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

-- ============================================================================
-- 6. FIX user_stats TABLE POLICIES
-- ============================================================================

-- Drop duplicate policies
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can manage their own stats" ON public.user_stats;

-- Create single optimized policy
CREATE POLICY "Users can manage own stats"
  ON public.user_stats FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 7. FIX devotional_progress TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own progress" ON public.devotional_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.devotional_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.devotional_progress;

-- Create single optimized policy
CREATE POLICY "Users can manage own progress"
  ON public.devotional_progress FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 8. FIX water_logs TABLE POLICIES
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage own water logs" ON public.water_logs;

-- Create optimized policy
CREATE POLICY "Users can manage own water logs"
  ON public.water_logs FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 9. FIX meal_plans TABLE POLICIES
-- ============================================================================

-- Drop all duplicate policies
DROP POLICY IF EXISTS "Users can manage own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can view own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;

-- Create single optimized policy
CREATE POLICY "Users can manage own meal plans"
  ON public.meal_plans FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 10. FIX payments TABLE POLICIES
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- Create optimized policy
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 11. FIX recipe_usage TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own usage" ON public.recipe_usage;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.recipe_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON public.recipe_usage;

-- Create single optimized policy
CREATE POLICY "Users can manage own usage"
  ON public.recipe_usage FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 12. FIX subscriptions TABLE POLICIES (Remove overly permissive policy)
-- ============================================================================

-- Drop all existing policies including the overly permissive one
DROP POLICY IF EXISTS "Service role full access" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- Create proper user policy
CREATE POLICY "Users can manage own subscription"
  ON public.subscriptions FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 13. FIX recipe_ratings TABLE POLICIES
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view all ratings" ON public.recipe_ratings;
DROP POLICY IF EXISTS "Users manage their own ratings" ON public.recipe_ratings;
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.recipe_ratings;
DROP POLICY IF EXISTS "Users can manage own ratings" ON public.recipe_ratings;

-- Create separate policies for each operation (no overlapping SELECT)
CREATE POLICY "Anyone can view ratings"
  ON public.recipe_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON public.recipe_ratings FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own ratings"
  ON public.recipe_ratings FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own ratings"
  ON public.recipe_ratings FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- 14. FIX admin_users INSERT POLICY (overly permissive)
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.admin_users;

-- Only existing admins can add new admins
CREATE POLICY "Admins can insert admin users"
  ON public.admin_users FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IN (SELECT user_id FROM public.admin_users));
