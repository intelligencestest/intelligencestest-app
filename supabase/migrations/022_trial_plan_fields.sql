-- ============================================================
-- Commercial / trial foundation — launch phase (Spain, first 10 customers).
-- Adds plan + trial + subscription tracking to companies. No payment
-- processor integration yet (manual/PayPal billing only).
-- Run once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_status TEXT NOT NULL DEFAULT 'active'
  CHECK (trial_status IN ('active', 'expired', 'extended', 'converted'));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'manual'
  CHECK (subscription_status IN ('manual', 'pending_payment', 'active', 'past_due', 'cancelled'));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS billing_provider TEXT NOT NULL DEFAULT 'manual'
  CHECK (billing_provider IN ('manual', 'paypal', 'stripe'));

-- NULL = unlimited / custom (enterprise). Non-null values are enforced in
-- application code (lib/plan/limits.ts), not by triggers.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS candidate_limit INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS project_limit INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS recruiter_limit INTEGER;

-- `plan` already exists (TEXT NOT NULL DEFAULT 'standard', see 020). New
-- signups should default into the trial, not the legacy 'standard' value.
ALTER TABLE companies ALTER COLUMN plan SET DEFAULT 'trial';

-- Backfill: every company that existed before this migration is pre-launch
-- or demo data. None of it should be retroactively trial-limited — mark it
-- converted/manual with unlimited (NULL) limits and leave `plan` untouched.
UPDATE companies
SET trial_status = 'converted',
    subscription_status = 'manual',
    billing_provider = 'manual'
WHERE trial_started_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_companies_trial_status ON companies(trial_status);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_status ON companies(subscription_status);
CREATE INDEX IF NOT EXISTS idx_companies_trial_ends_at ON companies(trial_ends_at);
