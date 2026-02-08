-- Fix Admin Access to User List and Activity Data

-- 1. Create a secure function to check admin status (idempotent)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add policy for admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- 3. Allow admins to update any profile (change roles/tiers)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- 4. Allow admins to view all enrollments
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.program_enrollments;

CREATE POLICY "Admins can view all enrollments"
  ON public.program_enrollments
  FOR SELECT
  USING (public.is_admin());

-- 5. Allow admins to view all wellness check-ins
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wellness_check_ins') THEN
      DROP POLICY IF EXISTS "Admins can view all check-ins" ON public.wellness_check_ins;
      CREATE POLICY "Admins can view all check-ins" ON public.wellness_check_ins FOR SELECT USING (public.is_admin());
  END IF;
END $$;

-- 6. Allow admins to view all meal logs
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'meal_logs') THEN
      DROP POLICY IF EXISTS "Admins can view all meal logs" ON public.meal_logs;
      CREATE POLICY "Admins can view all meal logs" ON public.meal_logs FOR SELECT USING (public.is_admin());
  END IF;
END $$;

-- 7. Allow admins to view all symptom logs
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'symptom_logs') THEN
      DROP POLICY IF EXISTS "Admins can view all symptom logs" ON public.symptom_logs;
      CREATE POLICY "Admins can view all symptom logs" ON public.symptom_logs FOR SELECT USING (public.is_admin());
  END IF;
END $$;
