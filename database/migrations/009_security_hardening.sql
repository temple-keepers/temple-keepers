-- Security Hardening: Fix search_path and permissive RLS
-- Run this in Supabase SQL Editor

-- 1. FIX FUNCTION SEARCH PATHS
-- Set search_path to public to prevent search path hijacking
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.get_current_program_day(UUID) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.get_or_create_today_log(UUID) SET search_path = public;

-- These seem to be trigger functions or helpers commonly managed by Supabase/Frameworks, 
-- but if they exist in public schema, we should secure them.
-- Use DO block to avoid errors if function doesn't exist (e.g. if it was renamed or deleted)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'update_updated_at_column' AND nspname = 'public') THEN
        ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'update_updated_at' AND nspname = 'public') THEN
        ALTER FUNCTION public.update_updated_at() SET search_path = public;
    END IF;
END $$;


-- 2. FIX PERMISSIVE RLS ON RECIPES
-- The policy "Anyone can create recipes" had `WITH CHECK (true)` which allows ANY authenticated user to insert ANY data rows
-- We should restrict it so users can only create recipes where they are the owner

-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can create recipes" ON public.recipes;

-- Create the secure policy
-- Ensures that the user_id/created_by field matches the authenticated user
CREATE POLICY "Anyone can create recipes"
ON public.recipes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by 
  OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);
