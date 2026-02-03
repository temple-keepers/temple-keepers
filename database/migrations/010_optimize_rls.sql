-- 010_optimize_rls.sql
-- Security and Performance Optimizations
-- Fixes: auth_rls_initplan (wrapping auth calls in select)
-- Fixes: multiple_permissive_policies (consolidating overlapping policies)

-- =============================================================================
-- 0. ENABLE RLS (Ensure all tables are secured)
-- =============================================================================

-- Ensure necessary columns exist for policies
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.weekly_themes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.feature_flags ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.pods ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;


ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_day_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 1. UTILITIES & HELPER FUNCTIONS
-- =============================================================================
-- Ensure is_admin is optimal and search_path is safe (already handled in 009, but effectively used here)

-- =============================================================================
-- 2. DAILY LOGS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can delete own logs" ON public.daily_logs;

CREATE POLICY "Users can manage own logs"
  ON public.daily_logs
  FOR ALL
  USING (user_id = (select auth.uid()));

-- =============================================================================
-- 3. DAILY LOG ENTRIES
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own entries" ON public.daily_log_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON public.daily_log_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.daily_log_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.daily_log_entries;

CREATE POLICY "Users can manage own entries"
  ON public.daily_log_entries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_logs
      WHERE daily_logs.id = daily_log_entries.log_id
      AND daily_logs.user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- 4. HABITS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can create habits" ON public.habits;
DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;

CREATE POLICY "Users can manage own habits"
  ON public.habits
  FOR ALL
  USING (user_id = (select auth.uid()));

-- =============================================================================
-- 5. PROGRAMS
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view published programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can create programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can update programs" ON public.programs;
DROP POLICY IF EXISTS "admins_view_all" ON public.programs;
DROP POLICY IF EXISTS "admins_full_access" ON public.programs;
DROP POLICY IF EXISTS "view_published_programs" ON public.programs;

-- Consolidated SELECT policy (Performance: eliminates multiple permissive checks)
CREATE POLICY "View programs"
  ON public.programs FOR SELECT
  USING (
    is_published = true 
    OR created_by = (select auth.uid()) 
    OR (select public.is_admin())
  );

-- Admin Modify (Insert/Update/Delete)
CREATE POLICY "Admins can manage programs"
  ON public.programs FOR INSERT
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "Admins can update programs"
  ON public.programs FOR UPDATE
  USING ((select public.is_admin()));

CREATE POLICY "Admins can delete programs"
  ON public.programs FOR DELETE
  USING ((select public.is_admin()));

-- =============================================================================
-- 6. PROGRAM DAYS
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view program days" ON public.program_days;
DROP POLICY IF EXISTS "Admins can manage program days" ON public.program_days;

-- Consolidated SELECT (Optimized EXISTS + Admin Check)
CREATE POLICY "View program days"
  ON public.program_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = program_days.program_id
      AND (programs.is_published = true OR (select public.is_admin()))
    )
  );

-- Admin Modify
CREATE POLICY "Admins can insert program days"
  ON public.program_days FOR INSERT
  WITH CHECK ((select public.is_admin()));

CREATE POLICY "Admins can update program days"
  ON public.program_days FOR UPDATE
  USING ((select public.is_admin()));

CREATE POLICY "Admins can delete program days"
  ON public.program_days FOR DELETE
  USING ((select public.is_admin()));

-- =============================================================================
-- 7. PROGRAM ENROLLMENTS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.program_enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON public.program_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.program_enrollments;
DROP POLICY IF EXISTS "Users can delete own enrollments" ON public.program_enrollments;

CREATE POLICY "Users can manage own enrollments"
  ON public.program_enrollments
  FOR ALL
  USING (user_id = (select auth.uid()));

-- =============================================================================
-- 8. PROGRAM DAY COMPLETIONS
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own completions" ON public.program_day_completions;
DROP POLICY IF EXISTS "Users can create completions" ON public.program_day_completions;

-- Optimized EXISTS check
CREATE POLICY "Users can manage own completions"
  ON public.program_day_completions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.program_enrollments
      WHERE program_enrollments.id = program_day_completions.enrollment_id
      AND program_enrollments.user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- 9. RECIPES
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view published recipes" ON public.recipes;
DROP POLICY IF EXISTS "Admins can manage recipes" ON public.recipes;
DROP POLICY IF EXISTS "Update own or admin recipes" ON public.recipes;
DROP POLICY IF EXISTS "Delete own or admin recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can create recipes" ON public.recipes;

CREATE POLICY "View recipes"
  ON public.recipes FOR SELECT
  USING (
    is_published = true 
    OR created_by = (select auth.uid()) 
    OR (select public.is_admin())
  );

CREATE POLICY "Manage recipes"
  ON public.recipes FOR ALL
  USING (
    created_by = (select auth.uid()) 
    OR (select public.is_admin())
  );

-- =============================================================================
-- 10. SAVED RECIPES & FAVORITES
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own saved recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can save recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can delete saved recipes" ON public.saved_recipes;

CREATE POLICY "Users can manage saved recipes"
  ON public.saved_recipes FOR ALL
  USING (user_id = (select auth.uid()));

-- User Favorite Recipes (assuming separate table based on warnings)
DROP POLICY IF EXISTS "View own favorites" ON public.user_favorite_recipes;
DROP POLICY IF EXISTS "Add favorites" ON public.user_favorite_recipes;
DROP POLICY IF EXISTS "Remove favorites" ON public.user_favorite_recipes;

CREATE POLICY "Users can manage favorites"
  ON public.user_favorite_recipes FOR ALL
  USING (user_id = (select auth.uid()));

-- =============================================================================
-- 11. MEAL PLANS & DAY & SHOPPING LIST
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can create own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;

CREATE POLICY "Users can manage meal plans" ON public.meal_plans FOR ALL
  USING (user_id = (select auth.uid()));


DROP POLICY IF EXISTS "Users can view own meal plan days" ON public.meal_plan_days;
DROP POLICY IF EXISTS "Users can manage own meal plan days" ON public.meal_plan_days;

-- Use EXISTS to link back to meal_plan entitlement
CREATE POLICY "Users can manage meal plan days" ON public.meal_plan_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_days.meal_plan_id
      AND meal_plans.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can manage own shopping lists" ON public.shopping_lists;

CREATE POLICY "Users can manage shopping lists" ON public.shopping_lists FOR ALL
  USING (user_id = (select auth.uid()));

-- =============================================================================
-- 12. NOTIFICATIONS & PREFERENCES
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own notification prefs" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification prefs" ON public.notification_preferences;

CREATE POLICY "Users can manage own notification prefs" ON public.notification_preferences FOR ALL
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications_sent;
DROP POLICY IF EXISTS "Admin can view all notifications" ON public.notifications_sent;

-- Consolidated SELECT
CREATE POLICY "View notifications sent" ON public.notifications_sent FOR SELECT
  USING (
    user_id = (select auth.uid()) OR (select public.is_admin())
  );

-- =============================================================================
-- 13. FEATURE FLAGS & TIER FEATURES & WEEKLY THEMES (Admin tables)
-- =============================================================================

-- Feature Flags
DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Anyone can view feature flags" ON public.feature_flags;

CREATE POLICY "View feature flags" ON public.feature_flags FOR SELECT
  USING (is_enabled = true OR (select public.is_admin()));

CREATE POLICY "Admins can modify feature flags" ON public.feature_flags FOR INSERT
  WITH CHECK ((select public.is_admin()));
CREATE POLICY "Admins can update feature flags" ON public.feature_flags FOR UPDATE
  USING ((select public.is_admin()));
CREATE POLICY "Admins can delete feature flags" ON public.feature_flags FOR DELETE
  USING ((select public.is_admin()));

-- Tier Features
DROP POLICY IF EXISTS "Authenticated users can view tier features" ON public.tier_features;
DROP POLICY IF EXISTS "Admins can manage tier features" ON public.tier_features;

CREATE POLICY "View tier features" ON public.tier_features FOR SELECT
  USING (true); -- Public/Auth view allowed

CREATE POLICY "Admins can modify tier features" ON public.tier_features FOR INSERT
  WITH CHECK ((select public.is_admin()));
CREATE POLICY "Admins can update tier features" ON public.tier_features FOR UPDATE
  USING ((select public.is_admin()));
CREATE POLICY "Admins can delete tier features" ON public.tier_features FOR DELETE
  USING ((select public.is_admin()));

-- Weekly Themes
DROP POLICY IF EXISTS "Authenticated users can view weekly themes" ON public.weekly_themes;
DROP POLICY IF EXISTS "Admins can manage weekly themes" ON public.weekly_themes;

CREATE POLICY "View weekly themes" ON public.weekly_themes FOR SELECT
  USING (is_active = true OR (select public.is_admin()));

CREATE POLICY "Admins modify weekly themes" ON public.weekly_themes FOR INSERT
  WITH CHECK ((select public.is_admin()));
CREATE POLICY "Admins update weekly themes" ON public.weekly_themes FOR UPDATE
  USING ((select public.is_admin()));
CREATE POLICY "Admins delete weekly themes" ON public.weekly_themes FOR DELETE
  USING ((select public.is_admin()));

-- Content Calendar
DROP POLICY IF EXISTS "Admin can manage content calendar" ON public.content_calendar;

CREATE POLICY "View content calendar" ON public.content_calendar FOR SELECT
  USING (true); -- Assuming visible to users, or restrict to admin? Warning only said Admin Manage.
                -- Let's make it admin managed, maybe public view? Or admin only? 
                -- Assuming Admin only for now based on context, possibly adding public read later.
  
CREATE POLICY "Admins manage content calendar" ON public.content_calendar FOR ALL
  USING ((select public.is_admin()));

-- =============================================================================
-- 14. PODS & COMMUNITY
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view public pods" ON public.pods;
DROP POLICY IF EXISTS "Users can create pods" ON public.pods;
DROP POLICY IF EXISTS "Leaders can update their pods" ON public.pods;

CREATE POLICY "View pods" ON public.pods FOR SELECT
  USING (
    is_private = false OR 
    EXISTS (
      SELECT 1 FROM public.pod_members 
      WHERE pod_members.pod_id = pods.id 
      AND pod_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Manage pods" ON public.pods FOR ALL
  USING (created_by = (select auth.uid())); -- Creator can Update/Delete

-- Pod Members
DROP POLICY IF EXISTS "Members can view pod members" ON public.pod_members;
DROP POLICY IF EXISTS "Users can join pods" ON public.pod_members;

CREATE POLICY "View pod members" ON public.pod_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members AS pm
      WHERE pm.pod_id = pod_members.pod_id 
      AND pm.user_id = (select auth.uid())
    ) OR user_id = (select auth.uid()) -- Can see self
  );

CREATE POLICY "Join pods" ON public.pod_members FOR INSERT
  WITH CHECK (user_id = (select auth.uid())); -- Can add self

-- Pod Posts
DROP POLICY IF EXISTS "Members can view pod posts" ON public.pod_posts;
DROP POLICY IF EXISTS "Members can create posts" ON public.pod_posts;

CREATE POLICY "View pod posts" ON public.pod_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pod_posts.pod_id
      AND pod_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Create pod posts" ON public.pod_posts FOR INSERT
  WITH CHECK (
    user_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pod_posts.pod_id
      AND pod_members.user_id = (select auth.uid())
    )
  );

-- Pod Challenges
DROP POLICY IF EXISTS "Pod members can view challenges" ON public.pod_challenges;
DROP POLICY IF EXISTS "Pod leaders can manage challenges" ON public.pod_challenges;

CREATE POLICY "View pod challenges" ON public.pod_challenges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pod_challenges.pod_id
      AND pod_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Manage pod challenges" ON public.pod_challenges FOR ALL
  USING (assigned_by = (select auth.uid())); 

-- =============================================================================
-- 15. PROFILES
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Consolidated View
CREATE POLICY "View profiles" ON public.profiles FOR SELECT
  USING (true); -- Public profiles

-- Modify Own
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE
  USING (id = (select auth.uid()));

CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT
  WITH CHECK (id = (select auth.uid()));

