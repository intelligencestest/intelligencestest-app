import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { assessmentName as termName } from "@/lib/i18n/assessment-terms";
import { DAY, EXPIRING_WINDOW_MS, relativeTime } from "@/lib/dashboard/format";
import { loadReviewQueue, type QueueSort } from "@/lib/dashboard/queue";
import { deriveProjectHealth, HEALTH_ORDER } from "@/lib/dashboard/project-health";
import { emptyStageCounts, type PipelineStage } from "@/lib/dashboard/stages";
import ActionCenter, { type AttentionAlert } from "@/components/dashboard/ActionCenter";
import ActivityRail, { type ActivityItem } from "@/components/dashboard/ActivityRail";
import PipelineStrip from "@/components/dashboard/PipelineStrip";
import ProcessHealthStrip from "@/components/dashboard/ProcessHealthStrip";
import ProjectHealthCard from "@/components/dashboard/ProjectHealthCard";
import QueueSection from "@/components/dashboard/QueueSection";
import WorkloadTiles from "@/components/dashboard/WorkloadTiles";
import MorningGreeting from "./MorningGreeting";

const REACHED_COMPLETED = new Set(["completed", "reviewed", "interview", "hired"]);
const STALLED_THRESHOLD_MS = 7 * DAY;
const INTERVIEW_AGING_MS = 7 * DAY;

type CandidateRow = {
  id: string;
  full_name: string;
  pipeline_stage: string;
  outcome: string;
  created_at: string;
  stage_changed_at: string | null;
  token_expires_at: string | null;
  project_id: string;
  hiring_projects: { id: string; name: string } | null;
};

type ProjectRow = { id: string; name: string; status: string; deadline: string | null };

type ResultRow = {
  score: number;
  completed_at: string;
  candidate_id: string | null;
  candidates: { full_name: string } | null;
  assessments: { name: string } | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ queue?: string }>;
}) {
  const { queue: queueParam } = await searchParams;
  const queueSort: QueueSort = queueParam === "recommendation" ? "recommendation" : "waiting";

  const locale = await getLocale();
  const intelLocale = locale === "es" ? "es" : "en";
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
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  // TODO(phase-2): replace full-table reads with event-fed rollups so the
  // dashboard stays a fixed number of indexed queries at enterprise volume.
  const [
    { data: candidates },
    { data: projects },
    { data: recentResults },
    { data: projectResults },
    reviewQueue,
  ] = await Promise.all([
    admin
      .from("candidates")
      .select(
        "id, full_name, pipeline_stage, outcome, created_at, stage_changed_at, token_expires_at, project_id, hiring_projects(id, name)"
      )
      .eq("company_id", companyId)
      .returns<CandidateRow[]>(),
    admin
      .from("hiring_projects")
      .select("id, name, status, deadline")
      .eq("company_id", companyId)
      .returns<ProjectRow[]>(),
    admin
      .from("results")
      .select("score, completed_at, candidate_id, candidates(full_name), assessments(name)")
      .eq("company_id", companyId)
      .order("completed_at", { ascending: false })
      .limit(8)
      .returns<ResultRow[]>(),
    admin
      .from("results")
      .select("project_id, score, completed_at")
      .eq("company_id", companyId)
      .returns<{ project_id: string; score: number; completed_at: string }[]>(),
    loadReviewQueue(admin, companyId, intelLocale, nowMs),
  ]);

  const all = candidates ?? [];
  const activeProjects = (projects ?? []).filter((p) => p.status === "active");
  const activeProjectIds = activeProjects.map((p) => p.id);

  const { data: paRows } =
    activeProjectIds.length > 0
      ? await admin
          .from("project_assessments")
          .select("project_id")
          .in("project_id", activeProjectIds)
          .returns<{ project_id: string }[]>()
      : { data: [] as { project_id: string }[] };
  const assessmentCounts = (paRows ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.project_id] = (acc[row.project_id] ?? 0) + 1;
    return acc;
  }, {});

  // ---- Candidate buckets ----------------------------------------------------
  const isTokenExpired = (c: CandidateRow) =>
    c.token_expires_at !== null && new Date(c.token_expires_at).getTime() < nowMs;
  const isExpiredInvite = (c: CandidateRow) =>
    c.pipeline_stage === "invited" && (c.outcome === "expired" || isTokenExpired(c));

  const openInvites = all.filter(
    (c) => c.pipeline_stage === "invited" && c.outcome === "pending" && !isTokenExpired(c)
  );
  const expiring = openInvites.filter(
    (c) =>
      c.token_expires_at !== null &&
      new Date(c.token_expires_at).getTime() - nowMs <= EXPIRING_WINDOW_MS
  );
  const expired = all.filter(isExpiredInvite);
  const stalled = openInvites.filter(
    (c) => nowMs - new Date(c.created_at).getTime() > STALLED_THRESHOLD_MS && !expiring.includes(c)
  );

  const stageCounts = emptyStageCounts();
  for (const c of all) {
    if (isExpiredInvite(c)) {
      stageCounts.expired += 1;
    } else if (c.outcome === "pending" || c.pipeline_stage === "hired") {
      if (c.pipeline_stage in stageCounts) stageCounts[c.pipeline_stage as PipelineStage] += 1;
    }
  }

  const reviewedPending = all.filter((c) => c.pipeline_stage === "reviewed" && c.outcome === "pending");
  const inInterview = all.filter((c) => c.pipeline_stage === "interview" && c.outcome === "pending");
  const interviewAging = inInterview.filter(
    (c) => c.stage_changed_at !== null && nowMs - new Date(c.stage_changed_at).getTime() > INTERVIEW_AGING_MS
  );

  // ---- Project health -------------------------------------------------------
  const candidatesByProject = all.reduce<Record<string, CandidateRow[]>>((acc, c) => {
    (acc[c.project_id] ??= []).push(c);
    return acc;
  }, {});
  const resultsByProject = (projectResults ?? []).reduce<
    Record<string, { scores: number[]; timestamps: number[] }>
  >((acc, r) => {
    const bucket = (acc[r.project_id] ??= { scores: [], timestamps: [] });
    bucket.scores.push(r.score);
    bucket.timestamps.push(new Date(r.completed_at).getTime());
    return acc;
  }, {});

  const projectHealths = activeProjects.map((p) => ({
    project: p,
    health: deriveProjectHealth(
      p,
      candidatesByProject[p.id] ?? [],
      resultsByProject[p.id]?.timestamps ?? [],
      assessmentCounts[p.id] ?? 0,
      resultsByProject[p.id]?.scores ?? [],
      nowMs
    ),
  }));
  const sortedProjects = [...projectHealths].sort(
    (a, b) =>
      HEALTH_ORDER[a.health.status] - HEALTH_ORDER[b.health.status] ||
      (a.health.daysLeft ?? 9999) - (b.health.daysLeft ?? 9999)
  );
  const blockedProjects = projectHealths.filter((p) => p.health.status === "blocked");
  const atRiskProjects = projectHealths
    .filter((p) => p.health.status === "atRisk")
    .sort((a, b) => (a.health.daysLeft ?? 0) - (b.health.daysLeft ?? 0));

  // ---- Action Center alerts (exceptions only; the queue owns routine work) --
  const toAlertCandidate = (c: CandidateRow) => ({
    id: c.id,
    name: c.full_name,
    expiresAt: c.token_expires_at,
  });
  const alerts: AttentionAlert[] = [];
  if (expiring.length > 0)
    alerts.push({
      kind: "expiring",
      candidates: expiring
        .sort((a, b) => new Date(a.token_expires_at!).getTime() - new Date(b.token_expires_at!).getTime())
        .map(toAlertCandidate),
    });
  if (expired.length > 0)
    alerts.push({
      kind: "expired",
      candidates: expired
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(toAlertCandidate),
    });
  blockedProjects.slice(0, 2).forEach(({ project, health }) => {
    const reason = health.reason;
    if (reason.kind !== "noAssessments" && reason.kind !== "allInvitesExpired" && reason.kind !== "inactive") return;
    alerts.push({ kind: "blocked", projectId: project.id, name: project.name, reason });
  });
  atRiskProjects.slice(0, 2).forEach(({ project, health }) =>
    alerts.push({
      kind: "atRisk",
      projectId: project.id,
      name: project.name,
      pct: health.pct,
      daysLeft: health.daysLeft,
    })
  );
  if (stalled.length > 0) alerts.push({ kind: "stalled", count: stalled.length });

  // ---- Morning brief ---------------------------------------------------------
  const strongCount = reviewQueue.entries.filter(
    (e) => e.intelligence.recommendation === "strong"
  ).length;
  const briefParts: string[] = [];
  if (reviewQueue.totalCount > 0) briefParts.push(t("briefReview", { count: reviewQueue.totalCount }));
  if (strongCount > 0) briefParts.push(t("briefStrong", { count: strongCount }));
  if (expiring.length > 0) briefParts.push(t("briefExpiring", { count: expiring.length }));
  if (atRiskProjects.length + blockedProjects.length > 0)
    briefParts.push(t("briefAtRisk", { count: atRiskProjects.length + blockedProjects.length }));

  // ---- Process health (tier-2) ----------------------------------------------
  const cohort = all.filter((c) => nowMs - new Date(c.created_at).getTime() <= 30 * DAY);
  const prevCohort = all.filter((c) => {
    const age = nowMs - new Date(c.created_at).getTime();
    return age > 30 * DAY && age <= 60 * DAY;
  });
  const rate = (list: CandidateRow[]) =>
    list.length > 0
      ? Math.round(
          (list.filter((c) => REACHED_COMPLETED.has(c.pipeline_stage)).length / list.length) * 100
        )
      : null;
  const completionRate = rate(cohort);
  const prevRate = rate(prevCohort);

  const hired = all.filter((c) => c.pipeline_stage === "hired");
  const hires30 = hired.filter(
    (c) => c.stage_changed_at !== null && nowMs - new Date(c.stage_changed_at).getTime() <= 30 * DAY
  ).length;
  const reachedCompleted = all.filter((c) => REACHED_COMPLETED.has(c.pipeline_stage)).length;

  // ---- Activity ---------------------------------------------------------------
  const activity: (ActivityItem & { ts: number })[] = [];
  (recentResults ?? []).forEach((r, i) => {
    if (!r.candidates || !r.assessments) return;
    const ts = new Date(r.completed_at).getTime();
    activity.push({
      key: `r-${r.completed_at}-${i}`,
      message: t("activityCompleted", {
        name: r.candidates.full_name,
        assessment: termName(r.assessments.name, locale),
        score: r.score,
      }),
      time: relativeTime(ts, nowMs, dateLocale),
      href: r.candidate_id ? `/candidates/${r.candidate_id}` : "/reports",
      kind: "completed",
      ts,
    });
  });
  [...all]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .forEach((c) => {
      const ts = new Date(c.created_at).getTime();
      activity.push({
        key: `c-${c.id}`,
        message: t("activityInvited", {
          name: c.full_name || t("unknown"),
          project: c.hiring_projects?.name ?? t("aProject"),
        }),
        time: relativeTime(ts, nowMs, dateLocale),
        href: `/candidates/${c.id}`,
        kind: "invited",
        ts,
      });
    });
  activity.sort((a, b) => b.ts - a.ts);

  const emptyWorkspace = all.length === 0 && (projects ?? []).length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      {/* Zone A — Morning brief */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <MorningGreeting firstName={firstName} />
          <p className="mt-2 text-sm text-slate-400">
            {briefParts.length > 0 ? (
              /* The brief points at the work it describes: the queue when
                 reviews wait, otherwise the alerts. */
              <a
                href={reviewQueue.totalCount > 0 || alerts.length === 0 ? "#queue" : "#attention"}
                className="transition-colors hover:text-slate-200"
              >
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
          {/* Zone B — Action Center (exceptions only; collapses away when clear) */}
          {alerts.length > 0 && <ActionCenter alerts={alerts} nowMs={nowMs} />}

          {/* Zone C — Workload tiles */}
          <WorkloadTiles
            data={{
              review: {
                count: reviewQueue.totalCount,
                oldestWaitMs: reviewQueue.entries[0]?.waitMs ?? null,
              },
              invites: { expiring: expiring.length, expired: expired.length },
              reviewed: { count: reviewedPending.length },
              interview: { count: inInterview.length, agingCount: interviewAging.length },
            }}
          />

          {/* Zones D–H — queue + projects | pipeline + activity */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
            <div className="space-y-6 xl:col-span-2">
              {/* Zone D — Candidate queue (hero) */}
              <QueueSection
                entries={reviewQueue.entries}
                totalCount={reviewQueue.totalCount}
                sort={queueSort}
                basePath="/dashboard"
                limit={7}
              />

              {/* Zone E — Project health */}
              <section className="space-y-4">
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
                  sortedProjects
                    .slice(0, 4)
                    .map(({ project, health }) => (
                      <ProjectHealthCard key={project.id} project={project} health={health} />
                    ))
                )}
              </section>
            </div>

            {/* Zones F + H — right rail */}
            <div className="space-y-6">
              <PipelineStrip counts={stageCounts} />
              <ActivityRail items={activity.slice(0, 8)} />
            </div>
          </div>

          {/* Zone I — Tier-2 process health (deliberately quiet, last) */}
          <ProcessHealthStrip
            data={{
              completionRate,
              rateDelta:
                completionRate !== null && prevRate !== null ? completionRate - prevRate : null,
              hires: hires30,
              conversion:
                reachedCompleted > 0 ? Math.round((hired.length / reachedCompleted) * 100) : null,
              onTrack: projectHealths.filter((p) => p.health.status === "onTrack").length,
              activeProjects: activeProjects.length,
            }}
          />
        </>
      )}
    </div>
  );
}
