export type IntelligenceLocale = "en" | "es";

export type CompetencyId =
  | "analytical-reasoning"
  | "decision-quality"
  | "evidence-analysis"
  | "judgment-under-ambiguity"
  | "risk-evaluation"
  | "decision-speed-calibration"
  | "structured-problem-solving"
  | "professional-communication"
  | "written-clarity"
  | "active-listening"
  | "interpersonal-awareness"
  | "integrity-judgment"
  | "ethical-compliance"
  | "trust-reliability"
  | "adaptability"
  | "emotional-self-awareness"
  | "emotional-self-regulation"
  | "achievement-motivation"
  | "relationship-management"
  | "team-cooperation"
  | "team-reliability"
  | "conflict-resolution"
  | "customer-empathy"
  | "customer-issue-resolution"
  | "customer-communication"
  | "service-composure"
  | "prospecting-discipline"
  | "consultative-selling"
  | "objection-handling"
  | "deal-advancement"
  | "strategic-direction"
  | "people-development"
  | "team-cohesion"
  | "participative-leadership"
  | "execution-standards"
  | "directive-leadership"
  | "resilience-under-pressure"
  | "adversity-control"
  | "personal-accountability"
  | "setback-containment"
  | "recovery-orientation"
  | "assessment-performance";

export type EvidenceDirection = "positive" | "mixed" | "risk" | "neutral";
export type EvidenceStrength = "strong" | "moderate" | "limited";
export type EvidenceKind =
  | "ability"
  | "resilience"
  | "service"
  | "sales"
  | "leadership"
  | "judgment"
  | "problem-solving"
  | "communication"
  | "integrity"
  | "situational-judgment"
  | "emotional-intelligence"
  | "teamwork"
  | "score-only";
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

export type StructuredAssessmentType =
  | "customer-service"
  | "sales-aptitude"
  | "decision-making"
  | "integrity-ethics";

export interface StructuredMultipleChoiceScoreDetails {
  type: StructuredAssessmentType;
  correct: number;
  total: number;
  percentage: number;
  dimensions: Record<string, number>;
}

export interface ProblemSolvingScoreDetails {
  type: "problem-solving";
  correct: number;
  total: number;
  percentage: number;
  interpretation?: string;
}

export interface LikertDimensionScoreDetails {
  type: "communication-skills" | "emotional-intelligence" | "teamwork-collaboration";
  total: number;
  percentage: number;
  dimensions: Record<string, number>;
}

export interface SituationalJudgmentScoreDetails {
  type: "situational-judgment";
  total: number;
  max: number;
  percentage: number;
  dimensions: Record<string, { score: number; max: number }>;
}

export interface LeadershipScoreDetails {
  type: "leadership-styles";
  score: number;
  dominantStyle: string;
  counts: Record<string, number>;
}

export type AssessmentScoreDetails =
  | CriticalThinkingScoreDetails
  | AQScoreDetails
  | StructuredMultipleChoiceScoreDetails
  | ProblemSolvingScoreDetails
  | LeadershipScoreDetails
  | LikertDimensionScoreDetails
  | SituationalJudgmentScoreDetails;

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
  assessmentKey:
    | "critical-thinking"
    | "aq"
    | "customer-service"
    | "sales-aptitude"
    | "leadership-styles"
    | "decision-making"
    | "problem-solving"
    | "communication-skills"
    | "integrity-ethics"
    | "situational-judgment"
    | "emotional-intelligence"
    | "teamwork-collaboration"
    | "score-only";
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
  engineVersion: string;
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
