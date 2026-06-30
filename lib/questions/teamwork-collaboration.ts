export type TWDimension = "Cooperation" | "Communication" | "Reliability" | "Conflict Resolution";

export interface TWQuestion {
  id: number;
  text: string;
  dimension: TWDimension;
  reversed?: boolean;
}

export const TW_QUESTIONS: TWQuestion[] = [
  // Cooperation (9)
  { id: 1,  text: "I actively support my colleagues to help them succeed, not only myself.", dimension: "Cooperation" },
  { id: 2,  text: "I am willing to put team goals ahead of my personal preferences when it matters.", dimension: "Cooperation" },
  { id: 3,  text: "I share information and resources with my team without needing to be asked.", dimension: "Cooperation" },
  { id: 4,  text: "I contribute equally to shared tasks rather than allowing others to carry a disproportionate load.", dimension: "Cooperation" },
  { id: 5,  text: "I recognise and appreciate the contributions of my teammates openly.", dimension: "Cooperation" },
  { id: 6,  text: "I prefer to keep my work separate and independent rather than integrating it with the team's work.", dimension: "Cooperation", reversed: true },
  { id: 7,  text: "I am willing to adjust my approach when doing so helps the team operate more effectively.", dimension: "Cooperation" },
  { id: 8,  text: "I step in to help a colleague who is struggling, even when it is not formally my responsibility.", dimension: "Cooperation" },
  { id: 9,  text: "I think about how my decisions and actions affect other team members before I proceed.", dimension: "Cooperation" },
  // Communication (9)
  { id: 10, text: "I keep my teammates informed of my progress without waiting to be asked.", dimension: "Communication" },
  { id: 11, text: "I communicate clearly about what I need from others in order to complete my work effectively.", dimension: "Communication" },
  { id: 12, text: "I listen carefully to teammates' ideas and perspectives before forming my own opinion.", dimension: "Communication" },
  { id: 13, text: "I share my views openly in team discussions, even when they differ from the majority opinion.", dimension: "Communication" },
  { id: 14, text: "I am slow to update the team when my priorities or plans change.", dimension: "Communication", reversed: true },
  { id: 15, text: "I give constructive feedback to colleagues in a way that is both honest and respectful.", dimension: "Communication" },
  { id: 16, text: "I ask for clarification rather than assuming I have understood what a colleague means.", dimension: "Communication" },
  { id: 17, text: "I am transparent with the team about challenges I am facing that may affect our shared work.", dimension: "Communication" },
  { id: 18, text: "I find it difficult to speak up in team settings even when I have something relevant to contribute.", dimension: "Communication", reversed: true },
  // Reliability (9)
  { id: 19, text: "I consistently deliver on what I commit to within agreed timeframes.", dimension: "Reliability" },
  { id: 20, text: "My teammates can count on me to follow through without needing to be chased.", dimension: "Reliability" },
  { id: 21, text: "I communicate ahead of time if I am going to miss a commitment or a deadline.", dimension: "Reliability" },
  { id: 22, text: "I am willing to work outside my comfort zone when the team needs it.", dimension: "Reliability" },
  { id: 23, text: "I sometimes let tasks fall through the cracks when no one is actively checking on them.", dimension: "Reliability", reversed: true },
  { id: 24, text: "I take ownership of my part of a shared project from start to final delivery.", dimension: "Reliability" },
  { id: 25, text: "I am late to deliver on agreed actions more often than I should be.", dimension: "Reliability", reversed: true },
  { id: 26, text: "I go beyond the minimum required when the team's shared success depends on it.", dimension: "Reliability" },
  { id: 27, text: "I honour my commitments to the team even when personal circumstances make it difficult.", dimension: "Reliability" },
  // Conflict Resolution (8)
  { id: 28, text: "When I disagree with a teammate, I raise the issue directly and calmly rather than avoiding it.", dimension: "Conflict Resolution" },
  { id: 29, text: "I make an effort to understand the other person's perspective before I respond in a conflict.", dimension: "Conflict Resolution" },
  { id: 30, text: "I tend to avoid difficult conversations with colleagues and allow issues to build up over time.", dimension: "Conflict Resolution", reversed: true },
  { id: 31, text: "In a conflict, I focus on solving the problem rather than on assigning blame.", dimension: "Conflict Resolution" },
  { id: 32, text: "I make an effort to rebuild the working relationship after a disagreement has been resolved.", dimension: "Conflict Resolution" },
  { id: 33, text: "I am able to separate the professional issue from any personal feelings when a conflict arises.", dimension: "Conflict Resolution" },
  { id: 34, text: "I tend to back down in disagreements even when I genuinely believe I am correct.", dimension: "Conflict Resolution", reversed: true },
  { id: 35, text: "I only involve a team lead or manager in a conflict after direct resolution between the parties has genuinely not worked.", dimension: "Conflict Resolution" },
];

export const TW_DURATION_SECONDS = 20 * 60;

export const TW_DIMENSIONS: Array<{ label: TWDimension; description: string; className: string }> = [
  { label: "Cooperation",         description: "Supporting colleagues and prioritising shared success.", className: "bg-teal-500/10 text-teal-300" },
  { label: "Communication",       description: "Sharing information clearly and listening actively.", className: "bg-sky-500/10 text-sky-300" },
  { label: "Reliability",         description: "Following through on commitments dependably.", className: "bg-emerald-500/10 text-emerald-300" },
  { label: "Conflict Resolution",  description: "Handling disagreements constructively and professionally.", className: "bg-amber-500/10 text-amber-300" },
];

export function scoreTW(answers: (number | null)[]) {
  const dims: Record<TWDimension, number> = { Cooperation: 0, Communication: 0, Reliability: 0, "Conflict Resolution": 0 };
  TW_QUESTIONS.forEach((q, i) => {
    const raw = answers[i] ?? 3;
    const value = q.reversed ? 6 - raw : raw;
    dims[q.dimension] += value;
  });
  const total = Object.values(dims).reduce((s, v) => s + v, 0);
  const percentage = Math.round((total / (TW_QUESTIONS.length * 5)) * 100);
  return { total, percentage, dimensions: dims };
}
