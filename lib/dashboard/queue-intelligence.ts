import { buildAssessmentIntelligence } from "@/lib/assessment-intelligence";
import type { AssessmentResultInput } from "@/lib/assessment-intelligence";

/**
 * The intelligence contract the Candidate Queue UI consumes.
 *
 * This shape is deliberately a strict subset of what the Assessment
 * Intelligence Layer will persist per candidate (`candidate_intelligence`
 * snapshots, written on assessment completion). When snapshots land:
 *   - replace `deriveQueueIntelligence` calls with a snapshot read,
 *   - map the snapshot row onto this same interface,
 *   - delete the derivation below.
 * The queue UI and sort logic must not change.
 */
export interface QueueIntelligence {
  recommendation: RecommendationLevel | null;
  confidence: ConfidenceLevel | null;
  /** One candidate-specific sentence explaining the recommendation. */
  headline: string | null;
  /** Strongest positively-evidenced competency label, if any. */
  topCompetency: string | null;
  /** Highest-severity hiring risk, if any. */
  primaryRisk: { label: string; severity: RiskSeverity } | null;
  /** Whether interview validation questions are ready for this candidate. */
  interviewKitReady: boolean;
}

export type RecommendationLevel = "strong" | "proceed" | "review" | "caution" | "notRecommended";
export type ConfidenceLevel = "high" | "moderate" | "low";
export type RiskSeverity = "high" | "medium" | "low";

/** Sort weight: stronger recommendations first, unknown last. */
export const RECOMMENDATION_ORDER: Record<RecommendationLevel, number> = {
  strong: 0,
  proceed: 1,
  review: 2,
  caution: 3,
  notRecommended: 4,
};

const RISK_ORDER: Record<RiskSeverity, number> = { high: 0, medium: 1, low: 2 };

/**
 * TEMPORARY render-time derivation using the existing intelligence engine.
 * Correct but not final: once the Assessment Intelligence Layer persists
 * per-candidate snapshots, this becomes a DB read (see interface note above).
 */
export function deriveQueueIntelligence(
  results: AssessmentResultInput[],
  locale: "en" | "es"
): QueueIntelligence {
  if (results.length === 0) {
    return {
      recommendation: null,
      confidence: null,
      headline: null,
      topCompetency: null,
      primaryRisk: null,
      interviewKitReady: false,
    };
  }

  const report = buildAssessmentIntelligence({ assessments: results, locale });

  const topCompetency =
    [...report.competencyEvidence]
      .filter((c) => c.direction === "positive")
      .sort((a, b) => b.score - a.score)[0]?.label ?? null;

  const topRisk =
    [...report.risks].sort((a, b) => RISK_ORDER[a.severity] - RISK_ORDER[b.severity])[0] ?? null;

  // The engine's executiveSummary.headline is methodological boilerplate;
  // the queue needs a candidate-specific "why". Strongest evidence statement
  // wins, then the leading risk, then the recommendation rationale.
  const topPositiveSignal = [...report.evidenceSignals]
    .filter((s) => s.direction === "positive")
    .sort((a, b) => b.normalizedScore - a.normalizedScore)[0];
  const headline =
    topPositiveSignal?.statement ?? topRisk?.statement ?? report.recommendation.rationale;

  return {
    recommendation: report.recommendation.level,
    confidence: report.recommendation.confidence,
    headline,
    topCompetency,
    primaryRisk: topRisk ? { label: topRisk.competencyLabel, severity: topRisk.severity } : null,
    interviewKitReady: report.interviewQuestions.length > 0,
  };
}
