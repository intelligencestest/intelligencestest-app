-- Deactivate catalog-only assessments that have no question bank, route, or scorer.
-- They remain in historical data if ever referenced, but are no longer selectable
-- as active tests in the product catalog.
UPDATE assessments
SET status = 'retired'
WHERE name IN (
  'DISC Assessment',
  'Logical Reasoning Test',
  'Spatial Reasoning Test',
  'Adaptability Test',
  'Leadership Potential Test',
  'Conflict Management Test',
  'Initiative & Proactivity Test',
  'Strategic Thinking Test'
);
