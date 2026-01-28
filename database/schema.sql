-- ============================================
-- TEMPLE KEEPERS DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  health_goals TEXT[] DEFAULT '{}',
  dietary_preferences TEXT[] DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{"daily_devotional": true, "weekly_summary": true, "recipe_suggestions": true}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- USER STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  streak_days INTEGER DEFAULT 0,
  devotionals_completed INTEGER DEFAULT 0,
  recipes_saved INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- User stats policies
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
CREATE POLICY "Users can view own stats" 
  ON user_stats FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
CREATE POLICY "Users can update own stats" 
  ON user_stats FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can insert own stats" 
  ON user_stats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DEVOTIONALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS devotionals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  scripture TEXT NOT NULL,
  scripture_reference TEXT NOT NULL,
  reflection TEXT NOT NULL,
  prayer TEXT,
  action_step TEXT,
  affirmation TEXT,
  theme TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;

-- Devotionals policy (readable by all authenticated users)
DROP POLICY IF EXISTS "Devotionals are viewable by authenticated users" ON devotionals;
CREATE POLICY "Devotionals are viewable by authenticated users" 
  ON devotionals FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================
-- DEVOTIONAL PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS devotional_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  devotional_id UUID REFERENCES devotionals(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, devotional_id)
);

-- Enable RLS
ALTER TABLE devotional_progress ENABLE ROW LEVEL SECURITY;

-- Devotional progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON devotional_progress;
CREATE POLICY "Users can view own progress" 
  ON devotional_progress FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON devotional_progress;
CREATE POLICY "Users can insert own progress" 
  ON devotional_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON devotional_progress;
CREATE POLICY "Users can update own progress" 
  ON devotional_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- SAVED RECIPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] DEFAULT '{}',
  instructions TEXT[] DEFAULT '{}',
  scripture TEXT,
  scripture_reference TEXT,
  meditation TEXT,
  prep_time TEXT,
  cook_time TEXT,
  servings TEXT,
  nutrition_info JSONB,
  cuisine TEXT,
  meal_type TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Saved recipes policies
DROP POLICY IF EXISTS "Users can view own recipes" ON saved_recipes;
CREATE POLICY "Users can view own recipes" 
  ON saved_recipes FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recipes" ON saved_recipes;
CREATE POLICY "Users can insert own recipes" 
  ON saved_recipes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recipes" ON saved_recipes;
CREATE POLICY "Users can update own recipes" 
  ON saved_recipes FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recipes" ON saved_recipes;
CREATE POLICY "Users can delete own recipes" 
  ON saved_recipes FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- DAILY CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'nutrition', 'movement', 'mindfulness', 'spiritual'
  points INTEGER DEFAULT 10,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Daily challenges policy
DROP POLICY IF EXISTS "Challenges are viewable by authenticated users" ON daily_challenges;
CREATE POLICY "Challenges are viewable by authenticated users" 
  ON daily_challenges FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================
-- CHALLENGE COMPLETIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;

-- Challenge completions policies
DROP POLICY IF EXISTS "Users can view own completions" ON challenge_completions;
CREATE POLICY "Users can view own completions" 
  ON challenge_completions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own completions" ON challenge_completions;
CREATE POLICY "Users can insert own completions" 
  ON challenge_completions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to auto-create profile and stats on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user completed something yesterday
  IF EXISTS (
    SELECT 1 FROM public.user_stats 
    WHERE user_id = NEW.user_id 
    AND last_activity_date = CURRENT_DATE - INTERVAL '1 day'
  ) THEN
    -- Continue streak
    UPDATE public.user_stats 
    SET streak_days = streak_days + 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF EXISTS (
    SELECT 1 FROM public.user_stats 
    WHERE user_id = NEW.user_id 
    AND last_activity_date = CURRENT_DATE
  ) THEN
    -- Same day, no change
    NULL;
  ELSE
    -- Reset streak
    UPDATE public.user_stats 
    SET streak_days = 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to increment devotional count
CREATE OR REPLACE FUNCTION public.increment_devotional_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_stats 
  SET devotionals_completed = devotionals_completed + 1,
      total_points = total_points + 10,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger for devotional completion
DROP TRIGGER IF EXISTS on_devotional_complete ON devotional_progress;
CREATE TRIGGER on_devotional_complete
  AFTER INSERT ON devotional_progress
  FOR EACH ROW EXECUTE FUNCTION public.increment_devotional_count();

-- Function to increment recipe count
CREATE OR REPLACE FUNCTION public.increment_recipe_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_stats 
  SET recipes_saved = recipes_saved + 1,
      total_points = total_points + 5,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger for recipe save
DROP TRIGGER IF EXISTS on_recipe_save ON saved_recipes;
CREATE TRIGGER on_recipe_save
  AFTER INSERT ON saved_recipes
  FOR EACH ROW EXECUTE FUNCTION public.increment_recipe_count();

-- Function to decrement recipe count on delete
CREATE OR REPLACE FUNCTION public.decrement_recipe_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_stats 
  SET recipes_saved = GREATEST(recipes_saved - 1, 0),
      updated_at = NOW()
  WHERE user_id = OLD.user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger for recipe delete
DROP TRIGGER IF EXISTS on_recipe_delete ON saved_recipes;
CREATE TRIGGER on_recipe_delete
  AFTER DELETE ON saved_recipes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_recipe_count();

-- ============================================
-- SEED DATA - Sample Devotionals
-- ============================================
INSERT INTO devotionals (title, scripture, scripture_reference, reflection, prayer, action_step, affirmation, theme, date) 
VALUES 
(
  'Your Body, God''s Temple',
  'Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.',
  '1 Corinthians 6:19-20 (NKJV)',
  'Today, we''re reminded of the profound truth that our bodies are not merely our own—they are sacred dwellings of God''s Holy Spirit. This isn''t meant to burden us with guilt, but to inspire us with purpose and dignity.

When we view our health choices through this lens, even the smallest acts of self-care become acts of worship. Choosing nourishing foods, getting adequate rest, moving our bodies, and managing stress are all ways we can honor the One who created us.

Consider how different your day might look if you approached each health decision as an opportunity to glorify God.',
  'Heavenly Father, thank You for this body You''ve given me. Help me to see it as the sacred gift it is—a temple of Your Holy Spirit. Give me wisdom in my choices today. In Jesus'' name, Amen.',
  'Take a 10-minute walk today while speaking with God. Let this simple act be your way of honoring your temple.',
  'My body is a temple of the Holy Spirit, and I choose to honor God in how I care for it today.',
  'general',
  CURRENT_DATE
),
(
  'Strength in Weakness',
  'But He said to me, "My grace is sufficient for you, for My power is made perfect in weakness." Therefore I will boast all the more gladly about my weaknesses, so that Christ''s power may rest on me.',
  '2 Corinthians 12:9 (NKJV)',
  'In our wellness journey, we often feel frustrated by our limitations—the days we can''t exercise, the moments we give in to unhealthy choices, the times our bodies don''t perform as we wish.

Yet Paul reminds us that God''s power shines brightest through our weaknesses. Our struggles aren''t signs of failure; they''re opportunities for grace. When we acknowledge we can''t do this alone, we open ourselves to divine strength.

Today, embrace your imperfections. Let them drive you not to discouragement, but to dependence on God.',
  'Lord, I confess my weaknesses to You today. I cannot do this journey alone. Fill me with Your strength and let Your power work through my limitations. Amen.',
  'When you face a health challenge today, pause and ask God for strength instead of relying solely on willpower.',
  'In my weakness, God''s power is made perfect. I embrace His grace for my wellness journey.',
  'strength',
  CURRENT_DATE + INTERVAL '1 day'
),
(
  'Nourishment for Body and Soul',
  'Jesus answered, "It is written: ''Man shall not live on bread alone, but on every word that comes from the mouth of God.''"',
  'Matthew 4:4 (NKJV)',
  'While we focus on physical nourishment—counting nutrients, choosing whole foods, staying hydrated—Jesus reminds us that true sustenance goes deeper. Our souls hunger just as our bodies do.

This doesn''t mean we neglect physical health. Rather, we recognize that complete wellness includes feeding our spirits with God''s Word. Just as we plan our meals, we can plan time to feast on Scripture.

Consider how you might balance both forms of nourishment today.',
  'Father, as I nourish my body today, remind me to also feed my soul with Your Word. Help me hunger for both physical and spiritual food. Amen.',
  'Before your next meal, read one verse of Scripture. Let it nourish your soul as the food nourishes your body.',
  'I nourish both my body and soul today, feeding on God''s Word alongside wholesome food.',
  'nutrition',
  CURRENT_DATE + INTERVAL '2 days'
);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')) DEFAULT 'admin',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies
-- Users can check if they are an admin (needed for auth checks)
DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;
CREATE POLICY "Users can check own admin status" 
  ON admin_users FOR SELECT 
  USING (user_id = auth.uid());

-- Admins can view all admin users
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
CREATE POLICY "Admins can view all admin users" 
  ON admin_users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Service role can insert admin users (for initial setup)
DROP POLICY IF EXISTS "Service role can insert admin users" ON admin_users;
CREATE POLICY "Service role can insert admin users" 
  ON admin_users FOR INSERT 
  WITH CHECK (true);

-- Super admins can insert admin users
DROP POLICY IF EXISTS "Super admins can insert admin users" ON admin_users;
CREATE POLICY "Super admins can insert admin users" 
  ON admin_users FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
CREATE POLICY "Super admins can update admin users" 
  ON admin_users FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can delete admin users" ON admin_users;
CREATE POLICY "Super admins can delete admin users" 
  ON admin_users FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_devotional_progress_user_id ON devotional_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_devotionals_date ON devotionals(date);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_id ON challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
