-- =====================================================================
-- Pennywise | Throw-away demo (guest) sessions
-- The 1-click demo uses Supabase anonymous sign-in: every visitor gets a private wallet through
-- the normal signup trigger. Nothing is shared and no credentials live in the repository.
-- Requires: Dashboard > Authentication > Providers > "Allow anonymous sign-ins" = ON.
-- =====================================================================
CREATE OR REPLACE FUNCTION private.purge_stale_anonymous_users(p_days integer DEFAULT 7)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_deleted integer;
BEGIN
  IF p_days IS NULL OR p_days < 1 THEN RAISE EXCEPTION 'p_days must be >= 1'; END IF;

  WITH gone AS (
    DELETE FROM auth.users
     WHERE is_anonymous AND created_at < now() - make_interval(days => p_days)
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM gone;

  -- audit rows of deleted users are kept with a NULL user (ON DELETE SET NULL); trim old orphans
  DELETE FROM public.audit_logs WHERE user_id IS NULL AND created_at < now() - make_interval(days => p_days * 4);
  RETURN v_deleted;
END $$;

REVOKE ALL ON FUNCTION private.purge_stale_anonymous_users(integer) FROM PUBLIC, anon, authenticated;

-- Schedule it (Supabase: Database > Extensions > pg_cron), e.g. every night at 03:00 UTC:
--   select cron.schedule('purge-guest-sessions', '0 3 * * *', $$select private.purge_stale_anonymous_users(7)$$);
