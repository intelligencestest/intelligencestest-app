-- ============================================================
-- Intelligences Test – initial schema
-- Run once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hiring_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  question_count INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES hiring_projects(id) NOT NULL,
  assessment_id UUID REFERENCES assessments(id) NOT NULL
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  project_id UUID REFERENCES hiring_projects(id) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'invited',
  token TEXT UNIQUE,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  assessment_id UUID REFERENCES assessments(id) NOT NULL,
  project_id UUID REFERENCES hiring_projects(id) NOT NULL,
  score INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  raw_answers JSONB
);

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hiring_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users see own company" ON companies
  FOR ALL USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users see own company data" ON hiring_projects
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users see own candidates" ON candidates
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users see own results" ON results
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Seed assessments (global, not company-scoped — no RLS needed)
INSERT INTO assessments (name, category, description, duration_minutes, question_count, status) VALUES
('Critical Thinking Test',      'Cognitive',    'Measures analytical and critical reasoning ability',        25, 40, 'active'),
('Adversity Quotient (AQ) Test','Resilience',   'Measures capacity to handle adversity and challenges',      20, 40, 'active'),
('Emotional Intelligence Test', 'Personality',  'Measures EQ across 5 Goleman domains',                     20, 40, 'coming_soon'),
('Fluid Intelligence Test',     'Cognitive',    'Measures raw reasoning capacity',                          25, 40, 'coming_soon'),
('Leadership Styles Test',      'Leadership',   'Identifies dominant leadership style',                     15, 30, 'coming_soon'),
('Personality Type Test',       'Personality',  'Full personality type profile',                            20, 40, 'coming_soon'),
('Numerical Intelligence Test', 'Cognitive',    'Measures quantitative reasoning ability',                  20, 35, 'coming_soon'),
('Social Intelligence Test',    'Personality',  'Measures people reading and social effectiveness',         18, 35, 'coming_soon');
