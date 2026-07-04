export type IntelligenceLocale = "en" | "es";

export type CompetencyId =
  | "analytical-reasoning"
  | "decision-quality"
  | "resilience-under-pressure"
  | "adversity-control"
  | "personal-accountability"
  | "setback-containment"
  | "recovery-orientation"
  | "assessment-performance";

export type EvidenceDirection = "positive" | "mixed" | "risk" | "neutral";
export type EvidenceStrength = "strong" | "moderate" | "limited";
export type EvidenceKind = "ability" | "resilience" | "score-only";
export type RiskSeverity = "high" | "medium" | "low";
export type ConfidenceLevel = "high" | "moderate" | "low";

export interface LocalizedText {
  en: string;
  es: string;
}

export interface CompetencyDefinition {
  id: CompetencyId;
  label: LocalizedText;
  category: LocalizedText;
  businessQuestion: LocalizedText;
}

export interface CriticalThinkingScoreDetails {
  type: "critical-thinking";
  correct: number;
  total: number;
  percentage: number;
  interpretation?: string;
}

export interface AQScoreDetails {
  type: "aq";
  total: number;
  control: number;
  ownership: number;
  reach: number;
  endurance: number;
  interpretation?: string;
  description?: string;
}

export type AssessmentScoreDetails = CriticalThinkingScoreDetails | AQScoreDetails;

export interface AssessmentResultInput {
  id?: string;
  assessmentId?: string;
  name: string;
  category?: string;
  score: number;
  completedAt: string;
  rawAnswers?: unknown;
  scoreDetails?: AssessmentScoreDetails;
}

export interface EvidenceSignal {
  id: string;
  assessmentId: string;
  assessmentName: string;
  assessmentKey: "critical-thinking" | "aq" | "score-only";
  competencyId: CompetencyId;
  competencyLabel: string;
  dimensionId?: string;
  dimensionLabel?: string;
  kind: EvidenceKind;
  score: number;
  maxScore: number;
  normalizedScore: number;
  direction: EvidenceDirection;
  strength: EvidenceStrength;
  statement: string;
  businessImpact: string;
  limitation?: string;
  rawEvidence?: string;
}

export interface CompetencyEvidence {
  competencyId: CompetencyId;
  label: string;
  category: string;
  score: number;
  direction: EvidenceDirection;
  strength: EvidenceStrength;
  evidenceSignalIds: string[];
  summary: string;
}

export interface HiringRisk {
  id: string;
  competencyId: CompetencyId;
  competencyLabel: string;
  severity: RiskSeverity;
  statement: string;
  businessImpact: string;
  evidenceSignalIds: string[];
  validationFocus: string;
}

export interface InterviewValidationQuestion {
  competency: string;
  question: string;
  reason: string;
  evidenceSignalIds: string[];
  riskId?: string;
}

export interface ConfidenceAnalysis {
  level: ConfidenceLevel;
  score: number;
  factors: string[];
  limitations: string[];
}

export interface IntelligenceRecommendation {
  level: "strong" | "proceed" | "review" | "caution" | "notRecommended";
  title: string;
  rationale: string;
  confidence: ConfidenceLevel;
  evidenceSignalIds: string[];
  riskIds: string[];
  nextSteps: string[];
  limitations: string[];
}

export interface QueueIntelligenceProjection {
  recommendation: IntelligenceRecommendation["level"] | null;
  confidence: ConfidenceLevel | null;
  /** One candidate-specific sentence explaining the recommendation. */
  headline: string | null;
  /** Strongest positively-evidenced competency label, if any. */
  topCompetency: string | null;
  /** Highest-severity hiring risk, if any. */
  primaryRisk: {
    id?: string;
    label: string;
    severity: RiskSeverity;
    evidenceSignalIds?: string[];
  } | null;
  /** Whether interview validation questions are ready for this candidate. */
  interviewKitReady: boolean;
  /** Number of validation prompts available for the recruiter workflow. */
  interviewQuestionCount: number;
  /** Evidence IDs supporting the queue-level recommendation. */
  evidenceSignalIds: string[];
  /** Source assessment IDs that produced this projection, when available. */
  sourceAssessmentIds: string[];
}

export interface AssessmentIntelligenceReport {
  locale: IntelligenceLocale;
  completedAssessmentCount: number;
  evidenceSignals: EvidenceSignal[];
  competencyEvidence: CompetencyEvidence[];
  strengths: string[];
  developmentAreas: string[];
  risks: HiringRisk[];
  interviewQuestions: InterviewValidationQuestion[];
  confidence: ConfidenceAnalysis;
  recommendation: IntelligenceRecommendation;
  executiveSummary: {
    headline: string;
    summary: string;
    evidence: string[];
  };
  methodologyLimitations: string[];
}
