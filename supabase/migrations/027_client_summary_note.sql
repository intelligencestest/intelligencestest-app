-- Agency-editable note shown on the client-safe shortlist summary
-- (the free-text "agency recommendation note" section from the brief).
ALTER TABLE hiring_projects ADD COLUMN IF NOT EXISTS client_summary_note TEXT;
