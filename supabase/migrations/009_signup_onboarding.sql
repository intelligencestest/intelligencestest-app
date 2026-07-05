-- Add industry + onboarding_completed to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Users' read/update-own-row policies already exist from 002_fix_users_rls.sql.
-- All server-side ops use the service-role key and bypass RLS entirely.

-- Ensure project_assessments is readable (needed for project detail queries)
ALTER TABLE project_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own project assessments" ON project_assessments
  FOR ALL USING (
    project_id IN (
      SELECT id FROM hiring_projects
      WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );
