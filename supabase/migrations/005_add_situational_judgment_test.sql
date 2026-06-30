UPDATE assessments
SET
  category = 'Workplace Judgment',
  description = 'Measures practical judgment across realistic workplace scenarios',
  duration_minutes = 20,
  question_count = 30,
  status = 'active'
WHERE name = 'Situational Judgment Test';

INSERT INTO assessments (name, category, description, duration_minutes, question_count, status)
SELECT
  'Situational Judgment Test',
  'Workplace Judgment',
  'Measures practical judgment across realistic workplace scenarios',
  20,
  30,
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM assessments WHERE name = 'Situational Judgment Test'
);
