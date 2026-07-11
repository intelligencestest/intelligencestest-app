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

export type AssessmentAnswers = (number | null)[];
export type AssessmentScorer = (answers: AssessmentAnswers) => unknown;

export const AQ_ASSESSMENT_NAME = "Adversity Quotient (AQ) Test";

const CHOICE_4 = { min: 0, max: 3 };
const CHOICE_6 = { min: 0, max: 5 };
const LIKERT_5 = { min: 1, max: 5 };

export const ASSESSMENT_SCORERS: Record<string, AssessmentScorer> = {
  "Critical Thinking Test": scoreResults,
  [AQ_ASSESSMENT_NAME]: scoreAQ,
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

const ASSESSMENT_ANSWER_RANGES: Record<string, { min: number; max: number }> = {
  "Critical Thinking Test": CHOICE_4,
  [AQ_ASSESSMENT_NAME]: LIKERT_5,
  "Emotional Intelligence Test": LIKERT_5,
  "Leadership Styles Test": CHOICE_6,
  "Numerical Intelligence Test": CHOICE_4,
  "Personality Type Test": LIKERT_5,
  "Situational Judgment Test": CHOICE_4,
  "Attention to Detail Test": CHOICE_4,
  "Verbal Reasoning Test": CHOICE_4,
  "Abstract Reasoning Test": CHOICE_4,
  "Mechanical Reasoning Test": CHOICE_4,
  "Communication Skills Test": LIKERT_5,
  "Problem Solving Test": CHOICE_4,
  "Work Style Assessment": LIKERT_5,
  "Sales Aptitude Test": CHOICE_4,
  "Customer Service Skills Test": CHOICE_4,
  "Teamwork & Collaboration Test": LIKERT_5,
  "Time Management Test": CHOICE_4,
  "Stress Tolerance Test": LIKERT_5,
  "Integrity & Ethics Test": CHOICE_4,
  "Decision Making Test": CHOICE_4,
  "Learning Agility Test": CHOICE_4,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampScore(score: number, max = 100) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(max, Math.round(score)));
}

function normalizeAnswers(raw: unknown[]): AssessmentAnswers {
  return raw.map((answer) => {
    if (answer === null) return null;
    if (Number.isInteger(answer) && (answer as number) >= 0) return answer as number;
    return null;
  });
}

export function extractAnswerArray(rawAnswers: unknown): AssessmentAnswers | null {
  if (Array.isArray(rawAnswers)) return normalizeAnswers(rawAnswers);
  if (isRecord(rawAnswers) && Array.isArray(rawAnswers.answers)) {
    return normalizeAnswers(rawAnswers.answers);
  }
  return null;
}

function answersFitRange(answers: AssessmentAnswers, range: { min: number; max: number }) {
  return answers.every((answer) => answer === null || (answer >= range.min && answer <= range.max));
}

function scoreValueFor(assessmentName: string, scored: unknown) {
  if (!isRecord(scored)) return null;

  if (assessmentName === AQ_ASSESSMENT_NAME && typeof scored.total === "number") {
    return clampScore(scored.total, 200);
  }

  if (typeof scored.percentage === "number") return clampScore(scored.percentage);
  if (typeof scored.score === "number") return clampScore(scored.score);
  return null;
}

export function scoreAssessmentSubmission(assessmentName: string, rawAnswers: unknown) {
  const scorer = ASSESSMENT_SCORERS[assessmentName];
  if (!scorer) {
    return { error: "Assessment scoring is not configured" as const };
  }

  const answers = extractAnswerArray(rawAnswers);
  if (!answers) {
    return { error: "Submitted answers are invalid" as const };
  }

  const range = ASSESSMENT_ANSWER_RANGES[assessmentName];
  if (!range || !answersFitRange(answers, range)) {
    return { error: "Submitted answers are outside the valid range" as const };
  }

  const scored = scorer(answers);
  const score = scoreValueFor(assessmentName, scored);
  if (score === null) {
    return { error: "Assessment score could not be calculated" as const };
  }

  return { score, answers, scored };
}
