import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";
import { getInternalAdmin } from "@/lib/internal-admin";
import { loadTimeline } from "@/lib/admin/timeline";
import { assessmentName as termName } from "@/lib/i18n/assessment-terms";
import { relativeTime } from "@/lib/dashboard/format";
import { ExtendInviteButton } from "@/components/admin/actions";
import { Chip, EmptyRow, Section, statusTone } from "@/components/admin/ui";

function Diag({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--it-hairline)] py-2 last:border-b-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right text-[13px] text-slate-200">{value}</span>
    </div>
  );
}

/**
 * Candidate page — the #1 support surface. The invite diagnostics block
 * answers "my candidate's link doesn't work" in ten seconds; the audited
 * extend action fixes it in one click.
 */
export default async function AdminCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const adminCtx = await getInternalAdmin();
  if (!adminCtx) return null;

  const { id } = await params;
  const admin = createAdminClient();
  const nowMs = Date.now(); // eslint-disable-line react-hooks/purity -- server component, one render per request; invite-expiry math needs the real request-time clock.

  const { data: candidate } = await admin
    .from("candidates")
    .select(
      "id, full_name, email, status, pipeline_stage, outcome, language, token, token_expires_at, created_at, stage_changed_at, company_id, project_id, companies(name), hiring_projects(name)"
    )
    .eq("id", id)
    .maybeSingle();
  if (!candidate) notFound();

  const [{ data: results }, { data: projectAssessments }, timeline] = await Promise.all([
    admin
      .from("results")
      .select("id, score, completed_at, assessments(name)")
      .eq("candidate_id", id)
      .order("completed_at", { ascending: true }),
    admin
      .from("project_assessments")
      .select("assessments(name, duration_minutes)")
      .eq("project_id", candidate.project_id),
    loadTimeline(admin, { candidateId: id }, 12),
  ]);

  const company = Array.isArray(candidate.companies) ? candidate.companies[0] : candidate.companies;
  const project = Array.isArray(candidate.hiring_projects) ? candidate.hiring_projects[0] : candidate.hiring_projects;

  // Invite diagnostics
  const hasToken = Boolean(candidate.token);
  const expiresMs = candidate.token_expires_at ? new Date(candidate.token_expires_at).getTime() : null;
  const isExpired =
    candidate.outcome === "expired" || (expiresMs !== null && expiresMs < nowMs && candidate.pipeline_stage === "invited");
  const isOpenInvite = candidate.pipeline_stage === "invited" && candidate.outcome === "pending";
  const inviteState: { tone: "good" | "warn" | "bad" | "neutral"; label: string } = !hasToken
    ? { tone: "neutral", label: "No invite link on record" }
    : isExpired
      ? { tone: "bad", label: "Invite expired" }
      : isOpenInvite && expiresMs !== null
        ? { tone: "good", label: `Active — expires ${relativeTime(expiresMs, nowMs, "en-US")}` }
        : { tone: "neutral", label: "Invite consumed / candidate progressed" };

  const closed = candidate.outcome !== "pending";
  const chipStatus = closed ? candidate.outcome : candidate.pipeline_stage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin" className="text-xs font-medium text-slate-500 hover:text-slate-300">
          ← Console
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{candidate.full_name || "Unnamed candidate"}</h1>
          <Chip tone={statusTone(chipStatus)}>{chipStatus}</Chip>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">
          {candidate.email || "no email"} ·{" "}
          {candidate.company_id ? (
            <Link href={`/admin/companies/${candidate.company_id}`} className="text-[#a78bfa] hover:underline">
              {company?.name ?? "company"}
            </Link>
          ) : (
            "no company"
          )}{" "}
          · {project?.name ?? "no project"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Invite diagnostics — the reason this page exists */}
        <div className="space-y-6 lg:col-span-2">
          <Section
            title="Invite diagnostics"
            action={isOpenInvite || isExpired ? <ExtendInviteButton candidateId={candidate.id} /> : undefined}
          >
            <div className="px-5 py-3">
              <div className="mb-2 flex items-center gap-2">
                <Chip tone={inviteState.tone}>{inviteState.label}</Chip>
              </div>
              <Diag label="Invite link" value={hasToken ? "present" : "missing"} />
              <Diag
                label="Expiry"
                value={
                  candidate.token_expires_at
                    ? new Date(candidate.token_expires_at).toLocaleString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"
                }
              />
              <Diag label="Pipeline stage" value={candidate.pipeline_stage} />
              <Diag label="Outcome" value={candidate.outcome} />
              <Diag label="Invite language" value={(candidate.language ?? "—").toUpperCase()} />
              <Diag
                label="Invited"
                value={new Date(candidate.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              />
              {/* TODO(itoc-phase-2): email delivery status (Resend message id +
                  bounce/failure) once invite sends are captured per candidate. */}
              <Diag label="Email delivery" value={<span className="text-slate-500">not captured yet</span>} />
            </div>
          </Section>

          {/* Assessments configured on the project */}
          <Section title="Assessments in this project">
            {(projectAssessments ?? []).length === 0 ? (
              <EmptyRow>No assessments linked to the project — candidates cannot be invited.</EmptyRow>
            ) : (
              <div className="divide-y divide-[var(--it-hairline)]">
                {(projectAssessments ?? []).map((pa, i) => {
                  const a = Array.isArray(pa.assessments) ? pa.assessments[0] : pa.assessments;
                  if (!a) return null;
                  return (
                    <div key={i} className="flex items-center justify-between gap-4 px-5 py-2.5">
                      <span className="truncate text-sm text-slate-200">{a.name}</span>
                      <span className="text-xs text-slate-500">{a.duration_minutes ? `${a.duration_minutes} min` : "—"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Results */}
          <Section title={`Results (${results?.length ?? 0})`}>
            {(results ?? []).length === 0 ? (
              <EmptyRow>No completed assessments yet.</EmptyRow>
            ) : (
              <div className="divide-y divide-[var(--it-hairline)]">
                {(results ?? []).map((r) => {
                  const a = Array.isArray(r.assessments) ? r.assessments[0] : r.assessments;
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-2.5">
                      <span className="truncate text-sm text-slate-200">{a ? termName(a.name, "en") : "Assessment"}</span>
                      <span className="flex items-center gap-4">
                        <span className="text-sm font-semibold tabular-nums text-white">{r.score}</span>
                        <span className="text-xs tabular-nums text-slate-500">
                          {new Date(r.completed_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        {/* Timeline */}
        <Section title="Timeline">
          {timeline.length === 0 ? (
            <EmptyRow>No events yet.</EmptyRow>
          ) : (
            <div className="divide-y divide-[var(--it-hairline)]">
              {timeline.map((event) => (
                <div key={event.id} className="px-4 py-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-200">{event.title}</span>
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
