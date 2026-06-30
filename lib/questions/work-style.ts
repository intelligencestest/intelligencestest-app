export type WSDimension = "Analytical" | "Detail-Oriented" | "Collaborative" | "Adaptable" | "Results-Driven";

export interface WSQuestion {
  id: number;
  text: string;
  dimension: WSDimension;
  reversed?: boolean;
}

export const WS_QUESTIONS: WSQuestion[] = [
  // Analytical (8)
  { id: 1,  text: "I prefer to gather and analyse information before making decisions.", dimension: "Analytical" },
  { id: 2,  text: "I look for root causes rather than just addressing symptoms.", dimension: "Analytical" },
  { id: 3,  text: "I enjoy working through complex problems in a structured, systematic way.", dimension: "Analytical" },
  { id: 4,  text: "I base decisions on data and evidence rather than intuition alone.", dimension: "Analytical" },
  { id: 5,  text: "I find it easy to evaluate the strengths and weaknesses of different options.", dimension: "Analytical" },
  { id: 6,  text: "I tend to make quick decisions without thorough analysis.", dimension: "Analytical", reversed: true },
  { id: 7,  text: "I apply logical reasoning when evaluating risks before I act.", dimension: "Analytical" },
  { id: 8,  text: "I find it difficult to draw clear conclusions from complex or ambiguous information.", dimension: "Analytical", reversed: true },
  // Detail-Oriented (8)
  { id: 9,  text: "I pay close attention to detail in everything I do.", dimension: "Detail-Oriented" },
  { id: 10, text: "I check my work carefully before considering it complete.", dimension: "Detail-Oriented" },
  { id: 11, text: "I notice errors and inconsistencies that others often overlook.", dimension: "Detail-Oriented" },
  { id: 12, text: "I prefer thorough, high-quality work over fast, approximate results.", dimension: "Detail-Oriented" },
  { id: 13, text: "I keep records and documentation well organised and up to date.", dimension: "Detail-Oriented" },
  { id: 14, text: "I sometimes overlook important details when working at speed.", dimension: "Detail-Oriented", reversed: true },
  { id: 15, text: "I review the final output against the original requirements before submitting.", dimension: "Detail-Oriented" },
  { id: 16, text: "I find detailed or repetitive tasks frustrating.", dimension: "Detail-Oriented", reversed: true },
  // Collaborative (8)
  { id: 17, text: "I prefer working in a team to working independently.", dimension: "Collaborative" },
  { id: 18, text: "I actively seek input from colleagues before making important decisions.", dimension: "Collaborative" },
  { id: 19, text: "I adjust my approach when others offer a better perspective.", dimension: "Collaborative" },
  { id: 20, text: "I find it easy to build working relationships with new colleagues.", dimension: "Collaborative" },
  { id: 21, text: "I contribute constructively to group discussions and team planning.", dimension: "Collaborative" },
  { id: 22, text: "I prefer to work independently rather than depend on others.", dimension: "Collaborative", reversed: true },
  { id: 23, text: "I share credit for team successes with all contributors.", dimension: "Collaborative" },
  { id: 24, text: "I find it difficult to align with team decisions I personally disagree with.", dimension: "Collaborative", reversed: true },
  // Adaptable (8)
  { id: 25, text: "I adjust quickly when priorities or plans change unexpectedly.", dimension: "Adaptable" },
  { id: 26, text: "I see change as an opportunity rather than a disruption.", dimension: "Adaptable" },
  { id: 27, text: "I am comfortable working with ambiguity when full information is not yet available.", dimension: "Adaptable" },
  { id: 28, text: "I can shift between different types of tasks without losing focus or momentum.", dimension: "Adaptable" },
  { id: 29, text: "I remain effective in high-pressure or uncertain situations.", dimension: "Adaptable" },
  { id: 30, text: "I find it difficult to work effectively outside familiar routines.", dimension: "Adaptable", reversed: true },
  { id: 31, text: "I readily learn new tools, systems, or methods when they are required.", dimension: "Adaptable" },
  { id: 32, text: "Unexpected changes to my plans tend to affect my performance negatively.", dimension: "Adaptable", reversed: true },
  // Results-Driven (8)
  { id: 33, text: "I stay focused on achieving goals even when the path becomes difficult.", dimension: "Results-Driven" },
  { id: 34, text: "I set clear personal targets and actively track my progress against them.", dimension: "Results-Driven" },
  { id: 35, text: "I take initiative without waiting to be directed.", dimension: "Results-Driven" },
  { id: 36, text: "I push myself and my team to deliver excellent results.", dimension: "Results-Driven" },
  { id: 37, text: "I prioritise outcomes over the comfort of familiar or safe routines.", dimension: "Results-Driven" },
  { id: 38, text: "I tend to lose momentum when a project faces significant setbacks.", dimension: "Results-Driven", reversed: true },
  { id: 39, text: "I am proactive in identifying what needs to be done next.", dimension: "Results-Driven" },
  { id: 40, text: "I struggle to maintain focus when recognition or feedback is not immediate.", dimension: "Results-Driven", reversed: true },
];

export const WS_DURATION_SECONDS = 20 * 60;

export const WS_DIMENSIONS: Array<{ label: WSDimension; description: string; className: string }> = [
  { label: "Analytical",      description: "Using data and logic to evaluate options and decisions.", className: "bg-blue-500/10 text-blue-300" },
  { label: "Detail-Oriented", description: "Accuracy, thoroughness, and quality in all tasks.", className: "bg-violet-500/10 text-violet-300" },
  { label: "Collaborative",   description: "Working with and through others to achieve shared goals.", className: "bg-emerald-500/10 text-emerald-300" },
  { label: "Adaptable",       description: "Flexibility and effectiveness in changing conditions.", className: "bg-amber-500/10 text-amber-300" },
  { label: "Results-Driven",  description: "Focus, initiative, and drive to achieve outcomes.", className: "bg-rose-500/10 text-rose-300" },
];

export function scoreWS(answers: (number | null)[]) {
  const dims: Record<WSDimension, number> = {
    Analytical: 0, "Detail-Oriented": 0, Collaborative: 0, Adaptable: 0, "Results-Driven": 0,
  };
  WS_QUESTIONS.forEach((q, i) => {
    const raw = answers[i] ?? 3;
    const value = q.reversed ? 6 - raw : raw;
    dims[q.dimension] += value;
  });
  const total = Object.values(dims).reduce((s, v) => s + v, 0);
  const percentage = Math.round((total / (WS_QUESTIONS.length * 5)) * 100);
  const entries = Object.entries(dims) as [WSDimension, number][];
  const strongestDimension = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max)[0];
  return { total, percentage, dimensions: dims, strongestDimension };
}
