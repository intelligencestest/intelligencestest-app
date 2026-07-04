import {
  buildAssessmentIntelligence,
  emptyQueueIntelligenceProjection,
  RECOMMENDATION_ORDER,
  toQueueIntelligenceProjection,
} from "@/lib/assessment-intelligence";
import type {
  AssessmentResultInput,
  ConfidenceLevel,
  QueueIntelligenceProjection,
  RecommendationLevel,
  RiskSeverity,
} from "@/lib/assessment-intelligence";

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
export type QueueIntelligence = QueueIntelligenceProjection;
export type { ConfidenceLevel, RecommendationLevel, RiskSeverity };
export { RECOMMENDATION_ORDER };

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
    return emptyQueueIntelligenceProjection();
  }

  const report = buildAssessmentIntelligence({ assessments: results, locale });
  return toQueueIntelligenceProjection(report);
}
