-- Add language preference to companies and candidates
ALTER TABLE companies ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

-- Index for candidate language lookups
CREATE INDEX IF NOT EXISTS idx_candidates_language ON candidates(language);
