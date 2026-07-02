-- Internal admin workspace management fields.
-- Kept separate from recruiter workflow / stage-outcome migrations.

ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_plan ON companies(plan);
