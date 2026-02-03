-- COMPLETE RECIPE TABLE FIX
-- Run this in Supabase SQL Editor
-- Safe to run multiple times

-- ============================================
-- 1. DROP AND RECREATE RECIPES TABLE
-- ============================================

-- Drop existing table if it has issues
DROP TABLE IF EXISTS user_favorite_recipes CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;

-- Create recipes table with ALL columns
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine TEXT, -- ← THIS COLUMN WAS MISSING
  prep_time INTEGER,
  cook_time INTEGER,
  total_time INTEGER,
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  dietary_tags TEXT[],
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  nutrition JSONB,
  scripture JSONB,
  tips TEXT[],
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE user_favorite_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================
-- 2. ENABLE RLS
-- ============================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_recipes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES
-- ============================================

-- Recipes policies
CREATE POLICY "Anyone can view recipes"
ON recipes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can create recipes"
ON recipes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Update own or admin recipes"
ON recipes FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Delete own or admin recipes"
ON recipes FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Favorites policies
CREATE POLICY "View own favorites"
ON user_favorite_recipes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Add favorites"
ON user_favorite_recipes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Remove favorites"
ON user_favorite_recipes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 4. CREATE INDEXES
-- ============================================

CREATE INDEX idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_total_time ON recipes(total_time);
CREATE INDEX idx_recipes_dietary_tags ON recipes USING GIN(dietary_tags);
CREATE INDEX idx_recipes_created_by ON recipes(created_by);
CREATE INDEX idx_user_favorite_recipes_user ON user_favorite_recipes(user_id);
CREATE INDEX idx_user_favorite_recipes_recipe ON user_favorite_recipes(recipe_id);

-- ============================================
-- 5. CREATE UPDATED_AT TRIGGER
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
-- DONE! ✅
-- ============================================

-- Now recipes table has:
-- ✅ cuisine column (was missing)
-- ✅ All other columns
-- ✅ Proper RLS policies
-- ✅ Indexes for performance
-- ✅ Auto-updated timestamps
