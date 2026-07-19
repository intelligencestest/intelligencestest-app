/**
 * Stage 1 of the assessment evidence methodology spec: cohort percentiles
 * (inclusive empirical CDF) and the natural-break cutoff decision. Every
 * output is deterministic and reproducible; method identifiers are persisted
 * alongside results so a displayed number can always be traced to the
 * algorithm version that produced it.
 *
 * Stage 2 (confidence components, evidence facts) intentionally does NOT
 * live here yet — it depends on per-item evidence-unit data whose
 * availability is only partial (see results.raw_answers), and must not be
 * approximated from aggregate scores.
 */

export const PERCENTILE_METHOD = "cohort_ecdf_inclusive_v1" as const;
export const NATURAL_BREAK_METHOD = "natural_break_local_median_v1" as const;

/** Proposed configuration values from the spec — kept in one place, not
 * scattered as magic numbers. Not yet psychometrically calibrated. */
export const NATURAL_BREAK_CONFIG = {
  reviewWindowMinFactor: 1.3,
  reviewWindowMaxFactor: 1.5,
  /** A gap smaller than this is never called a natural break. */
  minimumAbsoluteGap: 0.75,
  /** Selected gap must exceed the typical local step by this ratio. */
  minimumGapRatio: 1.75,
  /** Operational buffer used when no qualifying break exists. */
  policyFallbackFactor: 1.4,
} as const;

export interface EvaluatedGap {
  afterRank: number;
  scoreAbove: number;
  scoreBelow: number;
  gap: number;
}

export interface CutoffDecision {
  methodVersion: string;
  seatsOpen: number;
  reviewRankMin: number;
  reviewRankMax: number;
  evaluatedGaps: EvaluatedGap[];
  typicalStep: number | null;
  selectedGap: number | null;
  gapRatio: number | null;
  recommendedCount: number;
  decisionType: "natural_break" | "policy_fallback" | "manual_review";
  /** Set when the cutoff landed inside a tie group and was moved to the end
   * of that group (candidates with equal scores are never split). */
  boundaryTieExpanded: boolean;
  /** recommendedCount before the boundary-tie expansion, when it applies. */
  preTieRecommendedCount?: number;
}

/**
 * Inclusive empirical cumulative distribution within the cohort:
 * P = 100 * (# valid scores <= candidate score) / N.
 * Ties all receive the percentile of the upper end of the tied group.
 * Store the unrounded value; round only for display.
 */
export function inclusivePercentile(score: number, poolScores: number[]): number {
  const valid = poolScores.filter(Number.isFinite);
  if (valid.length === 0) {
    throw new Error("Cannot calculate percentile from an empty pool");
  }

  const atOrBelow = valid.filter((value) => value <= score).length;
  return (atOrBelow / valid.length) * 100;
}

export function displayedPercentile(score: number, poolScores: number[]): number {
  return Math.round(inclusivePercentile(score, poolScores));
}

function median(sortedAscending: number[]): number {
  const mid = Math.floor(sortedAscending.length / 2);
  return sortedAscending.length % 2 === 1
    ? sortedAscending[mid]
    : (sortedAscending[mid - 1] + sortedAscending[mid]) / 2;
}

/** Candidates with the same overall score are never split by the cutoff: if
 * the line lands inside a tie group, it moves to the end of that group. */
function expandThroughTies(descendingScores: number[], recommendedCount: number): { recommendedCount: number; expanded: boolean } {
  let count = recommendedCount;
  while (count > 0 && count < descendingScores.length && descendingScores[count - 1] === descendingScores[count]) {
    count += 1;
  }
  return { recommendedCount: count, expanded: count !== recommendedCount };
}

function policyFallback(
  gaps: EvaluatedGap[],
  rankMin: number,
  rankMax: number,
  seatsOpen: number,
  descendingScores: number[],
  typicalStep: number | null
): CutoffDecision {
  const rawCount = Math.round(NATURAL_BREAK_CONFIG.policyFallbackFactor * seatsOpen);
  const bounded = Math.min(Math.max(rawCount, rankMin), rankMax, descendingScores.length);
  const { recommendedCount, expanded } = expandThroughTies(descendingScores, bounded);

  return {
    methodVersion: NATURAL_BREAK_METHOD,
    seatsOpen,
    reviewRankMin: rankMin,
    reviewRankMax: rankMax,
    evaluatedGaps: gaps,
    typicalStep,
    selectedGap: null,
    gapRatio: null,
    recommendedCount,
    decisionType: "policy_fallback",
    boundaryTieExpanded: expanded,
    ...(expanded ? { preTieRecommendedCount: bounded } : {}),
  };
}

/**
 * Evaluates score gaps inside the review window (1.3x-1.5x seats) and calls
 * a natural break only when the largest gap is both absolutely material
 * (>= 0.75 points) and clearly larger than the typical local step (>= 1.75x
 * the median gap). Otherwise falls back to the configured operational
 * buffer and says so — it never claims a break that is not in the data.
 */
export function findNaturalBreak(descendingScores: number[], seatsOpen: number): CutoffDecision {
  if (seatsOpen < 1 || descendingScores.length === 0) {
    throw new Error("findNaturalBreak requires seatsOpen >= 1 and a non-empty score list");
  }

  const rankMin = Math.max(1, Math.floor(NATURAL_BREAK_CONFIG.reviewWindowMinFactor * seatsOpen));
  const rankMax = Math.min(descendingScores.length, Math.ceil(NATURAL_BREAK_CONFIG.reviewWindowMaxFactor * seatsOpen));

  const gaps: EvaluatedGap[] = [];
  for (let rank = rankMin; rank < rankMax; rank += 1) {
    const scoreAbove = descendingScores[rank - 1];
    const scoreBelow = descendingScores[rank];
    gaps.push({ afterRank: rank, scoreAbove, scoreBelow, gap: scoreAbove - scoreBelow });
  }

  const positiveGaps = gaps
    .map((item) => item.gap)
    .filter((gap) => gap > 0)
    .sort((a, b) => a - b);

  if (positiveGaps.length === 0) {
    return policyFallback(gaps, rankMin, rankMax, seatsOpen, descendingScores, null);
  }

  const typicalStep = median(positiveGaps);
  const selected = gaps.reduce((best, current) => (current.gap > best.gap ? current : best));
  const ratio = selected.gap / typicalStep;

  const qualifies = selected.gap >= NATURAL_BREAK_CONFIG.minimumAbsoluteGap && ratio >= NATURAL_BREAK_CONFIG.minimumGapRatio;

  if (!qualifies) {
    return policyFallback(gaps, rankMin, rankMax, seatsOpen, descendingScores, typicalStep);
  }

  const { recommendedCount, expanded } = expandThroughTies(descendingScores, selected.afterRank);

  return {
    methodVersion: NATURAL_BREAK_METHOD,
    seatsOpen,
    reviewRankMin: rankMin,
    reviewRankMax: rankMax,
    evaluatedGaps: gaps,
    typicalStep,
    selectedGap: selected.gap,
    gapRatio: ratio,
    recommendedCount,
    decisionType: "natural_break",
    boundaryTieExpanded: expanded,
    ...(expanded ? { preTieRecommendedCount: selected.afterRank } : {}),
  };
}

// ---------------- Stage 2: null-honest confidence (fallback model v1) ----------------

export const CONFIDENCE_METHOD = "confidence_fallback_v1_null_honest" as const;

export interface ConfidenceComponentsV1 {
  coverage: number;
  consistency: number | null;
  pairAgreement: null; // no parallel pairs authored in any bank yet — never faked
  facetAgreement: number | null;
  responseQuality: number;
}

export interface ConfidenceV1 {
  score: number;
  level: "high" | "moderate" | "low";
  components: ConfidenceComponentsV1;
  gateReasons: string[];
  methodVersion: string;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Robust dispersion: 1.4826 * median absolute deviation. */
export function robustSD(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const deviations = values.map((v) => Math.abs(v - med)).sort((a, b) => a - b);
  const mad = deviations.length % 2 ? deviations[(deviations.length - 1) / 2] : (deviations[deviations.length / 2 - 1] + deviations[deviations.length / 2]) / 2;
  return 1.4826 * mad;
}

/**
 * Fallback confidence, spec §4, restricted to components derivable from real
 * data today: coverage, MAD consistency, facet agreement when facet means are
 * supplied, response quality from validated flags (straight-lining, skip
 * rate). pairAgreement is always null (no authored pairs) and its weight is
 * renormalized across available components — never approximated.
 */
export function computeConfidenceV1(input: {
  unitScores: number[];
  expectedUnits: number;
  facetMeans?: number[] | null;
  flaggedUnits?: number;
  criticalIntegrityFailure?: boolean;
}): ConfidenceV1 {
  const valid = input.unitScores.filter(Number.isFinite);
  const coverage = input.expectedUnits > 0 ? clamp01(valid.length / input.expectedUnits) : 0;
  const consistency = valid.length >= 2 ? clamp01(1 - robustSD(valid) / 25) : null;
  const facetAgreement =
    input.facetMeans && input.facetMeans.length >= 2
      ? clamp01(1 - (Math.max(...input.facetMeans) - Math.min(...input.facetMeans)) / 30)
      : null;
  const flagged = input.flaggedUnits ?? 0;
  const responseQuality = valid.length > 0 ? clamp01(1 - flagged / valid.length) : 0;

  const parts: [number, number | null][] = [
    [0.2, coverage],
    [0.3, consistency],
    [0.25, null], // pairAgreement
    [0.15, facetAgreement],
    [0.1, responseQuality],
  ];
  const available = parts.filter(([, v]) => v !== null) as [number, number][];
  const weightSum = available.reduce((s, [w]) => s + w, 0);
  const score = Math.round(100 * available.reduce((s, [w, v]) => s + (w / weightSum) * v, 0));

  const gateReasons: string[] = [];
  if (valid.length < 4) gateReasons.push("fewer_than_4_valid_units");
  if (coverage < 0.7) gateReasons.push("coverage_below_70pct");
  if (responseQuality < 0.5) gateReasons.push("response_quality_below_50pct");
  if (input.criticalIntegrityFailure) gateReasons.push("critical_integrity_failure");
  const gated = gateReasons.length > 0;

  return {
    score,
    level: gated ? "low" : score >= 80 ? "high" : score >= 60 ? "moderate" : "low",
    components: { coverage, consistency, pairAgreement: null, facetAgreement, responseQuality },
    gateReasons,
    methodVersion: CONFIDENCE_METHOD,
  };
}
