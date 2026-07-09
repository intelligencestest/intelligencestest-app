import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronLeft, FileText } from "lucide-react";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { analyzeResult, type EvidenceDetail } from "@/lib/report-scoring";
import { assessmentName as termName, categoryLabel as termCategory, dimensionLabel as termDimension } from "@/lib/i18n/assessment-terms";
import { STATUS_CHIP_STYLE } from "@/lib/dashboard/stages";
import ExportPdfButton from "./ExportPdfButton";
import DecisionBar from "./DecisionBar";

function band(score: number): "high" | "medium" | "low" {
  return score >= 80 ? "high" : score >= 60 ? "medium" : "low";
}

const BAND_STYLE = {
  high: { text: "text-[#91c7ad]", chip: "bg-[rgba(63,143,107,0.1)] text-[#91c7ad] ring-[rgba(63,143,107,0.25)]", bar: "bg-[var(--it-success)]" },
  medium: { text: "text-[#d2b174]", chip: "bg-[rgba(184,134,47,0.1)] text-[#d2b174] ring-[rgba(184,134,47,0.25)]", bar: "bg-[var(--it-warning)]" },
  low: { text: "text-[#d99792]", chip: "bg-[rgba(185,82,76,0.1)] text-[#d99792] ring-[rgba(185,82,76,0.25)]", bar: "bg-[var(--it-danger)]" },
} as const;

type ResultRow = {
  id: string;
  score: number;
  completed_at: string;
  raw_answers: unknown;
  assessment_id: string;
  assessments: { id: string; name: string; category: string | null } | null;
};

export default async function CandidateReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ctx?: string }>;
}) {
  const { id } = await params;
  const { ctx } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("report");
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user!.id)
    .single();
  const companyId = profile?.company_id;

  const { data: candidate } = await admin
    .from("candidates")
    .select("id, full_name, email, status, pipeline_stage, outcome, created_at, company_id, project_id, hiring_projects(id, name)")
    .eq("id", id)
    .eq("company_id", companyId)
    .returns<{
      id: string; full_name: string; email: string; status: string; pipeline_stage: string; outcome: string;
      created_at: string; company_id: string; project_id: string; hiring_projects: { id: string; name: string } | null;
    }[]>()
    .maybeSingle();

  if (!candidate) notFound();

  const [{ data: results }, { data: projectResults }, { data: projectAssessments }, { data: company }] =
    await Promise.all([
      admin
        .from("results")
        .select("id, score, completed_at, raw_answers, assessment_id, assessments(id, name, category)")
        .eq("candidate_id", candidate.id)
        .order("completed_at", { ascending: true })
        .returns<ResultRow[]>(),
      admin
        .from("results")
        .select("candidate_id, assessment_id, score")
        .eq("project_id", candidate.project_id)
        .returns<{ candidate_id: string; assessment_id: string; score: number }[]>(),
      admin
        .from("project_assessments")
        .select("assessment_id, assessments(id, name, category)")
        .eq("project_id", candidate.project_id)
        .returns<{ assessment_id: string; assessments: { id: string; name: string; category: string | null } | null }[]>(),
      admin.from("companies").select("name").eq("id", candidate.company_id).single(),
    ]);

  const myResults = results ?? [];
  const peers = projectResults ?? [];
  const name = candidate.full_name?.trim() || t("anonymous");
  const initials =
    name === t("anonymous") ? "?" : name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const projectName = candidate.hiring_projects?.name ?? "—";
  const stageKey = candidate.pipeline_stage ?? candidate.status;
  const closed = candidate.outcome !== "pending";
  const chipKey = closed ? candidate.outcome : stageKey;
  const stageStyle = STATUS_CHIP_STYLE[chipKey] ?? STATUS_CHIP_STYLE.invited;
  const stageLabels: Record<string, string> = {
    invited: t("statusInvited"),
    started: t("statusStarted"),
    completed: t("statusCompleted"),
    reviewed: t("statusReviewed"),
    interview: t("statusInterview"),
    hired: t("statusHired"),
  };
  const outcomeLabels: Record<string, string> = {
    rejected: t("outcomeRejected"),
    withdrawn: t("outcomeWithdrawn"),
    expired: t("outcomeExpired"),
  };
  const stageLabel = closed ? outcomeLabels[candidate.outcome] ?? candidate.outcome : stageLabels[stageKey] ?? stageKey;

  // ---- Verdict numbers ------------------------------------------------------
  const overall = myResults.length
    ? Math.round(myResults.reduce((s, r) => s + r.score, 0) / myResults.length)
    : null;

  // Rank among project candidates by average score (only shown with >= 2 scored candidates).
  const perCandidate = peers.reduce<Record<string, { sum: number; n: number }>>((acc, r) => {
    const b = (acc[r.candidate_id] ??= { sum: 0, n: 0 });
    b.sum += r.score;
    b.n += 1;
    return acc;
  }, {});
  const averages = Object.entries(perCandidate).map(([cid, v]) => ({ cid, avg: v.sum / v.n }));
  averages.sort((a, b) => b.avg - a.avg);
  const rankIndex = averages.findIndex((a) => a.cid === candidate.id);
  const rank = rankIndex >= 0 && averages.length >= 2 ? { rank: rankIndex + 1, total: averages.length } : null;

  // ---- Queue context for prev/next navigation -------------------------------
  let queueIds: string[];
  let queueLabel: string;
  if (ctx === "review") {
    const { data: queue } = await admin
      .from("candidates")
      .select("id")
      .eq("company_id", companyId)
      .eq("pipeline_stage", "completed")
      .eq("outcome", "pending")
      .order("stage_changed_at", { ascending: true })
      .returns<{ id: string }[]>();
    queueIds = (queue ?? []).map((q) => q.id);
    // A candidate reviewed moments ago drops out of the queue but stays navigable.
    if (!queueIds.includes(candidate.id)) queueIds = [candidate.id, ...queueIds];
    queueLabel = t("queueReviewLabel");
  } else {
    queueIds = averages.length > 0 ? averages.map((a) => a.cid) : [candidate.id];
    queueLabel = t("queueProjectLabel");
  }
  const queueIdx = queueIds.indexOf(candidate.id);
  const qs = ctx === "review" ? "?ctx=review" : "";
  const prevHref = queueIdx > 0 ? `/candidates/${queueIds[queueIdx - 1]}${qs}` : null;
  const nextHref = queueIdx >= 0 && queueIdx < queueIds.length - 1 ? `/candidates/${queueIds[queueIdx + 1]}${qs}` : null;

  // Per-assessment share of project results this score beats (needs >= 4 results).
  const beatsShare = (assessmentId: string, score: number): number | null => {
    const others = peers.filter((r) => r.assessment_id === assessmentId && r.candidate_id !== candidate.id);
    if (others.length < 3) return null;
    return Math.round((others.filter((r) => r.score < score).length / others.length) * 100);
  };

  const completedAssessmentIds = new Set(myResults.map((r) => r.assessment_id));
  const pending = (projectAssessments ?? []).filter((pa) => !completedAssessmentIds.has(pa.assessment_id));
  const totalAssigned = (projectAssessments ?? []).length;

  const evidence = myResults.map((r) => ({
    result: r,
    detail: r.assessments ? analyzeResult(r.assessments.name, r.raw_answers) : (null as EvidenceDetail | null),
  }));


  // ---- Timeline -------------------------------------------------------------
  const timeline: { key: string; label: string; date: string; ts: number }[] = [
    {
      key: "invited",
      label: t("eventInvited"),
      date: new Date(candidate.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" }),
      ts: new Date(candidate.created_at).getTime(),
    },
    ...myResults.map((r) => ({
      key: r.id,
      label: t("eventCompleted", { assessment: r.assessments ? termName(r.assessments.name, locale) : "—" }),
      date: new Date(r.completed_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" }),
      ts: new Date(r.completed_at).getTime(),
    })),
  ].sort((a, b) => a.ts - b.ts);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <Link
        href={`/projects/${candidate.project_id}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--it-muted)] transition-colors hover:text-slate-200"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        {t("backTo", { name: projectName })}
      </Link>

      {/* Identity + verdict */}
      <header className="enterprise-card relative overflow-hidden rounded-2xl p-6 sm:p-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--it-primary)]/60 to-transparent" aria-hidden="true" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-[var(--it-hairline)] bg-[var(--it-bg)] text-lg font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-semibold tracking-tight text-white">{name}</h1>
              <p className="mt-0.5 truncate text-sm text-[var(--it-muted)]">
                {candidate.email || "—"} · {projectName}
              </p>
              <p className="mt-0.5 text-[13px] text-[var(--it-muted)]">
                {t("invitedOn", {
                  date: new Date(candidate.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "long" }),
                })}
              </p>
            </div>
          </div>
          <span className={`inline-flex flex-shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${stageStyle.bg} ${stageStyle.text} ${stageStyle.ring}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${stageStyle.dot}`} aria-hidden="true" />
            {stageLabel}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t enterprise-divider pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[13px] font-medium text-[var(--it-muted)]">{t("overallScore")}</p>
            <p className={`mt-1 text-4xl font-semibold tracking-tight ${overall !== null ? BAND_STYLE[band(overall)].text : "text-[var(--it-faint)]"}`}>
              {overall ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--it-muted)]">{t("rankLabel")}</p>
            {rank ? (
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white">{t("rankValue", { rank: rank.rank })}</span>
                <span className="text-[13px] text-[var(--it-muted)]">{t("rankOfTotal", { total: rank.total })}</span>
              </p>
            ) : (
              <p className="mt-1 text-4xl font-semibold tracking-tight text-[var(--it-faint)]">—</p>
            )}
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--it-muted)]">{t("assessmentsLabel")}</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {myResults.length}/{Math.max(totalAssigned, myResults.length)}
              </span>
              <span className="text-[13px] text-[var(--it-muted)]">{t("doneSub")}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
        {/* Evidence */}
        <section className="space-y-4 xl:col-span-2">
          <h2 className="text-sm font-semibold text-white">{t("evidenceTitle")}</h2>

          {myResults.length === 0 && (
            <div>
              <p className="text-sm font-medium text-slate-200">{t("noResultsTitle")}</p>
              <p className="mt-1 text-[13px] text-[var(--it-muted)]">{t("noResultsBody")}</p>
            </div>
          )}

          {evidence.map(({ result, detail }) => {
            const b = BAND_STYLE[band(result.score)];
            const share = beatsShare(result.assessment_id, result.score);
            const dimMax = detail?.dimensions?.length
              ? Math.max(...detail.dimensions.map((d) => d.max ?? d.value), 1)
              : 1;
            return (
              <article key={result.id} className="enterprise-card rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-white">{result.assessments ? termName(result.assessments.name, locale) : "—"}</h3>
                    <p className="mt-0.5 text-[13px] text-[var(--it-muted)]">
                      {result.assessments?.category ? `${termCategory(result.assessments.category, locale)} · ` : ""}
                      {t("completedOn", {
                        date: new Date(result.completed_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short" }),
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${b.chip}`}>
                    {t(band(result.score) === "high" ? "bandHigh" : band(result.score) === "medium" ? "bandMedium" : "bandLow")}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <span className={`text-3xl font-semibold tracking-tight ${b.text}`}>{result.score}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className={`h-2 rounded-full ${b.bar}`} style={{ width: `${Math.min(result.score, 100)}%` }} />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {t(band(result.score) === "high" ? "interpHigh" : band(result.score) === "medium" ? "interpMedium" : "interpLow")}
                  {share !== null && <span className="text-[var(--it-muted)]"> · {t("beatsShare", { pct: share })}</span>}
                </p>

                {detail?.correct && (
                  <p className="mt-2 text-[13px] text-[var(--it-muted)]">
                    {t("correctAnswers", { correct: detail.correct.correct, total: detail.correct.total })}
                  </p>
                )}

                {detail?.dimensions && detail.dimensions.length > 0 && (
                  <div className="mt-4 border-t enterprise-divider pt-4">
                    <p className="mb-3 text-[13px] font-medium text-[var(--it-muted)]">{t("dimensionsTitle")}</p>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                      {detail.dimensions.map((d) => {
                        const pct = Math.round((d.value / (d.max ?? dimMax)) * 100);
                        return (
                          <div key={d.label}>
                            <div className="mb-1 flex items-center justify-between text-[13px]">
                              <span className="text-slate-300">{termDimension(d.label, locale)}</span>
                              <span className="font-medium text-slate-200">
                                {d.value}{d.max ? ` / ${d.max}` : ""}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div className="h-1.5 rounded-full bg-[var(--it-primary)]" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {locale === "en" && detail?.interpretation && (
                  <p className="mt-3 text-[13px] text-[var(--it-muted)]">
                    <span className="font-medium text-slate-300">{detail.interpretation}</span>
                    {detail.description ? ` — ${detail.description}` : ""}
                  </p>
                )}
              </article>
            );
          })}

          {pending.map((pa) => (
            <article key={pa.assessment_id} className="rounded-xl border border-dashed border-[var(--it-hairline)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-medium text-[var(--it-muted)]">{pa.assessments ? termName(pa.assessments.name, locale) : "—"}</h3>
                  {pa.assessments?.category && <p className="mt-0.5 text-[13px] text-[var(--it-faint)]">{termCategory(pa.assessments.category, locale)}</p>}
                </div>
                <span className="inline-flex flex-shrink-0 items-center rounded-full border border-[var(--it-hairline)] px-2.5 py-1 text-xs font-medium text-[var(--it-muted)]">
                  {t("pendingChip")}
                </span>
              </div>
            </article>
          ))}
        </section>

        {/* Rail: timeline + export */}
        <div className="space-y-4">
          <section className="enterprise-card rounded-xl p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">{t("timelineTitle")}</h2>
            <ol className="space-y-0">
              {timeline.map((event, i) => (
                <li key={event.key} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < timeline.length - 1 && (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-[var(--it-border-soft)]" aria-hidden="true" />
                  )}
                  <span
                    className={`mt-1.5 h-[11px] w-[11px] flex-shrink-0 rounded-full ring-2 ring-[var(--it-surface)] ${
                      i === timeline.length - 1 ? "bg-[var(--it-primary)]" : "bg-[var(--it-border)]"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-snug text-slate-300">{event.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--it-muted)]">{event.date}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="enterprise-card rounded-xl p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">{t("exportTitle")}</h2>
            {myResults.length > 0 && (
              <div className="mb-4">
                <Link
                  href={`/candidates/${candidate.id}/report`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--it-primary)]/40 bg-[var(--it-primary-soft)] px-4 py-2.5 text-sm font-semibold text-[#9fb3e5] transition-colors hover:bg-[var(--it-primary)]/25"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                  {t("executiveReport")}
                </Link>
                <p className="mt-2 text-xs text-[var(--it-muted)]">{t("executiveReportNote")}</p>
              </div>
            )}
            <ExportPdfButton
              candidateName={name}
              candidateEmail={candidate.email || ""}
              companyName={company?.name ?? ""}
              projectName={projectName}
              candidateId={candidate.id}
              assessments={myResults.map((r) => ({
                id: r.id,
                assessmentId: r.assessment_id,
                name: r.assessments?.name ?? "—",
                score: r.score,
                completedAt: r.completed_at,
                category: r.assessments?.category ?? undefined,
                rawAnswers: r.raw_answers,
              }))}
            />
          </section>
        </div>
      </div>

      <DecisionBar
        candidateId={candidate.id}
        stage={stageKey}
        outcome={candidate.outcome ?? "pending"}
        prevHref={prevHref}
        nextHref={nextHref}
        position={queueIdx >= 0 ? queueIdx + 1 : null}
        total={queueIdx >= 0 ? queueIds.length : null}
        queueLabel={queueLabel}
        advanceHref={nextHref}
      />
    </div>
  );
}
