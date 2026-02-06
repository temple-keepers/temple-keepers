-- Add dessert as valid meal_type
-- Safe to run multiple times

ALTER TABLE public.recipes
  DROP CONSTRAINT IF EXISTS recipes_meal_type_check;

ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_meal_type_check
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert'));
