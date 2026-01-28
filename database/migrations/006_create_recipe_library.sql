-- ============================================
-- RECIPE LIBRARY SYSTEM
-- ============================================
-- This migration creates a shared recipe library that all users can access
-- Includes recipes, ratings, comments, and moderation features

-- ============================================
-- RECIPES TABLE (Public Library)
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view approved recipes" ON recipes;
DROP POLICY IF EXISTS "Users can manage their own recipes" ON recipes;

-- Check if table exists and add columns if needed, or create new table
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recipes') THEN
    -- Table exists, add missing columns
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'author_name') THEN
      ALTER TABLE recipes ADD COLUMN author_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'description') THEN
      ALTER TABLE recipes ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'ingredients') THEN
      ALTER TABLE recipes ADD COLUMN ingredients TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'instructions') THEN
      ALTER TABLE recipes ADD COLUMN instructions TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'scripture') THEN
      ALTER TABLE recipes ADD COLUMN scripture TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'scripture_reference') THEN
      ALTER TABLE recipes ADD COLUMN scripture_reference TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'meditation') THEN
      ALTER TABLE recipes ADD COLUMN meditation TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'prep_time') THEN
      ALTER TABLE recipes ADD COLUMN prep_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'cook_time') THEN
      ALTER TABLE recipes ADD COLUMN cook_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'servings') THEN
      ALTER TABLE recipes ADD COLUMN servings TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'nutrition_info') THEN
      ALTER TABLE recipes ADD COLUMN nutrition_info JSONB;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'cuisine') THEN
      ALTER TABLE recipes ADD COLUMN cuisine TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'meal_type') THEN
      ALTER TABLE recipes ADD COLUMN meal_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'dietary_tags') THEN
      ALTER TABLE recipes ADD COLUMN dietary_tags TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'image_url') THEN
      ALTER TABLE recipes ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'status') THEN
      ALTER TABLE recipes ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'is_featured') THEN
      ALTER TABLE recipes ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'view_count') THEN
      ALTER TABLE recipes ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'save_count') THEN
      ALTER TABLE recipes ADD COLUMN save_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'approved_at') THEN
      ALTER TABLE recipes ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'approved_by') THEN
      ALTER TABLE recipes ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  ELSE
    -- Create new table
    CREATE TABLE recipes (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      author_name TEXT,
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
      image_url TEXT,
      status TEXT DEFAULT 'pending',
      is_featured BOOLEAN DEFAULT false,
      view_count INTEGER DEFAULT 0,
      save_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      approved_at TIMESTAMP WITH TIME ZONE,
      approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
    );
  END IF;
END $$;

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policies for recipes
DROP POLICY IF EXISTS "Anyone can view approved recipes" ON recipes;
CREATE POLICY "Anyone can view approved recipes" 
  ON recipes FOR SELECT 
  USING (status = 'approved' OR (select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage their own recipes" ON recipes;
CREATE POLICY "Users can manage their own recipes" 
  ON recipes 
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- RECIPE RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

-- Enable RLS
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for ratings
DROP POLICY IF EXISTS "Anyone can view ratings" ON recipe_ratings;
CREATE POLICY "Anyone can view ratings" 
  ON recipe_ratings FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can manage own ratings" ON recipe_ratings;
CREATE POLICY "Users can manage own ratings" 
  ON recipe_ratings 
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- RECIPE COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recipe_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT,
  comment TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
DROP POLICY IF EXISTS "Anyone can view comments" ON recipe_comments;
CREATE POLICY "Anyone can view comments" 
  ON recipe_comments FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON recipe_comments;
CREATE POLICY "Users can create comments" 
  ON recipe_comments FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own comments" ON recipe_comments;
CREATE POLICY "Users can manage own comments" 
  ON recipe_comments FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON recipe_comments;
CREATE POLICY "Users can delete own comments" 
  ON recipe_comments FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- RECIPE SAVES TABLE (Track who saved what)
-- ============================================
CREATE TABLE IF NOT EXISTS recipe_library_saves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_recipe_id UUID REFERENCES saved_recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

-- Enable RLS
ALTER TABLE recipe_library_saves ENABLE ROW LEVEL SECURITY;

-- Policies for saves
DROP POLICY IF EXISTS "Users can view own saves" ON recipe_library_saves;
CREATE POLICY "Users can view own saves" 
  ON recipe_library_saves FOR SELECT 
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own saves" ON recipe_library_saves;
CREATE POLICY "Users can manage own saves" 
  ON recipe_library_saves 
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate average rating for a recipe
CREATE OR REPLACE FUNCTION get_recipe_average_rating(recipe_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1)
  INTO avg_rating
  FROM recipe_ratings
  WHERE recipe_id = recipe_uuid;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get rating count for a recipe
CREATE OR REPLACE FUNCTION get_recipe_rating_count(recipe_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  rating_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO rating_count
  FROM recipe_ratings
  WHERE recipe_id = recipe_uuid;
  
  RETURN COALESCE(rating_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_recipe_views()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called when a recipe is viewed
  -- Implementation depends on your tracking method
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update save count when a recipe is saved
CREATE OR REPLACE FUNCTION update_recipe_save_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes
    SET save_count = save_count + 1
    WHERE id = NEW.recipe_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes
    SET save_count = GREATEST(save_count - 1, 0)
    WHERE id = OLD.recipe_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for save count
DROP TRIGGER IF EXISTS on_recipe_library_save ON recipe_library_saves;
CREATE TRIGGER on_recipe_library_save
  AFTER INSERT OR DELETE ON recipe_library_saves
  FOR EACH ROW EXECUTE FUNCTION update_recipe_save_count();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_recipes_status ON recipes(status);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_featured ON recipes(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_user_id ON recipe_ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_recipe_comments_recipe_id ON recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_comments_user_id ON recipe_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_recipe_library_saves_recipe_id ON recipe_library_saves(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_library_saves_user_id ON recipe_library_saves(user_id);

-- GIN index for array searches
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_tags ON recipes USING GIN (dietary_tags);

-- ============================================
-- SEED SOME SAMPLE RECIPES (Optional)
-- ============================================
-- You can add some initial approved recipes here if desired
