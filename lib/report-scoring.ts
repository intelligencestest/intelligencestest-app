// Maps every assessment to its real scorer and normalizes the heterogeneous
// return shapes into one evidence structure for the candidate report.
// If a scorer is missing or throws, the report degrades to score-only —
// it never shows an interpretation produced by the wrong instrument.

import { scoreResults } from "@/lib/questions/critical-thinking";
import { scoreAQ } from "@/lib/questions/aq";
import { scoreEI } from "@/lib/questions/emotional-intelligence";
import { scoreLeadership } from "@/lib/questions/leadership-styles";
import { scoreNumerical } from "@/lib/questions/numerical-intelligence";
import { scorePersonality } from "@/lib/questions/personality-type";
import { scoreSJT } from "@/lib/questions/situational-judgment";
import { scoreAD } from "@/lib/questions/attention-detail";
import { scoreVR } from "@/lib/questions/verbal-reasoning";
import { scoreAR } from "@/lib/questions/abstract-reasoning";
import { scoreMR } from "@/lib/questions/mechanical-reasoning";
import { scoreCS } from "@/lib/questions/communication-skills";
import { scorePS } from "@/lib/questions/problem-solving";
import { scoreWS } from "@/lib/questions/work-style";
import { scoreSA } from "@/lib/questions/sales-aptitude";
import { scoreCServ } from "@/lib/questions/customer-service-skills";
import { scoreTW } from "@/lib/questions/teamwork-collaboration";
import { scoreTM } from "@/lib/questions/time-management";
import { scoreST } from "@/lib/questions/stress-tolerance";
import { scoreIE } from "@/lib/questions/integrity-ethics";
import { scoreDM } from "@/lib/questions/decision-making";
import { scoreLA } from "@/lib/questions/learning-agility";

type Answers = (number | null)[];
type Scorer = (answers: Answers) => unknown;

const AQ_NAME = "Adversity Quotient (AQ) Test";

const SCORERS: Record<string, Scorer> = {
  "Critical Thinking Test": scoreResults,
  [AQ_NAME]: scoreAQ,
  "Emotional Intelligence Test": scoreEI,
  "Leadership Styles Test": scoreLeadership,
  "Numerical Intelligence Test": scoreNumerical,
  "Personality Type Test": scorePersonality,
  "Situational Judgment Test": scoreSJT,
  "Attention to Detail Test": scoreAD,
  "Verbal Reasoning Test": scoreVR,
  "Abstract Reasoning Test": scoreAR,
  "Mechanical Reasoning Test": scoreMR,
  "Communication Skills Test": scoreCS,
  "Problem Solving Test": scorePS,
  "Work Style Assessment": scoreWS,
  "Sales Aptitude Test": scoreSA,
  "Customer Service Skills Test": scoreCServ,
  "Teamwork & Collaboration Test": scoreTW,
  "Time Management Test": scoreTM,
  "Stress Tolerance Test": scoreST,
  "Integrity & Ethics Test": scoreIE,
  "Decision Making Test": scoreDM,
  "Learning Agility Test": scoreLA,
};

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
  if (!scorer || !Array.isArray(rawAnswers)) return null;

  let out: unknown;
  try {
    out = scorer(rawAnswers as Answers);
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
