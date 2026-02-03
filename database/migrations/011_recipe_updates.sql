-- Migration: Add is_admin_created to recipes and fix difficulty constraint
-- 011_recipe_updates.sql

-- 1. Add is_admin_created column
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS is_admin_created BOOLEAN DEFAULT false;

-- 2. Drop the case-sensitive check constraint on difficulty if it exists
-- We want to support both or standardize. Let's allowing lowercase too or just drop the check constraint to be more flexible,
-- OR we update the constraint to allow lowercase.
-- Checking existing constraint name: usually recipes_difficulty_check
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_difficulty_check;

-- Add new constraint that allows both Title Case and lowercase
ALTER TABLE public.recipes 
ADD CONSTRAINT recipes_difficulty_check 
CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'easy', 'medium', 'hard'));

-- 3. Fix any existing data if needed (optional, safe to skip if empty)
-- UPDATE public.recipes SET difficulty = 'Easy' WHERE difficulty = 'easy';
-- UPDATE public.recipes SET difficulty = 'Medium' WHERE difficulty = 'medium';
-- UPDATE public.recipes SET difficulty = 'Hard' WHERE difficulty = 'hard';
