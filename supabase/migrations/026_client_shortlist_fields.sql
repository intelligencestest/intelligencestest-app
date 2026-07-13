-- Agency pivot: client + role fields on hiring_projects.
-- Deliberately not a separate `clients` table yet — client_name stays
-- free text so agencies aren't blocked while we validate the workflow.
-- Migrate into a real clients table later if agencies need reusable
-- client records / cross-shortlist history.

ALTER TABLE hiring_projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE hiring_projects ADD COLUMN IF NOT EXISTS role_title TEXT;

CREATE INDEX IF NOT EXISTS idx_hiring_projects_client_name ON hiring_projects(client_name);
