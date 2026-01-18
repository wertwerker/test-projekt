-- =====================================================
-- PROJ-1: User Authentication - Profiles Table
-- =====================================================
-- This migration creates a profiles table that extends
-- Supabase Auth users with additional user data.
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with additional data beyond Supabase Auth';

-- Create index for performance (email lookups)
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- Automatic Profile Creation Trigger
-- =====================================================
-- This trigger automatically creates a profile entry
-- when a new user signs up via Supabase Auth.
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Updated_at Trigger
-- =====================================================
-- Automatically update the updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Grant permissions
-- =====================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- =====================================================
-- Test Queries (for verification)
-- =====================================================
-- Run these queries to verify the migration worked:
--
-- 1. Check if table exists:
-- SELECT * FROM information_schema.tables WHERE table_name = 'profiles';
--
-- 2. Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
--
-- 3. Test profile creation (will happen automatically on signup):
-- SELECT * FROM public.profiles WHERE id = auth.uid();
-- =====================================================
