-- Security Patch: Enable RLS and missing policies
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on public tables flagged by linter
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pod_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.weekly_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tier_features ENABLE ROW LEVEL SECURITY;

-- 2. profiles Policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow authenticated users to view basic profile info (needed for community features)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to insert their own profile on signup
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);


-- 3. weekly_themes Policies
-- Everyone can view themes
CREATE POLICY "Authenticated users can view weekly themes"
ON public.weekly_themes FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can manage themes
CREATE POLICY "Admins can manage weekly themes"
ON public.weekly_themes FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- 4. tier_features Policies
-- Everyone can view features
CREATE POLICY "Authenticated users can view tier features"
ON public.tier_features FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can manage features
CREATE POLICY "Admins can manage tier features"
ON public.tier_features FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- 5. pod_challenges Policies
-- Pod members can view challenges
CREATE POLICY "Pod members can view challenges"
ON public.pod_challenges FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pod_members 
    WHERE pod_members.pod_id = pod_challenges.pod_id 
    AND pod_members.user_id = auth.uid()
  )
);

-- Pod leaders can manage challenges
CREATE POLICY "Pod leaders can manage challenges"
ON public.pod_challenges FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.pod_members 
    WHERE pod_members.pod_id = pod_challenges.pod_id 
    AND pod_members.user_id = auth.uid()
    AND pod_members.role IN ('leader', 'moderator')
  )
);
