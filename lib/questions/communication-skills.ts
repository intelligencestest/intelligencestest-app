export type CSdimension = "Written" | "Verbal" | "Listening" | "Non-verbal";

export interface CSQuestion {
  id: number;
  text: string;
  dimension: CSdimension;
  reversed?: boolean;
}

export const CS_QUESTIONS: CSQuestion[] = [
  // Written (9)
  { id: 1,  text: "I organise my written communications with a clear structure before writing.", dimension: "Written" },
  { id: 2,  text: "I proofread my written work carefully before sending it.", dimension: "Written" },
  { id: 3,  text: "I tailor the tone and formality of my writing to the intended audience.", dimension: "Written" },
  { id: 4,  text: "My writing is often unclear or difficult for others to follow.", dimension: "Written", reversed: true },
  { id: 5,  text: "I use precise language in writing to avoid misunderstandings.", dimension: "Written" },
  { id: 6,  text: "I keep written messages concise without omitting important information.", dimension: "Written" },
  { id: 7,  text: "I struggle to express complex ideas clearly in writing.", dimension: "Written", reversed: true },
  { id: 8,  text: "I choose the most appropriate written format (email, report, memo) for each situation.", dimension: "Written" },
  { id: 9,  text: "I ensure the key message is clearly stated in the opening of my written communications.", dimension: "Written" },
  // Verbal (9)
  { id: 10, text: "I speak clearly and at an appropriate pace for my audience.", dimension: "Verbal" },
  { id: 11, text: "I organise my verbal points logically before speaking.", dimension: "Verbal" },
  { id: 12, text: "I am comfortable contributing to discussions in meetings.", dimension: "Verbal" },
  { id: 13, text: "I tend to ramble or lose my train of thought when speaking.", dimension: "Verbal", reversed: true },
  { id: 14, text: "I adapt my speaking style depending on who I am addressing.", dimension: "Verbal" },
  { id: 15, text: "I express disagreement or alternative ideas respectfully and clearly.", dimension: "Verbal" },
  { id: 16, text: "I often avoid speaking up in group settings even when I have something relevant to say.", dimension: "Verbal", reversed: true },
  { id: 17, text: "I can summarise a complex topic in simple, accessible terms when needed.", dimension: "Verbal" },
  { id: 18, text: "I use relevant examples to make verbal explanations clearer.", dimension: "Verbal" },
  // Listening (9)
  { id: 19, text: "I give my full attention to the speaker and avoid distractions.", dimension: "Listening" },
  { id: 20, text: "I ask clarifying questions when I am unsure I have understood correctly.", dimension: "Listening" },
  { id: 21, text: "I can accurately recall the key points of a conversation afterwards.", dimension: "Listening" },
  { id: 22, text: "I often find my mind wandering when someone else is speaking.", dimension: "Listening", reversed: true },
  { id: 23, text: "I listen to understand rather than simply to formulate my response.", dimension: "Listening" },
  { id: 24, text: "I notice emotional cues in someone's voice as well as their words.", dimension: "Listening" },
  { id: 25, text: "I interrupt others before they have finished their point.", dimension: "Listening", reversed: true },
  { id: 26, text: "I paraphrase what I have heard to confirm my understanding.", dimension: "Listening" },
  { id: 27, text: "I can follow detailed verbal instructions without needing them repeated.", dimension: "Listening" },
  // Non-verbal (8)
  { id: 28, text: "I am aware of how my body language may affect the message I communicate.", dimension: "Non-verbal" },
  { id: 29, text: "I maintain appropriate eye contact when speaking or listening.", dimension: "Non-verbal" },
  { id: 30, text: "I notice non-verbal signals that indicate how others are feeling.", dimension: "Non-verbal" },
  { id: 31, text: "I struggle to read facial expressions or body language accurately.", dimension: "Non-verbal", reversed: true },
  { id: 32, text: "I use gestures and facial expressions naturally to reinforce my spoken message.", dimension: "Non-verbal" },
  { id: 33, text: "My body language is consistent with what I am saying.", dimension: "Non-verbal" },
  { id: 34, text: "I am generally unaware of how I come across physically in conversation.", dimension: "Non-verbal", reversed: true },
  { id: 35, text: "I can identify when someone's non-verbal cues contradict what they are saying.", dimension: "Non-verbal" },
];

export const CS_DURATION_SECONDS = 20 * 60;

export const CS_DIMENSIONS: Array<{ label: CSdimension; description: string; className: string }> = [
  { label: "Written",    description: "Clarity, structure, and precision in written communication.", className: "bg-blue-500/10 text-blue-300" },
  { label: "Verbal",     description: "Confidence, clarity, and adaptability when speaking.", className: "bg-emerald-500/10 text-emerald-300" },
  { label: "Listening",  description: "Active listening, retention, and comprehension.", className: "bg-amber-500/10 text-amber-300" },
  { label: "Non-verbal", description: "Awareness of body language, gestures, and visual cues.", className: "bg-pink-500/10 text-pink-300" },
];

export const CS_LIKERT_LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

export function scoreCS(answers: (number | null)[]) {
  const dims: Record<CSdimension, number> = { Written: 0, Verbal: 0, Listening: 0, "Non-verbal": 0 };
  CS_QUESTIONS.forEach((q, i) => {
    const raw = answers[i] ?? 3;
    const value = q.reversed ? 6 - raw : raw;
    dims[q.dimension] += value;
  });
  const total = Object.values(dims).reduce((s, v) => s + v, 0);
  const maxTotal = CS_QUESTIONS.length * 5;
  const percentage = Math.round((total / maxTotal) * 100);
  return { total, percentage, dimensions: dims };
}
