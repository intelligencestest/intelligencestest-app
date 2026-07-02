-- Make Spanish the database default for new B2B workspaces and candidates.
ALTER TABLE companies ALTER COLUMN language SET DEFAULT 'es';
ALTER TABLE candidates ALTER COLUMN language SET DEFAULT 'es';
