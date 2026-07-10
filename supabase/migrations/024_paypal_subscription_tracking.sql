-- ============================================================
-- PayPal subscription tracking — launch billing handoff.
-- Stores the PayPal subscription created by the customer so ops can
-- manually activate the requested plan after payment review.
-- Run once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS pending_plan TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS paypal_subscription_status TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS paypal_subscription_updated_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_pending_plan_check'
  ) THEN
    ALTER TABLE companies
      ADD CONSTRAINT companies_pending_plan_check
      CHECK (pending_plan IS NULL OR pending_plan IN ('starter', 'professional', 'enterprise'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_paypal_subscription_id
  ON companies(paypal_subscription_id)
  WHERE paypal_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_pending_plan ON companies(pending_plan);
