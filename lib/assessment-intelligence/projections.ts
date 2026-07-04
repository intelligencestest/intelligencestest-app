import type {
  AssessmentIntelligenceReport,
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
