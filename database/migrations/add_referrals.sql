-- ================================================
-- Migration: Add referral system
-- ================================================

-- 1. Add referral_code to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- 2. Backfill existing profiles with unique codes
UPDATE public.profiles
SET referral_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- 3. Make NOT NULL with DEFAULT for future rows
ALTER TABLE public.profiles
  ALTER COLUMN referral_code SET NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN referral_code
  SET DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

-- 4. Referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id),
  referred_id uuid NOT NULL REFERENCES public.profiles(id),
  referral_code text NOT NULL,
  points_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT referrals_referred_id_unique UNIQUE (referred_id),
  CONSTRAINT referrals_no_self_referral CHECK (referrer_id != referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);

-- 5. Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they made"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their own referral"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referred_id);

CREATE POLICY "Users can record being referred"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

CREATE POLICY "Users can update their referral record"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = referred_id)
  WITH CHECK (auth.uid() = referred_id);

-- 6. RPC function to look up referrer by code (bypasses profiles RLS)
CREATE OR REPLACE FUNCTION public.lookup_referrer(p_referral_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  SELECT id INTO v_referrer_id
  FROM public.profiles
  WHERE referral_code = upper(p_referral_code)
  LIMIT 1;

  RETURN v_referrer_id;
END;
$$;
