-- Add industry + onboarding_completed to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- RLS was enabled on users but no policies existed (deny-all by default).
-- These let authenticated users read/update their own row.
-- All server-side ops use the service-role key and bypass RLS entirely.
CREATE POLICY "Users can read own row" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own row" ON users
  FOR UPDATE USING (id = auth.uid());

-- Ensure project_assessments is readable (needed for project detail queries)
ALTER TABLE project_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own project assessments" ON project_assessments
  FOR ALL USING (
    project_id IN (
      SELECT id FROM hiring_projects
      WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );
