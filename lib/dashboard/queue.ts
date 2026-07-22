import type { createAdminClient } from "@/lib/supabase-server";
import type { AssessmentResultInput, IntelligenceLocale } from "@/lib/assessment-intelligence";
import {
  deriveQueueIntelligence,
  RECOMMENDATION_ORDER,
  type QueueIntelligence,
} from "./queue-intelligence";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Review-queue fetch ceiling. Deriving intelligence at render time bounds how
 * many candidates we can enrich per request; the inbox states this cap in the
 * UI. TODO(intelligence-layer): once `candidate_intelligence` snapshots exist,
 * sorting/filtering moves into SQL and this becomes cursor pagination.
 */
export const QUEUE_FETCH_LIMIT = 50;

export type QueueSort = "waiting" | "recommendation";

export interface QueueEntry {
  id: string;
  fullName: string;
  projectId: string;
  projectName: string | null;
  /** How long the candidate has been waiting since completing assessments. */
  waitMs: number;
  resultsCount: number;
  /** Assessments configured on the project; null when unknown. */
  assessmentTotal: number | null;
  intelligence: QueueIntelligence;
}

interface QueueCandidateRow {
  id: string;
  full_name: string;
  stage_changed_at: string;
  project_id: string;
  hiring_projects: { id: string; name: string } | null;
}

interface QueueResultRow {
  candidate_id: string;
  score: number;
  completed_at: string;
  raw_answers: unknown;
  assessments: { name: string } | null;
}

/**
 * Loads the review queue: candidates who completed their assessments and are
 * waiting for a decision, oldest first. Uses the
 * (company_id, pipeline_stage, outcome) index.
 */
export async function loadReviewQueue(
  admin: AdminClient,
  companyId: string,
  locale: IntelligenceLocale,
  nowMs: number
): Promise<{ entries: QueueEntry[]; totalCount: number }> {
  const [{ count }, { data: rows }] = await Promise.all([
    admin
      .from("candidates")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("pipeline_stage", "completed")
      .eq("outcome", "pending"),
    admin
      .from("candidates")
      .select("id, full_name, stage_changed_at, project_id, hiring_projects(id, name)")
      .eq("company_id", companyId)
      .eq("pipeline_stage", "completed")
      .eq("outcome", "pending")
      .order("stage_changed_at", { ascending: true })
      .limit(QUEUE_FETCH_LIMIT)
      .returns<QueueCandidateRow[]>(),
  ]);

  const candidates = rows ?? [];
  if (candidates.length === 0) return { entries: [], totalCount: count ?? 0 };

  const candidateIds = candidates.map((c) => c.id);
  const projectIds = [...new Set(candidates.map((c) => c.project_id))];

  const [{ data: results }, { data: paRows }] = await Promise.all([
    admin
      .from("results")
      .select("candidate_id, score, completed_at, raw_answers, assessments(name)")
      .in("candidate_id", candidateIds)
      .returns<QueueResultRow[]>(),
    admin
      .from("project_assessments")
      .select("project_id")
      .in("project_id", projectIds)
      .returns<{ project_id: string }[]>(),
  ]);

  const resultsByCandidate = (results ?? []).reduce<Record<string, AssessmentResultInput[]>>(
    (acc, r) => {
      if (!r.assessments) return acc;
      (acc[r.candidate_id] ??= []).push({
        name: r.assessments.name,
        score: r.score,
        completedAt: r.completed_at,
        rawAnswers: r.raw_answers,
      });
      return acc;
    },
    {}
  );

  const assessmentTotals = (paRows ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.project_id] = (acc[row.project_id] ?? 0) + 1;
    return acc;
  }, {});

  const entries = candidates.map((c) => {
    const candidateResults = resultsByCandidate[c.id] ?? [];
    return {
      id: c.id,
      fullName: c.full_name,
      projectId: c.project_id,
      projectName: c.hiring_projects?.name ?? null,
      waitMs: Math.max(0, nowMs - new Date(c.stage_changed_at).getTime()),
      resultsCount: candidateResults.length,
      assessmentTotal: assessmentTotals[c.project_id] ?? null,
      intelligence: deriveQueueIntelligence(candidateResults, locale),
    };
  });

  return { entries, totalCount: count ?? entries.length };
}

/** FIFO protects review SLA; recommendation-first serves shortlist mode. */
export function sortQueueEntries(entries: QueueEntry[], sort: QueueSort): QueueEntry[] {
  if (sort === "waiting") return entries; // already oldest-first from the query
  return [...entries].sort((a, b) => {
    const ra = a.intelligence.recommendation;
    const rb = b.intelligence.recommendation;
    const wa = ra ? RECOMMENDATION_ORDER[ra] : 99;
    const wb = rb ? RECOMMENDATION_ORDER[rb] : 99;
    return wa - wb || b.waitMs - a.waitMs;
  });
}
