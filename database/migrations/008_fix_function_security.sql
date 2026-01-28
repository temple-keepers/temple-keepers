-- Fix security warnings for recipe library functions

-- Function to calculate average rating for a recipe (with search_path fix)
CREATE OR REPLACE FUNCTION get_recipe_average_rating(recipe_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1)
  INTO avg_rating
  FROM public.recipe_ratings
  WHERE recipe_id = recipe_uuid;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to get rating count for a recipe (with search_path fix)
CREATE OR REPLACE FUNCTION get_recipe_rating_count(recipe_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  rating_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO rating_count
  FROM public.recipe_ratings
  WHERE recipe_id = recipe_uuid;
  
  RETURN COALESCE(rating_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to increment view count (with search_path fix)
CREATE OR REPLACE FUNCTION increment_recipe_views()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called when a recipe is viewed
  -- Implementation depends on your tracking method
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function to update save count when a recipe is saved (with search_path fix)
CREATE OR REPLACE FUNCTION update_recipe_save_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.recipes
    SET save_count = save_count + 1
    WHERE id = NEW.recipe_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.recipes
    SET save_count = GREATEST(save_count - 1, 0)
    WHERE id = OLD.recipe_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
