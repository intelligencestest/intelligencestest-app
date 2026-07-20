-- Agency branding used by client-facing shortlist reports.
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS primary_color TEXT NOT NULL DEFAULT '#2457D6',
  ADD COLUMN IF NOT EXISTS report_footer_text TEXT;

ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_primary_color_format;

ALTER TABLE companies
  ADD CONSTRAINT companies_primary_color_format
  CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_report_footer_text_length;

ALTER TABLE companies
  ADD CONSTRAINT companies_report_footer_text_length
  CHECK (report_footer_text IS NULL OR char_length(report_footer_text) <= 180);

-- Public reads are intentional: company logos are client-facing report assets.
-- Uploads and database writes stay server-side behind authenticated routes.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  TRUE,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
