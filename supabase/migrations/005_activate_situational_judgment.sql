INSERT INTO assessments (name, category, description, duration_minutes, question_count, status)
VALUES (
  'Situational Judgment Test',
  'Judgment',
  'Assesses workplace decision-making across 5 competencies: Decision Quality, Collaboration, Accountability, Adaptability, and Communication.',
  20,
  30,
  'active'
)
ON CONFLICT (name) DO UPDATE SET status = 'active';
