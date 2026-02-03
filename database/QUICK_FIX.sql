-- RECIPES TABLE CREATION - Run this in Supabase SQL Editor
-- This creates everything needed for the recipe system

-- ============================================
-- 1. DROP OLD TABLES (if recreating from scratch)
-- ============================================
-- Uncomment these lines if you want to start fresh:
-- DROP TABLE IF EXISTS user_favorite_recipes CASCADE;
-- DROP TABLE IF EXISTS recipes CASCADE;

-- ============================================
-- 2. CREATE RECIPES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine TEXT, -- No constraint - allows any cuisine including Caribbean, African, etc.
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  total_time INTEGER, -- minutes
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  dietary_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ingredients JSONB NOT NULL DEFAULT '[]'::JSONB,
  instructions JSONB NOT NULL DEFAULT '[]'::JSONB,
  nutrition JSONB DEFAULT '{}'::JSONB,
  scripture JSONB DEFAULT NULL,
  tips TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CREATE FAVORITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================
-- 4. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_total_time ON recipes(total_time);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_tags ON recipes USING GIN(dietary_tags);
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);
CREATE INDEX IF NOT EXISTS idx_user_favorite_recipes_user ON user_favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_recipes_recipe ON user_favorite_recipes(recipe_id);

-- ============================================
-- 5. ENABLE RLS
-- ============================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_recipes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. DROP OLD POLICIES (to avoid conflicts)
-- ============================================

DROP POLICY IF EXISTS "view_recipes" ON recipes;
DROP POLICY IF EXISTS "create_recipes" ON recipes;
DROP POLICY IF EXISTS "update_own_recipes" ON recipes;
DROP POLICY IF EXISTS "update_recipes" ON recipes;
DROP POLICY IF EXISTS "delete_own_recipes" ON recipes;
DROP POLICY IF EXISTS "delete_recipes" ON recipes;
DROP POLICY IF EXISTS "admins_full_recipes_access" ON recipes;

DROP POLICY IF EXISTS "view_own_favorites" ON user_favorite_recipes;
DROP POLICY IF EXISTS "add_favorites" ON user_favorite_recipes;
DROP POLICY IF EXISTS "remove_favorites" ON user_favorite_recipes;

-- ============================================
-- 7. CREATE RLS POLICIES (PERMISSIVE)
-- ============================================

-- Anyone authenticated can view all recipes
CREATE POLICY "view_recipes"
ON recipes FOR SELECT
TO authenticated
USING (true);

-- Anyone authenticated can create recipes
CREATE POLICY "create_recipes"
ON recipes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own recipes, admins can update any
CREATE POLICY "update_recipes"
ON recipes FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  created_by = auth.uid() OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Users can delete their own recipes, admins can delete any
CREATE POLICY "delete_recipes"
ON recipes FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Favorites policies
CREATE POLICY "view_own_favorites"
ON user_favorite_recipes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "add_favorites"
ON user_favorite_recipes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "remove_favorites"
ON user_favorite_recipes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 8. CREATE UPDATE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. FIX PROGRAM ENROLLMENTS (while we're here)
-- ============================================

-- Ensure completed_days exists and is initialized
DO $$ 
BEGIN
  -- Add column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'program_enrollments' 
    AND column_name = 'completed_days'
  ) THEN
    ALTER TABLE program_enrollments ADD COLUMN completed_days INTEGER[] DEFAULT ARRAY[]::INTEGER[];
  END IF;
END $$;

-- Initialize NULL values
UPDATE program_enrollments 
SET completed_days = ARRAY[]::INTEGER[]
WHERE completed_days IS NULL;

-- Set default
ALTER TABLE program_enrollments 
ALTER COLUMN completed_days SET DEFAULT ARRAY[]::INTEGER[];

-- ============================================
-- DONE! ✅
-- ============================================

SELECT 'Recipes tables created successfully!' AS status;
SELECT 'You can now save recipes!' AS message;
SELECT 'Caribbean and African cuisines are supported!' AS cuisines;
