-- Recipe System Tables
-- Run this in Supabase SQL Editor

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine TEXT,
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  total_time INTEGER, -- minutes
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  dietary_tags TEXT[], -- ['vegetarian', 'vegan', 'gluten-free', etc.]
  ingredients JSONB NOT NULL, -- [{ item, amount, unit }]
  instructions JSONB NOT NULL, -- [{ step, instruction }]
  nutrition JSONB, -- { calories, protein, carbs, fat, fiber }
  scripture JSONB, -- { reference, text, reflection }
  tips TEXT[],
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_favorite_recipes table
CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_total_time ON recipes(total_time);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_tags ON recipes USING GIN(dietary_tags);
CREATE INDEX IF NOT EXISTS idx_user_favorite_recipes_user ON user_favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_recipes_recipe ON user_favorite_recipes(recipe_id);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes

-- Anyone authenticated can view recipes
CREATE POLICY "view_recipes"
ON recipes FOR SELECT
TO authenticated
USING (true);

-- Users can create recipes
CREATE POLICY "create_recipes"
ON recipes FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Users can update their own recipes
CREATE POLICY "update_own_recipes"
ON recipes FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- Users can delete their own recipes
CREATE POLICY "delete_own_recipes"
ON recipes FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Admins can do everything with recipes
CREATE POLICY "admins_full_recipes_access"
ON recipes FOR ALL
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- RLS Policies for user_favorite_recipes

-- Users can view their own favorites
CREATE POLICY "view_own_favorites"
ON user_favorite_recipes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can add favorites
CREATE POLICY "add_favorites"
ON user_favorite_recipes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can remove their favorites
CREATE POLICY "remove_favorites"
ON user_favorite_recipes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create updated_at trigger for recipes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
