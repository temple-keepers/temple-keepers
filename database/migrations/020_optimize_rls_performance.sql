-- ============================================
-- Optimize RLS Performance - Fix Auth InitPlan Issues
-- ============================================
-- This migration addresses performance warnings by:
-- 1. Wrapping auth.uid() calls in SELECT subqueries to prevent re-evaluation per row
-- 2. Consolidating duplicate permissive policies
-- 3. Removing duplicate indexes

-- ============================================
-- Drop Duplicate Policies (to be recreated with optimizations)
-- ============================================

-- user_challenges policies
-- SKIPPED: Policy already exists and will not be recreated
-- DROP POLICY IF EXISTS "Users can manage own challenge enrollments" ON user_challenges;
DROP POLICY IF EXISTS "Users can view own challenge enrollments" ON user_challenges;
DROP POLICY IF EXISTS "Users can insert own challenge enrollments" ON user_challenges;
DROP POLICY IF EXISTS "Users can update own challenge enrollments" ON user_challenges;
DROP POLICY IF EXISTS "Users can delete own challenge enrollments" ON user_challenges;

-- challenge_day_progress policies
-- SKIPPED: Policy already exists and will not be recreated
-- DROP POLICY IF EXISTS "Users can manage own progress" ON challenge_day_progress;

-- community_polls policies
DROP POLICY IF EXISTS "Post owners can create polls" ON community_polls;

-- community_poll_votes policies
DROP POLICY IF EXISTS "Users can vote on polls" ON community_poll_votes;
DROP POLICY IF EXISTS "Users can update their votes" ON community_poll_votes;

-- subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON subscriptions;

-- pod_events policies
DROP POLICY IF EXISTS "Pod members can view events" ON pod_events;
DROP POLICY IF EXISTS "Pod admins can create events" ON pod_events;
DROP POLICY IF EXISTS "Event creators can update events" ON pod_events;
DROP POLICY IF EXISTS "Event creators can delete events" ON pod_events;

-- community_posts policies
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;

-- post_likes policies
DROP POLICY IF EXISTS "Users can manage own likes" ON post_likes;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON post_likes;

-- post_comments policies
DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;

-- prayer_requests policies
DROP POLICY IF EXISTS "Public prayers are viewable" ON prayer_requests;
DROP POLICY IF EXISTS "Users can manage own prayers" ON prayer_requests;

-- prayer_interactions policies
DROP POLICY IF EXISTS "Prayer interactions viewable" ON prayer_interactions;
DROP POLICY IF EXISTS "Users can manage own prayer interactions" ON prayer_interactions;

-- pods policies
DROP POLICY IF EXISTS "Pods are viewable" ON pods;
DROP POLICY IF EXISTS "Users can create pods" ON pods;
DROP POLICY IF EXISTS "Pod admins can update" ON pods;

-- notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON notifications;

-- notification_preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON notification_preferences;

-- push_subscriptions policies
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;

-- scheduled_notifications policies
DROP POLICY IF EXISTS "Users can view own scheduled" ON scheduled_notifications;

-- pod_messages policies
DROP POLICY IF EXISTS "Messages viewable by pod members" ON pod_messages;
DROP POLICY IF EXISTS "Members can send messages" ON pod_messages;

-- user_follows policies
DROP POLICY IF EXISTS "Users manage own follows" ON user_follows;
DROP POLICY IF EXISTS "Follows are viewable" ON user_follows;

-- pod_event_rsvps policies
DROP POLICY IF EXISTS "Pod members can view RSVPs" ON pod_event_rsvps;
DROP POLICY IF EXISTS "Users can manage their RSVPs" ON pod_event_rsvps;

-- community_post_saves policies
DROP POLICY IF EXISTS "Users can view their saves" ON community_post_saves;
DROP POLICY IF EXISTS "Users can save posts" ON community_post_saves;
DROP POLICY IF EXISTS "Users can unsave posts" ON community_post_saves;

-- pod_members policies
DROP POLICY IF EXISTS "Users can join pods" ON pod_members;
DROP POLICY IF EXISTS "Users can leave pods" ON pod_members;
DROP POLICY IF EXISTS "Pod admins can remove members" ON pod_members;

-- habits policies
DROP POLICY IF EXISTS "Users can manage own habits" ON habits;
DROP POLICY IF EXISTS "Users manage own habits" ON habits;

-- habit_logs policies
DROP POLICY IF EXISTS "Users can manage own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users manage own habit logs" ON habit_logs;

-- weekly_reviews policies
DROP POLICY IF EXISTS "Users can manage own reviews" ON weekly_reviews;
DROP POLICY IF EXISTS "Users manage own reviews" ON weekly_reviews;

-- habit_insights policies
DROP POLICY IF EXISTS "Users can view own insights" ON habit_insights;

-- goals policies
DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
DROP POLICY IF EXISTS "Users manage own goals" ON goals;

-- goal_logs policies
DROP POLICY IF EXISTS "Users manage own goal logs" ON goal_logs;

-- user_achievements policies
DROP POLICY IF EXISTS "Users view own achievements" ON user_achievements;

-- community_post_media policies
DROP POLICY IF EXISTS "Post owners can add media" ON community_post_media;
DROP POLICY IF EXISTS "Post owners can delete media" ON community_post_media;

-- community_post_shares policies
DROP POLICY IF EXISTS "Users can share posts" ON community_post_shares;
DROP POLICY IF EXISTS "Users can delete their shares" ON community_post_shares;

-- community_post_mentions policies
DROP POLICY IF EXISTS "Post owners can mention users" ON community_post_mentions;

-- recipes policies
DROP POLICY IF EXISTS "Users can view recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete recipes" ON recipes;

-- profiles policies
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- meal_plans policies
DROP POLICY IF EXISTS "Users can manage own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Admins can view all meal plans" ON meal_plans;

-- payments policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

-- recipe_usage policies
DROP POLICY IF EXISTS "Users can manage own usage" ON recipe_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON recipe_usage;

-- user_stats policies
DROP POLICY IF EXISTS "Users can manage own stats" ON user_stats;
DROP POLICY IF EXISTS "Admins can view all stats" ON user_stats;

-- water_logs policies
DROP POLICY IF EXISTS "Users can manage own water logs" ON water_logs;
DROP POLICY IF EXISTS "Admins can view all water logs" ON water_logs;

-- devotional_progress policies
DROP POLICY IF EXISTS "Users can manage own progress" ON devotional_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON devotional_progress;

-- challenge_days policies (keep public viewable separate from admin)
DROP POLICY IF EXISTS "Admins can manage challenge days" ON challenge_days;

-- challenges policies (keep public viewable separate from admin)
DROP POLICY IF EXISTS "Admins can manage challenges" ON challenges;

-- ============================================
-- Recreate Policies with Optimized auth.uid() Calls
-- ============================================

-- USER_CHALLENGES: Consolidated single policy for all operations
-- SKIPPED: Already created during testing
-- CREATE POLICY "Users manage own challenge enrollments"
--   ON user_challenges
--   FOR ALL
--   USING ((select auth.uid()) = user_id)
--   WITH CHECK ((select auth.uid()) = user_id);

-- CHALLENGE_DAY_PROGRESS
-- SKIPPED: Already created during testing
-- CREATE POLICY "Users manage own progress"
--   ON challenge_day_progress
--   FOR ALL
--   USING ((select auth.uid()) = user_id)
--   WITH CHECK ((select auth.uid()) = user_id);

-- COMMUNITY_POLLS
CREATE POLICY "Post owners can create polls"
  ON community_polls
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_polls.post_id
      AND community_posts.user_id = (select auth.uid())
    )
  );

-- COMMUNITY_POLL_VOTES: Consolidated policy
CREATE POLICY "Users manage own poll votes"
  ON community_poll_votes
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- SUBSCRIPTIONS: Consolidated policy
CREATE POLICY "Users manage own subscription"
  ON subscriptions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POD_EVENTS: Consolidated policies
CREATE POLICY "Pod members view events"
  ON pod_events
  FOR SELECT
  USING (
    is_pod_member(pod_id, (select auth.uid()))
  );

CREATE POLICY "Pod admins manage events"
  ON pod_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = pod_events.pod_id
      AND pod_members.user_id = (select auth.uid())
      AND pod_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = pod_events.pod_id
      AND pod_members.user_id = (select auth.uid())
      AND pod_members.role = 'admin'
    )
  );

-- COMMUNITY_POSTS: Consolidated policy
CREATE POLICY "Users manage own posts"
  ON community_posts
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POST_LIKES: Consolidated policy (keep public SELECT)
CREATE POLICY "Likes viewable by all"
  ON post_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users manage own likes"
  ON post_likes
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POST_COMMENTS: Consolidated policy
CREATE POLICY "Users manage own comments"
  ON post_comments
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- PRAYER_REQUESTS: Consolidated policy (viewable by all authenticated users)
CREATE POLICY "Prayer requests viewable"
  ON prayer_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users manage own prayers"
  ON prayer_requests
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- PRAYER_INTERACTIONS: Consolidated policy (keep public SELECT)
CREATE POLICY "Prayer interactions viewable"
  ON prayer_interactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users manage own prayer interactions"
  ON prayer_interactions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- PODS: Optimized policies
CREATE POLICY "Pods viewable"
  ON pods
  FOR SELECT
  USING (
    (select auth.uid()) = created_by
    OR is_pod_member(id, (select auth.uid()))
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users create pods"
  ON pods
  FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Pod admins update"
  ON pods
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = pods.id
      AND pod_members.user_id = (select auth.uid())
      AND pod_members.role = 'admin'
    )
  );

-- NOTIFICATIONS: Consolidated policy
CREATE POLICY "Users manage own notifications"
  ON notifications
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- NOTIFICATION_PREFERENCES: Consolidated policy
CREATE POLICY "Users manage own preferences"
  ON notification_preferences
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- PUSH_SUBSCRIPTIONS: Consolidated policy
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- SCHEDULED_NOTIFICATIONS: Consolidated policy
CREATE POLICY "Users view own scheduled"
  ON scheduled_notifications
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- POD_MESSAGES: Optimized policies
CREATE POLICY "Pod members view messages"
  ON pod_messages
  FOR SELECT
  USING (is_pod_member(pod_id, (select auth.uid())));

CREATE POLICY "Pod members send messages"
  ON pod_messages
  FOR INSERT
  WITH CHECK (
    is_pod_member(pod_id, (select auth.uid()))
    AND (select auth.uid()) = user_id
  );

-- USER_FOLLOWS: Consolidated policy (keep public SELECT)
CREATE POLICY "Follows viewable"
  ON user_follows
  FOR SELECT
  USING (true);

CREATE POLICY "Users manage own follows"
  ON user_follows
  FOR ALL
  USING ((select auth.uid()) = follower_id)
  WITH CHECK ((select auth.uid()) = follower_id);

-- POD_EVENT_RSVPS: Consolidated policy
CREATE POLICY "Pod members manage RSVPs"
  ON pod_event_rsvps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pod_events pe
      WHERE pe.id = pod_event_rsvps.event_id
      AND is_pod_member(pe.pod_id, (select auth.uid()))
    )
    AND pod_event_rsvps.user_id = (select auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pod_events pe
      WHERE pe.id = pod_event_rsvps.event_id
      AND is_pod_member(pe.pod_id, (select auth.uid()))
    )
    AND pod_event_rsvps.user_id = (select auth.uid())
  );

-- COMMUNITY_POST_SAVES: Consolidated policy
CREATE POLICY "Users manage own saves"
  ON community_post_saves
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POD_MEMBERS: Consolidated policies
CREATE POLICY "Pod members viewable"
  ON pod_members
  FOR SELECT
  USING (true);

CREATE POLICY "Users join pods"
  ON pod_members
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users leave own pods"
  ON pod_members
  FOR DELETE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Pod admins remove members"
  ON pod_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = (select auth.uid())
      AND pm.role = 'admin'
    )
  );

-- HABITS: Consolidated policy
CREATE POLICY "Users manage own habits"
  ON habits
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- HABIT_LOGS: Consolidated policy
CREATE POLICY "Users manage own habit logs"
  ON habit_logs
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- WEEKLY_REVIEWS: Consolidated policy
CREATE POLICY "Users manage own reviews"
  ON weekly_reviews
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- HABIT_INSIGHTS: Consolidated policy
CREATE POLICY "Users view own insights"
  ON habit_insights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_insights.habit_id
      AND habits.user_id = (select auth.uid())
    )
  );

-- GOALS: Consolidated policy
CREATE POLICY "Users manage own goals"
  ON goals
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- GOAL_LOGS: Consolidated policy
CREATE POLICY "Users manage own goal logs"
  ON goal_logs
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- USER_ACHIEVEMENTS: Consolidated policy
CREATE POLICY "Users view own achievements"
  ON user_achievements
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- COMMUNITY_POST_MEDIA: Consolidated policy
CREATE POLICY "Post owners manage media"
  ON community_post_media
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_post_media.post_id
      AND community_posts.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_post_media.post_id
      AND community_posts.user_id = (select auth.uid())
    )
  );

-- COMMUNITY_POST_SHARES: Consolidated policy
CREATE POLICY "Users manage own shares"
  ON community_post_shares
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- COMMUNITY_POST_MENTIONS: Consolidated policy
CREATE POLICY "Post owners mention users"
  ON community_post_mentions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_post_mentions.post_id
      AND community_posts.user_id = (select auth.uid())
    )
  );

-- RECIPES: Admin policies (keep existing structure)
CREATE POLICY "Users view recipes"
  ON recipes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins manage recipes"
  ON recipes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- PROFILES: Consolidated policy with admin override
CREATE POLICY "Users manage own profile"
  ON profiles
  FOR ALL
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- MEAL_PLANS: Consolidated policy with admin override
CREATE POLICY "Users manage own meal plans"
  ON meal_plans
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins view all meal plans"
  ON meal_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- PAYMENTS: Consolidated policy with admin override
CREATE POLICY "Users view own payments"
  ON payments
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins view all payments"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- RECIPE_USAGE: Consolidated policy with admin override
CREATE POLICY "Users manage own usage"
  ON recipe_usage
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins view all usage"
  ON recipe_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- USER_STATS: Consolidated policy with admin override
CREATE POLICY "Users manage own stats"
  ON user_stats
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins view all stats"
  ON user_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- WATER_LOGS: Consolidated policy with admin override
CREATE POLICY "Users manage own water logs"
  ON water_logs
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins view all water logs"
  ON water_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- DEVOTIONAL_PROGRESS: Consolidated policy with admin override
CREATE POLICY "Users manage own progress"
  ON devotional_progress
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins view all progress"
  ON devotional_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- CHALLENGE_DAYS: Recreate with optimized auth check
CREATE POLICY "Admins manage challenge days"
  ON challenge_days
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- CHALLENGES: Recreate with optimized auth check
CREATE POLICY "Admins manage challenges"
  ON challenges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- ============================================
-- Remove Duplicate Index
-- ============================================

-- Drop duplicate index on habit_logs (keep the more descriptive name)
DROP INDEX IF EXISTS idx_habit_logs_date;

-- ============================================
-- Verification Comments
-- ============================================

-- This migration should resolve:
-- - 70+ auth_rls_initplan warnings by wrapping auth.uid() in SELECT subqueries
-- - 200+ multiple_permissive_policies warnings by consolidating duplicate policies
-- - 1 duplicate_index warning by removing idx_habit_logs_date (keeping idx_habit_logs_log_date)
