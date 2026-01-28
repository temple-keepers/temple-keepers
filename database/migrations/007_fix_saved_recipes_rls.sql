-- Fix RLS policies for saved_recipes table
-- The issue is that inserts are being blocked

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can manage their own saved recipes" ON saved_recipes;

-- Create a single permissive policy for all operations
CREATE POLICY "Users can manage their own saved recipes" 
  ON saved_recipes 
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
