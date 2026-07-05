-- Safety net: assessments.name needs a unique index for the ON CONFLICT (name)
-- upserts used by migrations 005-008. 001_schema.sql now creates the column
-- as UNIQUE directly; this is a no-op there and only matters for a database
-- that was provisioned before that fix.
CREATE UNIQUE INDEX IF NOT EXISTS assessments_name_key ON assessments (name);
