-- ============================================
-- Fix Security Warnings - Search Path Mutable
-- ============================================

-- Fix create_notification_preferences function
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix notify_push_on_insert function
CREATE OR REPLACE FUNCTION notify_push_on_insert()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function is called by trigger to send push notifications
  -- The actual push logic is handled by Edge Functions
  RETURN NEW;
END;
$$;

-- Fix update_post_likes_count function
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_post_comments_count function
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_prayers_count function
CREATE OR REPLACE FUNCTION update_prayers_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests
    SET prayers_count = prayers_count + 1
    WHERE id = NEW.prayer_request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests
    SET prayers_count = GREATEST(0, prayers_count - 1)
    WHERE id = OLD.prayer_request_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix is_pod_member function
DROP FUNCTION IF EXISTS is_pod_member(uuid, uuid);
CREATE FUNCTION is_pod_member(pod_id uuid, user_id uuid)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pod_members
    WHERE pod_members.pod_id = is_pod_member.pod_id
    AND pod_members.user_id = is_pod_member.user_id
  );
END;
$$;

-- Fix update_habit_streak function
CREATE OR REPLACE FUNCTION update_habit_streak()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  last_log_date date;
  current_streak int;
  best_streak int;
BEGIN
  -- Get the habit's current streak values
  SELECT habits.current_streak, habits.best_streak
  INTO current_streak, best_streak
  FROM habits
  WHERE habits.id = NEW.habit_id;

  -- Get the most recent log date before this one
  SELECT habit_logs.log_date
  INTO last_log_date
  FROM habit_logs
  WHERE habit_logs.habit_id = NEW.habit_id
  AND habit_logs.log_date < NEW.log_date
  AND habit_logs.is_completed = true
  ORDER BY habit_logs.log_date DESC
  LIMIT 1;

  -- Calculate new streak
  IF last_log_date IS NULL THEN
    -- First completion
    current_streak := 1;
  ELSIF NEW.log_date = last_log_date + 1 THEN
    -- Consecutive day
    current_streak := current_streak + 1;
  ELSE
    -- Streak broken
    current_streak := 1;
  END IF;

  -- Update best streak if needed
  IF current_streak > best_streak THEN
    best_streak := current_streak;
  END IF;

  -- Update habit
  UPDATE habits
  SET 
    current_streak = update_habit_streak.current_streak,
    best_streak = update_habit_streak.best_streak,
    total_completions = total_completions + 1,
    updated_at = NOW()
  WHERE id = NEW.habit_id;

  RETURN NEW;
END;
$$;

-- Fix get_post_reaction_counts function
DROP FUNCTION IF EXISTS get_post_reaction_counts(uuid);
CREATE FUNCTION get_post_reaction_counts(post_id_param uuid)
RETURNS TABLE (
  reaction text,
  count bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    post_likes.reaction::text,
    COUNT(*)::bigint
  FROM post_likes
  WHERE post_likes.post_id = post_id_param
  GROUP BY post_likes.reaction;
END;
$$;

-- Fix increment_comment_reply_count function
CREATE OR REPLACE FUNCTION increment_comment_reply_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    UPDATE post_comments
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_comment_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix decrement_comment_reply_count function
CREATE OR REPLACE FUNCTION decrement_comment_reply_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.parent_comment_id IS NOT NULL THEN
    UPDATE post_comments
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.parent_comment_id;
  END IF;
  RETURN OLD;
END;
$$;

-- ============================================
-- Fix RLS Policy Warnings
-- ============================================

-- Fix challenge_days admin policy - should check for actual admin role
DROP POLICY IF EXISTS "Admins can manage challenge days" ON challenge_days;
CREATE POLICY "Admins can manage challenge days"
  ON challenge_days
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Fix challenges admin policy - should check for actual admin role
DROP POLICY IF EXISTS "Admins can manage challenges" ON challenges;
CREATE POLICY "Admins can manage challenges"
  ON challenges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Fix notifications system insert policy
-- Replace overly permissive policy with service role restriction
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Service role can create any notifications (for backend/edge functions)
CREATE POLICY "Service role can create notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Authenticated users can only create notifications for themselves (if needed for client-side)
CREATE POLICY "Users can create own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Additional Security Improvements
-- ============================================

-- Ensure all functions are properly secured
-- Add explicit SECURITY DEFINER where needed for privilege elevation
-- Use SECURITY INVOKER for functions that should run with caller's privileges

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION is_pod_member TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_reaction_counts TO authenticated;

-- Revoke public execute on sensitive functions
REVOKE EXECUTE ON FUNCTION create_notification_preferences FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION notify_push_on_insert FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION update_post_likes_count FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION update_post_comments_count FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION update_prayers_count FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION update_habit_streak FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_comment_reply_count FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION decrement_comment_reply_count FROM PUBLIC;
