-- Fix program_enrollments completed_days field
-- Run this in Supabase SQL Editor if you're having issues with all days showing as complete

-- Ensure completed_days is an array (not null)
UPDATE program_enrollments 
SET completed_days = ARRAY[]::INTEGER[]
WHERE completed_days IS NULL;

-- Add default value for future inserts
ALTER TABLE program_enrollments 
ALTER COLUMN completed_days SET DEFAULT ARRAY[]::INTEGER[];

-- Clear any erroneous completions
-- Uncomment if you want to reset all completions
-- DELETE FROM program_day_completions;
-- UPDATE program_enrollments SET completed_days = ARRAY[]::INTEGER[], current_day = 1;
