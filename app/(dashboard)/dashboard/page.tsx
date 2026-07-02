import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import MorningGreeting from "./MorningGreeting";

const DAY = 24 * 60 * 60 * 1000;

// Status colors: fixed semantic palette (icon + label always accompany color).
const SEVERITY = {
  critical: { text: "text-[#e05252]", bg: "bg-[#d03b3b]/10", ring: "ring-[#d03b3b]/25" },
  warning: { text: "text-[#fab219]", bg: "bg-[#fab219]/10", ring: "ring-[#fab219]/25" },
  serious: { text: "text-[#ec835a]", bg: "bg-[#ec835a]/10", ring: "ring-[#ec835a]/25" },
  info: { text: "text-[#6da7ec]", bg: "bg-[#3987e5]/10", ring: "ring-[#3987e5]/25" },
} as const;

type Severity = keyof typeof SEVERITY;

// Stage colors mirror the candidate status chips used across the app.
const STAGE = {
  completed: "bg-emerald-400",
  started: "bg-blue-400",
  invited: "bg-amber-400",
  expired: "bg-slate-600",
} as const;

type CandidateRow = {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
  token_expires_at: string | null;
  project_id: string;
  hiring_projects: { id: string; name: string } | null;
};

type ProjectRow = { id: string; name: string; status: string; deadline: string | null };

type ResultRow = {
  score: number;
  completed_at: string;
  candidates: { full_name: string } | null;
  assessments: { name: string } | null;
};

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

function relativeTime(ts: number, nowMs: number, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const mins = Math.round((ts - nowMs) / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) <= 7) return rtf.format(days, "day");
  return new Date(ts).toLocaleDateString(locale, { month: "short", day: "numeric" });
}

function AttnIcon({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    review: "M9 12h6m-6 4h6M9 8h6m-9 12h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
    expiring: "M12 8v4l2.5 2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    expired: "M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    stalled: "M10 9v6m4-6v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    project: "M3 21v-4m0 0V5a2 2 0 0 1 2-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 0 0-2 2Z",
  };
  return (
    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={paths[kind]} />
    </svg>
  );
}

export default async function DashboardPage() {
  const locale = await getLocale();
  const t = await getTranslations("dashboard");
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("users")
    .select("company_id, full_name")
    .eq("id", user!.id)
    .single();
  const companyId = profile?.company_id;
  const firstName = profile?.full_name?.split(" ")[0];

  const nowMs = Date.now();
  const weekAgo = new Date(nowMs - 7 * DAY).toISOString();
  const twoWeeksAgo = new Date(nowMs - 14 * DAY).toISOString();

  const [
    { data: candidates },
    { data: projects },
    { data: recentResults },
    { count: resultsThisWeek },
    { count: resultsPrevWeek },
    { data: recentCompletions },
    { data: projectScores },
  ] = await Promise.all([
    admin
      .from("candidates")
      .select("id, full_name, status, created_at, token_expires_at, project_id, hiring_projects(id, name)")
      .eq("company_id", companyId)
      .returns<CandidateRow[]>(),
    admin
      .from("hiring_projects")
      .select("id, name, status, deadline")
      .eq("company_id", companyId)
      .returns<ProjectRow[]>(),
    admin
      .from("results")
      .select("score, completed_at, candidates(full_name), assessments(name)")
      .eq("company_id", companyId)
      .order("completed_at", { ascending: false })
      .limit(8)
      .returns<ResultRow[]>(),
    admin
      .from("results")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("completed_at", weekAgo),
    admin
      .from("results")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("completed_at", twoWeeksAgo)
      .lt("completed_at", weekAgo),
    admin
      .from("results")
      .select("candidate_id, project_id")
      .eq("company_id", companyId)
      .gte("completed_at", weekAgo)
      .returns<{ candidate_id: string; project_id: string }[]>(),
    admin
      .from("results")
      .select("project_id, score")
      .eq("company_id", companyId)
      .returns<{ project_id: string; score: number }[]>(),
  ]);

  const all = candidates ?? [];
  const activeProjects = (projects ?? []).filter((p) => p.status === "active");
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  // ---- Queues (Needs Attention) -------------------------------------------
  const isExpired = (c: CandidateRow) =>
    c.token_expires_at !== null && new Date(c.token_expires_at).getTime() < nowMs;

  const openInvites = all.filter((c) => c.status === "invited" && !isExpired(c));
  const expiring = openInvites.filter(
    (c) => c.token_expires_at !== null && new Date(c.token_expires_at).getTime() - nowMs <= 2 * DAY
  );
  const expired = all.filter((c) => c.status === "invited" && isExpired(c));
  const stalled = openInvites.filter(
    (c) => nowMs - new Date(c.created_at).getTime() > 7 * DAY && !expiring.includes(c)
  );
  const toReview = new Set((recentCompletions ?? []).map((r) => r.candidate_id)).size;
  // When everything to review sits in one project, land directly on its ranking.
  const reviewProjectIds = new Set((recentCompletions ?? []).map((r) => r.project_id));
  const reviewHref =
    reviewProjectIds.size === 1 ? `/reports?project=${[...reviewProjectIds][0]}` : "/reports";

  const perProject = all.reduce<
    Record<string, { total: number; completed: number; started: number; invitedOpen: number; expired: number }>
  >((acc, c) => {
    const bucket = (acc[c.project_id] ??= { total: 0, completed: 0, started: 0, invitedOpen: 0, expired: 0 });
    bucket.total += 1;
    if (c.status === "completed") bucket.completed += 1;
    else if (c.status === "started") bucket.started += 1;
    else if (c.status === "invited") {
      if (isExpired(c)) bucket.expired += 1;
      else bucket.invitedOpen += 1;
    }
    return acc;
  }, {});

  const scoresByProject = (projectScores ?? []).reduce<Record<string, number[]>>((acc, r) => {
    (acc[r.project_id] ??= []).push(r.score);
    return acc;
  }, {});

  const projectStats = activeProjects.map((p) => {
    const stats = perProject[p.id] ?? { total: 0, completed: 0, started: 0, invitedOpen: 0, expired: 0 };
    const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const daysLeft = p.deadline ? Math.ceil((new Date(p.deadline).getTime() - nowMs) / DAY) : null;
    const atRisk =
      stats.total > 0 && daysLeft !== null && (daysLeft < 0 || (daysLeft <= 7 && pct < 70));
    const scores = scoresByProject[p.id] ?? [];
    return { ...p, ...stats, pct, daysLeft, atRisk, medianScore: scores.length >= 3 ? median(scores) : null };
  });
  const atRiskProjects = projectStats
    .filter((p) => p.atRisk)
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
  const sortedProjects = [...projectStats].sort(
    (a, b) => (b.atRisk ? 1 : 0) - (a.atRisk ? 1 : 0) || (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999)
  );

  type AttnRow = {
    key: string;
    severity: Severity;
    icon: string;
    text: string;
    hint: string;
    action: string;
    href: string;
  };

  const attention: AttnRow[] = [];
  if (toReview > 0)
    attention.push({
      key: "review", severity: "critical", icon: "review",
      text: t("attnReview", { count: toReview }),
      hint: t("attnReviewHint"), action: t("attnReviewAction"), href: reviewHref,
    });
  if (expiring.length > 0)
    attention.push({
      key: "expiring", severity: "warning", icon: "expiring",
      text: t("attnExpiring", { count: expiring.length }),
      hint: t("attnExpiringHint"), action: t("attnExpiringAction"), href: "/candidates?status=invited",
    });
  atRiskProjects.slice(0, 2).forEach((p) =>
    attention.push({
      key: `project-${p.id}`, severity: "serious", icon: "project",
      text:
        p.daysLeft !== null && p.daysLeft < 0
          ? t("attnProjectOverdue", { name: p.name, pct: p.pct })
          : t("attnProjectAtRisk", { name: p.name, pct: p.pct, days: Math.max(p.daysLeft ?? 0, 0) }),
      hint: "", action: t("attnProjectAction"), href: `/projects/${p.id}`,
    })
  );
  if (expired.length > 0)
    attention.push({
      key: "expired", severity: "serious", icon: "expired",
      text: t("attnExpired", { count: expired.length }),
      hint: t("attnExpiredHint"), action: t("attnExpiredAction"), href: "/candidates?status=invited",
    });
  if (stalled.length > 0)
    attention.push({
      key: "stalled", severity: "info", icon: "stalled",
      text: t("attnStalled", { count: stalled.length }),
      hint: t("attnStalledHint"), action: t("attnStalledAction"), href: "/candidates?status=invited",
    });

  // ---- Morning brief summary ----------------------------------------------
  const briefParts: string[] = [];
  if (toReview > 0) briefParts.push(t("briefReview", { count: toReview }));
  if (expiring.length > 0) briefParts.push(t("briefExpiring", { count: expiring.length }));
  if (atRiskProjects.length > 0) briefParts.push(t("briefAtRisk", { count: atRiskProjects.length }));

  // ---- Health metrics -------------------------------------------------------
  const cohort = all.filter((c) => nowMs - new Date(c.created_at).getTime() <= 30 * DAY);
  const prevCohort = all.filter((c) => {
    const age = nowMs - new Date(c.created_at).getTime();
    return age > 30 * DAY && age <= 60 * DAY;
  });
  const rate = (list: CandidateRow[]) =>
    list.length > 0
      ? Math.round((list.filter((c) => c.status === "completed").length / list.length) * 100)
      : null;
  const completionRate = rate(cohort);
  const prevRate = rate(prevCohort);
  const rateDelta = completionRate !== null && prevRate !== null ? completionRate - prevRate : null;

  const weekCount = resultsThisWeek ?? 0;
  const weekDelta = weekCount - (resultsPrevWeek ?? 0);
  const pipeline = all.filter((c) => (c.status === "invited" && !isExpired(c)) || c.status === "started").length;
  const onTrack = projectStats.filter((p) => !p.atRisk).length;

  type Kpi = {
    key: string; label: string; value: string; sub: string; action: string; href: string;
    delta?: { value: number; label: string; goodWhenUp: boolean };
  };
  const kpis: Kpi[] = [
    {
      key: "completion", label: t("kpiCompletionRate"),
      value: completionRate !== null ? `${completionRate}%` : "—",
      sub: t("kpiCompletionRateSub"), action: t("kpiCompletionRateAction"),
      href: "/candidates?status=invited",
      delta: rateDelta !== null ? { value: rateDelta, label: `${rateDelta > 0 ? "+" : ""}${rateDelta} pp`, goodWhenUp: true } : undefined,
    },
    {
      key: "results", label: t("kpiResultsWeek"), value: `${weekCount}`,
      sub: t("kpiResultsWeekSub"), action: t("kpiResultsWeekAction"), href: "/reports",
      delta: { value: weekDelta, label: `${weekDelta > 0 ? "+" : ""}${weekDelta}`, goodWhenUp: true },
    },
    {
      key: "pipeline", label: t("kpiPipeline"), value: `${pipeline}`,
      sub: t("kpiPipelineSub"), action: t("kpiPipelineAction"), href: "/candidates",
    },
    {
      key: "ontrack", label: t("kpiOnTrack"),
      value: activeProjects.length > 0 ? `${onTrack}/${activeProjects.length}` : "—",
      sub: t("kpiOnTrackSub", { total: activeProjects.length }),
      action: t("kpiOnTrackAction"), href: "/projects",
    },
  ];

  // ---- Activity -------------------------------------------------------------
  type Activity = { key: string; message: string; time: string; href: string; kind: "completed" | "invited"; ts: number };
  const activity: Activity[] = [];

  (recentResults ?? []).forEach((r, i) => {
    if (!r.candidates || !r.assessments) return;
    const ts = new Date(r.completed_at).getTime();
    activity.push({
      key: `r-${r.completed_at}-${i}`,
      message: t("activityCompleted", { name: r.candidates.full_name, assessment: r.assessments.name, score: r.score }),
      time: relativeTime(ts, nowMs, dateLocale),
      href: "/reports", kind: "completed", ts,
    });
  });
  [...all]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .forEach((c) => {
      const ts = new Date(c.created_at).getTime();
      activity.push({
        key: `c-${c.id}`,
        message: t("activityInvited", { name: c.full_name || t("unknown"), project: c.hiring_projects?.name ?? t("aProject") }),
        time: relativeTime(ts, nowMs, dateLocale),
        href: "/candidates", kind: "invited", ts,
      });
    });
  activity.sort((a, b) => b.ts - a.ts);

  const emptyWorkspace = all.length === 0 && (projects ?? []).length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      {/* Zone 1 — Morning brief */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <MorningGreeting firstName={firstName} />
          <p className="mt-2 text-sm text-slate-400">
            {briefParts.length > 0 ? (
              <a href="#attention" className="transition-colors hover:text-slate-200">
                {briefParts.join(" · ")}
              </a>
            ) : (
              t("briefAllClear")
            )}
          </p>
        </div>
        {!emptyWorkspace && (
          <div className="flex items-center gap-2.5">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1E2240] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-[#2d3a70] hover:text-white"
            >
              {t("newProject")}
            </Link>
            <Link
              href="/candidates?invite=1"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("inviteCandidate")}
            </Link>
          </div>
        )}
      </header>

      {emptyWorkspace ? (
        /* First-run: guided setup */
        <div className="premium-card rounded-2xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-white">{t("startedTitle")}</h2>
            <p className="mt-2 text-sm text-slate-400">{t("startedBody")}</p>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-5">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#1D4ED8]/40 bg-[#1D4ED8]/15 text-xs font-semibold text-[#8CB1FF]">
                  {n}
                </div>
                <h3 className="text-sm font-semibold text-white">{t(`step${n}Title`)}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{t(`step${n}Desc`)}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("firstProject")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Zone 2 — Needs attention */}
          <section id="attention" className="premium-card overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-[#1E2240] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-white">{t("needsAttention")}</h2>
              {attention.length > 0 && (
                <span className="rounded-full border border-[#1E2240] px-2.5 py-0.5 text-xs font-medium text-slate-400">
                  {attention.length}
                </span>
              )}
            </div>
            {attention.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#0ca30c]/10 ring-1 ring-[#0ca30c]/25">
                  <svg className="h-5 w-5 text-[#3fbf3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-200">{t("allClearTitle")}</p>
                <p className="mt-1 text-[13px] text-slate-400">{t("allClearBody")}</p>
                <a href="#activity" className="mt-3 inline-block text-[13px] font-medium text-[#8CB1FF] hover:underline">
                  {t("allClearAction")} ↓
                </a>
              </div>
            ) : (
              <div className="divide-y divide-[#1E2240]">
                {attention.map((row) => {
                  const sev = SEVERITY[row.severity];
                  return (
                    <Link
                      key={row.key}
                      href={row.href}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#1E2240]/30"
                    >
                      <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${sev.bg} ${sev.text} ${sev.ring}`}>
                        <AttnIcon kind={row.icon} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-200">{row.text}</span>
                        {row.hint && <span className="mt-0.5 block text-[13px] text-slate-400">{row.hint}</span>}
                      </span>
                      <span className="flex-shrink-0 whitespace-nowrap text-[13px] font-medium text-[#8CB1FF] group-hover:underline">
                        {row.action} →
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Zone 3 — Health strip */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <Link
                key={kpi.key}
                href={kpi.href}
                className="premium-card premium-card-hover flex flex-col rounded-xl p-5"
              >
                <p className="text-[13px] font-medium text-slate-400">{kpi.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-white">{kpi.value}</span>
                  {kpi.delta && kpi.delta.value !== 0 && (
                    <span
                      className={`text-[13px] font-medium ${
                        kpi.delta.value > 0 === kpi.delta.goodWhenUp ? "text-[#3fbf3f]" : "text-[#f28b8b]"
                      }`}
                    >
                      <span aria-hidden="true">{kpi.delta.value > 0 ? "▲" : "▼"}</span> {kpi.delta.label}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[13px] text-slate-400">{kpi.sub}</p>
                <p className="mt-3 text-[13px] font-medium text-[#8CB1FF]">{kpi.action} →</p>
              </Link>
            ))}
          </section>

          {/* Zone 4 — Active projects + Zone 6 — Activity rail */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
            <section className="space-y-4 xl:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">{t("activeProjectsTitle")}</h2>
                {sortedProjects.length > 4 && (
                  <Link href="/projects" className="text-[13px] font-medium text-[#8CB1FF] hover:underline">
                    {t("viewAllProjects", { count: sortedProjects.length })} →
                  </Link>
                )}
              </div>

              {sortedProjects.length === 0 ? (
                <div className="premium-card rounded-xl p-8 text-center">
                  <p className="text-sm font-medium text-slate-200">{t("noActiveProjects")}</p>
                  <p className="mt-1 text-[13px] text-slate-400">{t("noActiveProjectsBody")}</p>
                  <Link
                    href="/projects/new"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
                  >
                    {t("newProject")}
                  </Link>
                </div>
              ) : (
                sortedProjects.slice(0, 4).map((p) => {
                  const deadlineLabel =
                    p.daysLeft === null
                      ? t("deadlineNone")
                      : p.daysLeft < 0
                        ? t("deadlineOverdue", { days: Math.abs(p.daysLeft) })
                        : p.daysLeft <= 14
                          ? t("deadlineDays", { days: p.daysLeft })
                          : t("deadlineDue", {
                              date: new Date(p.deadline!).toLocaleDateString(dateLocale, { day: "numeric", month: "short" }),
                            });
                  const deadlineTone =
                    p.daysLeft !== null && p.daysLeft < 0
                      ? "text-[#ec835a]"
                      : p.daysLeft !== null && p.daysLeft <= 7
                        ? "text-[#fab219]"
                        : "text-slate-400";
                  const segments = [
                    { key: "completed", count: p.completed, cls: STAGE.completed, label: t("stageCompleted"), status: "completed" },
                    { key: "started", count: p.started, cls: STAGE.started, label: t("stageStarted"), status: "started" },
                    { key: "invited", count: p.invitedOpen, cls: STAGE.invited, label: t("stageInvited"), status: "invited" },
                    { key: "expired", count: p.expired, cls: STAGE.expired, label: t("stageExpired"), status: "invited" },
                  ].filter((s) => s.count > 0);

                  return (
                    <article key={p.id} className="premium-card premium-card-hover rounded-xl p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/projects/${p.id}`}
                            className="block truncate text-[15px] font-semibold text-white transition-colors hover:text-[#AFC7FF]"
                          >
                            {p.name}
                          </Link>
                          <p className={`mt-0.5 text-[13px] ${deadlineTone}`}>{deadlineLabel}</p>
                        </div>
                        {p.atRisk && (
                          <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#ec835a]/10 px-2.5 py-1 text-xs font-medium text-[#ec835a] ring-1 ring-[#ec835a]/25">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M4.5 19.5h15L12 4.5l-7.5 15Z" />
                            </svg>
                            {t("atRiskBadge")}
                          </span>
                        )}
                      </div>

                      {p.total > 0 ? (
                        <>
                          <div
                            className="mt-4 flex h-2.5 w-full gap-[3px]"
                            role="img"
                            aria-label={segments.map((s) => `${s.count} ${s.label}`).join(", ")}
                          >
                            {segments.map((s) => (
                              <div
                                key={s.key}
                                className={`h-2.5 rounded-full ${s.cls}`}
                                style={{ flexGrow: s.count, flexBasis: 0, minWidth: "8px" }}
                              />
                            ))}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                            {segments.map((s) => (
                              <Link
                                key={s.key}
                                href={`/candidates?project=${p.id}&status=${s.status}`}
                                className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 transition-colors hover:text-slate-200"
                              >
                                <span className={`h-2 w-2 rounded-full ${s.cls}`} aria-hidden="true" />
                                <span className="font-semibold text-slate-200">{s.count}</span> {s.label}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="mt-4 text-[13px] text-slate-400">{t("noCandidatesInProject")}</p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-[#1E2240] pt-3.5">
                        <div className="flex items-center gap-3 text-[13px] text-slate-400">
                          {p.total > 0 && <span>{t("completionShort", { pct: p.pct })}</span>}
                          {p.medianScore !== null && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{t("medianScore", { score: p.medianScore })}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/candidates?invite=1&project=${p.id}`}
                            className="text-[13px] font-medium text-slate-300 transition-colors hover:text-white"
                          >
                            {t("inviteShort")}
                          </Link>
                          <Link href={`/projects/${p.id}`} className="text-[13px] font-medium text-[#8CB1FF] hover:underline">
                            {t("openProject")} →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            {/* Zone 6 — Recent activity (rail) */}
            <section id="activity" className="premium-card overflow-hidden rounded-xl">
              <div className="border-b border-[#1E2240] px-4 py-3.5">
                <h2 className="text-sm font-semibold text-white">{t("activity")}</h2>
              </div>
              {activity.length === 0 ? (
                <div className="px-5 py-10 text-center text-[13px] text-slate-400">{t("activityEmpty")}</div>
              ) : (
                <div className="divide-y divide-[#1E2240]">
                  {activity.slice(0, 8).map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#1E2240]/30"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${
                          item.kind === "completed"
                            ? "bg-[#0ca30c]/10 text-[#3fbf3f] ring-[#0ca30c]/25"
                            : "bg-[#3987e5]/10 text-[#6da7ec] ring-[#3987e5]/25"
                        }`}
                      >
                        {item.kind === "completed" ? (
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.2 5.47a2.25 2.25 0 0 1-2.5 0L2.25 7.5" />
                          </svg>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] leading-snug text-slate-300">{item.message}</span>
                        <span className="mt-0.5 block text-xs text-slate-400">{item.time}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
