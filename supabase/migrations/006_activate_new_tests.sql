-- Activate 7 new assessments
INSERT INTO assessments (name, category, description, duration_minutes, question_count, status)
VALUES
  (
    'Attention to Detail Test',
    'Cognitive',
    'Measures accuracy and precision through 40 error-detection questions covering spelling, data, calculations, formatting, and referential consistency.',
    20, 40, 'active'
  ),
  (
    'Verbal Reasoning Test',
    'Cognitive',
    'Assesses comprehension, word relationships, and logical deduction across 30 questions including analogies, odd-one-out, and syllogisms.',
    20, 30, 'active'
  ),
  (
    'Abstract Reasoning Test',
    'Cognitive',
    'Evaluates pattern recognition and non-verbal reasoning through 25 sequence and matrix questions.',
    20, 25, 'active'
  ),
  (
    'Mechanical Reasoning Test',
    'Mechanical',
    'Tests understanding of mechanical principles — gears, levers, pulleys, forces, circuits, and fluid dynamics — across 30 questions.',
    25, 30, 'active'
  ),
  (
    'Communication Skills Test',
    'Communication',
    'Profiles communication effectiveness across 4 dimensions: Written, Verbal, Listening, and Non-verbal communication. 35 Likert-scale statements.',
    20, 35, 'active'
  ),
  (
    'Problem Solving Test',
    'Workplace Judgment',
    'Assesses workplace problem-solving and decision quality through 30 realistic scenario-based questions.',
    25, 30, 'active'
  ),
  (
    'Work Style Assessment',
    'Work Style',
    'Profiles working preferences across 5 dimensions: Analytical, Detail-Oriented, Collaborative, Adaptable, and Results-Driven. 40 Likert-scale statements.',
    20, 40, 'active'
  )
ON CONFLICT (name) DO UPDATE SET
  status = 'active',
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  question_count = EXCLUDED.question_count;
