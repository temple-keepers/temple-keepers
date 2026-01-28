-- Migration 009: Consolidate duplicate RLS policies on recipe library tables
-- Fixes: Multiple Permissive Policies warnings for recipe_library_saves, recipe_ratings, recipes

-- ============================================================================
-- recipe_library_saves: Consolidate "Users can manage own saves" and "Users can view own saves"
-- ============================================================================

-- Drop duplicate SELECT policies
DROP POLICY IF EXISTS "Users can view own saves" ON public.recipe_library_saves;

-- Keep "Users can manage own saves" which already handles all operations
-- This single policy covers SELECT, INSERT, UPDATE, DELETE for user's own records


-- ============================================================================
-- recipe_ratings: Consolidate "Anyone can view ratings" and "Users can manage own ratings"
-- ============================================================================

-- Drop the duplicate policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.recipe_ratings;
DROP POLICY IF EXISTS "Users can manage own ratings" ON public.recipe_ratings;

-- Create consolidated policy for SELECT (anyone can view all ratings)
CREATE POLICY "Anyone can view all ratings"
ON public.recipe_ratings
FOR SELECT
TO public
USING (true);

-- Create policy for INSERT/UPDATE/DELETE (users manage only their own ratings)
CREATE POLICY "Users manage their own ratings"
ON public.recipe_ratings
FOR ALL
TO public
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- recipes: Consolidate "Anyone can view approved recipes" and "Users can manage their own recipes"
-- ============================================================================

-- Drop the duplicate policies
DROP POLICY IF EXISTS "Anyone can view approved recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can manage their own recipes" ON public.recipes;

-- Create consolidated policy for SELECT (anyone can view approved recipes OR their own recipes)
CREATE POLICY "Users can view approved recipes and own recipes"
ON public.recipes
FOR SELECT
TO public
USING (
  status = 'approved' OR 
  (SELECT auth.uid()) = user_id
);

-- Create policy for INSERT (authenticated users can insert their own recipes)
CREATE POLICY "Users can insert own recipes"
ON public.recipes
FOR INSERT
TO public
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Create policy for UPDATE/DELETE (users can only modify their own recipes)
CREATE POLICY "Users can modify own recipes"
ON public.recipes
FOR ALL
TO public
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);
