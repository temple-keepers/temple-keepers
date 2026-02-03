-- ================================================
-- TEMPLE KEEPERS V2 - CLEAN DATABASE SETUP
-- ================================================
-- Run this ONCE in your Supabase SQL Editor
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: profiles
-- ================================================
-- Stores user profile information
-- One profile per authenticated user

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ================================================
-- TABLE: daily_logs
-- ================================================
-- One log per user per calendar day
-- Auto-created when user first interacts each day

CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one log per user per day
  UNIQUE(user_id, log_date)
);

-- Enable RLS
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_logs
CREATE POLICY "Users can view own logs"
  ON public.daily_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON public.daily_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date 
  ON public.daily_logs(user_id, log_date DESC);

-- ================================================
-- TABLE: daily_log_entries
-- ================================================
-- Flexible entry system using JSONB
-- Types: 'mood', 'note', 'meal', 'devotional'

CREATE TABLE IF NOT EXISTS public.daily_log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('mood', 'note', 'meal', 'devotional')),
  entry_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.daily_log_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_log_entries
CREATE POLICY "Users can view own entries"
  ON public.daily_log_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_logs
      WHERE daily_logs.id = daily_log_entries.log_id
      AND daily_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own entries"
  ON public.daily_log_entries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.daily_logs
      WHERE daily_logs.id = daily_log_entries.log_id
      AND daily_logs.user_id = auth.uid()
    )
  );

-- Index for fast entry lookups
CREATE INDEX IF NOT EXISTS idx_entries_log_type 
  ON public.daily_log_entries(log_id, entry_type, created_at DESC);

-- ================================================
-- FUNCTION: Create profile on signup
-- ================================================
-- Automatically creates a profile when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Friend'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- FUNCTION: Update updated_at timestamp
-- ================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ================================================
-- HELPER FUNCTION: Get or create today's log
-- ================================================
-- Call this from your app to ensure today's log exists

CREATE OR REPLACE FUNCTION public.get_or_create_today_log(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Try to get existing log
  SELECT id INTO v_log_id
  FROM public.daily_logs
  WHERE user_id = p_user_id 
  AND log_date = v_today;
  
  -- If not found, create it
  IF v_log_id IS NULL THEN
    INSERT INTO public.daily_logs (user_id, log_date)
    VALUES (p_user_id, v_today)
    RETURNING id INTO v_log_id;
  END IF;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_or_create_today_log(UUID) TO authenticated;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify setup (optional)

-- Check tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'daily_logs', 'daily_log_entries');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('profiles', 'daily_logs', 'daily_log_entries');

-- ================================================
-- SETUP COMPLETE!
-- ================================================
