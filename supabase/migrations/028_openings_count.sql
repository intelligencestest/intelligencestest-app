-- Number of roles/positions a shortlist is filling. Drives how many
-- candidates the client-facing brief recommends (see
-- app/api/reports/client-brief/route.ts) — a 1-role search needs 1-2
-- names, a 10-role staffing run needs 15-20. Defaults to 1 so every
-- existing shortlist keeps today's single-role behavior with no backfill
-- needed.
ALTER TABLE hiring_projects ADD COLUMN IF NOT EXISTS openings_count INTEGER NOT NULL DEFAULT 1
  CHECK (openings_count > 0);
