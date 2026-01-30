-- Migration: Fix RLS performance issues across all tables
-- Addresses: auth_rls_initplan, multiple_permissive_policies, duplicate_index

-- ============================================
-- FIX DUPLICATE INDEX
-- ============================================
DROP INDEX IF EXISTS public.idx_habit_logs_date;
-- Keep idx_habit_logs_log_date

-- ============================================
-- FIX HABIT_CATEGORIES
-- ============================================
DROP POLICY IF EXISTS "Habit categories viewable by authenticated users" ON public.habit_categories;
CREATE POLICY "Habit categories viewable by authenticated users"
  ON public.habit_categories FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

-- ============================================
-- FIX HABIT_TEMPLATES
-- ============================================
DROP POLICY IF EXISTS "Habit templates viewable by authenticated users" ON public.habit_templates;
CREATE POLICY "Habit templates viewable by authenticated users"
  ON public.habit_templates FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

-- ============================================
-- FIX GOAL_MILESTONES
-- ============================================
DROP POLICY IF EXISTS "Users manage own goal milestones" ON public.goal_milestones;
CREATE POLICY "Users view own goal milestones"
  ON public.goal_milestones FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert own goal milestones"
  ON public.goal_milestones FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own goal milestones"
  ON public.goal_milestones FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own goal milestones"
  ON public.goal_milestones FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX DAILY_CHALLENGES
-- ============================================
DROP POLICY IF EXISTS "Daily challenges viewable by authenticated users" ON public.daily_challenges;
CREATE POLICY "Daily challenges viewable by authenticated users"
  ON public.daily_challenges FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

-- ============================================
-- FIX PRAYER_REQUESTS
-- ============================================
DROP POLICY IF EXISTS "Prayer requests viewable" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users manage own prayers" ON public.prayer_requests;

CREATE POLICY "Prayer requests viewable"
  ON public.prayer_requests FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users insert own prayers"
  ON public.prayer_requests FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own prayers"
  ON public.prayer_requests FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own prayers"
  ON public.prayer_requests FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX PODS
-- ============================================
DROP POLICY IF EXISTS "Pods viewable" ON public.pods;
CREATE POLICY "Pods viewable"
  ON public.pods FOR SELECT
  USING (
    (select auth.uid()) = created_by
    OR id IN (
      SELECT pod_id FROM pod_members WHERE user_id = (select auth.uid())
    )
  );

-- ============================================
-- FIX COMMUNITY_POSTS
-- ============================================
DROP POLICY IF EXISTS "Community posts viewable by authenticated users" ON public.community_posts;
DROP POLICY IF EXISTS "Users manage own posts" ON public.community_posts;

CREATE POLICY "Community posts viewable"
  ON public.community_posts FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own posts"
  ON public.community_posts FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own posts"
  ON public.community_posts FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX DEVOTIONALS
-- ============================================
DROP POLICY IF EXISTS "Devotionals viewable by authenticated users" ON public.devotionals;
CREATE POLICY "Devotionals viewable by authenticated users"
  ON public.devotionals FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

-- ============================================
-- FIX ACHIEVEMENTS
-- ============================================
DROP POLICY IF EXISTS "Achievements viewable by authenticated users" ON public.achievements;
CREATE POLICY "Achievements viewable by authenticated users"
  ON public.achievements FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

-- ============================================
-- FIX RECIPE_RATINGS
-- ============================================
DROP POLICY IF EXISTS "Recipe ratings viewable" ON public.recipe_ratings;
DROP POLICY IF EXISTS "Users manage own ratings" ON public.recipe_ratings;

CREATE POLICY "Recipe ratings viewable"
  ON public.recipe_ratings FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert own ratings"
  ON public.recipe_ratings FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own ratings"
  ON public.recipe_ratings FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own ratings"
  ON public.recipe_ratings FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX RECIPE_COMMENTS
-- ============================================
DROP POLICY IF EXISTS "Recipe comments viewable" ON public.recipe_comments;
DROP POLICY IF EXISTS "Users manage own recipe comments" ON public.recipe_comments;

CREATE POLICY "Recipe comments viewable"
  ON public.recipe_comments FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert own recipe comments"
  ON public.recipe_comments FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own recipe comments"
  ON public.recipe_comments FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own recipe comments"
  ON public.recipe_comments FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Profiles viewable"
  ON public.profiles FOR SELECT
  USING (
    (select auth.uid()) = id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

-- ============================================
-- FIX ADMIN_USERS
-- ============================================
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins manage admin users" ON public.admin_users;

CREATE POLICY "Admins view admin users"
  ON public.admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Super admins insert admin users"
  ON public.admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
    )
  );

CREATE POLICY "Super admins update admin users"
  ON public.admin_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
    )
  );

CREATE POLICY "Super admins delete admin users"
  ON public.admin_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
    )
  );

-- ============================================
-- FIX CHALLENGE_COMPLETIONS
-- ============================================
DROP POLICY IF EXISTS "Users manage own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users view own challenge completions" ON public.challenge_completions;

CREATE POLICY "Users view own challenge completions"
  ON public.challenge_completions FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert challenge completions"
  ON public.challenge_completions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update challenge completions"
  ON public.challenge_completions FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete challenge completions"
  ON public.challenge_completions FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX DEVOTIONAL_PROGRESS
-- ============================================
DROP POLICY IF EXISTS "Admins view all progress" ON public.devotional_progress;
DROP POLICY IF EXISTS "Users manage own progress on devotional_progress" ON public.devotional_progress;

CREATE POLICY "Users and admins view devotional progress"
  ON public.devotional_progress FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Users insert devotional progress"
  ON public.devotional_progress FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update devotional progress"
  ON public.devotional_progress FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete devotional progress"
  ON public.devotional_progress FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX MEAL_PLANS
-- ============================================
DROP POLICY IF EXISTS "Admins view all meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users manage own meal plans" ON public.meal_plans;

CREATE POLICY "Users and admins view meal plans"
  ON public.meal_plans FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Users insert meal plans"
  ON public.meal_plans FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update meal plans"
  ON public.meal_plans FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete meal plans"
  ON public.meal_plans FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX PAYMENTS
-- ============================================
DROP POLICY IF EXISTS "Admins view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;

CREATE POLICY "Users and admins view payments"
  ON public.payments FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

-- ============================================
-- FIX POD_EVENTS
-- ============================================
DROP POLICY IF EXISTS "Pod admins manage events" ON public.pod_events;
DROP POLICY IF EXISTS "Pod members view events" ON public.pod_events;

CREATE POLICY "Pod members view events"
  ON public.pod_events FOR SELECT
  USING (
    pod_id IN (
      SELECT pod_id FROM pod_members WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Pod admins insert events"
  ON public.pod_events FOR INSERT
  WITH CHECK (
    pod_id IN (
      SELECT pod_id FROM pod_members 
      WHERE user_id = (select auth.uid()) AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Pod admins update events"
  ON public.pod_events FOR UPDATE
  USING (
    pod_id IN (
      SELECT pod_id FROM pod_members 
      WHERE user_id = (select auth.uid()) AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Pod admins delete events"
  ON public.pod_events FOR DELETE
  USING (
    pod_id IN (
      SELECT pod_id FROM pod_members 
      WHERE user_id = (select auth.uid()) AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- FIX POD_MEMBERS
-- ============================================
DROP POLICY IF EXISTS "Pod admins remove members" ON public.pod_members;
DROP POLICY IF EXISTS "Users leave own pods" ON public.pod_members;

CREATE POLICY "Users delete pod members"
  ON public.pod_members FOR DELETE
  USING (
    (select auth.uid()) = user_id
    OR pod_id IN (
      SELECT pod_id FROM pod_members 
      WHERE user_id = (select auth.uid()) AND role IN ('admin', 'owner')
    )
  );

-- ============================================
-- FIX POST_LIKES
-- ============================================
DROP POLICY IF EXISTS "Likes viewable by all" ON public.post_likes;
DROP POLICY IF EXISTS "Users manage own likes" ON public.post_likes;

CREATE POLICY "Likes viewable"
  ON public.post_likes FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert likes"
  ON public.post_likes FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete likes"
  ON public.post_likes FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX PRAYER_INTERACTIONS
-- ============================================
DROP POLICY IF EXISTS "Prayer interactions viewable" ON public.prayer_interactions;
DROP POLICY IF EXISTS "Users manage own prayer interactions" ON public.prayer_interactions;

CREATE POLICY "Prayer interactions viewable"
  ON public.prayer_interactions FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert prayer interactions"
  ON public.prayer_interactions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update prayer interactions"
  ON public.prayer_interactions FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete prayer interactions"
  ON public.prayer_interactions FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX RECIPE_LIBRARY_SAVES
-- ============================================
DROP POLICY IF EXISTS "Users manage own recipe library saves" ON public.recipe_library_saves;
DROP POLICY IF EXISTS "Users view own recipe library saves" ON public.recipe_library_saves;

CREATE POLICY "Users view recipe library saves"
  ON public.recipe_library_saves FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert recipe library saves"
  ON public.recipe_library_saves FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete recipe library saves"
  ON public.recipe_library_saves FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX RECIPE_USAGE
-- ============================================
DROP POLICY IF EXISTS "Admins view all usage" ON public.recipe_usage;
DROP POLICY IF EXISTS "Users manage own usage" ON public.recipe_usage;

CREATE POLICY "Users and admins view recipe usage"
  ON public.recipe_usage FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Users insert recipe usage"
  ON public.recipe_usage FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update recipe usage"
  ON public.recipe_usage FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete recipe usage"
  ON public.recipe_usage FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX SAVED_RECIPES
-- ============================================
DROP POLICY IF EXISTS "Users manage own saved recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users view own saved recipes" ON public.saved_recipes;

CREATE POLICY "Users view saved recipes"
  ON public.saved_recipes FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert saved recipes"
  ON public.saved_recipes FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update saved recipes"
  ON public.saved_recipes FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete saved recipes"
  ON public.saved_recipes FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX USER_FOLLOWS
-- ============================================
DROP POLICY IF EXISTS "Follows viewable" ON public.user_follows;
DROP POLICY IF EXISTS "Users manage own follows" ON public.user_follows;

CREATE POLICY "Follows viewable"
  ON public.user_follows FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users insert follows"
  ON public.user_follows FOR INSERT
  WITH CHECK ((select auth.uid()) = follower_id);

CREATE POLICY "Users delete follows"
  ON public.user_follows FOR DELETE
  USING ((select auth.uid()) = follower_id);

-- ============================================
-- FIX USER_STATS
-- ============================================
DROP POLICY IF EXISTS "Admins view all stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users manage own stats" ON public.user_stats;

CREATE POLICY "Users and admins view stats"
  ON public.user_stats FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Users insert stats"
  ON public.user_stats FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update stats"
  ON public.user_stats FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete stats"
  ON public.user_stats FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FIX WATER_LOGS
-- ============================================
DROP POLICY IF EXISTS "Admins view all water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Users manage own water logs" ON public.water_logs;

CREATE POLICY "Users and admins view water logs"
  ON public.water_logs FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Users insert water logs"
  ON public.water_logs FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update water logs"
  ON public.water_logs FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete water logs"
  ON public.water_logs FOR DELETE
  USING ((select auth.uid()) = user_id);
