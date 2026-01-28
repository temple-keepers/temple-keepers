-- Migration: Change health_goals from TEXT to TEXT[]
-- This allows users to select multiple health goals

-- Drop the column and recreate it as an array type
ALTER TABLE profiles DROP COLUMN IF EXISTS health_goals;
ALTER TABLE profiles ADD COLUMN health_goals TEXT[] DEFAULT '{}';
