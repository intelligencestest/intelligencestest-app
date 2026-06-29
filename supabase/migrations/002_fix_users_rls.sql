-- Fix RLS on users table.
-- Without this, the company_id subquery used by all other RLS policies
-- returns NULL for authenticated users, blocking all data access.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own row" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own row" ON users
  FOR UPDATE USING (id = auth.uid());

-- Make assessments readable to all authenticated users (global catalog, no company scope)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (true);
