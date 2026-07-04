import type { TenantStats } from "./stats";

/**
 * Company Health Score — extension point (Phase 2).
 *
 * The reusable model that will classify tenants for the Home attention list,
 * the Companies list and CS outreach. The contract is fixed now so consumers
 * can reserve UI slots; the scoring itself is deliberately unimplemented.
 *
 * Planned inputs beyond TenantStats: activity trend (rollup history),
 * expired-invite ratio, completion-rate trend, error rates, seat utilization.
 * Planned model: weighted signals → 0–100 score → thresholds → level, with
 * `reasons` naming the signals that drove the classification (a health chip
 * without a stated reason is a rumor).
 */
export type CompanyHealthLevel = "healthy" | "attention" | "atRisk";

export interface CompanyHealthInput {
  stats: TenantStats;
  /** Days since last tenant activity, null when never active. */
  daysSinceActivity: number | null;
}

export interface CompanyHealth {
  level: CompanyHealthLevel;
  score: number; // 0–100
  reasons: string[];
}

/**
 * Not yet classified — consumers must handle null and hide the chip.
 * TODO(itoc-phase-2): implement the weighted model described above.
 */
export function computeCompanyHealth(_input: CompanyHealthInput): CompanyHealth | null {
  return null;
}
