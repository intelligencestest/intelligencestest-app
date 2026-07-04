import type { createAdminClient } from "@/lib/supabase-server";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Unified Timeline — the one chronological history an operator reads on any
 * entity page. Provider-based by design: each source contributes events for
 * a scope, and new sources (customer activity_events, report exports,
 * delivery webhooks) plug in as additional providers without touching
 * consumers. Events are merged and sorted here, never in the UI.
 */
export interface TimelineEvent {
  id: string;
  ts: string; // ISO
  kind:
    | "candidate_invited"
    | "assessment_completed"
    | "stage_changed"
    | "admin_action"
    // Future sources reserve their kinds now so UI styling is stable:
    | "report_exported"
    | "email_delivery"
    | "product_event";
  title: string;
  detail?: string;
  href?: string;
  /** Who caused it: recruiter/candidate name, admin email, or "system". */
  actor?: string;
}

interface TimelineScope {
  companyId?: string;
  candidateId?: string;
}

type TimelineProvider = (
  admin: AdminClient,
  scope: TimelineScope,
  limit: number
) => Promise<TimelineEvent[]>;

const inviteProvider: TimelineProvider = async (admin, scope, limit) => {
  let q = admin
    .from("candidates")
    .select("id, full_name, created_at, hiring_projects(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (scope.candidateId) q = q.eq("id", scope.candidateId);
  else if (scope.companyId) q = q.eq("company_id", scope.companyId);
  const { data } = await q.returns<
    { id: string; full_name: string; created_at: string; hiring_projects: { name: string } | null }[]
  >();
  return (data ?? []).map((c) => ({
    id: `inv-${c.id}`,
    ts: c.created_at,
    kind: "candidate_invited" as const,
    title: `${c.full_name || "Candidate"} invited`,
    detail: c.hiring_projects?.name ?? undefined,
    href: `/admin/candidates/${c.id}`,
  }));
};

const resultProvider: TimelineProvider = async (admin, scope, limit) => {
  let q = admin
    .from("results")
    .select("id, score, completed_at, candidate_id, company_id, candidates(full_name), assessments(name)")
    .order("completed_at", { ascending: false })
    .limit(limit);
  if (scope.candidateId) q = q.eq("candidate_id", scope.candidateId);
  else if (scope.companyId) q = q.eq("company_id", scope.companyId);
  const { data } = await q.returns<
    {
      id: string;
      score: number;
      completed_at: string;
      candidate_id: string | null;
      company_id: string | null;
      candidates: { full_name: string } | null;
      assessments: { name: string } | null;
    }[]
  >();
  return (data ?? []).map((r) => ({
    id: `res-${r.id}`,
    ts: r.completed_at,
    kind: "assessment_completed" as const,
    title: `${r.candidates?.full_name ?? "Candidate"} completed ${r.assessments?.name ?? "an assessment"}`,
    detail: `Score ${r.score}`,
    href: r.candidate_id ? `/admin/candidates/${r.candidate_id}` : undefined,
  }));
};

// Only the latest stage transition per candidate is known today
// (stage_changed_at); the customer-side event model will replace this with
// full history via a new provider.
const stageProvider: TimelineProvider = async (admin, scope, limit) => {
  let q = admin
    .from("candidates")
    .select("id, full_name, company_id, pipeline_stage, outcome, stage_changed_at, created_at")
    .order("stage_changed_at", { ascending: false })
    .limit(limit);
  if (scope.candidateId) q = q.eq("id", scope.candidateId);
  else if (scope.companyId) q = q.eq("company_id", scope.companyId);
  const { data } = await q.returns<
    {
      id: string;
      full_name: string;
      company_id: string | null;
      pipeline_stage: string;
      outcome: string;
      stage_changed_at: string | null;
      created_at: string;
    }[]
  >();
  return (data ?? [])
    .filter((c) => c.stage_changed_at && c.stage_changed_at !== c.created_at)
    .map((c) => ({
      id: `stg-${c.id}-${c.stage_changed_at}`,
      ts: c.stage_changed_at!,
      kind: "stage_changed" as const,
      title: `${c.full_name || "Candidate"} moved to ${c.pipeline_stage}`,
      detail: c.outcome !== "pending" ? `Outcome: ${c.outcome}` : undefined,
      href: `/admin/candidates/${c.id}`,
    }));
};

const adminActionProvider: TimelineProvider = async (admin, scope, limit) => {
  let q = admin
    .from("admin_actions")
    .select("id, admin_email, action_type, entity_type, entity_id, reason, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (scope.candidateId) q = q.eq("entity_id", scope.candidateId);
  else if (scope.companyId) q = q.eq("company_id", scope.companyId);
  const { data, error } = await q.returns<
    {
      id: string;
      admin_email: string;
      action_type: string;
      entity_type: string | null;
      entity_id: string | null;
      reason: string | null;
      occurred_at: string;
    }[]
  >();
  if (error) return []; // migration 021 not applied yet
  return (data ?? []).map((a) => ({
    id: `adm-${a.id}`,
    ts: a.occurred_at,
    kind: "admin_action" as const,
    title: a.action_type,
    detail: a.reason ?? undefined,
    actor: a.admin_email,
  }));
};

const PROVIDERS: TimelineProvider[] = [
  inviteProvider,
  resultProvider,
  stageProvider,
  adminActionProvider,
];

export async function loadTimeline(
  admin: AdminClient,
  scope: TimelineScope,
  limit = 20
): Promise<TimelineEvent[]> {
  const batches = await Promise.all(PROVIDERS.map((p) => p(admin, scope, limit)));
  return batches
    .flat()
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, limit);
}
