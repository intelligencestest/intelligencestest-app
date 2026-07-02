-- ============================================================
-- Pipeline stage / outcome separation (M3b)
-- Stage = where the candidate is in the hiring workflow.
-- Outcome = how their process ended (pending while active).
-- Legacy `status` stays mirrored for invited/started/completed
-- so existing pages keep working during the transition.
--
-- RUN THIS BEFORE DEPLOYING M3b CODE (Supabase SQL editor).
-- ============================================================

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'invited'
  CHECK (pipeline_stage IN ('invited','started','completed','reviewed','interview','hired'));

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS outcome TEXT NOT NULL DEFAULT 'pending'
  CHECK (outcome IN ('pending','rejected','withdrawn','expired'));

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS stage_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill from the legacy status column.
UPDATE candidates SET pipeline_stage = status WHERE status IN ('invited','started','completed');

-- Lapsed invitations that never started are closed as expired.
UPDATE candidates SET outcome = 'expired'
WHERE status = 'invited' AND token_expires_at IS NOT NULL AND token_expires_at < NOW();

CREATE INDEX IF NOT EXISTS idx_candidates_company_stage
  ON candidates(company_id, pipeline_stage, outcome);
