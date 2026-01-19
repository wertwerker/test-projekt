-- =====================================================
-- BUG-5 Fix: Server-Side Rate Limiting
-- =====================================================
-- This migration creates a rate_limits table for tracking
-- login attempts and implementing server-side rate limiting.
-- =====================================================

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.rate_limits IS 'Rate limiting tracking for login attempts by IP address';

-- Create unique index on ip_address for fast lookups and prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS rate_limits_ip_address_idx ON public.rate_limits(ip_address);

-- Create index for cleanup queries (finding old records)
CREATE INDEX IF NOT EXISTS rate_limits_created_at_idx ON public.rate_limits(created_at);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS (table should not be accessible from client)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: No public access - only server-side access via service role
-- This ensures clients cannot manipulate rate limit data
CREATE POLICY "No public access to rate_limits"
  ON public.rate_limits
  FOR ALL
  USING (false);

-- =====================================================
-- Automatic Cleanup Trigger (24 hours)
-- =====================================================
-- This trigger automatically deletes rate limit entries
-- older than 24 hours to prevent table bloat.
-- =====================================================

-- Function to delete old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Automatic cleanup will be triggered via cron job or manually
-- For Supabase, consider using pg_cron extension or manual cleanup

-- =====================================================
-- Updated_at Trigger
-- =====================================================
-- Automatically update the updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_rate_limits_updated ON public.rate_limits;
CREATE TRIGGER on_rate_limits_updated
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_rate_limits_updated_at();

-- =====================================================
-- Grant permissions (service role only)
-- =====================================================

-- No public access - only authenticated backend can access
-- Service role will be used from middleware/server-side code

-- =====================================================
-- Helper Function: Check Rate Limit
-- =====================================================
-- This function checks if an IP is rate limited and returns
-- the lockout status and remaining time.
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address TEXT,
  p_max_attempts INTEGER DEFAULT 3,
  p_lockout_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(
  is_locked BOOLEAN,
  remaining_seconds INTEGER,
  attempts INTEGER
) AS $$
DECLARE
  v_record RECORD;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Get or create rate limit record
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE ip_address = p_ip_address;

  -- If no record exists, not locked
  IF v_record IS NULL THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  -- Check if currently locked
  IF v_record.locked_until IS NOT NULL AND v_record.locked_until > v_now THEN
    -- Still locked
    RETURN QUERY SELECT
      true,
      EXTRACT(EPOCH FROM (v_record.locked_until - v_now))::INTEGER,
      v_record.failed_attempts;
    RETURN;
  END IF;

  -- Check if lockout expired - reset attempts
  IF v_record.locked_until IS NOT NULL AND v_record.locked_until <= v_now THEN
    -- Lockout expired, reset
    UPDATE public.rate_limits
    SET
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
    WHERE ip_address = p_ip_address;

    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  -- Not locked, return current attempts
  RETURN QUERY SELECT false, 0, v_record.failed_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Helper Function: Record Failed Attempt
-- =====================================================

CREATE OR REPLACE FUNCTION public.record_failed_attempt(
  p_ip_address TEXT,
  p_max_attempts INTEGER DEFAULT 3,
  p_lockout_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(
  attempts INTEGER,
  is_locked BOOLEAN,
  locked_until_ts TIMESTAMPTZ
) AS $$
DECLARE
  v_new_attempts INTEGER;
  v_lockout_time TIMESTAMPTZ;
BEGIN
  -- Insert or update rate limit record
  INSERT INTO public.rate_limits (ip_address, failed_attempts, last_attempt_at)
  VALUES (p_ip_address, 1, NOW())
  ON CONFLICT (ip_address)
  DO UPDATE SET
    failed_attempts = rate_limits.failed_attempts + 1,
    last_attempt_at = NOW(),
    updated_at = NOW()
  RETURNING rate_limits.failed_attempts INTO v_new_attempts;

  -- Check if should be locked
  IF v_new_attempts >= p_max_attempts THEN
    v_lockout_time := NOW() + (p_lockout_duration_minutes || ' minutes')::INTERVAL;

    UPDATE public.rate_limits
    SET locked_until = v_lockout_time
    WHERE ip_address = p_ip_address;

    RETURN QUERY SELECT v_new_attempts, true, v_lockout_time;
  ELSE
    RETURN QUERY SELECT v_new_attempts, false, NULL::TIMESTAMPTZ;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Helper Function: Reset Rate Limit (on successful login)
-- =====================================================

CREATE OR REPLACE FUNCTION public.reset_rate_limit(
  p_ip_address TEXT
)
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE ip_address = p_ip_address;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Test Queries (for verification)
-- =====================================================
-- Run these queries to verify the migration worked:
--
-- 1. Check if table exists:
-- SELECT * FROM information_schema.tables WHERE table_name = 'rate_limits';
--
-- 2. Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename = 'rate_limits';
--
-- 3. Test rate limit check (should return no lock):
-- SELECT * FROM public.check_rate_limit('127.0.0.1');
--
-- 4. Test record failed attempt:
-- SELECT * FROM public.record_failed_attempt('127.0.0.1');
--
-- 5. Test lockout after 3 attempts:
-- SELECT * FROM public.record_failed_attempt('127.0.0.1');
-- SELECT * FROM public.record_failed_attempt('127.0.0.1');
-- SELECT * FROM public.record_failed_attempt('127.0.0.1');
-- SELECT * FROM public.check_rate_limit('127.0.0.1'); -- Should show locked
-- =====================================================
