-- ================================================
-- TEMPLE KEEPERS PLATFORM - COMPLETE MIGRATION
-- ================================================
-- Run this in Supabase SQL Editor
-- This builds on your existing tables (profiles, daily_logs, daily_log_entries)
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- UPDATE EXISTING TABLES
-- ================================================

-- Add new columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS dietary_preferences JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS health_goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

-- Add check constraint for role
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'coach'));

-- Add check constraint for tier
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_tier_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_tier_check 
CHECK (tier IN ('free', 'premium', 'pro'));

-- ================================================
-- PROGRAMS & CONTENT
-- ================================================

-- Programs (14-Day Prayer Fast, future programs)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  program_type TEXT DEFAULT 'fasting',
  includes_fasting BOOLEAN DEFAULT false,
  fasting_types TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  is_evergreen BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT programs_type_check 
  CHECK (program_type IN ('fasting', 'challenge', 'course'))
);

-- Program Days (each day's content - 8 sections)
CREATE TABLE IF NOT EXISTS program_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  anchor_sentence TEXT,
  
  -- Section 2: Scripture
  scripture_reference TEXT,
  scripture_text TEXT,
  scripture_audio_url TEXT,
  
  -- Section 3: Focus Thought
  focus_thought TEXT,
  
  -- Section 4: Prayer Prompt
  prayer_text TEXT,
  prayer_audio_url TEXT,
  
  -- Section 5: Fasting Reminder (conditional)
  fasting_reminder TEXT,
  
  -- Section 6: Reflection Questions
  reflection_questions JSONB DEFAULT '[]'::jsonb,
  
  -- Section 7: Action Step
  action_step TEXT,
  
  -- Section 8: Completion
  completion_message TEXT,
  
  -- Linked resources
  linked_recipes UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(program_id, day_number)
);

-- User Program Enrollments
CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_day INTEGER DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  fasting_type TEXT,
  status TEXT DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT enrollment_status_check 
  CHECK (status IN ('active', 'completed', 'paused')),
  
  CONSTRAINT enrollment_fasting_type_check
  CHECK (fasting_type IS NULL OR fasting_type IN ('daylight', 'daniel', 'media'))
);

-- Index for finding active enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user_active 
ON program_enrollments(user_id, status) 
WHERE status = 'active';

-- Daily Program Completions
CREATE TABLE IF NOT EXISTS program_day_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES program_enrollments(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  reflection_response JSONB DEFAULT '{}'::jsonb,
  action_completed BOOLEAN DEFAULT true,
  
  UNIQUE(enrollment_id, day_number)
);

-- ================================================
-- RECIPES
-- ================================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Recipe content
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT[] DEFAULT '{}',
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 2,
  
  -- Dietary & Fasting
  dietary_tags TEXT[] DEFAULT '{}',
  fasting_compatible TEXT[] DEFAULT '{}',
  meal_type TEXT[] DEFAULT '{}',
  
  -- Faith integration
  scripture_reference TEXT,
  scripture_meditation TEXT,
  
  -- Media
  image_url TEXT,
  video_url TEXT,
  
  -- Admin
  source TEXT DEFAULT 'manual',
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT recipe_source_check 
  CHECK (source IN ('ai_generated', 'pdf_upload', 'manual'))
);

-- Index for recipe searches
CREATE INDEX IF NOT EXISTS idx_recipes_published 
ON recipes(is_published) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_recipes_dietary 
ON recipes USING GIN(dietary_tags);

CREATE INDEX IF NOT EXISTS idx_recipes_fasting 
ON recipes USING GIN(fasting_compatible);

-- User Saved Recipes
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, recipe_id)
);

-- ================================================
-- HABITS
-- ================================================

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '✓',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user habits
CREATE INDEX IF NOT EXISTS idx_habits_user 
ON habits(user_id);

-- Function to enforce max 3 habits per user
CREATE OR REPLACE FUNCTION check_habit_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM habits WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Users can only have 3 habits maximum';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce habit limit
DROP TRIGGER IF EXISTS enforce_habit_limit ON habits;
CREATE TRIGGER enforce_habit_limit
  BEFORE INSERT ON habits
  FOR EACH ROW
  EXECUTE FUNCTION check_habit_limit();

-- ================================================
-- COMMUNITY PODS
-- ================================================

CREATE TABLE IF NOT EXISTS pods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  max_members INTEGER DEFAULT 8,
  is_private BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pod Members with Roles
CREATE TABLE IF NOT EXISTS pod_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT pod_member_role_check 
  CHECK (role IN ('leader', 'moderator', 'member')),
  
  UNIQUE(pod_id, user_id)
);

-- Pod Posts/Feed
CREATE TABLE IF NOT EXISTS pod_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for pod posts
CREATE INDEX IF NOT EXISTS idx_pod_posts_pod 
ON pod_posts(pod_id, created_at DESC);

-- Pod Challenges (leaders can assign programs)
CREATE TABLE IF NOT EXISTS pod_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  start_date DATE DEFAULT CURRENT_DATE,
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- WEEKLY THEMES
-- ================================================

CREATE TABLE IF NOT EXISTS weekly_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  scripture TEXT,
  scripture_reference TEXT,
  focus_area TEXT,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(week_start)
);

-- Index for current theme
CREATE INDEX IF NOT EXISTS idx_weekly_themes_current 
ON weekly_themes(week_start) 
WHERE is_active = true;

-- ================================================
-- NOTIFICATIONS
-- ================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Daily touchpoints
  morning_enabled BOOLEAN DEFAULT true,
  morning_time TIME DEFAULT '07:00',
  
  midday_enabled BOOLEAN DEFAULT true,
  midday_time TIME DEFAULT '12:00',
  
  evening_enabled BOOLEAN DEFAULT true,
  evening_time TIME DEFAULT '19:00',
  
  -- Channels
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- FEATURE GATING & ADMIN
-- ================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  required_tier TEXT[] DEFAULT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tier_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  limit_value INTEGER,
  
  CONSTRAINT tier_features_tier_check 
  CHECK (tier IN ('free', 'premium', 'pro')),
  
  UNIQUE(tier, feature_name)
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on new tables
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_day_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_features ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES - Programs
-- ================================================

-- Programs: Anyone can view published
CREATE POLICY "Anyone can view published programs"
  ON programs FOR SELECT
  USING (is_published = true);

-- Programs: Admin can do everything
CREATE POLICY "Admin can manage programs"
  ON programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Program Days: Anyone can view published program days
CREATE POLICY "Anyone can view published program days"
  ON program_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_days.program_id
      AND programs.is_published = true
    )
  );

-- Program Days: Admin can manage
CREATE POLICY "Admin can manage program days"
  ON program_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- RLS POLICIES - Enrollments
-- ================================================

-- Users can view own enrollments
CREATE POLICY "Users can view own enrollments"
  ON program_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create own enrollments
CREATE POLICY "Users can create own enrollments"
  ON program_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own enrollments
CREATE POLICY "Users can update own enrollments"
  ON program_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES - Completions
-- ================================================

-- Users can view own completions
CREATE POLICY "Users can view own completions"
  ON program_day_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_enrollments
      WHERE program_enrollments.id = program_day_completions.enrollment_id
      AND program_enrollments.user_id = auth.uid()
    )
  );

-- Users can create own completions
CREATE POLICY "Users can create own completions"
  ON program_day_completions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM program_enrollments
      WHERE program_enrollments.id = program_day_completions.enrollment_id
      AND program_enrollments.user_id = auth.uid()
    )
  );

-- ================================================
-- RLS POLICIES - Recipes
-- ================================================

-- Anyone can view published recipes
CREATE POLICY "Anyone can view published recipes"
  ON recipes FOR SELECT
  USING (is_published = true);

-- Admin can manage recipes
CREATE POLICY "Admin can manage recipes"
  ON recipes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view own saved recipes
CREATE POLICY "Users can view own saved recipes"
  ON saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save recipes
CREATE POLICY "Users can save recipes"
  ON saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own saved recipes
CREATE POLICY "Users can delete own saved recipes"
  ON saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES - Habits
-- ================================================

-- Users can view own habits
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create own habits
CREATE POLICY "Users can create own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own habits
CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own habits
CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES - Pods
-- ================================================

-- Users can view pods they're members of
CREATE POLICY "Users can view their pods"
  ON pods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = pods.id
      AND pod_members.user_id = auth.uid()
    )
    OR is_private = false
  );

-- Users can create pods
CREATE POLICY "Users can create pods"
  ON pods FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Pod creators can update their pods
CREATE POLICY "Pod creators can update pods"
  ON pods FOR UPDATE
  USING (auth.uid() = created_by);

-- Pod members policies
CREATE POLICY "Users can view pod members"
  ON pod_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Pod leaders can manage members"
  ON pod_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'leader'
    )
  );

-- Pod posts policies
CREATE POLICY "Pod members can view posts"
  ON pod_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = pod_posts.pod_id
      AND pod_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Pod members can create posts"
  ON pod_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = pod_posts.pod_id
      AND pod_members.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

-- ================================================
-- RLS POLICIES - Themes & Admin
-- ================================================

-- Anyone can view active themes
CREATE POLICY "Anyone can view active themes"
  ON weekly_themes FOR SELECT
  USING (is_active = true);

-- Admin can manage themes
CREATE POLICY "Admin can manage themes"
  ON weekly_themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view own notification preferences
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update own notification preferences
CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can view feature flags
CREATE POLICY "Anyone can view feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

-- Admin can manage feature flags
CREATE POLICY "Admin can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can view tier features
CREATE POLICY "Anyone can view tier features"
  ON tier_features FOR SELECT
  TO authenticated
  USING (true);

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to get current program day for user
CREATE OR REPLACE FUNCTION get_current_program_day(p_enrollment_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_start_date DATE;
  v_days_elapsed INTEGER;
  v_duration INTEGER;
BEGIN
  SELECT 
    pe.start_date,
    EXTRACT(DAY FROM CURRENT_DATE - pe.start_date)::INTEGER,
    p.duration_days
  INTO v_start_date, v_days_elapsed, v_duration
  FROM program_enrollments pe
  JOIN programs p ON p.id = pe.program_id
  WHERE pe.id = p_enrollment_id;
  
  -- Return current day (capped at duration)
  RETURN LEAST(v_days_elapsed + 1, v_duration);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_current_program_day(UUID) TO authenticated;

-- Function to check if user can access feature
CREATE OR REPLACE FUNCTION can_access_feature(p_feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_tier TEXT;
  v_required_tiers TEXT[];
  v_is_enabled BOOLEAN;
BEGIN
  -- Get user's tier
  SELECT tier INTO v_user_tier
  FROM profiles
  WHERE id = auth.uid();
  
  -- Get feature requirements
  SELECT is_enabled, required_tier
  INTO v_is_enabled, v_required_tiers
  FROM feature_flags
  WHERE feature_name = p_feature_name;
  
  -- If feature doesn't exist or is disabled, return false
  IF NOT FOUND OR v_is_enabled = false THEN
    RETURN false;
  END IF;
  
  -- If no tier restrictions, everyone can access
  IF v_required_tiers IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if user's tier is in required tiers
  RETURN v_user_tier = ANY(v_required_tiers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION can_access_feature(TEXT) TO authenticated;

-- ================================================
-- UPDATED_AT TRIGGERS
-- ================================================

-- Reuse existing update_updated_at function
-- Add triggers for new tables

DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_program_days_updated_at ON program_days;
CREATE TRIGGER update_program_days_updated_at
  BEFORE UPDATE ON program_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_pod_posts_updated_at ON pod_posts;
CREATE TRIGGER update_pod_posts_updated_at
  BEFORE UPDATE ON pod_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ================================================
-- INITIAL DATA
-- ================================================

-- Insert default feature flags
INSERT INTO feature_flags (feature_name, is_enabled, required_tier, description)
VALUES 
  ('community_pods', true, ARRAY['premium', 'pro'], 'Access to community accountability pods'),
  ('meal_planner', true, ARRAY['pro'], 'Weekly meal planning calendar'),
  ('unlimited_programs', true, ARRAY['pro'], 'Enroll in unlimited programs'),
  ('ai_recipe_generator', true, ARRAY['free', 'premium', 'pro'], 'AI-powered recipe generation')
ON CONFLICT (feature_name) DO NOTHING;

-- Insert tier feature limits
INSERT INTO tier_features (tier, feature_name, limit_value)
VALUES 
  ('free', 'max_programs', 1),
  ('free', 'max_recipes_saved', 10),
  ('free', 'max_ai_recipes_per_month', 3),
  ('premium', 'max_programs', 3),
  ('premium', 'max_recipes_saved', 50),
  ('premium', 'max_ai_recipes_per_month', 20),
  ('pro', 'max_programs', NULL), -- unlimited
  ('pro', 'max_recipes_saved', NULL), -- unlimited
  ('pro', 'max_ai_recipes_per_month', NULL) -- unlimited
ON CONFLICT (tier, feature_name) DO NOTHING;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check all tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
  'programs', 'program_days', 'program_enrollments', 'program_day_completions',
  'recipes', 'saved_recipes', 'habits', 'pods', 'pod_members', 'pod_posts',
  'pod_challenges', 'weekly_themes', 'notification_preferences',
  'feature_flags', 'tier_features'
)
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'programs', 'program_days', 'program_enrollments', 'program_day_completions',
  'recipes', 'saved_recipes', 'habits', 'pods', 'pod_members', 'pod_posts'
)
ORDER BY tablename;

-- ================================================
-- MIGRATION COMPLETE!
-- ================================================
-- You now have:
-- ✅ Program management system
-- ✅ Recipe system with dietary filtering
-- ✅ Habit tracking
-- ✅ Community pods
-- ✅ Feature gating
-- ✅ All RLS policies
-- ✅ Helper functions
-- ================================================
