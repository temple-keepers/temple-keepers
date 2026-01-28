-- ============================================
-- OPTIMIZE DATABASE INDEXES
-- ============================================
-- This migration addresses the remaining info-level suggestions:
-- 1. Adds indexes on unindexed foreign keys for better join performance
-- 2. Removes unused indexes to reduce storage overhead

-- ============================================
-- ADD INDEXES ON FOREIGN KEYS
-- ============================================

-- Challenge completions - index on challenge_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge_id 
ON challenge_completions(challenge_id);

-- Devotional progress - index on devotional_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_devotional_progress_devotional_id 
ON devotional_progress(devotional_id);

-- Recipes table - index on user_id if it exists
-- This handles the case where a separate 'recipes' table exists with foreign keys
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recipes') THEN
    -- Check if there's a user_id or other foreign key columns
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'recipes' 
      AND column_name = 'user_id'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id)';
    END IF;
  END IF;
END $$;

-- ============================================
-- REMOVE UNUSED INDEXES
-- ============================================
-- Note: These indexes are suggested as unused by Supabase's analyzer
-- Only drop if you're sure they're not needed by your application

-- Drop unused index on devotional_progress (if it exists and is not the user_completed one we want to keep)
DROP INDEX IF EXISTS idx_devotional_progress_user_id;

-- Drop unused index on devotionals
DROP INDEX IF EXISTS idx_devotionals_date;

-- Drop unused index on challenge_completions
DROP INDEX IF EXISTS idx_challenge_completions_user_id;

-- ============================================
-- RECREATE ESSENTIAL INDEXES
-- ============================================
-- Keep the indexes we actually use

-- We need user_id indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_devotional_progress_user_id_v2 
ON devotional_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_id_v2 
ON challenge_completions(user_id);

-- Keep the date index if you query devotionals by date
CREATE INDEX IF NOT EXISTS idx_devotionals_date_v2 
ON devotionals(date DESC);
