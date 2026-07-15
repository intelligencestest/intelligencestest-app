import { RECOMMENDATION_ORDER, type RecommendationLevel } from "@/lib/assessment-intelligence";
import type { ClientBriefRadarPoint } from "./client-brief-template";

/**
 * Pure candidate-ranking/selection logic for the client-brief route
 * (app/api/reports/client-brief/route.ts). Extracted so a fixture/test script
 * can exercise the exact same selection logic the route uses, without
 * reimplementing it by hand where it could silently drift.
 */

export type RankedCandidate = {
  name: string;
  level: RecommendationLevel;
  /** Average of competencyEvidence scores (0-100) — no single canonical
   * score exists on the assessment-intelligence engine's report, so this is
   * the ranking proxy used to order candidates within/across tiers. */
  score: number;
  recommendationTitle: string;
  rationale: string;
  competencyEvidence: { label: string; score: number }[];
  interviewQuestions: { question: string; reason: string }[];
};

/** A ranked candidate with its position in the recommended set attached. */
export type RankedSlot = RankedCandidate & { rank: number };

export function rankCandidates(candidates: RankedCandidate[]): RankedCandidate[] {
  return [...candidates].sort(
    (a, b) => RECOMMENDATION_ORDER[a.level] - RECOMMENDATION_ORDER[b.level] || b.score - a.score
  );
}

export function recommendedPool(ranked: RankedCandidate[]): RankedCandidate[] {
  return ranked.filter((c) => c.level === "strong" || c.level === "proceed");
}

/** ~1.5-2x openings_count, floor 2 (matches the prior fixed-2 behavior for
 * the default single-opening shortlist), capped at however many candidates
 * actually cleared the strong/proceed bar. */
export function targetRecommendedCount(openingsCount: number, poolSize: number): number {
  const target = Math.round(openingsCount * 1.75);
  return Math.max(2, Math.min(target, poolSize));
}

export function selectRecommended(candidates: RankedCandidate[], openingsCount: number): RankedCandidate[] {
  const pool = recommendedPool(rankCandidates(candidates));
  return pool.slice(0, targetRecommendedCount(openingsCount, pool.length));
}

/**
 * Splits the selected/recommended set into two tiers:
 * - primary (rank 1..openingsCount): the actual hiring picks — full
 *   treatment (executive summary card + interview-kit page each).
 * - backup (rank openingsCount+1..target): the ranked bench the agency
 *   goes to if a primary candidate falls through — compact grid entry
 *   only (rank, name, score, verdict), no interview-kit page.
 *
 * Rank numbers (1-indexed, continuous across both tiers) are attached here
 * so every downstream consumer (template, narrative, fixture) shows the
 * same numbering without recomputing it.
 */
export function tierSelection(
  selected: RankedCandidate[],
  openingsCount: number
): { primary: RankedSlot[]; backup: RankedSlot[] } {
  const ranked = selected.map((candidate, index) => ({ ...candidate, rank: index + 1 }));
  return {
    primary: ranked.slice(0, openingsCount),
    backup: ranked.slice(openingsCount),
  };
}

/**
 * A client-facing brief is meant to be skimmed by an executive in one
 * sitting. Past ~40 pages it stops being a quick brief and needs its own
 * handoff — that's the number this splits on. It's a judgment call, not a
 * hard technical limit; adjust if the real template (once Codex locks it)
 * reads denser or lighter per page than this estimate assumes.
 */
export const CLIENT_BRIEF_PAGE_BUDGET = 40;

const GRID_CARDS_PER_PAGE = 9; // 3-per-row compact grid, ~3 rows comfortably per A4 page.

function estimateGridPages(count: number, useDetailedLayout: boolean): number {
  if (count === 0) return 0;
  if (useDetailedLayout) return 1; // 2-column layout for <=2 candidates fits on one page.
  return Math.ceil(count / GRID_CARDS_PER_PAGE);
}

/**
 * Decides whether the backup bench needs to move into its own overflow
 * document to keep the main brief under CLIENT_BRIEF_PAGE_BUDGET. If the
 * primary tier alone (cover + its grid/detail layout + one interview page
 * per primary candidate) already exceeds the budget, that's a different,
 * unhandled problem — very large openings_count needs a different decision
 * than "split the backup bench," so in that case everything backup moves to
 * overflow but the main document is still flagged as over budget.
 */
export function planClientBriefDocuments(
  primary: RankedSlot[],
  backup: RankedSlot[]
): { main: { primary: RankedSlot[]; backup: RankedSlot[] }; overflow?: { backup: RankedSlot[] }; estimatedMainPages: number; overBudgetEvenWithoutBackup: boolean } {
  const coverPages = 1;
  const primaryGridPages = estimateGridPages(primary.length, primary.length <= 2);
  const interviewPages = primary.length; // one physical page per primary candidate, conservative
  const fixedPages = coverPages + primaryGridPages + interviewPages;

  const fullBackupPages = estimateGridPages(backup.length, false);
  if (fixedPages + fullBackupPages <= CLIENT_BRIEF_PAGE_BUDGET) {
    return {
      main: { primary, backup },
      estimatedMainPages: fixedPages + fullBackupPages,
      overBudgetEvenWithoutBackup: false,
    };
  }

  const overBudgetEvenWithoutBackup = fixedPages > CLIENT_BRIEF_PAGE_BUDGET;
  const remainingBudgetPages = Math.max(0, CLIENT_BRIEF_PAGE_BUDGET - fixedPages);
  const backupCountAllowed = remainingBudgetPages * GRID_CARDS_PER_PAGE;
  const mainBackup = backup.slice(0, backupCountAllowed);
  const overflowBackup = backup.slice(backupCountAllowed);

  return {
    main: { primary, backup: mainBackup },
    overflow: overflowBackup.length > 0 ? { backup: overflowBackup } : undefined,
    estimatedMainPages: fixedPages + estimateGridPages(mainBackup.length, false),
    overBudgetEvenWithoutBackup,
  };
}

/** Competencies shared across the given candidates, so their radar charts
 * plot the same axes and stay visually comparable. Used for primary cards
 * only — the backup bench doesn't render charts. */
export function sharedRadarDimensions(candidates: RankedCandidate[]): string[] {
  const bestScoreByLabel = new Map<string, number>();
  for (const candidate of candidates) {
    for (const evidence of candidate.competencyEvidence) {
      bestScoreByLabel.set(evidence.label, Math.max(bestScoreByLabel.get(evidence.label) ?? 0, evidence.score));
    }
  }
  return [...bestScoreByLabel.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label]) => label);
}

export function radarForCandidate(candidate: RankedCandidate, dimensions: string[]): ClientBriefRadarPoint[] {
  return dimensions.map((label) => {
    const evidence = candidate.competencyEvidence.find((e) => e.label === label);
    // competencyEvidence scores are 0-100; the brief's radar is 0-5.
    return { label, value: evidence ? Math.round((evidence.score / 20) * 10) / 10 : 0 };
  });
}
