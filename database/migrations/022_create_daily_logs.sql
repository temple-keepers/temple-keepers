-- Migration: Create daily logs system for meals, moods, and symptoms
-- Integrates with existing water_logs system

-- ============================================
-- MEAL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name TEXT,
  description TEXT,
  calories INTEGER,
  portion_size TEXT,
  ingredients TEXT[],
  photo_url TEXT,
  notes TEXT,
  time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for meal_logs
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_meal_type ON public.meal_logs(meal_type);

-- RLS for meal_logs
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own meal logs" ON public.meal_logs;
DROP POLICY IF EXISTS "Admins view all meal logs" ON public.meal_logs;

-- Consolidated policy for SELECT: users view own data OR admins view all
CREATE POLICY "Users and admins view meal logs"
  ON public.meal_logs FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

-- Users can insert, update, delete their own data
CREATE POLICY "Users manage own meal logs"
  ON public.meal_logs FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own meal logs"
  ON public.meal_logs FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own meal logs"
  ON public.meal_logs FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- MOOD LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME DEFAULT CURRENT_TIME,
  mood TEXT NOT NULL CHECK (mood IN ('excellent', 'good', 'neutral', 'low', 'poor')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  notes TEXT,
  activities TEXT[], -- What they did (e.g., 'exercise', 'prayer', 'meditation')
  triggers TEXT[], -- What might have affected mood
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for mood_logs
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON public.mood_logs(user_id, date DESC, time DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_mood ON public.mood_logs(mood);

-- RLS for mood_logs
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own mood logs" ON public.mood_logs;
DROP POLICY IF EXISTS "Admins view all mood logs" ON public.mood_logs;

-- Consolidated policy for SELECT: users view own data OR admins view all
CREATE POLICY "Users and admins view mood logs"
  ON public.mood_logs FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

-- Users can insert, update, delete their own data
CREATE POLICY "Users manage own mood logs"
  ON public.mood_logs FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own mood logs"
  ON public.mood_logs FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own mood logs"
  ON public.mood_logs FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- SYMPTOM LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME DEFAULT CURRENT_TIME,
  symptom_type TEXT NOT NULL, -- e.g., 'headache', 'fatigue', 'digestive', 'pain', etc.
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  location TEXT, -- For pain/discomfort - body part
  duration TEXT, -- How long it lasted
  notes TEXT,
  triggers TEXT[], -- Possible causes
  relieved_by TEXT[], -- What helped
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for symptom_logs
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date ON public.symptom_logs(user_id, date DESC, time DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_type ON public.symptom_logs(symptom_type);

-- RLS for symptom_logs
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own symptom logs" ON public.symptom_logs;
DROP POLICY IF EXISTS "Admins view all symptom logs" ON public.symptom_logs;

-- Consolidated policy for SELECT: users view own data OR admins view all
CREATE POLICY "Users and admins view symptom logs"
  ON public.symptom_logs FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (select auth.uid())
      AND (
        auth.users.raw_app_meta_data->>'role' = 'super_admin'
        OR auth.users.raw_app_meta_data->>'role' = 'admin'
      )
    )
  );

-- Users can insert, update, delete their own data
CREATE POLICY "Users manage own symptom logs"
  ON public.symptom_logs FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own symptom logs"
  ON public.symptom_logs FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own symptom logs"
  ON public.symptom_logs FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- DAILY SUMMARY VIEW
-- ============================================
-- View that combines all daily logs for easy overview
-- Restructured to avoid exposing auth.users
CREATE OR REPLACE VIEW public.daily_summary AS
WITH all_dates_users AS (
  SELECT DISTINCT user_id, date FROM (
    SELECT user_id, date FROM water_logs
    UNION SELECT user_id, date FROM meal_logs
    UNION SELECT user_id, date FROM mood_logs
    UNION SELECT user_id, date FROM symptom_logs
  ) combined
)
SELECT 
  adu.user_id,
  adu.date,
  w.glasses as water_glasses,
  w.goal as water_goal,
  (SELECT COUNT(*) FROM meal_logs m WHERE m.user_id = adu.user_id AND m.date = adu.date) as meal_count,
  (SELECT AVG(energy_level) FROM mood_logs mo WHERE mo.user_id = adu.user_id AND mo.date = adu.date) as avg_energy,
  (SELECT AVG(stress_level) FROM mood_logs mo WHERE mo.user_id = adu.user_id AND mo.date = adu.date) as avg_stress,
  (SELECT COUNT(*) FROM symptom_logs s WHERE s.user_id = adu.user_id AND s.date = adu.date) as symptom_count
FROM all_dates_users adu
LEFT JOIN water_logs w ON w.user_id = adu.user_id AND w.date = adu.date;

-- Enable RLS on the view
ALTER VIEW public.daily_summary SET (security_invoker = on);

-- Note: RLS policies from underlying tables (meal_logs, mood_logs, etc.) will automatically apply

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get complete daily log for a user
CREATE OR REPLACE FUNCTION get_daily_log(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'date', p_date,
    'water', (
      SELECT json_build_object(
        'glasses', COALESCE(glasses, 0),
        'goal', COALESCE(goal, 8)
      )
      FROM water_logs
      WHERE user_id = p_user_id AND date = p_date
    ),
    'meals', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', id,
          'meal_type', meal_type,
          'meal_name', meal_name,
          'description', description,
          'calories', calories,
          'time', time,
          'notes', notes
        ) ORDER BY time
      ), '[]'::json)
      FROM meal_logs
      WHERE user_id = p_user_id AND date = p_date
    ),
    'moods', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', id,
          'mood', mood,
          'energy_level', energy_level,
          'stress_level', stress_level,
          'time', time,
          'notes', notes
        ) ORDER BY time DESC
      ), '[]'::json)
      FROM mood_logs
      WHERE user_id = p_user_id AND date = p_date
    ),
    'symptoms', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', id,
          'symptom_type', symptom_type,
          'severity', severity,
          'location', location,
          'time', time,
          'notes', notes
        ) ORDER BY time DESC
      ), '[]'::json)
      FROM symptom_logs
      WHERE user_id = p_user_id AND date = p_date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS update_meal_logs_updated_at ON public.meal_logs;
CREATE TRIGGER update_meal_logs_updated_at
  BEFORE UPDATE ON public.meal_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_mood_logs_updated_at ON public.mood_logs;
CREATE TRIGGER update_mood_logs_updated_at
  BEFORE UPDATE ON public.mood_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_symptom_logs_updated_at ON public.symptom_logs;
CREATE TRIGGER update_symptom_logs_updated_at
  BEFORE UPDATE ON public.symptom_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FIX RLS FOR ADMIN_USERS TABLE
-- ============================================
-- Enable RLS on admin_users if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
    ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
    DROP POLICY IF EXISTS "Super admins manage admin users" ON public.admin_users;
    
    -- Only admins can view admin_users
    CREATE POLICY "Admins can view all admin users"
      ON public.admin_users FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = (select auth.uid())
          AND (
            auth.users.raw_app_meta_data->>'role' = 'super_admin'
            OR auth.users.raw_app_meta_data->>'role' = 'admin'
          )
        )
      );
    
    -- Only super admins can modify admin_users
    CREATE POLICY "Super admins manage admin users"
      ON public.admin_users FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = (select auth.uid())
          AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
        )
      );
  END IF;
END $$;
