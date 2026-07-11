// Maps every assessment to its real scorer and normalizes the heterogeneous
// return shapes into one evidence structure for the candidate report.
// If a scorer is missing or throws, the report degrades to score-only —
// it never shows an interpretation produced by the wrong instrument.

import {
  AQ_ASSESSMENT_NAME,
  ASSESSMENT_SCORERS,
  extractAnswerArray,
  type AssessmentScorer,
} from "@/lib/assessment-scoring";

const SCORERS: Record<string, AssessmentScorer> = ASSESSMENT_SCORERS;
const AQ_NAME = AQ_ASSESSMENT_NAME;

export interface DimensionScore {
  label: string;
  value: number;
  /** null = no known absolute scale; render relative to the candidate's own profile */
  max: number | null;
}

export interface EvidenceDetail {
  correct?: { correct: number; total: number };
  dimensions?: DimensionScore[];
  /** English text straight from the instrument's scorer */
  interpretation?: string;
  description?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function analyzeResult(assessmentName: string, rawAnswers: unknown): EvidenceDetail | null {
  const scorer = SCORERS[assessmentName];
  const answers = extractAnswerArray(rawAnswers);
  if (!scorer || !answers) return null;

  let out: unknown;
  try {
    out = scorer(answers);
  } catch {
    return null;
  }
  if (!isRecord(out)) return null;

  const detail: EvidenceDetail = {};

  // AQ returns its four CORE dimensions as top-level fields, each out of 50.
  if (assessmentName === AQ_NAME) {
    const dims = (["control", "ownership", "reach", "endurance"] as const)
      .filter((k) => typeof out[k] === "number")
      .map((k) => ({ label: k, value: out[k] as number, max: 50 }));
    if (dims.length === 4) detail.dimensions = dims;
  }

  if (typeof out.correct === "number" && typeof out.total === "number" && out.total > 0) {
    detail.correct = { correct: out.correct, total: out.total };
  }

  if (!detail.dimensions) {
    const dimObj = isRecord(out.dimensions)
      ? out.dimensions
      : isRecord(out.styles)
        ? out.styles
        : isRecord(out.counts)
          ? out.counts
          : null;
    if (dimObj) {
      const dims = Object.entries(dimObj)
        .filter((entry): entry is [string, number] => typeof entry[1] === "number")
        .map(([label, value]) => ({ label, value, max: null }));
      if (dims.length >= 2) detail.dimensions = dims;
    }
  }

  if (typeof out.interpretation === "string" && out.interpretation) detail.interpretation = out.interpretation;
  else if (typeof out.type === "string" && out.type) detail.interpretation = out.type;
  else if (typeof out.dominantStyle === "string" && out.dominantStyle) detail.interpretation = out.dominantStyle;
  if (typeof out.description === "string" && out.description) detail.description = out.description;

  return Object.keys(detail).length > 0 ? detail : null;
}

/** Tests whose single-assessment PDF template matches their instrument. */
export const PDF_SAFE_ASSESSMENTS = new Set(["Critical Thinking Test", AQ_NAME]);
