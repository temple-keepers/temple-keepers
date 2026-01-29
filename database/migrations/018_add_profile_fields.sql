-- ============================================
-- ADD PROFILE FIELDS MIGRATION
-- ============================================
-- Adds date of birth, city, country, and timezone fields to profiles
-- Adds image_url to pods

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add image_url to pods table
ALTER TABLE pods
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- Note: date_of_birth is stored but marked as private in the application layer
-- Only city/country will be publicly visible for timezone identification
