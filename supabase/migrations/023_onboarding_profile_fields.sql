-- Launch onboarding profile fields.
-- These are product/sales segmentation fields collected during setup.

ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS hires_per_month TEXT;
