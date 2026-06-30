-- Activate 8 B2B-focused assessments
INSERT INTO assessments (name, category, description, duration_minutes, question_count, status)
VALUES
  (
    'Sales Aptitude Test',
    'Sales',
    'Evaluates B2B sales capability across 4 dimensions: Prospecting, Persuasion, Objection Handling, and Closing. 35 scenario-based questions.',
    20, 35, 'active'
  ),
  (
    'Customer Service Skills Test',
    'Customer Service',
    'Assesses customer service effectiveness across 4 dimensions: Empathy, Problem Resolution, Communication, and Patience. 35 scenario-based questions.',
    20, 35, 'active'
  ),
  (
    'Teamwork & Collaboration Test',
    'Teamwork',
    'Profiles collaborative working style across 4 dimensions: Cooperation, Communication, Reliability, and Conflict Resolution. 35 Likert-scale statements.',
    20, 35, 'active'
  ),
  (
    'Time Management Test',
    'Productivity',
    'Assesses time and priority management across 4 dimensions: Prioritization, Planning, Focus, and Deadline Management. 30 scenario-based questions.',
    20, 30, 'active'
  ),
  (
    'Stress Tolerance Test',
    'Resilience',
    'Measures resilience and composure under pressure across 4 dimensions: Emotional Control, Resilience, Coping Strategies, and Performance Under Pressure. 30 Likert-scale statements.',
    15, 30, 'active'
  ),
  (
    'Integrity & Ethics Test',
    'Character',
    'Evaluates professional integrity across 4 dimensions: Honesty, Accountability, Ethics, and Trustworthiness. 30 scenario-based questions.',
    20, 30, 'active'
  ),
  (
    'Decision Making Test',
    'Workplace Judgment',
    'Assesses decision quality across 4 dimensions: Analysis, Judgment, Risk Assessment, and Speed. 30 scenario-based questions.',
    20, 30, 'active'
  ),
  (
    'Learning Agility Test',
    'Cognitive',
    'Measures adaptability and growth mindset across 4 dimensions: Mental Flexibility, Speed of Learning, Feedback Receptivity, and Experimentation. 30 scenario-based questions.',
    20, 30, 'active'
  )
ON CONFLICT (name) DO UPDATE SET
  status = 'active',
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  question_count = EXCLUDED.question_count,
  category = EXCLUDED.category;
