/**
 * Minimal Anthropic Messages API call — same shape as the Resend usage in
 * lib/trial-email.ts (thin, direct, no wrapper class). No SDK is installed;
 * this is the only call site so far, and the REST call is simple enough
 * that adding @anthropic-ai/sdk isn't worth it yet.
 *
 * Used to generate the page-2 narrative paragraph for the client-facing
 * shortlist brief (lib/pdf/client-brief-template.ts). Never throws — falls
 * back to a deterministic, still-natural-prose paragraph built from
 * candidate-specific evidence if ANTHROPIC_API_KEY is unset or the call
 * fails, so PDF generation never hard-fails on this step.
 */

export type NarrativeLocale = "en" | "es" | "fr";

export interface NarrativeCandidateInput {
  name: string;
  /** e.g. "Recommended for client interview" */
  recommendationTitle: string;
  /** Candidate-specific, score-grounded evidence written only for page 2. */
  executiveEvidence: string;
  isPrimary: boolean;
}

export interface NarrativeInput {
  locale: NarrativeLocale;
  roleTitle: string;
  totalCandidates: number;
  /** Full size of the scaled recommended set (see targetRecommendedCount in
   * the client-brief route) — may be larger than `candidates`, which only
   * carries the top 2 for the narrative to name directly. */
  recommendedCount: number;
  /** Top 1-2 ranked candidates to name directly in the narrative. */
  candidates: NarrativeCandidateInput[];
}

function localePrompt(locale: NarrativeLocale): string {
  if (locale === "es") return "Spanish";
  if (locale === "fr") return "French";
  return "English";
}

function buildPrompt(input: NarrativeInput): string {
  const candidateLines = input.candidates
    .map((c) => `- ${c.name} (${c.isPrimary ? "primary" : "secondary"} recommendation, "${c.recommendationTitle}"): ${c.executiveEvidence}`)
    .join("\n");

  return `You are writing the executive summary paragraph of a client-facing recruitment shortlist brief for a hiring agency's client. Write in ${localePrompt(input.locale)}.

Role: ${input.roleTitle}
Candidates evaluated: ${input.totalCandidates}
Candidates recommended: ${input.recommendedCount}
Top-ranked candidates:
${candidateLines}

Write a single narrative paragraph of 3-4 short sentences and no more than 360 characters, in natural prose (no bullet points, no headers). Begin with the decision: name the top-ranked candidate and state why the client should interview them first. If there is a second candidate, identify the distinct reason they remain the next priority. Mention how many candidates were evaluated and recommended only after that decision-first opening (use the exact recommended count above; if it is larger than 2, make clear the named candidates lead a larger recommended set). Use each candidate's supplied evidence, but paraphrase it naturally. Never repeat a clause, framing sentence, or candidate description between candidates. Tone: confident, professional, consultative, like a recruiter briefing a client. Do not use words like "incomplete", "verification status", "score", or any internal assessment jargon. Output only the paragraph text, nothing else.`;
}

function fallbackNarrative(input: NarrativeInput): string {
  const primary = input.candidates.find((c) => c.isPrimary) ?? input.candidates[0];
  const secondary = input.candidates.find((c) => !c.isPrimary);
  const moreThanNamed = input.recommendedCount > input.candidates.length;

  if (!primary) {
    if (input.locale === "es") return `Se evaluaron ${input.totalCandidates} candidatos para el puesto de ${input.roleTitle}.`;
    if (input.locale === "fr") return `${input.totalCandidates} candidats ont été évalués pour le poste de ${input.roleTitle}.`;
    return `${input.totalCandidates} candidates were evaluated for the ${input.roleTitle} role.`;
  }

  if (input.locale === "es") {
    const lead = moreThanNamed
      ? `Entreviste primero a ${primary.name}. ${primary.executiveEvidence} ${secondary ? `${secondary.name} es la siguiente prioridad: ${secondary.executiveEvidence} ` : ""}De ${input.totalCandidates} candidatos evaluados para el puesto de ${input.roleTitle}, ${input.recommendedCount} integran el grupo recomendado.`
      : `Entreviste primero a ${primary.name}. ${primary.executiveEvidence}${secondary ? ` ${secondary.name} es la siguiente prioridad: ${secondary.executiveEvidence}` : ""} Se evaluaron ${input.totalCandidates} candidatos para el puesto de ${input.roleTitle}.`;
    return lead;
  }
  if (input.locale === "fr") {
    const lead = moreThanNamed
      ? `Rencontrez ${primary.name} en premier. ${primary.executiveEvidence} ${secondary ? `${secondary.name} est la priorité suivante : ${secondary.executiveEvidence} ` : ""}Sur les ${input.totalCandidates} candidats évalués pour le poste de ${input.roleTitle}, ${input.recommendedCount} composent le groupe recommandé.`
      : `Rencontrez ${primary.name} en premier. ${primary.executiveEvidence}${secondary ? ` ${secondary.name} est la priorité suivante : ${secondary.executiveEvidence}` : ""} ${input.totalCandidates} candidats ont été évalués pour le poste de ${input.roleTitle}.`;
    return lead;
  }
  const lead = moreThanNamed
    ? `Interview ${primary.name} first. ${primary.executiveEvidence} ${secondary ? `${secondary.name} is the next priority: ${secondary.executiveEvidence} ` : ""}Of ${input.totalCandidates} candidates evaluated for the ${input.roleTitle} role, ${input.recommendedCount} make up the recommended group.`
    : `Interview ${primary.name} first. ${primary.executiveEvidence}${secondary ? ` ${secondary.name} is the next priority: ${secondary.executiveEvidence}` : ""} ${input.totalCandidates} candidates were evaluated for the ${input.roleTitle} role.`;
  return lead;
}

export async function generateShortlistNarrative(input: NarrativeInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackNarrative(input);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 300,
        messages: [{ role: "user", content: buildPrompt(input) }],
      }),
    });

    if (!response.ok) return fallbackNarrative(input);

    const data: unknown = await response.json();
    const text =
      data && typeof data === "object" && "content" in data && Array.isArray((data as { content: unknown }).content)
        ? (data as { content: { text?: string }[] }).content[0]?.text
        : undefined;

    return typeof text === "string" && text.trim() ? text.trim() : fallbackNarrative(input);
  } catch {
    return fallbackNarrative(input);
  }
}
