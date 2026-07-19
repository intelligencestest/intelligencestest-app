import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";
import { getInternalAdmin } from "@/lib/internal-admin";
import { loadTenantStats } from "@/lib/admin/stats";
import { loadTimeline } from "@/lib/admin/timeline";
import { computeCompanyHealth } from "@/lib/admin/health";
import { buildSupportContext, getCopilotSummary } from "@/lib/admin/copilot";
import { DAY, relativeTime } from "@/lib/dashboard/format";
import { emptyStageCounts, PIPELINE_STAGES, STAGE_COLOR, type PipelineStage } from "@/lib/dashboard/stages";
import {
  ActivatePendingPaymentButton,
  ChangePlanButton,
  ExtendTrialButton,
  ResetPasswordButton,
  SendTrialEmailButton,
  SetCustomLimitsButton,
  SetSubscriptionStatusButton,
} from "@/components/admin/actions";
import { Chip, EmptyRow, Section, StatCard, statusTone } from "@/components/admin/ui";

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial",
  starter: "Starter · $49/mo founding",
  professional: "Professional · $109/mo founding",
  enterprise: "Enterprise · custom",
};

function formatPlan(plan: string | null) {
  if (!plan) return "Trial";
  return PLAN_LABELS[plan] ?? `Legacy · ${plan}`;
}

/**
 * Company 360: is this customer healthy, what did they touch last, and what
 * changed recently — one screen, no SQL.
 */
export default async function AdminCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const adminCtx = await getInternalAdmin();
  if (!adminCtx) return null;

  const { id } = await params;
  const admin = createAdminClient();
  const nowMs = Date.now(); // eslint-disable-line react-hooks/purity -- server component, one render per request; recency math needs the real request-time clock.

  const { data: company } = await admin
    .from("companies")
    .select(
      "id, name, email, language, industry, plan, status, created_at, trial_status, trial_started_at, trial_ends_at, subscription_status, billing_provider, pending_plan, paypal_subscription_id, paypal_subscription_status, paypal_subscription_updated_at, candidate_limit, project_limit, recruiter_limit"
    )
    .eq("id", id)
    .maybeSingle();
  if (!company) notFound();

  const [{ data: users }, { data: projects }, { data: candidates }, statsMap, timeline] =
    await Promise.all([
      admin
        .from("users")
        .select("id, full_name, email, role, created_at")
        .eq("company_id", id)
        .order("created_at", { ascending: true }),
      admin
        .from("hiring_projects")
        .select("id, name, status, deadline, created_at")
        .eq("company_id", id)
        .order("created_at", { ascending: false })
        .limit(25),
      // Funnel + recent list; capped — the candidates page paginates fully.
      admin
        .from("candidates")
        .select("id, full_name, email, pipeline_stage, outcome, token_expires_at, created_at, project_id")
        .eq("company_id", id)
        .order("created_at", { ascending: false })
        .limit(1000),
      loadTenantStats(admin),
      loadTimeline(admin, { companyId: id }, 15),
    ]);

  const stats = statsMap?.get(id) ?? null;
  const daysSince = stats?.lastActivityAt
    ? Math.floor((nowMs - new Date(stats.lastActivityAt).getTime()) / DAY)
    : null;

  // Extension-point slots: hidden while the models return null.
  const health = stats ? computeCompanyHealth({ stats, daysSinceActivity: daysSince }) : null;
  const copilot = await getCopilotSummary(
    buildSupportContext("company", id, { name: company.name, plan: company.plan, status: company.status }, timeline)
  );

  const stageCounts = emptyStageCounts();
  for (const c of candidates ?? []) {
    const expired =
      c.pipeline_stage === "invited" &&
      (c.outcome === "expired" || (c.token_expires_at && new Date(c.token_expires_at).getTime() < nowMs));
    if (expired) stageCounts.expired += 1;
    else if (c.outcome === "pending" || c.pipeline_stage === "hired") {
      if (c.pipeline_stage in stageCounts) stageCounts[c.pipeline_stage as PipelineStage] += 1;
    }
  }

  const projectCandidateCounts = new Map<string, number>();
  for (const c of candidates ?? []) {
    projectCandidateCounts.set(c.project_id, (projectCandidateCounts.get(c.project_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-[var(--it-hairline)] bg-[var(--it-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--it-text)]">{company.name}</h1>
              <Chip tone={statusTone(company.status ?? "active")}>{company.status ?? "active"}</Chip>
              <Chip tone="info">{formatPlan(company.plan)}</Chip>
              <Chip>{company.language ?? "es"}</Chip>
              {health && <Chip tone={health.level === "healthy" ? "good" : health.level === "attention" ? "warn" : "bad"}>{health.level}</Chip>}
            </div>
            <p className="mt-1.5 text-sm text-slate-500">
              {company.email} · {company.industry || "no industry"} · created{" "}
              {new Date(company.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ResetPasswordButton companyId={company.id} />
            <Link
              href={`/admin/companies?q=${encodeURIComponent(company.email)}`}
              className="rounded-lg border border-[var(--it-hairline)] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-[#8b5cf6]/60 hover:text-[var(--it-text)]"
            >
              Manage workspace →
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Recruiters" value={`${stats?.recruiters ?? users?.length ?? 0}`} />
          <StatCard label="Candidates" value={`${stats?.candidatesTotal ?? candidates?.length ?? 0}`} />
          <StatCard label="Completed · 30d" value={`${stats?.completed30d ?? "—"}`} />
          <StatCard label="Active projects" value={`${stats?.activeProjects ?? "—"}`} />
          <StatCard
            label="Last activity"
            value={daysSince === null ? "—" : daysSince === 0 ? "today" : `${daysSince}d ago`}
            sub={stats ? `rollup ${relativeTime(new Date(stats.computedAt).getTime(), nowMs, "en-US")}` : "needs migration 021"}
          />
        </div>
      </div>

      {/* AI copilot slot — renders only once getCopilotSummary is implemented */}
      {copilot && (
        <div className="rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/5 p-4 text-sm text-slate-300">{copilot.summary}</div>
      )}

      {/* Plan & trial */}
      <Section title="Plan & trial">
        <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
          <Chip tone="info">{formatPlan(company.plan)}</Chip>
          <Chip tone={company.trial_status === "expired" ? "bad" : company.trial_status === "active" ? "warn" : "good"}>
            trial: {company.trial_status ?? "—"}
          </Chip>
          <Chip tone={company.subscription_status === "active" ? "good" : "neutral"}>
            subscription: {company.subscription_status ?? "manual"}
          </Chip>
          <Chip>billing: {company.billing_provider ?? "manual"}</Chip>
          {company.pending_plan ? <Chip tone="warn">pending: {formatPlan(company.pending_plan)}</Chip> : null}
        </div>
        <div className="grid grid-cols-2 gap-4 px-5 py-4 lg:grid-cols-6">
          <StatCard
            label="Trial ends"
            value={company.trial_ends_at ? new Date(company.trial_ends_at).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "—"}
          />
          <StatCard label="Candidate limit" value={company.candidate_limit === null || company.candidate_limit === undefined ? "∞" : `${company.candidate_limit}`} />
          <StatCard label="Project limit" value={company.project_limit === null || company.project_limit === undefined ? "∞" : `${company.project_limit}`} />
          <StatCard label="Recruiter limit" value={company.recruiter_limit === null || company.recruiter_limit === undefined ? "∞" : `${company.recruiter_limit}`} />
          <StatCard label="PayPal status" value={company.paypal_subscription_status ?? "—"} />
          <StatCard
            label="PayPal subscription"
            value={company.paypal_subscription_id ? "linked" : "—"}
            sub={company.paypal_subscription_id ?? undefined}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--it-hairline)] px-5 py-4">
          {company.pending_plan && company.paypal_subscription_id ? (
            <ActivatePendingPaymentButton companyId={company.id} plan={company.pending_plan} />
          ) : null}
          <ExtendTrialButton companyId={company.id} />
          <ChangePlanButton companyId={company.id} />
          <SetSubscriptionStatusButton companyId={company.id} />
          <SetCustomLimitsButton companyId={company.id} />
          <SendTrialEmailButton companyId={company.id} />
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
        <div className="space-y-6 xl:col-span-2">
          {/* Funnel */}
          <Section title="Hiring pipeline (all projects)">
            <div className="space-y-1 px-4 py-3">
              {[...PIPELINE_STAGES, "expired" as const].map((stage) => (
                <div key={stage} className="flex items-center gap-3 px-2 py-1">
                  <span className="flex w-24 items-center gap-2 text-[13px] capitalize text-slate-400">
                    <span className={`h-2 w-2 rounded-full ${STAGE_COLOR[stage]}`} aria-hidden="true" />
                    {stage}
                  </span>
                  <span className="h-2 flex-1 rounded-full bg-[var(--it-bg)]/70">
                    <span
                      className={`block h-2 rounded-full ${STAGE_COLOR[stage]}`}
                      style={{
                        width: `${Math.max(
                          (stageCounts[stage] / Math.max(...Object.values(stageCounts), 1)) * 100,
                          stageCounts[stage] > 0 ? 6 : 0
                        )}%`,
                      }}
                    />
                  </span>
                  <span className={`w-10 text-right text-[13px] font-semibold tabular-nums ${stageCounts[stage] > 0 ? "text-slate-200" : "text-slate-600"}`}>
                    {stageCounts[stage]}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Recruiters */}
          <Section title={`Recruiters (${users?.length ?? 0})`}>
            {(users ?? []).length === 0 ? (
              <EmptyRow>No users in this workspace — nobody can sign in.</EmptyRow>
            ) : (
              <div className="divide-y divide-[var(--it-hairline)]">
                {(users ?? []).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-200">{u.full_name || u.email}</span>
                      <span className="block truncate text-xs text-slate-500">{u.email}</span>
                    </span>
                    <Chip>{u.role ?? "admin"}</Chip>
                    <span className="text-xs text-slate-500">
                      joined {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Projects */}
          <Section title={`Projects (${projects?.length ?? 0})`}>
            {(projects ?? []).length === 0 ? (
              <EmptyRow>No hiring projects yet.</EmptyRow>
            ) : (
              <div className="divide-y divide-[var(--it-hairline)]">
                {(projects ?? []).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">{p.name}</span>
                    <Chip tone={statusTone(p.status)}>{p.status}</Chip>
                    <span className="w-24 text-right text-xs tabular-nums text-slate-500">
                      {projectCandidateCounts.get(p.id) ?? 0} candidates
                    </span>
                    <span className="w-24 text-right text-xs text-slate-500">
                      {p.deadline ? `due ${new Date(p.deadline).toLocaleDateString("en-US", { day: "numeric", month: "short" })}` : "no deadline"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Unified timeline */}
        <Section title="Timeline">
          {timeline.length === 0 ? (
            <EmptyRow>No events yet.</EmptyRow>
          ) : (
            <div className="divide-y divide-[var(--it-hairline)]">
              {timeline.map((event) => (
                <div key={event.id} className="px-4 py-2.5">
                  <div className="flex items-baseline gap-2">
                    {event.href ? (
                      <Link href={event.href} className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-200 hover:text-[#4338ca]">
                        {event.title}
                      </Link>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-200">{event.title}</span>
                    )}
                    <span className="whitespace-nowrap text-xs tabular-nums text-slate-500">
                      {relativeTime(new Date(event.ts).getTime(), nowMs, "en-US")}
                    </span>
                  </div>
                  {(event.detail || event.actor) && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {event.actor ? `${event.actor}${event.detail ? " — " : ""}` : ""}
                      {event.detail ?? ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
