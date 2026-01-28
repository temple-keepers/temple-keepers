-- Migration: Give admins full read access to all tables for admin panel
-- This allows superAdmins to view all users, subscriptions, etc.

-- ============================================================================
-- 1. PROFILES - Admins can view all profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Users can manage their own profile
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- 2. SUBSCRIPTIONS - Admins can view and update all subscriptions
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

-- Users can view/insert/update their own subscription
CREATE POLICY "Users can manage own subscription"
  ON public.subscriptions FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING ((SELECT public.is_admin()));

-- Admins can update all subscriptions (for changing plans)
CREATE POLICY "Admins can update all subscriptions"
  ON public.subscriptions FOR UPDATE
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert subscriptions for any user
CREATE POLICY "Admins can insert subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK ((SELECT public.is_admin()));

-- ============================================================================
-- 3. USER_STATS - Admins can view all user stats
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Admins can view all stats" ON public.user_stats;

-- Users can manage their own stats
CREATE POLICY "Users can manage own stats"
  ON public.user_stats FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Admins can view all user stats
CREATE POLICY "Admins can view all stats"
  ON public.user_stats FOR SELECT
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- 4. DEVOTIONAL_PROGRESS - Admins can view all
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own progress" ON public.devotional_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.devotional_progress;

CREATE POLICY "Users can manage own progress"
  ON public.devotional_progress FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all progress"
  ON public.devotional_progress FOR SELECT
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- 5. WATER_LOGS - Admins can view all
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Admins can view all water logs" ON public.water_logs;

CREATE POLICY "Users can manage own water logs"
  ON public.water_logs FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all water logs"
  ON public.water_logs FOR SELECT
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- 6. MEAL_PLANS - Admins can view all
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Admins can view all meal plans" ON public.meal_plans;

CREATE POLICY "Users can manage own meal plans"
  ON public.meal_plans FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all meal plans"
  ON public.meal_plans FOR SELECT
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- 7. RECIPE_USAGE - Admins can view all
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own usage" ON public.recipe_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON public.recipe_usage;

CREATE POLICY "Users can manage own usage"
  ON public.recipe_usage FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all usage"
  ON public.recipe_usage FOR SELECT
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- 8. PAYMENTS - Admins can view all payments
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING ((SELECT public.is_admin()));
