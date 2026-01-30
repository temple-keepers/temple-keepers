-- ============================================
-- HOTFIX: Restore Missing RLS Policies
-- ============================================
-- This restores all the RLS policies that were accidentally dropped
-- Run this immediately in Supabase Dashboard SQL Editor

-- USER_CHALLENGES (if not already exists)
DROP POLICY IF EXISTS "Users manage own challenge enrollments" ON user_challenges;
CREATE POLICY "Users manage own challenge enrollments"
  ON user_challenges
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- CHALLENGE_DAY_PROGRESS (if not already exists)
DROP POLICY IF EXISTS "Users manage own progress" ON challenge_day_progress;
CREATE POLICY "Users manage own progress"
  ON challenge_day_progress
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_challenges uc
      WHERE uc.id = challenge_day_progress.user_challenge_id
      AND uc.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_challenges uc
      WHERE uc.id = challenge_day_progress.user_challenge_id
      AND uc.user_id = (select auth.uid())
    )
  );

-- CHALLENGES: Public viewable + admin manage
DROP POLICY IF EXISTS "Challenges are viewable" ON challenges;
DROP POLICY IF EXISTS "Admins manage challenges" ON challenges;

CREATE POLICY "Challenges are viewable"
  ON challenges
  FOR SELECT
  USING (true);  -- Everyone can view challenges

CREATE POLICY "Admins manage challenges"
  ON challenges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins update challenges"
  ON challenges
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins delete challenges"
  ON challenges
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- CHALLENGE_DAYS: Public viewable + admin manage
DROP POLICY IF EXISTS "Challenge days viewable" ON challenge_days;
DROP POLICY IF EXISTS "Admins manage challenge days" ON challenge_days;

CREATE POLICY "Challenge days viewable"
  ON challenge_days
  FOR SELECT
  USING (true);  -- Everyone can view challenge days

CREATE POLICY "Admins manage challenge days"
  ON challenge_days
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins update challenge days"
  ON challenge_days
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins delete challenge days"
  ON challenge_days
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- RECIPES: Public viewable + admin manage
DROP POLICY IF EXISTS "Recipes are viewable" ON recipes;
DROP POLICY IF EXISTS "Users view recipes" ON recipes;
DROP POLICY IF EXISTS "Admins manage recipes" ON recipes;

CREATE POLICY "Recipes are viewable"
  ON recipes
  FOR SELECT
  USING (true);  -- Everyone can view recipes

CREATE POLICY "Admins create recipes"
  ON recipes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins update recipes"
  ON recipes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins delete recipes"
  ON recipes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- COMMUNITY_POLLS
DROP POLICY IF EXISTS "Post owners can create polls" ON community_polls;
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

-- COMMUNITY_POLL_VOTES
DROP POLICY IF EXISTS "Users manage own poll votes" ON community_poll_votes;
CREATE POLICY "Users manage own poll votes"
  ON community_poll_votes
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users manage own subscription" ON subscriptions;
CREATE POLICY "Users manage own subscription"
  ON subscriptions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POD_EVENTS
DROP POLICY IF EXISTS "Pod members view events" ON pod_events;
DROP POLICY IF EXISTS "Pod admins manage events" ON pod_events;

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

-- COMMUNITY_POSTS
DROP POLICY IF EXISTS "Users manage own posts" ON community_posts;
CREATE POLICY "Users manage own posts"
  ON community_posts
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POST_LIKES
DROP POLICY IF EXISTS "Likes viewable by all" ON post_likes;
DROP POLICY IF EXISTS "Users manage own likes" ON post_likes;

CREATE POLICY "Likes viewable by all"
  ON post_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users manage own likes"
  ON post_likes
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POST_COMMENTS
DROP POLICY IF EXISTS "Users manage own comments" ON post_comments;
CREATE POLICY "Users manage own comments"
  ON post_comments
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- PRAYER_REQUESTS
DROP POLICY IF EXISTS "Prayer requests viewable" ON prayer_requests;
DROP POLICY IF EXISTS "Users manage own prayers" ON prayer_requests;

CREATE POLICY "Prayer requests viewable"
  ON prayer_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users manage own prayers"
  ON prayer_requests
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- PRAYER_INTERACTIONS
DROP POLICY IF EXISTS "Prayer interactions viewable" ON prayer_interactions;
DROP POLICY IF EXISTS "Users manage own prayer interactions" ON prayer_interactions;

CREATE POLICY "Prayer interactions viewable"
  ON prayer_interactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users manage own prayer interactions"
  ON prayer_interactions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- PODS
DROP POLICY IF EXISTS "Pods viewable" ON pods;
DROP POLICY IF EXISTS "Users create pods" ON pods;
DROP POLICY IF EXISTS "Pod admins update" ON pods;

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

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users manage own notifications" ON notifications;
CREATE POLICY "Users manage own notifications"
  ON notifications
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- NOTIFICATION_PREFERENCES
DROP POLICY IF EXISTS "Users manage own preferences" ON notification_preferences;
CREATE POLICY "Users manage own preferences"
  ON notification_preferences
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- PUSH_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- SCHEDULED_NOTIFICATIONS
DROP POLICY IF EXISTS "Users view own scheduled" ON scheduled_notifications;
CREATE POLICY "Users view own scheduled"
  ON scheduled_notifications
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- POD_MESSAGES
DROP POLICY IF EXISTS "Pod members view messages" ON pod_messages;
DROP POLICY IF EXISTS "Pod members send messages" ON pod_messages;

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

-- USER_FOLLOWS
DROP POLICY IF EXISTS "Follows viewable" ON user_follows;
DROP POLICY IF EXISTS "Users manage own follows" ON user_follows;

CREATE POLICY "Follows viewable"
  ON user_follows
  FOR SELECT
  USING (true);

CREATE POLICY "Users manage own follows"
  ON user_follows
  FOR ALL
  USING ((select auth.uid()) = follower_id)
  WITH CHECK ((select auth.uid()) = follower_id);

-- POD_EVENT_RSVPS
DROP POLICY IF EXISTS "Pod members manage RSVPs" ON pod_event_rsvps;
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

-- COMMUNITY_POST_SAVES
DROP POLICY IF EXISTS "Users manage own saves" ON community_post_saves;
CREATE POLICY "Users manage own saves"
  ON community_post_saves
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- POD_MEMBERS
DROP POLICY IF EXISTS "Pod members viewable" ON pod_members;
DROP POLICY IF EXISTS "Users join pods" ON pod_members;
DROP POLICY IF EXISTS "Users leave own pods" ON pod_members;
DROP POLICY IF EXISTS "Pod admins remove members" ON pod_members;

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

-- HABITS
DROP POLICY IF EXISTS "Users manage own habits" ON habits;
CREATE POLICY "Users manage own habits"
  ON habits
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- HABIT_LOGS
DROP POLICY IF EXISTS "Users manage own habit logs" ON habit_logs;
CREATE POLICY "Users manage own habit logs"
  ON habit_logs
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- WEEKLY_REVIEWS
DROP POLICY IF EXISTS "Users manage own reviews" ON weekly_reviews;
CREATE POLICY "Users manage own reviews"
  ON weekly_reviews
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- HABIT_INSIGHTS
DROP POLICY IF EXISTS "Users view own insights" ON habit_insights;
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

-- GOALS
DROP POLICY IF EXISTS "Users manage own goals" ON goals;
CREATE POLICY "Users manage own goals"
  ON goals
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- GOAL_LOGS
DROP POLICY IF EXISTS "Users manage own goal logs" ON goal_logs;
CREATE POLICY "Users manage own goal logs"
  ON goal_logs
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- USER_ACHIEVEMENTS
DROP POLICY IF EXISTS "Users view own achievements" ON user_achievements;
CREATE POLICY "Users view own achievements"
  ON user_achievements
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- COMMUNITY_POST_MEDIA
DROP POLICY IF EXISTS "Post owners manage media" ON community_post_media;
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

-- COMMUNITY_POST_SHARES
DROP POLICY IF EXISTS "Users manage own shares" ON community_post_shares;
CREATE POLICY "Users manage own shares"
  ON community_post_shares
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- COMMUNITY_POST_MENTIONS
DROP POLICY IF EXISTS "Post owners mention users" ON community_post_mentions;
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

-- PROFILES
DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;

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

-- MEAL_PLANS
DROP POLICY IF EXISTS "Users manage own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Admins view all meal plans" ON meal_plans;

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

-- PAYMENTS
DROP POLICY IF EXISTS "Users view own payments" ON payments;
DROP POLICY IF EXISTS "Admins view all payments" ON payments;

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

-- RECIPE_USAGE
DROP POLICY IF EXISTS "Users manage own usage" ON recipe_usage;
DROP POLICY IF EXISTS "Admins view all usage" ON recipe_usage;

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

-- USER_STATS
DROP POLICY IF EXISTS "Users manage own stats" ON user_stats;
DROP POLICY IF EXISTS "Admins view all stats" ON user_stats;

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

-- WATER_LOGS
DROP POLICY IF EXISTS "Users manage own water logs" ON water_logs;
DROP POLICY IF EXISTS "Admins view all water logs" ON water_logs;

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

-- DEVOTIONAL_PROGRESS
DROP POLICY IF EXISTS "Users manage own progress" ON devotional_progress;
DROP POLICY IF EXISTS "Admins view all progress" ON devotional_progress;

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
