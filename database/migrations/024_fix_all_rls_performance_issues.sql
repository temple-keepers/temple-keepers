-- Migration: Comprehensive RLS Performance Fix
-- Date: 2026-01-30
-- Purpose: Fix all remaining auth_rls_initplan, multiple_permissive_policies, and duplicate_index issues

BEGIN;

-- ============================================
-- REMOVE DUPLICATE INDEXES
-- ============================================
-- Fix duplicate indexes on habit_logs table
DROP INDEX IF EXISTS public.idx_habit_logs_date;
-- Keep idx_habit_logs_log_date as it's more descriptive

-- ============================================
-- FIX AUTH RLS INITIALIZATION PLAN ISSUES
-- ============================================

-- 1. HABIT_CATEGORIES
DROP POLICY IF EXISTS "Habit categories viewable by authenticated users" ON public.habit_categories;
CREATE POLICY "Habit categories viewable by authenticated users"
  ON public.habit_categories FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

-- 2. HABIT_TEMPLATES  
DROP POLICY IF EXISTS "Habit templates viewable by authenticated users" ON public.habit_templates;
CREATE POLICY "Habit templates viewable by authenticated users"
  ON public.habit_templates FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

-- 3. GOAL_MILESTONES - Replace single policy with separate CRUD policies
DROP POLICY IF EXISTS "Users manage own goal milestones" ON public.goal_milestones;

CREATE POLICY "Users view own goal milestones"
  ON public.goal_milestones FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users insert own goal milestones"
  ON public.goal_milestones FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update own goal milestones"
  ON public.goal_milestones FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own goal milestones"
  ON public.goal_milestones FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 4. DAILY_CHALLENGES
DROP POLICY IF EXISTS "Daily challenges viewable by authenticated users" ON public.daily_challenges;
CREATE POLICY "Daily challenges viewable by authenticated users"
  ON public.daily_challenges FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

-- 5. PRAYER_REQUESTS - Consolidate multiple policies
DROP POLICY IF EXISTS "Prayer requests viewable" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users manage own prayers" ON public.prayer_requests;

CREATE POLICY "Prayer requests viewable to pod members"
  ON public.prayer_requests FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR (
      pod_id IS NOT NULL 
      AND pod_id IN (
        SELECT pod_id FROM pod_members WHERE user_id = (SELECT auth.uid())
      )
    )
    OR pod_id IS NULL -- Public prayer requests
  );

CREATE POLICY "Users insert own prayers"
  ON public.prayer_requests FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update own prayers"
  ON public.prayer_requests FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own prayers"
  ON public.prayer_requests FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 6. PODS - Fix auth function calls
DROP POLICY IF EXISTS "Pods viewable" ON public.pods;
CREATE POLICY "Pods viewable to members"
  ON public.pods FOR SELECT
  USING (
    (SELECT auth.uid()) = created_by
    OR id IN (
      SELECT pod_id FROM pod_members WHERE user_id = (SELECT auth.uid())
    )
  );

-- 7. COMMUNITY_POSTS - Consolidate multiple policies  
DROP POLICY IF EXISTS "Community posts viewable by authenticated users" ON public.community_posts;
DROP POLICY IF EXISTS "Users manage own posts" ON public.community_posts;

CREATE POLICY "Community posts viewable to all authenticated users"
  ON public.community_posts FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update own posts"
  ON public.community_posts FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own posts"
  ON public.community_posts FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 8. DEVOTIONALS
DROP POLICY IF EXISTS "Devotionals viewable by authenticated users" ON public.devotionals;
CREATE POLICY "Devotionals viewable by authenticated users"
  ON public.devotionals FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

-- 9. ACHIEVEMENTS
DROP POLICY IF EXISTS "Achievements viewable by authenticated users" ON public.achievements;
CREATE POLICY "Achievements viewable by authenticated users"
  ON public.achievements FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

-- 10. RECIPE_RATINGS - Consolidate multiple policies
DROP POLICY IF EXISTS "Recipe ratings viewable" ON public.recipe_ratings;
DROP POLICY IF EXISTS "Users manage own ratings" ON public.recipe_ratings;

CREATE POLICY "Recipe ratings viewable to all authenticated users"
  ON public.recipe_ratings FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert own ratings"
  ON public.recipe_ratings FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update own ratings"
  ON public.recipe_ratings FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own ratings"
  ON public.recipe_ratings FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 11. RECIPE_COMMENTS - Consolidate multiple policies
DROP POLICY IF EXISTS "Recipe comments viewable" ON public.recipe_comments;
DROP POLICY IF EXISTS "Users manage own recipe comments" ON public.recipe_comments;

CREATE POLICY "Recipe comments viewable to all authenticated users"
  ON public.recipe_comments FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert own comments"
  ON public.recipe_comments FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update own comments"
  ON public.recipe_comments FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own comments"
  ON public.recipe_comments FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 12. PROFILES - Consolidate multiple policies
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view public profiles and own profile"
  ON public.profiles FOR SELECT
  USING (
    (SELECT auth.uid()) = id  -- Own profile
    OR is_public = true       -- Public profiles
    OR EXISTS (               -- Admin check
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid()) 
      AND au.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- FIX MULTIPLE PERMISSIVE POLICIES
-- ============================================

-- ADMIN_USERS - Consolidate multiple SELECT policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins manage admin users" ON public.admin_users;

CREATE POLICY "Admin users viewable by admins"
  ON public.admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid())
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins manage admin users"
  ON public.admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid())
      AND au.role = 'super_admin'
    )
  );

-- CHALLENGE_COMPLETIONS - Consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Users manage own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users view own challenge completions" ON public.challenge_completions;

CREATE POLICY "Users manage own challenge completions"
  ON public.challenge_completions FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- DEVOTIONAL_PROGRESS - Consolidate admin and user policies
DROP POLICY IF EXISTS "Admins view all progress" ON public.devotional_progress;
DROP POLICY IF EXISTS "Users manage own progress on devotional_progress" ON public.devotional_progress;

CREATE POLICY "Users and admins view devotional progress"
  ON public.devotional_progress FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- Own progress
    OR EXISTS (                    -- Admin access
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid())
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users manage own devotional progress"
  ON public.devotional_progress FOR INSERT, UPDATE, DELETE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- MEAL_PLANS - Consolidate multiple policies
DROP POLICY IF EXISTS "Admins view all meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users manage own meal plans" ON public.meal_plans;

CREATE POLICY "Users and admins view meal plans"
  ON public.meal_plans FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- Own meal plans
    OR EXISTS (                    -- Admin access
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid())
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users manage own meal plans"
  ON public.meal_plans FOR INSERT, UPDATE, DELETE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- PAYMENTS - Consolidate view policies
DROP POLICY IF EXISTS "Admins view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;

CREATE POLICY "Users and admins view payments"
  ON public.payments FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- Own payments
    OR EXISTS (                    -- Admin access
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid())
      AND au.role IN ('admin', 'super_admin')
    )
  );

-- POD_EVENTS - Consolidate multiple policies
DROP POLICY IF EXISTS "Pod admins manage events" ON public.pod_events;
DROP POLICY IF EXISTS "Pod members view events" ON public.pod_events;

CREATE POLICY "Pod members view events"
  ON public.pod_events FOR SELECT
  USING (
    pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Pod admins manage events"
  ON public.pod_events FOR INSERT, UPDATE, DELETE
  USING (
    pod_id IN (
      SELECT pm.pod_id FROM pod_members pm
      WHERE pm.user_id = (SELECT auth.uid()) AND pm.role = 'admin'
    )
    OR pod_id IN (
      SELECT p.id FROM pods p
      WHERE p.created_by = (SELECT auth.uid())
    )
  );

-- POD_MEMBERS - Consolidate multiple DELETE policies
DROP POLICY IF EXISTS "Pod admins remove members" ON public.pod_members;
DROP POLICY IF EXISTS "Users leave own pods" ON public.pod_members;

CREATE POLICY "Pod member management"
  ON public.pod_members FOR DELETE
  USING (
    user_id = (SELECT auth.uid())  -- Users can leave
    OR pod_id IN (                 -- Pod admins can remove
      SELECT pm.pod_id FROM pod_members pm
      WHERE pm.user_id = (SELECT auth.uid()) AND pm.role = 'admin'
    )
    OR pod_id IN (                 -- Pod creators can remove
      SELECT p.id FROM pods p
      WHERE p.created_by = (SELECT auth.uid())
    )
  );

-- POST_LIKES - Consolidate multiple policies
DROP POLICY IF EXISTS "Likes viewable by all" ON public.post_likes;
DROP POLICY IF EXISTS "Users manage own likes" ON public.post_likes;

CREATE POLICY "Post likes viewable to authenticated users"
  ON public.post_likes FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users manage own likes"
  ON public.post_likes FOR INSERT, DELETE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- PRAYER_INTERACTIONS - Consolidate multiple policies
DROP POLICY IF EXISTS "Prayer interactions viewable" ON public.prayer_interactions;
DROP POLICY IF EXISTS "Users manage own prayer interactions" ON public.prayer_interactions;

CREATE POLICY "Prayer interactions viewable to authenticated users"
  ON public.prayer_interactions FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users manage own prayer interactions"
  ON public.prayer_interactions FOR INSERT, UPDATE, DELETE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- RECIPE_LIBRARY_SAVES - Consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Users manage own recipe library saves" ON public.recipe_library_saves;
DROP POLICY IF EXISTS "Users view own recipe library saves" ON public.recipe_library_saves;

CREATE POLICY "Users manage own recipe library saves"
  ON public.recipe_library_saves FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- RECIPE_USAGE - Consolidate multiple policies
DROP POLICY IF EXISTS "Admins view all usage" ON public.recipe_usage;
DROP POLICY IF EXISTS "Users manage own usage" ON public.recipe_usage;

CREATE POLICY "Users and admins view recipe usage"
  ON public.recipe_usage FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- Own usage
    OR EXISTS (                    -- Admin access
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid())
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users manage own recipe usage"
  ON public.recipe_usage FOR INSERT, UPDATE, DELETE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- SAVED_RECIPES - Consolidate duplicate SELECT policies
DROP POLICY IF EXISTS "Users manage own saved recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users view own saved recipes" ON public.saved_recipes;

CREATE POLICY "Users manage own saved recipes"
  ON public.saved_recipes FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- USER_FOLLOWS - Consolidate multiple policies
DROP POLICY IF EXISTS "Follows viewable" ON public.user_follows;
DROP POLICY IF EXISTS "Users manage own follows" ON public.user_follows;

CREATE POLICY "User follows viewable to authenticated users"
  ON public.user_follows FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users manage own follows"
  ON public.user_follows FOR INSERT, DELETE
  USING (
    follower_id = (SELECT auth.uid()) OR following_id = (SELECT auth.uid())
  )
  WITH CHECK (follower_id = (SELECT auth.uid()));

-- USER_STATS - Consolidate multiple policies
DROP POLICY IF EXISTS "Admins view all stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users manage own stats" ON public.user_stats;

CREATE POLICY "Users and admins view stats"
  ON public.user_stats FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- Own stats
    OR EXISTS (                    -- Admin access
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid())
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users manage own stats"
  ON public.user_stats FOR INSERT, UPDATE, DELETE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- WATER_LOGS - Consolidate multiple policies
DROP POLICY IF EXISTS "Admins view all water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Users manage own water logs" ON public.water_logs;

CREATE POLICY "Users and admins view water logs"
  ON public.water_logs FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- Own logs
    OR EXISTS (                    -- Admin access
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (SELECT auth.uid())
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users manage own water logs"
  ON public.water_logs FOR INSERT, UPDATE, DELETE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

COMMIT;