export type STDimension = "Emotional Control" | "Resilience" | "Coping Strategies" | "Performance Under Pressure";

export interface STQuestion {
  id: number;
  text: string;
  dimension: STDimension;
  reversed?: boolean;
}

export const ST_QUESTIONS: STQuestion[] = [
  // Emotional Control (8)
  { id: 1,  text: "I remain calm and composed when dealing with high-stress situations at work.", dimension: "Emotional Control" },
  { id: 2,  text: "I can manage my emotional reactions even when I feel genuinely frustrated or under significant pressure.", dimension: "Emotional Control" },
  { id: 3,  text: "I notice when stress is starting to affect my mood and take steps to manage it before it escalates.", dimension: "Emotional Control" },
  { id: 4,  text: "I tend to become short or irritable with colleagues when I am under significant pressure.", dimension: "Emotional Control", reversed: true },
  { id: 5,  text: "I am able to prevent personal stress from spilling into my professional interactions.", dimension: "Emotional Control" },
  { id: 6,  text: "When stressed, I often make hasty decisions I later regret.", dimension: "Emotional Control", reversed: true },
  { id: 7,  text: "I can stay focused on facts and practical solutions even when a situation feels emotionally charged.", dimension: "Emotional Control" },
  { id: 8,  text: "It is obvious to my colleagues when I am stressed, even when I am trying not to show it.", dimension: "Emotional Control", reversed: true },
  // Resilience (8)
  { id: 9,  text: "When things go wrong, I recover quickly and refocus on what can be done next.", dimension: "Resilience" },
  { id: 10, text: "I view professional setbacks as learning opportunities rather than as failures.", dimension: "Resilience" },
  { id: 11, text: "I maintain my confidence and self-belief even after making a significant mistake at work.", dimension: "Resilience" },
  { id: 12, text: "I tend to dwell on negative outcomes for longer than is useful or productive.", dimension: "Resilience", reversed: true },
  { id: 13, text: "I am able to maintain perspective during difficult or demanding periods at work.", dimension: "Resilience" },
  { id: 14, text: "After a stressful period ends, I return to my normal level of performance relatively quickly.", dimension: "Resilience" },
  { id: 15, text: "When I hit a significant obstacle, I find it difficult to stay motivated and keep going.", dimension: "Resilience", reversed: true },
  { id: 16, text: "I treat challenges as a normal part of working life rather than as a personal threat.", dimension: "Resilience" },
  // Coping Strategies (7)
  { id: 17, text: "I have effective, healthy strategies I use to manage stress when it becomes intense.", dimension: "Coping Strategies" },
  { id: 18, text: "I am proactive about addressing stress before it builds into a larger problem.", dimension: "Coping Strategies" },
  { id: 19, text: "I use physical activity, breaks, or other healthy outlets to decompress from work-related pressure.", dimension: "Coping Strategies" },
  { id: 20, text: "When I feel overwhelmed, I tend to avoid the source of stress rather than addressing it directly.", dimension: "Coping Strategies", reversed: true },
  { id: 21, text: "I am comfortable asking for support or talking to someone when I am struggling with stress.", dimension: "Coping Strategies" },
  { id: 22, text: "I am able to separate work stress from my personal life and genuinely switch off outside working hours.", dimension: "Coping Strategies" },
  { id: 23, text: "I tend to bottle up stress rather than address it in a constructive way.", dimension: "Coping Strategies", reversed: true },
  // Performance Under Pressure (7)
  { id: 24, text: "I perform at or near my best when the stakes are high and the deadline is tight.", dimension: "Performance Under Pressure" },
  { id: 25, text: "I am able to maintain attention to detail even when working under significant time pressure.", dimension: "Performance Under Pressure" },
  { id: 26, text: "When given a difficult or high-stakes task, I feel motivated by the challenge rather than overwhelmed by it.", dimension: "Performance Under Pressure" },
  { id: 27, text: "I make significantly more errors than usual when working under intense time pressure.", dimension: "Performance Under Pressure", reversed: true },
  { id: 28, text: "I can prioritise effectively even when I am simultaneously managing several urgent issues.", dimension: "Performance Under Pressure" },
  { id: 29, text: "High-pressure situations consistently cause my performance to deteriorate noticeably.", dimension: "Performance Under Pressure", reversed: true },
  { id: 30, text: "I am able to deliver quality work even during particularly demanding or stressful periods.", dimension: "Performance Under Pressure" },
];

export const ST_DURATION_SECONDS = 15 * 60;

export const ST_DIMENSIONS: Array<{ label: STDimension; description: string; className: string }> = [
  { label: "Emotional Control",        description: "Managing emotional reactions under pressure.", className: "bg-blue-500/10 text-blue-300" },
  { label: "Resilience",               description: "Recovering and adapting after setbacks.", className: "bg-emerald-500/10 text-emerald-300" },
  { label: "Coping Strategies",        description: "Using healthy methods to manage and reduce stress.", className: "bg-violet-500/10 text-violet-300" },
  { label: "Performance Under Pressure", description: "Maintaining quality and effectiveness in demanding situations.", className: "bg-orange-500/10 text-orange-300" },
];

export function scoreST(answers: (number | null)[]) {
  const dims: Record<STDimension, number> = {
    "Emotional Control": 0,
    Resilience: 0,
    "Coping Strategies": 0,
    "Performance Under Pressure": 0,
  };
  ST_QUESTIONS.forEach((q, i) => {
    const raw = answers[i] ?? 3;
    const value = q.reversed ? 6 - raw : raw;
    dims[q.dimension] += value;
  });
  const total = Object.values(dims).reduce((s, v) => s + v, 0);
  const percentage = Math.round((total / (ST_QUESTIONS.length * 5)) * 100);
  return { total, percentage, dimensions: dims };
}
