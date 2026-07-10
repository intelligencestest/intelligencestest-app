-- ============================================================
-- Trial lifecycle email tracking.
-- Keeps the cron-triggered trial emails idempotent, so a daily VPS cron can
-- call /api/cron/trial-emails safely without sending duplicates.
-- Run once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_started_email_sent_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_day1_email_sent_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_day2_email_sent_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_ending_email_sent_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_expired_email_sent_at TIMESTAMPTZ;
