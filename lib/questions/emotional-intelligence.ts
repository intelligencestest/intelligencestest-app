export type EIDimension =
  | "Self-awareness"
  | "Self-regulation"
  | "Motivation"
  | "Empathy"
  | "Social Skills";

export interface EIQuestion {
  id: number;
  text: string;
  dimension: EIDimension;
  reversed?: boolean;
}

export const EI_QUESTIONS: EIQuestion[] = [
  { id: 1, text: "I can usually name the emotion I am experiencing while it is happening.", dimension: "Self-awareness" },
  { id: 2, text: "I notice how my mood affects the way I communicate with others.", dimension: "Self-awareness" },
  { id: 3, text: "I understand the personal triggers that can make me defensive.", dimension: "Self-awareness" },
  { id: 4, text: "I often act without noticing how I feel until later.", dimension: "Self-awareness", reversed: true },
  { id: 5, text: "I can recognize when stress is affecting my judgment.", dimension: "Self-awareness" },
  { id: 6, text: "I seek feedback to understand how others experience me.", dimension: "Self-awareness" },
  { id: 7, text: "I can separate facts from my emotional interpretation of a situation.", dimension: "Self-awareness" },
  { id: 8, text: "I rarely understand why certain situations upset me.", dimension: "Self-awareness", reversed: true },

  { id: 9, text: "I can stay calm enough to respond thoughtfully during tension.", dimension: "Self-regulation" },
  { id: 10, text: "When I feel frustrated, I pause before speaking or acting.", dimension: "Self-regulation" },
  { id: 11, text: "I recover quickly after a difficult interaction.", dimension: "Self-regulation" },
  { id: 12, text: "I say things I later regret when pressure is high.", dimension: "Self-regulation", reversed: true },
  { id: 13, text: "I can adjust my behavior when my first reaction would be unhelpful.", dimension: "Self-regulation" },
  { id: 14, text: "I handle unexpected changes without losing focus.", dimension: "Self-regulation" },
  { id: 15, text: "I manage conflict without escalating it unnecessarily.", dimension: "Self-regulation" },
  { id: 16, text: "Small setbacks often disrupt my mood for the rest of the day.", dimension: "Self-regulation", reversed: true },

  { id: 17, text: "I stay committed to important goals even when progress is slow.", dimension: "Motivation" },
  { id: 18, text: "I can find meaning in work that is challenging or repetitive.", dimension: "Motivation" },
  { id: 19, text: "I set personal standards that push me to improve.", dimension: "Motivation" },
  { id: 20, text: "I lose energy quickly when recognition is not immediate.", dimension: "Motivation", reversed: true },
  { id: 21, text: "I look for lessons when something does not go as planned.", dimension: "Motivation" },
  { id: 22, text: "I remain optimistic while still being realistic about obstacles.", dimension: "Motivation" },
  { id: 23, text: "I take initiative without waiting to be told every next step.", dimension: "Motivation" },
  { id: 24, text: "I avoid difficult goals if success is uncertain.", dimension: "Motivation", reversed: true },

  { id: 25, text: "I can usually sense when someone is uncomfortable even if they do not say it.", dimension: "Empathy" },
  { id: 26, text: "I listen for what people feel as well as what they say.", dimension: "Empathy" },
  { id: 27, text: "I consider how decisions may affect people with different needs.", dimension: "Empathy" },
  { id: 28, text: "I find it difficult to understand why people react differently than I do.", dimension: "Empathy", reversed: true },
  { id: 29, text: "I ask questions before assuming I understand another person's perspective.", dimension: "Empathy" },
  { id: 30, text: "I notice when someone needs support, space, or encouragement.", dimension: "Empathy" },
  { id: 31, text: "I can disagree with someone while still respecting their experience.", dimension: "Empathy" },
  { id: 32, text: "When people are emotional, I tend to dismiss their concerns.", dimension: "Empathy", reversed: true },

  { id: 33, text: "I build trust by communicating clearly and consistently.", dimension: "Social Skills" },
  { id: 34, text: "I can adapt my communication style to different people.", dimension: "Social Skills" },
  { id: 35, text: "I help groups move toward agreement during disagreement.", dimension: "Social Skills" },
  { id: 36, text: "I avoid important conversations when they may become uncomfortable.", dimension: "Social Skills", reversed: true },
  { id: 37, text: "I give feedback in a way that is direct and respectful.", dimension: "Social Skills" },
  { id: 38, text: "I maintain professional relationships even after conflict.", dimension: "Social Skills" },
  { id: 39, text: "I can influence others without relying on authority or pressure.", dimension: "Social Skills" },
  { id: 40, text: "I struggle to repair relationships after misunderstandings.", dimension: "Social Skills", reversed: true },
];

export const EI_DURATION_SECONDS = 20 * 60;

export const EI_DIMENSIONS: Array<{ label: EIDimension; description: string; className: string }> = [
  { label: "Self-awareness", description: "Recognizing emotions, triggers, and impact.", className: "bg-purple-500/10 text-purple-300" },
  { label: "Self-regulation", description: "Managing impulses, stress, and reactions.", className: "bg-blue-500/10 text-blue-300" },
  { label: "Motivation", description: "Sustaining drive, optimism, and initiative.", className: "bg-amber-500/10 text-amber-300" },
  { label: "Empathy", description: "Understanding and respecting others' perspectives.", className: "bg-pink-500/10 text-pink-300" },
  { label: "Social Skills", description: "Building trust, collaboration, and influence.", className: "bg-emerald-500/10 text-emerald-300" },
];

export function scoreEI(answers: (number | null)[]) {
  const dimensions: Record<EIDimension, number> = {
    "Self-awareness": 0,
    "Self-regulation": 0,
    Motivation: 0,
    Empathy: 0,
    "Social Skills": 0,
  };

  EI_QUESTIONS.forEach((question, index) => {
    const raw = answers[index] ?? 3;
    const value = question.reversed ? 6 - raw : raw;
    dimensions[question.dimension] += value;
  });

  const total = Object.values(dimensions).reduce((sum, value) => sum + value, 0);
  const percentage = Math.round((total / (EI_QUESTIONS.length * 5)) * 100);

  return {
    total,
    percentage,
    dimensions,
  };
}
