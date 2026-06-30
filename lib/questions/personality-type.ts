export type PersonalityDimension =
  | "Openness"
  | "Conscientiousness"
  | "Extraversion"
  | "Agreeableness"
  | "Emotional Stability";

export interface PersonalityQuestion {
  id: number;
  text: string;
  dimension: PersonalityDimension;
  reversed?: boolean;
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  { id: 1, text: "I enjoy exploring new ideas, methods, or perspectives.", dimension: "Openness" },
  { id: 2, text: "I am curious about topics outside my usual area of work.", dimension: "Openness" },
  { id: 3, text: "I like finding creative approaches to familiar problems.", dimension: "Openness" },
  { id: 4, text: "I prefer routines so strongly that I avoid trying new approaches.", dimension: "Openness", reversed: true },
  { id: 5, text: "I notice patterns and possibilities that others may overlook.", dimension: "Openness" },
  { id: 6, text: "I enjoy learning skills even when they are not immediately required.", dimension: "Openness" },
  { id: 7, text: "I am comfortable with ambiguity while an idea is still forming.", dimension: "Openness" },
  { id: 8, text: "I rarely enjoy abstract or imaginative discussions.", dimension: "Openness", reversed: true },

  { id: 9, text: "I plan my work carefully before moving into execution.", dimension: "Conscientiousness" },
  { id: 10, text: "I follow through on commitments even when tasks become tedious.", dimension: "Conscientiousness" },
  { id: 11, text: "I keep important details organized and easy to find.", dimension: "Conscientiousness" },
  { id: 12, text: "I often leave things unfinished when a task loses momentum.", dimension: "Conscientiousness", reversed: true },
  { id: 13, text: "I check my work for accuracy before considering it complete.", dimension: "Conscientiousness" },
  { id: 14, text: "I manage deadlines by starting early enough to adjust if needed.", dimension: "Conscientiousness" },
  { id: 15, text: "I prefer clear priorities and structured execution.", dimension: "Conscientiousness" },
  { id: 16, text: "I frequently underestimate how long work will take.", dimension: "Conscientiousness", reversed: true },

  { id: 17, text: "I gain energy from interacting with people during the day.", dimension: "Extraversion" },
  { id: 18, text: "I am comfortable speaking up in group discussions.", dimension: "Extraversion" },
  { id: 19, text: "I tend to initiate conversations with new people.", dimension: "Extraversion" },
  { id: 20, text: "I prefer to stay quiet even when I have something useful to add.", dimension: "Extraversion", reversed: true },
  { id: 21, text: "I bring visible enthusiasm to collaborative work.", dimension: "Extraversion" },
  { id: 22, text: "I find it natural to build relationships across teams.", dimension: "Extraversion" },
  { id: 23, text: "I am comfortable taking the lead in social or group situations.", dimension: "Extraversion" },
  { id: 24, text: "Frequent interaction drains me so much that I avoid it whenever possible.", dimension: "Extraversion", reversed: true },

  { id: 25, text: "I try to understand other people's needs before making judgments.", dimension: "Agreeableness" },
  { id: 26, text: "I look for cooperative solutions during disagreement.", dimension: "Agreeableness" },
  { id: 27, text: "I am considerate of how my actions affect others.", dimension: "Agreeableness" },
  { id: 28, text: "I can be blunt in ways that damage trust.", dimension: "Agreeableness", reversed: true },
  { id: 29, text: "I give people the benefit of the doubt when possible.", dimension: "Agreeableness" },
  { id: 30, text: "I am willing to help colleagues even when it is not directly my responsibility.", dimension: "Agreeableness" },
  { id: 31, text: "I handle conflict with respect for the other person's dignity.", dimension: "Agreeableness" },
  { id: 32, text: "I often compete with others when collaboration would work better.", dimension: "Agreeableness", reversed: true },

  { id: 33, text: "I stay composed when work becomes uncertain or stressful.", dimension: "Emotional Stability" },
  { id: 34, text: "I recover quickly after receiving difficult feedback.", dimension: "Emotional Stability" },
  { id: 35, text: "I can keep perspective when several things go wrong at once.", dimension: "Emotional Stability" },
  { id: 36, text: "I often feel overwhelmed by normal work pressure.", dimension: "Emotional Stability", reversed: true },
  { id: 37, text: "I remain steady when priorities change unexpectedly.", dimension: "Emotional Stability" },
  { id: 38, text: "I can manage frustration without letting it control my behavior.", dimension: "Emotional Stability" },
  { id: 39, text: "I usually sleep on problems rather than replaying them constantly.", dimension: "Emotional Stability" },
  { id: 40, text: "Small setbacks can make me anxious for a long time.", dimension: "Emotional Stability", reversed: true },
];

export const PERSONALITY_DURATION_SECONDS = 20 * 60;

export const PERSONALITY_DIMENSIONS: Array<{ label: PersonalityDimension; description: string; className: string }> = [
  { label: "Openness", description: "Curiosity, imagination, and comfort with new ideas.", className: "bg-purple-500/10 text-purple-300" },
  { label: "Conscientiousness", description: "Organization, reliability, and follow-through.", className: "bg-blue-500/10 text-blue-300" },
  { label: "Extraversion", description: "Social energy, assertiveness, and expressiveness.", className: "bg-amber-500/10 text-amber-300" },
  { label: "Agreeableness", description: "Cooperation, empathy, and trust-building.", className: "bg-emerald-500/10 text-emerald-300" },
  { label: "Emotional Stability", description: "Composure, resilience, and stress regulation.", className: "bg-cyan-500/10 text-cyan-300" },
];

export function scorePersonality(answers: (number | null)[]) {
  const dimensions: Record<PersonalityDimension, number> = {
    Openness: 0,
    Conscientiousness: 0,
    Extraversion: 0,
    Agreeableness: 0,
    "Emotional Stability": 0,
  };

  PERSONALITY_QUESTIONS.forEach((question, index) => {
    const raw = answers[index] ?? 3;
    const value = question.reversed ? 6 - raw : raw;
    dimensions[question.dimension] += value;
  });

  const total = Object.values(dimensions).reduce((sum, value) => sum + value, 0);
  const percentage = Math.round((total / (PERSONALITY_QUESTIONS.length * 5)) * 100);

  const strongestDimension = (Object.keys(dimensions) as PersonalityDimension[])
    .sort((a, b) => dimensions[b] - dimensions[a])[0];

  return {
    total,
    percentage,
    dimensions,
    strongestDimension,
  };
}
