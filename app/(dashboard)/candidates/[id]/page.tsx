import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { analyzeResult, type EvidenceDetail } from "@/lib/report-scoring";
import { assessmentName as termName, categoryLabel as termCategory, dimensionLabel as termDimension } from "@/lib/i18n/assessment-terms";
import ExportPdfButton from "./ExportPdfButton";
import DecisionBar from "./DecisionBar";

// Stage chips mirror the candidate list styling.
const STAGE_CHIP: Record<string, { class: string; dot: string }> = {
  invited: { class: "bg-amber-500/10 text-amber-300 border-amber-500/25", dot: "bg-amber-400" },
  started: { class: "bg-blue-500/10 text-blue-300 border-blue-500/25", dot: "bg-blue-400" },
  completed: { class: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25", dot: "bg-emerald-400" },
  reviewed: { class: "bg-violet-500/10 text-violet-300 border-violet-500/25", dot: "bg-violet-400" },
  interview: { class: "bg-[#1D4ED8]/15 text-[#9BB8FF] border-[#1D4ED8]/35", dot: "bg-[#6B9FFF]" },
  hired: { class: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40", dot: "bg-emerald-300" },
};

const OUTCOME_CHIP: Record<string, { class: string; dot: string }> = {
  rejected: { class: "bg-[#d03b3b]/10 text-[#f28b8b] border-[#d03b3b]/25", dot: "bg-[#e05252]" },
  withdrawn: { class: "bg-[#1E2240]/60 text-slate-300 border-[#1E2240]", dot: "bg-slate-400" },
  expired: { class: "bg-[#ec835a]/10 text-[#ec835a] border-[#ec835a]/25", dot: "bg-[#ec835a]" },
};

function band(score: number): "high" | "medium" | "low" {
  return score >= 80 ? "high" : score >= 60 ? "medium" : "low";
}

const BAND_STYLE = {
  high: { text: "text-emerald-300", chip: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25", bar: "bg-emerald-400" },
  medium: { text: "text-amber-300", chip: "bg-amber-400/10 text-amber-300 ring-amber-400/25", bar: "bg-amber-400" },
  low: { text: "text-[#f28b8b]", chip: "bg-[#d03b3b]/10 text-[#f28b8b] ring-[#d03b3b]/25", bar: "bg-[#e05252]" },
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
  const stage = closed
    ? OUTCOME_CHIP[candidate.outcome] ?? OUTCOME_CHIP.withdrawn
    : STAGE_CHIP[stageKey] ?? STAGE_CHIP.invited;
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
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <Link
        href={`/projects/${candidate.project_id}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-200"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t("backTo", { name: projectName })}
      </Link>

      {/* Identity + verdict */}
      <header className="premium-card relative overflow-hidden rounded-2xl p-6 sm:p-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1D4ED8]/60 to-transparent" aria-hidden="true" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-[#1D4ED8]/40 bg-[#1D4ED8]/15 text-lg font-semibold text-[#9BB8FF] shadow-[0_0_24px_rgba(29,78,216,0.25)]">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-semibold tracking-tight text-white">{name}</h1>
              <p className="mt-0.5 truncate text-sm text-slate-400">
                {candidate.email || "—"} · {projectName}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-400">
                {t("invitedOn", {
                  date: new Date(candidate.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "long" }),
                })}
              </p>
            </div>
          </div>
          <span className={`inline-flex flex-shrink-0 items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-medium ${stage.class}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} aria-hidden="true" />
            {stageLabel}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#1E2240] pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[13px] font-medium text-slate-400">{t("overallScore")}</p>
            <p className={`mt-1 text-4xl font-semibold tracking-tight ${overall !== null ? BAND_STYLE[band(overall)].text : "text-slate-500"}`}>
              {overall ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-400">{t("rankLabel")}</p>
            {rank ? (
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white">{t("rankValue", { rank: rank.rank })}</span>
                <span className="text-[13px] text-slate-400">{t("rankOfTotal", { total: rank.total })}</span>
              </p>
            ) : (
              <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-500">—</p>
            )}
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-400">{t("assessmentsLabel")}</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {myResults.length}/{Math.max(totalAssigned, myResults.length)}
              </span>
              <span className="text-[13px] text-slate-400">{t("doneSub")}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
        {/* Evidence */}
        <section className="space-y-4 xl:col-span-2">
          <h2 className="text-sm font-semibold text-white">{t("evidenceTitle")}</h2>

          {myResults.length === 0 && (
            <div className="premium-card rounded-xl p-8 text-center">
              <p className="text-sm font-medium text-slate-200">{t("noResultsTitle")}</p>
              <p className="mt-1 text-[13px] text-slate-400">{t("noResultsBody")}</p>
            </div>
          )}

          {evidence.map(({ result, detail }) => {
            const b = BAND_STYLE[band(result.score)];
            const share = beatsShare(result.assessment_id, result.score);
            const dimMax = detail?.dimensions?.length
              ? Math.max(...detail.dimensions.map((d) => d.max ?? d.value), 1)
              : 1;
            return (
              <article key={result.id} className="premium-card rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-white">{result.assessments ? termName(result.assessments.name, locale) : "—"}</h3>
                    <p className="mt-0.5 text-[13px] text-slate-400">
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
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1E2240]">
                    <div className={`h-2 rounded-full ${b.bar}`} style={{ width: `${Math.min(result.score, 100)}%` }} />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {t(band(result.score) === "high" ? "interpHigh" : band(result.score) === "medium" ? "interpMedium" : "interpLow")}
                  {share !== null && <span className="text-slate-400"> · {t("beatsShare", { pct: share })}</span>}
                </p>

                {detail?.correct && (
                  <p className="mt-2 text-[13px] text-slate-400">
                    {t("correctAnswers", { correct: detail.correct.correct, total: detail.correct.total })}
                  </p>
                )}

                {detail?.dimensions && detail.dimensions.length > 0 && (
                  <div className="mt-4 border-t border-[#1E2240] pt-4">
                    <p className="mb-3 text-[13px] font-medium text-slate-400">{t("dimensionsTitle")}</p>
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
                            <div className="h-1.5 overflow-hidden rounded-full bg-[#1E2240]">
                              <div className="h-1.5 rounded-full bg-[#3987e5]" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {locale === "en" && detail?.interpretation && (
                  <p className="mt-3 text-[13px] text-slate-400">
                    <span className="font-medium text-slate-300">{detail.interpretation}</span>
                    {detail.description ? ` — ${detail.description}` : ""}
                  </p>
                )}
              </article>
            );
          })}

          {pending.map((pa) => (
            <article key={pa.assessment_id} className="rounded-xl border border-dashed border-[#1E2240] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-medium text-slate-400">{pa.assessments ? termName(pa.assessments.name, locale) : "—"}</h3>
                  {pa.assessments?.category && <p className="mt-0.5 text-[13px] text-slate-500">{termCategory(pa.assessments.category, locale)}</p>}
                </div>
                <span className="inline-flex flex-shrink-0 items-center rounded-full border border-[#1E2240] px-2.5 py-1 text-xs font-medium text-slate-400">
                  {t("pendingChip")}
                </span>
              </div>
            </article>
          ))}
        </section>

        {/* Rail: timeline + export */}
        <div className="space-y-4">
          <section className="premium-card rounded-xl p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">{t("timelineTitle")}</h2>
            <ol className="space-y-0">
              {timeline.map((event, i) => (
                <li key={event.key} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < timeline.length - 1 && (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-[#1E2240]" aria-hidden="true" />
                  )}
                  <span
                    className={`mt-1.5 h-[11px] w-[11px] flex-shrink-0 rounded-full ring-2 ring-[#0D1020] ${
                      i === timeline.length - 1 ? "bg-[#3987e5]" : "bg-[#1E2240]"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-snug text-slate-300">{event.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{event.date}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="premium-card rounded-xl p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">{t("exportTitle")}</h2>
            <ExportPdfButton
              candidateName={name}
              candidateEmail={candidate.email || ""}
              companyName={company?.name ?? ""}
              projectName={projectName}
              candidateId={candidate.id}
              assessments={myResults.map((r) => ({
                name: r.assessments?.name ?? "—",
                score: r.score,
                completedAt: r.completed_at,
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
