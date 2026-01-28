-- =============================================
-- Migration: Add Facebook-like Features
-- =============================================

-- 1. Add reaction types (instead of just likes)
CREATE TYPE reaction_type AS ENUM ('like', 'love', 'pray', 'celebrate', 'care', 'insightful');

-- 2. Update post_likes to support reactions
ALTER TABLE post_likes 
ADD COLUMN reaction reaction_type DEFAULT 'like';

-- 3. Add reactions to comments
ALTER TABLE post_comments 
ADD COLUMN reactions jsonb DEFAULT '{}';

-- 4. Add post editing timestamp
ALTER TABLE community_posts 
ADD COLUMN edited_at timestamptz,
ADD COLUMN edit_history jsonb DEFAULT '[]';

-- 5. Add multiple images support
CREATE TABLE community_post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL, -- 'image', 'video', 'gif'
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_post_media_post ON community_post_media(post_id);

-- 6. Add comment replies (nested comments)
ALTER TABLE post_comments
ADD COLUMN parent_comment_id uuid REFERENCES post_comments(id) ON DELETE CASCADE,
ADD COLUMN reply_count int DEFAULT 0;

-- Index for faster nested queries
CREATE INDEX idx_comments_parent ON post_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- 7. Add post sharing/resharing
CREATE TABLE community_post_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_comment text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_post_shares_post ON community_post_shares(post_id);
CREATE INDEX idx_post_shares_user ON community_post_shares(shared_by);

-- 8. Add member mentions/tags
CREATE TABLE community_post_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  mentioned_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, mentioned_user_id)
);

CREATE INDEX idx_post_mentions_post ON community_post_mentions(post_id);
CREATE INDEX idx_post_mentions_user ON community_post_mentions(mentioned_user_id);

-- 9. Add polls feature
CREATE TABLE community_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  question text NOT NULL,
  options jsonb NOT NULL, -- [{"id": "1", "text": "Option 1", "votes": 0}]
  multiple_choice boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE community_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES community_polls(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  option_ids text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX idx_poll_votes_poll ON community_poll_votes(poll_id);

-- 10. Add events feature for pods
CREATE TABLE pod_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id uuid REFERENCES pods(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  location text,
  is_online boolean DEFAULT false,
  meeting_link text,
  max_attendees int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE pod_event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES pod_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('going', 'maybe', 'not_going')) DEFAULT 'going',
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_pod_events_pod ON pod_events(pod_id);
CREATE INDEX idx_event_rsvps_event ON pod_event_rsvps(event_id);

-- 11. Add post bookmarks/saves
CREATE TABLE community_post_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_saves_user ON community_post_saves(user_id);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Post Media
ALTER TABLE community_post_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post media"
  ON community_post_media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Post owners can add media"
  ON community_post_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Post owners can delete media"
  ON community_post_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Post Shares
ALTER TABLE community_post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shares"
  ON community_post_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can share posts"
  ON community_post_shares FOR INSERT
  TO authenticated
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can delete their shares"
  ON community_post_shares FOR DELETE
  TO authenticated
  USING (shared_by = auth.uid());

-- Post Mentions
ALTER TABLE community_post_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mentions"
  ON community_post_mentions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Post owners can mention users"
  ON community_post_mentions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Polls
ALTER TABLE community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls"
  ON community_polls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Post owners can create polls"
  ON community_polls FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view poll votes"
  ON community_poll_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote on polls"
  ON community_poll_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their votes"
  ON community_poll_votes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Pod Events
ALTER TABLE pod_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pod members can view events"
  ON pod_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_id = pod_events.pod_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Pod admins can create events"
  ON pod_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pods
      WHERE id = pod_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Event creators can update events"
  ON pod_events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Event creators can delete events"
  ON pod_events FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Pod members can view RSVPs"
  ON pod_event_rsvps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pod_events pe
      JOIN pod_members pm ON pe.pod_id = pm.pod_id
      WHERE pe.id = event_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their RSVPs"
  ON pod_event_rsvps FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Post Saves/Bookmarks
ALTER TABLE community_post_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saves"
  ON community_post_saves FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can save posts"
  ON community_post_saves FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unsave posts"
  ON community_post_saves FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get reaction counts for a post
CREATE OR REPLACE FUNCTION get_post_reaction_counts(post_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT jsonb_object_agg(reaction, count)
    FROM (
      SELECT reaction, COUNT(*)::int as count
      FROM post_likes
      WHERE post_id = post_uuid
      GROUP BY reaction
    ) reactions
  );
END;
$$;

-- Function to increment reply count on parent comment
CREATE OR REPLACE FUNCTION increment_comment_reply_count()
RETURNS trigger
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

CREATE TRIGGER trigger_increment_reply_count
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_comment_reply_count();

-- Function to decrement reply count when reply is deleted
CREATE OR REPLACE FUNCTION decrement_comment_reply_count()
RETURNS trigger
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

CREATE TRIGGER trigger_decrement_reply_count
  AFTER DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_comment_reply_count();
