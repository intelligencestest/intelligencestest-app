UPDATE assessments
SET status = 'active'
WHERE name IN (
  'Emotional Intelligence Test',
  'Leadership Styles Test',
  'Numerical Intelligence Test'
);
