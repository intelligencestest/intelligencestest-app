-- Durable, tenant-scoped queue for CSV candidate invitation batches.
CREATE TABLE IF NOT EXISTS invite_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES hiring_projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  test_type TEXT NOT NULL,
  source_filename TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'completed_with_failures', 'failed')),
  total_count INTEGER NOT NULL CHECK (total_count BETWEEN 1 AND 200),
  sent_count INTEGER NOT NULL DEFAULT 0 CHECK (sent_count >= 0),
  failed_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sent_count + failed_count <= total_count),
  UNIQUE (id, company_id)
);

CREATE TABLE IF NOT EXISTS invite_batch_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL CHECK (row_number > 0),
  candidate_name TEXT NOT NULL CHECK (char_length(candidate_name) BETWEEN 1 AND 500),
  candidate_email TEXT NOT NULL CHECK (char_length(candidate_email) BETWEEN 3 AND 320),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  error_message TEXT,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (batch_id, row_number),
  FOREIGN KEY (batch_id, company_id)
    REFERENCES invite_batches(id, company_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invite_batches_company_created
  ON invite_batches(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invite_batches_pending
  ON invite_batches(status, created_at)
  WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_invite_batch_rows_pending
  ON invite_batch_rows(status, created_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invite_batch_rows_batch
  ON invite_batch_rows(batch_id, row_number);

ALTER TABLE invite_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_batch_rows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own invite batches" ON invite_batches;
CREATE POLICY "Users see own invite batches" ON invite_batches
  FOR SELECT TO authenticated
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users see own invite batch rows" ON invite_batch_rows;
CREATE POLICY "Users see own invite batch rows" ON invite_batch_rows
  FOR SELECT TO authenticated
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Atomically claim a small amount of work. SKIP LOCKED prevents overlapping
-- cron calls from processing the same row; stale claims are retried after ten
-- minutes so a PM2 restart cannot strand a batch forever.
CREATE OR REPLACE FUNCTION claim_invite_batch_rows(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  batch_id UUID,
  company_id UUID,
  candidate_name TEXT,
  candidate_email TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH reset_stale AS (
    UPDATE invite_batch_rows
    SET status = 'pending', updated_at = NOW()
    WHERE status = 'processing'
      AND updated_at < NOW() - INTERVAL '10 minutes'
    RETURNING id
  ),
  picked AS (
    SELECT rows.id
    FROM invite_batch_rows rows
    JOIN invite_batches batches ON batches.id = rows.batch_id
    WHERE rows.status = 'pending'
      AND batches.status IN ('pending', 'processing')
    ORDER BY batches.created_at, rows.row_number
    FOR UPDATE OF rows SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit, 1), 25)
  ),
  claimed AS (
    UPDATE invite_batch_rows rows
    SET
      status = 'processing',
      attempt_count = rows.attempt_count + 1,
      updated_at = NOW()
    FROM picked
    WHERE rows.id = picked.id
    RETURNING rows.id, rows.batch_id, rows.company_id, rows.candidate_name, rows.candidate_email
  ),
  started AS (
    UPDATE invite_batches batches
    SET
      status = 'processing',
      started_at = COALESCE(batches.started_at, NOW()),
      updated_at = NOW()
    WHERE batches.id IN (SELECT DISTINCT batch_id FROM claimed)
    RETURNING batches.id
  )
  SELECT claimed.id, claimed.batch_id, claimed.company_id, claimed.candidate_name, claimed.candidate_email
  FROM claimed;
$$;

REVOKE ALL ON FUNCTION claim_invite_batch_rows(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_invite_batch_rows(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION claim_invite_batch_rows(INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION claim_invite_batch_rows(INTEGER) TO service_role;
