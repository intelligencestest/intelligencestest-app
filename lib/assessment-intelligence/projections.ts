import type {
  AssessmentIntelligenceReport,
  ConfidenceLevel,
  ExecutiveBrief,
  ExecutiveBriefConfidenceLevel,
  ExecutiveBriefDecisionLevel,
  EvidenceDirection,
  IntelligenceRecommendation,
  QueueIntelligenceProjection,
  RiskSeverity,
} from "./types";

export type RecommendationLevel = IntelligenceRecommendation["level"];

/** Sort weight: stronger recommendations first, unknown last. */
export const RECOMMENDATION_ORDER: Record<RecommendationLevel, number> = {
  strong: 0,
  proceed: 1,
  review: 2,
  caution: 3,
  notRecommended: 4,
};

const RISK_ORDER: Record<RiskSeverity, number> = { high: 0, medium: 1, low: 2 };
const EVIDENCE_ORDER: Record<EvidenceDirection, number> = { risk: 0, mixed: 1, positive: 2, neutral: 3 };

export function emptyQueueIntelligenceProjection(): QueueIntelligenceProjection {
  return {
    recommendation: null,
    confidence: null,
    headline: null,
    topCompetency: null,
    primaryRisk: null,
    interviewKitReady: false,
    interviewQuestionCount: 0,
    evidenceSignalIds: [],
    sourceAssessmentIds: [],
  };
}

/**
 * Canonical dashboard/API projection for candidate review queues.
 *
 * The full AssessmentIntelligenceReport remains the source of truth. This
 * projection narrows it to the fields required for queue ranking, queue cards,
 * API summaries, and future candidate_intelligence snapshot rows.
 */
export function toQueueIntelligenceProjection(
  report: AssessmentIntelligenceReport
): QueueIntelligenceProjection {
  const topCompetency =
    [...report.competencyEvidence]
      .filter((competency) => competency.direction === "positive")
      .sort((a, b) => b.score - a.score)[0]?.label ?? null;

  const topRisk =
    [...report.risks].sort((a, b) => RISK_ORDER[a.severity] - RISK_ORDER[b.severity])[0] ?? null;

  // The executive summary is intentionally methodological. Queues need a
  // candidate-specific "why", so strongest positive evidence wins, followed by
  // the leading risk, then the recommendation rationale.
  const topPositiveSignal = [...report.evidenceSignals]
    .filter((signal) => signal.direction === "positive")
    .sort((a, b) => b.normalizedScore - a.normalizedScore)[0];

  const sourceAssessmentIds = Array.from(
    new Set(
      report.evidenceSignals
        .map((signal) => signal.assessmentId)
        .filter((assessmentId): assessmentId is string => Boolean(assessmentId))
    )
  );

  return {
    recommendation: report.recommendation.level,
    confidence: report.recommendation.confidence,
    headline: topPositiveSignal?.statement ?? topRisk?.statement ?? report.recommendation.rationale,
    topCompetency,
    primaryRisk: topRisk
      ? {
          id: topRisk.id,
          label: topRisk.competencyLabel,
          severity: topRisk.severity,
          evidenceSignalIds: topRisk.evidenceSignalIds,
        }
      : null,
    interviewKitReady: report.interviewQuestions.length > 0,
    interviewQuestionCount: report.interviewQuestions.length,
    evidenceSignalIds: report.recommendation.evidenceSignalIds,
    sourceAssessmentIds,
  };
}

function toDecisionLevel(level: IntelligenceRecommendation["level"]): ExecutiveBriefDecisionLevel {
  if (level === "strong" || level === "proceed") return "interview";
  if (level === "caution" || level === "notRecommended") return "do_not_proceed";
  return "review";
}

function toBriefConfidence(level: ConfidenceLevel): ExecutiveBriefConfidenceLevel {
  return level === "moderate" ? "medium" : level;
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

/**
 * Canonical candidate report projection for the product UI.
 *
 * This keeps the full intelligence engine as the source of truth while giving
 * the report screen one stable, decision-oriented object: who to interview,
 * why, what evidence supports it, and what to verify next.
 */
export function toExecutiveBrief(report: AssessmentIntelligenceReport): ExecutiveBrief {
  const sortedRisks = [...report.risks].sort((a, b) => RISK_ORDER[a.severity] - RISK_ORDER[b.severity]);
  const risks = sortedRisks.slice(0, 3).map((risk) => ({
    id: risk.id,
    severity: risk.severity,
    title: risk.competencyLabel,
    evidence: risk.statement,
    businessImpact: risk.businessImpact,
    verify: risk.validationFocus,
    evidenceSignalIds: risk.evidenceSignalIds,
  }));

  const evidence = [...report.evidenceSignals]
    .sort((a, b) => {
      const directionDelta = EVIDENCE_ORDER[a.direction] - EVIDENCE_ORDER[b.direction];
      if (directionDelta !== 0) return directionDelta;
      return b.normalizedScore - a.normalizedScore;
    })
    .slice(0, 5)
    .map((signal) => ({
      id: signal.id,
      assessment: signal.assessmentName,
      signal: signal.statement,
      businessImpact: signal.businessImpact,
      direction: signal.direction,
      score: signal.normalizedScore,
      evidenceSignalIds: [signal.id],
    }));

  const strengths = report.strengths.length
    ? report.strengths.slice(0, 3)
    : [...report.evidenceSignals]
        .filter((signal) => signal.direction === "positive")
        .sort((a, b) => b.normalizedScore - a.normalizedScore)
        .slice(0, 3)
        .map((signal) => signal.statement);

  const verifyNext = uniqueStrings([
    ...risks.map((risk) => risk.verify),
    ...report.recommendation.nextSteps,
    ...report.interviewQuestions.slice(0, 2).map((question) => question.question),
  ]).slice(0, 5);

  const limitations = uniqueStrings([
    ...report.recommendation.limitations,
    ...report.confidence.limitations,
    ...report.methodologyLimitations,
  ]).slice(0, 5);

  return {
    recommendation: {
      level: toDecisionLevel(report.recommendation.level),
      sourceLevel: report.recommendation.level,
      title: report.recommendation.title,
      rationale: report.recommendation.rationale,
    },
    confidence: {
      level: toBriefConfidence(report.confidence.level),
      sourceLevel: report.confidence.level,
      score: report.confidence.score,
      factors: report.confidence.factors,
      limitations: report.confidence.limitations,
    },
    strengths,
    risks,
    evidence,
    verifyNext,
    limitations,
    source: {
      engineVersion: report.engineVersion,
      completedAssessmentCount: report.completedAssessmentCount,
      evidenceSignalIds: uniqueStrings([
        ...report.recommendation.evidenceSignalIds,
        ...evidence.flatMap((item) => item.evidenceSignalIds),
        ...risks.flatMap((risk) => risk.evidenceSignalIds),
      ]),
    },
  };
}
