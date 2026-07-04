import { DAY, median } from "./format";
import { emptyStageCounts, type StageCounts } from "./stages";

/**
 * Project health model: a labeled state with a stated reason, so the recruiter
 * never has to deduce project status from a bar chart.
 * Precedence: blocked > atRisk > slowing > onTrack.
 */
export type ProjectHealthStatus = "onTrack" | "slowing" | "blocked" | "atRisk";

export type ProjectHealthReason =
  | { kind: "none" }
  | { kind: "noAssessments" }
  | { kind: "allInvitesExpired"; count: number }
  | { kind: "inactive"; days: number }
  | { kind: "overdue"; days: number; pct: number }
  | { kind: "deadline"; days: number; pct: number }
  | { kind: "slowing"; prev: number; current: number };

export interface CandidateFunnelRow {
  pipeline_stage: string;
  outcome: string;
  created_at: string;
  stage_changed_at: string | null;
  token_expires_at: string | null;
}

export interface ProjectHealth {
  status: ProjectHealthStatus;
  reason: ProjectHealthReason;
  stages: StageCounts;
  total: number;
  /** % of candidates that reached "completed" or beyond. */
  pct: number;
  daysLeft: number | null;
  medianScore: number | null;
  /** Completions in the last 7 days vs the 7 days before. */
  velocity: { current: number; previous: number };
}

const INACTIVITY_THRESHOLD_DAYS = 10;
const REACHED_COMPLETED = new Set(["completed", "reviewed", "interview", "hired"]);

function isTokenExpired(c: CandidateFunnelRow, nowMs: number): boolean {
  return c.token_expires_at !== null && new Date(c.token_expires_at).getTime() < nowMs;
}

export function deriveProjectHealth(
  project: { deadline: string | null },
  candidates: CandidateFunnelRow[],
  completionTimestamps: number[],
  assessmentCount: number,
  scores: number[],
  nowMs: number
): ProjectHealth {
  const stages = emptyStageCounts();
  let reached = 0;
  let lastActivity = 0;

  for (const c of candidates) {
    lastActivity = Math.max(
      lastActivity,
      new Date(c.created_at).getTime(),
      c.stage_changed_at ? new Date(c.stage_changed_at).getTime() : 0
    );
    if (REACHED_COMPLETED.has(c.pipeline_stage)) reached += 1;

    // Closed candidates: expired invites get their own segment; rejected and
    // withdrawn leave the active funnel (they still count toward totals/pct).
    if (c.outcome === "expired" || (c.pipeline_stage === "invited" && isTokenExpired(c, nowMs))) {
      stages.expired += 1;
      continue;
    }
    if (c.outcome !== "pending" && c.pipeline_stage !== "hired") continue;
    if (c.pipeline_stage in stages) stages[c.pipeline_stage as keyof StageCounts] += 1;
  }
  for (const ts of completionTimestamps) lastActivity = Math.max(lastActivity, ts);

  const total = candidates.length;
  const pct = total > 0 ? Math.round((reached / total) * 100) : 0;
  const daysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - nowMs) / DAY)
    : null;

  const velocity = {
    current: completionTimestamps.filter((ts) => nowMs - ts <= 7 * DAY).length,
    previous: completionTimestamps.filter((ts) => nowMs - ts > 7 * DAY && nowMs - ts <= 14 * DAY)
      .length,
  };

  const openInvites = stages.invited + stages.started;
  const workRemaining = total > 0 && pct < 100;

  // Blocked: the project cannot make progress without recruiter intervention.
  let status: ProjectHealthStatus = "onTrack";
  let reason: ProjectHealthReason = { kind: "none" };

  if (assessmentCount === 0) {
    status = "blocked";
    reason = { kind: "noAssessments" };
  } else if (workRemaining && openInvites === 0 && stages.expired > 0) {
    status = "blocked";
    reason = { kind: "allInvitesExpired", count: stages.expired };
  } else if (
    workRemaining &&
    openInvites > 0 &&
    lastActivity > 0 &&
    nowMs - lastActivity > INACTIVITY_THRESHOLD_DAYS * DAY
  ) {
    status = "blocked";
    reason = { kind: "inactive", days: INACTIVITY_THRESHOLD_DAYS };
  } else if (total > 0 && daysLeft !== null && daysLeft < 0 && pct < 100) {
    status = "atRisk";
    reason = { kind: "overdue", days: Math.abs(daysLeft), pct };
  } else if (total > 0 && daysLeft !== null && daysLeft <= 7 && pct < 70) {
    status = "atRisk";
    reason = { kind: "deadline", days: Math.max(daysLeft, 0), pct };
  } else if (workRemaining && velocity.previous > 0 && velocity.current < velocity.previous) {
    status = "slowing";
    reason = { kind: "slowing", prev: velocity.previous, current: velocity.current };
  }

  return {
    status,
    reason,
    stages,
    total,
    pct,
    daysLeft,
    medianScore: scores.length >= 3 ? median(scores) : null,
    velocity,
  };
}

/** Ranking for "worst first" ordering on the dashboard. */
export const HEALTH_ORDER: Record<ProjectHealthStatus, number> = {
  blocked: 0,
  atRisk: 1,
  slowing: 2,
  onTrack: 3,
};
