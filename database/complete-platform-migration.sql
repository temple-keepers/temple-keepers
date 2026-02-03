-- ================================================
-- TEMPLE KEEPERS PLATFORM - COMPLETE MIGRATION
-- ================================================
-- Run this ONCE in Supabase SQL Editor
-- This adds all new tables for Week 2+
-- ================================================

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS program_day_completions CASCADE;
DROP TABLE IF EXISTS program_enrollments CASCADE;
DROP TABLE IF EXISTS program_days CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS saved_recipes CASCADE;
DROP TABLE IF EXISTS meal_plan_days CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS shopping_lists CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS pod_posts CASCADE;
DROP TABLE IF EXISTS pod_challenges CASCADE;
DROP TABLE IF EXISTS pod_members CASCADE;
DROP TABLE IF EXISTS pods CASCADE;
DROP TABLE IF EXISTS weekly_themes CASCADE;
DROP TABLE IF EXISTS content_calendar CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications_sent CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS tier_features CASCADE;

-- ================================================
-- UPDATE PROFILES TABLE
-- ================================================
-- Add new fields to existing profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS dietary_preferences JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS health_goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

-- ================================================
-- PROGRAMS SYSTEM
-- ================================================

CREATE TABLE public.programs (
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
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.program_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  anchor_sentence TEXT,
  
  -- Scripture section
  scripture_reference TEXT,
  scripture_text TEXT,
  scripture_audio_url TEXT,
  
  -- Focus thought
  focus_thought TEXT,
  
  -- Prayer
  prayer_text TEXT,
  prayer_audio_url TEXT,
  
  -- Fasting (conditional)
  fasting_reminder TEXT,
  
  -- Reflection
  reflection_questions JSONB DEFAULT '[]'::jsonb,
  
  -- Action
  action_step TEXT,
  
  -- Completion
  completion_message TEXT,
  
  -- Linked content
  linked_recipes UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(program_id, day_number)
);

CREATE TABLE public.program_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  current_day INTEGER DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  fasting_type TEXT,
  status TEXT DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, program_id, start_date)
);

CREATE TABLE public.program_day_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  reflection_response JSONB DEFAULT '{}'::jsonb,
  action_completed BOOLEAN DEFAULT true,
  
  UNIQUE(enrollment_id, day_number)
);

-- ================================================
-- RECIPES SYSTEM
-- ================================================

CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Recipe content
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT[] DEFAULT '{}',
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  
  -- Dietary & Fasting
  dietary_tags TEXT[] DEFAULT '{}',
  fasting_compatible TEXT[] DEFAULT '{}',
  meal_type TEXT[] DEFAULT '{}',
  
  -- Spiritual integration
  scripture_reference TEXT,
  scripture_meditation TEXT,
  
  -- Media
  image_url TEXT,
  video_url TEXT,
  
  -- Admin
  source TEXT DEFAULT 'manual',
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.saved_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, recipe_id)
);

CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meal_plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  meal_type TEXT NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id),
  
  UNIQUE(meal_plan_id, day_of_week, meal_type)
);

CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES public.meal_plans(id),
  week_start DATE,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- HABITS SYSTEM
-- ================================================

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit completions stored in daily_log_entries
-- entry_type: 'habit_completion'
-- entry_data: { habit_id: UUID, completed: true }

-- ================================================
-- COMMUNITY PODS
-- ================================================

CREATE TABLE public.pods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  max_members INTEGER DEFAULT 8,
  is_private BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pod_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(pod_id, user_id)
);

CREATE TABLE public.pod_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pod_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- WEEKLY THEMES & CONTENT
-- ================================================

CREATE TABLE public.weekly_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  scripture TEXT,
  scripture_reference TEXT,
  focus_area TEXT,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(week_start)
);

CREATE TABLE public.content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  theme_id UUID REFERENCES public.weekly_themes(id),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- NOTIFICATIONS
-- ================================================

CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  
  morning_enabled BOOLEAN DEFAULT true,
  morning_time TIME DEFAULT '07:00',
  
  midday_enabled BOOLEAN DEFAULT true,
  midday_time TIME DEFAULT '12:00',
  
  evening_enabled BOOLEAN DEFAULT true,
  evening_time TIME DEFAULT '19:00',
  
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened BOOLEAN DEFAULT false
);

-- ================================================
-- FEATURE GATING
-- ================================================

CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  required_tier TEXT[] DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tier_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  limit_value INTEGER,
  
  UNIQUE(tier, feature_name)
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Programs (public read, admin write)
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published programs"
  ON public.programs FOR SELECT
  USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Admins can create programs"
  ON public.programs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update programs"
  ON public.programs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Program Days (public read, admin write)
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view program days"
  ON public.program_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = program_days.program_id
      AND programs.is_published = true
    )
  );

CREATE POLICY "Admins can manage program days"
  ON public.program_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enrollments (users only see their own)
ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON public.program_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create enrollments"
  ON public.program_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments"
  ON public.program_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- Completions
ALTER TABLE public.program_day_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON public.program_day_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.program_enrollments
      WHERE program_enrollments.id = program_day_completions.enrollment_id
      AND program_enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create completions"
  ON public.program_day_completions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.program_enrollments
      WHERE program_enrollments.id = program_day_completions.enrollment_id
      AND program_enrollments.user_id = auth.uid()
    )
  );

-- Recipes (public read, admin write)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published recipes"
  ON public.recipes FOR SELECT
  USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Admins can manage recipes"
  ON public.recipes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Saved Recipes
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved recipes"
  ON public.saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON public.saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete saved recipes"
  ON public.saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create habits"
  ON public.habits FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (SELECT COUNT(*) FROM public.habits WHERE user_id = auth.uid()) < 3
  );

CREATE POLICY "Users can update own habits"
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON public.habits FOR DELETE
  USING (auth.uid() = user_id);

-- Pods
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public pods"
  ON public.pods FOR SELECT
  USING (
    is_private = false OR
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pods.id
      AND pod_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pods"
  ON public.pods FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Leaders can update their pods"
  ON public.pods FOR UPDATE
  USING (auth.uid() = created_by);

-- Pod Members
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view pod members"
  ON public.pod_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = pod_members.pod_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join pods"
  ON public.pod_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Pod Posts
ALTER TABLE public.pod_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view pod posts"
  ON public.pod_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pod_posts.pod_id
      AND pod_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create posts"
  ON public.pod_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.pod_members
      WHERE pod_members.pod_id = pod_posts.pod_id
      AND pod_members.user_id = auth.uid()
    )
  );

-- Notification Preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification prefs"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification prefs"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Feature Flags (admin only)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX idx_programs_slug ON public.programs(slug);
CREATE INDEX idx_programs_published ON public.programs(is_published);
CREATE INDEX idx_program_days_program ON public.program_days(program_id, day_number);
CREATE INDEX idx_enrollments_user ON public.program_enrollments(user_id);
CREATE INDEX idx_enrollments_status ON public.program_enrollments(user_id, status);
CREATE INDEX idx_recipes_slug ON public.recipes(slug);
CREATE INDEX idx_recipes_published ON public.recipes(is_published);
CREATE INDEX idx_recipes_dietary ON public.recipes USING GIN(dietary_tags);
CREATE INDEX idx_recipes_fasting ON public.recipes USING GIN(fasting_compatible);
CREATE INDEX idx_habits_user ON public.habits(user_id);
CREATE INDEX idx_pods_private ON public.pods(is_private);
CREATE INDEX idx_pod_members_user ON public.pod_members(user_id);
CREATE INDEX idx_pod_posts_pod ON public.pod_posts(pod_id, created_at DESC);

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get user's current program day
CREATE OR REPLACE FUNCTION public.get_current_program_day(enrollment_id UUID)
RETURNS INTEGER AS $$
DECLARE
  enrollment RECORD;
  days_since_start INTEGER;
BEGIN
  SELECT * INTO enrollment
  FROM public.program_enrollments
  WHERE id = enrollment_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  days_since_start := CURRENT_DATE - enrollment.start_date;
  
  RETURN LEAST(days_since_start + 1, 
    (SELECT duration_days FROM public.programs WHERE id = enrollment.program_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- SEED INITIAL DATA
-- ================================================

-- Insert default feature flags
INSERT INTO public.feature_flags (feature_name, is_enabled, required_tier, description) VALUES
('community_pods', true, ARRAY['free', 'premium', 'pro'], 'Access to community pods'),
('meal_planner', false, ARRAY['pro'], 'Weekly meal planning feature'),
('recipe_library', true, ARRAY['free', 'premium', 'pro'], 'Access to recipe library'),
('ai_recipe_generation', true, ARRAY['free', 'premium', 'pro'], 'AI recipe generator'),
('programs', true, ARRAY['free', 'premium', 'pro'], 'Access to programs');

-- Insert tier limits
INSERT INTO public.tier_features (tier, feature_name, limit_value) VALUES
('free', 'max_programs', 1),
('free', 'max_recipes_saved', 10),
('free', 'max_ai_recipes_per_month', 3),
('premium', 'max_programs', 3),
('premium', 'max_recipes_saved', 50),
('premium', 'max_ai_recipes_per_month', 20),
('pro', 'max_programs', NULL), -- NULL = unlimited
('pro', 'max_recipes_saved', NULL),
('pro', 'max_ai_recipes_per_month', NULL);

-- ================================================
-- COMPLETE!
-- ================================================
-- All tables created with RLS enabled
-- Ready for Week 2 development
-- ================================================
