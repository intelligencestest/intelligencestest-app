-- admin_refresh_tenant_stats() is SECURITY DEFINER and aggregates data across
-- every company (bypassing RLS by design), but Postgres grants EXECUTE on new
-- functions to PUBLIC by default. That default was never revoked, so the
-- anon key alone could call it via PostgREST's RPC endpoint. Lock it down to
-- service_role only — the only caller is the internal admin console's
-- server-side (service-role) code.
REVOKE EXECUTE ON FUNCTION admin_refresh_tenant_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_refresh_tenant_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION admin_refresh_tenant_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION admin_refresh_tenant_stats() TO service_role;
