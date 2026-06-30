-- Activate 8 strategic and cognitive assessments
INSERT INTO assessments (name, category, description, duration_minutes, question_count, status)
VALUES
  (
    'DISC Assessment',
    'Personality',
    'Profiles behavioural style across the 4 DISC dimensions: Dominance, Influence, Steadiness, and Conscientiousness. 40 forced-choice statements.',
    20, 40, 'active'
  ),
  (
    'Logical Reasoning Test',
    'Cognitive',
    'Evaluates deductive and inductive reasoning ability across syllogisms, logical sequences, and argument analysis. 30 multiple-choice questions.',
    20, 30, 'active'
  ),
  (
    'Spatial Reasoning Test',
    'Cognitive',
    'Assesses the ability to mentally manipulate 2D and 3D shapes, pattern folding, and spatial visualisation. 25 multiple-choice questions.',
    20, 25, 'active'
  ),
  (
    'Adaptability Test',
    'Personality',
    'Measures openness to change, cognitive flexibility, and comfort with ambiguity across workplace scenarios. 30 Likert-scale statements.',
    15, 30, 'active'
  ),
  (
    'Leadership Potential Test',
    'Leadership',
    'Identifies leadership readiness across 4 dimensions: Vision, Influence, Accountability, and Team Development. 35 scenario-based questions.',
    20, 35, 'active'
  ),
  (
    'Conflict Management Test',
    'Workplace Judgment',
    'Evaluates conflict resolution style and effectiveness across 4 dimensions: Collaboration, Compromise, Assertiveness, and De-escalation. 30 scenario-based questions.',
    20, 30, 'active'
  ),
  (
    'Initiative & Proactivity Test',
    'Personality',
    'Assesses self-starting behaviour, ownership mindset, and drive to act without prompting. 30 Likert-scale statements.',
    15, 30, 'active'
  ),
  (
    'Strategic Thinking Test',
    'Cognitive',
    'Measures long-range planning, systems thinking, and the ability to connect decisions to organisational outcomes. 30 scenario-based questions.',
    25, 30, 'active'
  )
ON CONFLICT (name) DO UPDATE SET
  status          = 'active',
  description     = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  question_count  = EXCLUDED.question_count,
  category        = EXCLUDED.category;
