-- ============================================
-- COMMUNITY TABLES MIGRATION
-- ============================================
-- Creates tables for community features:
-- - community_posts (feed posts)
-- - post_likes
-- - post_comments
-- - prayer_requests
-- - prayer_interactions
-- - pods (accountability groups)
-- - pod_members
-- - pod_messages (optional for pod chat)

-- ============================================
-- COMMUNITY POSTS (Feed)
-- ============================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'testimony', 'encouragement', 'question', 'scripture')),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POST LIKES
-- ============================================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- POST COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRAYER REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('health', 'family', 'work', 'spiritual', 'relationships', 'financial', 'general', 'other')),
  is_anonymous BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  answered_testimony TEXT,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRAYER INTERACTIONS (Prayed for this)
-- ============================================
CREATE TABLE IF NOT EXISTS prayer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prayer_request_id, user_id)
);

-- ============================================
-- ACCOUNTABILITY PODS
-- ============================================
CREATE TABLE IF NOT EXISTS pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  focus TEXT DEFAULT 'general' CHECK (focus IN ('prayer', 'fitness', 'nutrition', 'scripture', 'fasting', 'general')),
  is_private BOOLEAN DEFAULT false,
  invite_code TEXT UNIQUE,
  max_members INTEGER DEFAULT 12,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POD MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS pod_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES pods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'co-leader', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pod_id, user_id)
);

-- ============================================
-- POD MESSAGES (for pod chat)
-- ============================================
CREATE TABLE IF NOT EXISTS pod_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES pods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'prayer', 'encouragement', 'check-in')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_user ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created ON prayer_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prayer_interactions_prayer ON prayer_interactions(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_user ON prayer_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_pods_private ON pods(is_private);
CREATE INDEX IF NOT EXISTS idx_pods_focus ON pods(focus);

CREATE INDEX IF NOT EXISTS idx_pod_members_pod ON pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_user ON pod_members(user_id);

CREATE INDEX IF NOT EXISTS idx_pod_messages_pod ON pod_messages(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_messages_created ON pod_messages(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_messages ENABLE ROW LEVEL SECURITY;

-- COMMUNITY_POSTS policies
CREATE POLICY "Users can view non-hidden posts" ON community_posts
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Users can create their own posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- POST_LIKES policies
CREATE POLICY "Anyone can view likes" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can add likes" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their likes" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- POST_COMMENTS policies
CREATE POLICY "Users can view non-hidden comments" ON post_comments
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- PRAYER_REQUESTS policies
CREATE POLICY "Users can view public prayers" ON prayer_requests
  FOR SELECT USING (is_private = false OR auth.uid() = user_id);

CREATE POLICY "Users can create prayer requests" ON prayer_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayers" ON prayer_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayers" ON prayer_requests
  FOR DELETE USING (auth.uid() = user_id);

-- PRAYER_INTERACTIONS policies
CREATE POLICY "Anyone can view prayer interactions" ON prayer_interactions
  FOR SELECT USING (true);

CREATE POLICY "Users can add prayer interactions" ON prayer_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their prayer interactions" ON prayer_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- PODS policies
CREATE POLICY "Users can view public pods" ON pods
  FOR SELECT USING (
    is_private = false 
    OR created_by = auth.uid() 
    OR EXISTS (SELECT 1 FROM pod_members WHERE pod_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create pods" ON pods
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Pod creators can update their pods" ON pods
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Pod creators can delete their pods" ON pods
  FOR DELETE USING (auth.uid() = created_by);

-- POD_MEMBERS policies
CREATE POLICY "Pod members are visible to other members" ON pod_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pod_members pm WHERE pm.pod_id = pod_id AND pm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM pods p WHERE p.id = pod_id AND p.is_private = false)
  );

CREATE POLICY "Users can join pods" ON pod_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave pods" ON pod_members
  FOR DELETE USING (auth.uid() = user_id);

-- POD_MESSAGES policies
CREATE POLICY "Pod members can view messages" ON pod_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pod_members WHERE pod_id = pod_messages.pod_id AND user_id = auth.uid())
  );

CREATE POLICY "Pod members can send messages" ON pod_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM pod_members WHERE pod_id = pod_messages.pod_id AND user_id = auth.uid())
  );

-- ============================================
-- TRIGGERS FOR COUNTS
-- ============================================

-- Update likes_count on post_likes insert/delete
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update comments_count on post_comments insert/delete
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON post_comments;
CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update prayer_count on prayer_interactions insert/delete
CREATE OR REPLACE FUNCTION update_prayer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests SET prayer_count = prayer_count + 1 WHERE id = NEW.prayer_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests SET prayer_count = prayer_count - 1 WHERE id = OLD.prayer_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_prayer_count ON prayer_interactions;
CREATE TRIGGER trigger_update_prayer_count
  AFTER INSERT OR DELETE ON prayer_interactions
  FOR EACH ROW EXECUTE FUNCTION update_prayer_count();

-- ============================================
-- Add community_visible to profiles if not exists
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'community_visible'
  ) THEN
    ALTER TABLE profiles ADD COLUMN community_visible BOOLEAN DEFAULT true;
  END IF;
END $$;
