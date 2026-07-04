-- ============================================================
-- Internal Operations Console (ITOC) — Phase 0 foundation.
-- Run in: Supabase Dashboard → SQL Editor before deploying the
-- console. All three tables are service-role only: RLS is
-- enabled with no policies, so product users can never touch
-- them; the console reaches them via the admin client.
-- ============================================================

-- Console operators and their roles. The INTERNAL_ADMIN_EMAILS env
-- allowlist remains as break-glass bootstrap (treated as superadmin).
CREATE TABLE IF NOT EXISTS internal_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'support' CHECK (role IN ('support', 'ops', 'superadmin')),
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disabled_at TIMESTAMPTZ
);

-- Append-only audit of every console mutation. Separate stream from the
-- future customer-facing activity_events: different audience, retention
-- and sensitivity.
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  company_id UUID,
  reason TEXT,
  payload JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_occurred ON admin_actions(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_company ON admin_actions(company_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_email, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type, occurred_at DESC);

-- Per-tenant daily rollups: list sorting, Home triage and usage analytics
-- read these instead of scanning product tables per page view.
CREATE TABLE IF NOT EXISTS tenant_stats_daily (
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  recruiters INTEGER NOT NULL DEFAULT 0,
  candidates_total INTEGER NOT NULL DEFAULT 0,
  invited_30d INTEGER NOT NULL DEFAULT 0,
  completed_30d INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (company_id, day)
);

ALTER TABLE internal_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_stats_daily ENABLE ROW LEVEL SECURITY;

-- Aggregates all tenant stats in one SQL pass. Called by the console when
-- today's rollups are stale; a scheduled job (pg_cron / external cron) can
-- call it nightly at scale — the console code does not change.
CREATE OR REPLACE FUNCTION admin_refresh_tenant_stats() RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO tenant_stats_daily (
    company_id, day, recruiters, candidates_total, invited_30d,
    completed_30d, active_projects, last_activity_at, computed_at
  )
  SELECT
    c.id,
    CURRENT_DATE,
    COALESCE(u.cnt, 0),
    COALESCE(cd.total, 0),
    COALESCE(cd.invited30, 0),
    COALESCE(r.completed30, 0),
    COALESCE(p.active, 0),
    GREATEST(cd.last_created, cd.last_stage, r.last_completed),
    NOW()
  FROM companies c
  LEFT JOIN (
    SELECT company_id, COUNT(*) AS cnt FROM users GROUP BY 1
  ) u ON u.company_id = c.id
  LEFT JOIN (
    SELECT company_id,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS invited30,
      MAX(created_at) AS last_created,
      MAX(stage_changed_at) AS last_stage
    FROM candidates GROUP BY 1
  ) cd ON cd.company_id = c.id
  LEFT JOIN (
    SELECT company_id,
      COUNT(*) FILTER (WHERE completed_at >= NOW() - INTERVAL '30 days') AS completed30,
      MAX(completed_at) AS last_completed
    FROM results GROUP BY 1
  ) r ON r.company_id = c.id
  LEFT JOIN (
    SELECT company_id, COUNT(*) FILTER (WHERE status = 'active') AS active
    FROM hiring_projects GROUP BY 1
  ) p ON p.company_id = c.id
  ON CONFLICT (company_id, day) DO UPDATE SET
    recruiters = EXCLUDED.recruiters,
    candidates_total = EXCLUDED.candidates_total,
    invited_30d = EXCLUDED.invited_30d,
    completed_30d = EXCLUDED.completed_30d,
    active_projects = EXCLUDED.active_projects,
    last_activity_at = EXCLUDED.last_activity_at,
    computed_at = NOW();
$$;
