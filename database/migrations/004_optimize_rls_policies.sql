-- ============================================
-- OPTIMIZE RLS POLICIES FOR PERFORMANCE
-- ============================================
-- This migration fixes two types of performance issues:
-- 1. Auth RLS Initialization Plan: Wraps auth.uid() in (select auth.uid()) 
--    to prevent re-evaluation for each row
-- 2. Multiple Permissive Policies: Consolidates duplicate policies into 
--    single policies per action

-- ============================================
-- PROFILES TABLE - Consolidated Policies
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

-- Create optimized consolidated policies
CREATE POLICY "Users can manage their own profile" 
  ON profiles 
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================
-- USER STATS TABLE - Consolidated Policies
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can manage their own stats" ON user_stats;

-- Create optimized consolidated policy
CREATE POLICY "Users can manage their own stats" 
  ON user_stats 
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- DEVOTIONALS TABLE - Optimized Policy
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Devotionals are viewable by authenticated users" ON devotionals;

-- Create optimized policy
CREATE POLICY "Devotionals are viewable by authenticated users" 
  ON devotionals FOR SELECT 
  USING ((select auth.role()) = 'authenticated');

-- ============================================
-- DEVOTIONAL PROGRESS TABLE - Optimized Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own progress" ON devotional_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON devotional_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON devotional_progress;

-- Create optimized policies with subqueries
CREATE POLICY "Users can view own progress" 
  ON devotional_progress FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress" 
  ON devotional_progress FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own progress" 
  ON devotional_progress FOR UPDATE 
  USING ((select auth.uid()) = user_id);

-- ============================================
-- SAVED RECIPES TABLE - Optimized Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON saved_recipes;

-- Create optimized policies with subqueries
CREATE POLICY "Users can view own recipes" 
  ON saved_recipes FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own recipes" 
  ON saved_recipes FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own recipes" 
  ON saved_recipes FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own recipes" 
  ON saved_recipes FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- ============================================
-- DAILY CHALLENGES TABLE - Optimized Policy
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Challenges are viewable by authenticated users" ON daily_challenges;

-- Create optimized policy
CREATE POLICY "Challenges are viewable by authenticated users" 
  ON daily_challenges FOR SELECT 
  USING ((select auth.role()) = 'authenticated');

-- ============================================
-- CHALLENGE COMPLETIONS TABLE - Optimized Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own completions" ON challenge_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON challenge_completions;

-- Create optimized policies with subqueries
CREATE POLICY "Users can view own completions" 
  ON challenge_completions FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own completions" 
  ON challenge_completions FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- RECIPES TABLE (if exists separately)
-- ============================================
-- Note: This handles the case where a separate 'recipes' table exists
-- The warnings mention this table, so we'll create policies for it

-- Check if recipes table exists and drop/create policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recipes') THEN
    -- Drop existing policies
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their own recipes" ON recipes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view recipes" ON recipes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert recipes" ON recipes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update recipes" ON recipes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete recipes" ON recipes';
    
    -- Create optimized policy
    EXECUTE 'CREATE POLICY "Users can manage their own recipes" 
      ON recipes 
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id)';
  END IF;
END $$;
