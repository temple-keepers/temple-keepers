-- Add mobile number and birth year to profiles
-- Safe to run multiple times

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_year INTEGER;
