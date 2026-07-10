import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { ProjectHealth, ProjectHealthStatus } from "@/lib/dashboard/project-health";
import { PIPELINE_STAGES, STAGE_COLOR, STAGE_LABEL_KEY } from "@/lib/dashboard/stages";

const HEALTH_STYLE: Record<ProjectHealthStatus, { chip: string; dot: string; text: string }> = {
  onTrack: { chip: "enterprise-chip-success", dot: "bg-[var(--it-success)]", text: "text-[#15803d]" },
  slowing: { chip: "enterprise-chip-warning", dot: "bg-[var(--it-warning)]", text: "text-[#b45309]" },
  atRisk: { chip: "enterprise-chip-warning", dot: "bg-[var(--it-warning)]", text: "text-[#b45309]" },
  blocked: { chip: "enterprise-chip-danger", dot: "bg-[var(--it-danger)]", text: "text-[#b91c1c]" },
};

const HEALTH_LABEL_KEY: Record<ProjectHealthStatus, string> = {
  onTrack: "healthOnTrack",
  slowing: "healthSlowing",
  atRisk: "healthAtRisk",
  blocked: "healthBlocked",
};

export interface ProjectHealthCardProps {
  project: { id: string; name: string; deadline: string | null };
  health: ProjectHealth;
}

/** One project, one diagnosis: a labeled health state with the reason stated. */
export default async function ProjectHealthCard({ project, health }: ProjectHealthCardProps) {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const style = HEALTH_STYLE[health.status];

  const reasonText = (() => {
    switch (health.reason.kind) {
      case "noAssessments":
        return t("healthReasonNoAssessments");
      case "allInvitesExpired":
        return t("healthReasonExpiredInvites", { count: health.reason.count });
      case "inactive":
        return t("healthReasonInactive", { days: health.reason.days });
      case "overdue":
        return t("healthReasonOverdue", { days: health.reason.days, pct: health.reason.pct });
      case "deadline":
        return t("healthReasonAtRisk", { pct: health.reason.pct, days: health.reason.days });
      case "slowing":
        return t("healthReasonSlowing", { prev: health.reason.prev, current: health.reason.current });
      case "none":
        return null;
    }
  })();

  const deadlineLabel =
    health.daysLeft === null
      ? t("deadlineNone")
      : health.daysLeft < 0
        ? t("deadlineOverdue", { days: Math.abs(health.daysLeft) })
        : health.daysLeft <= 14
          ? t("deadlineDays", { days: health.daysLeft })
          : t("deadlineDue", {
              date: new Date(project.deadline!).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
              }),
            });

  const segments = [...PIPELINE_STAGES, "expired" as const]
    .map((stage) => ({
      key: stage,
      count: health.stages[stage],
      cls: STAGE_COLOR[stage],
      label: t(STAGE_LABEL_KEY[stage]),
      // The candidates list filters expired invites via the invited stage.
      href: `/candidates?project=${project.id}&stage=${stage === "expired" ? "invited" : stage}`,
    }))
    .filter((s) => s.count > 0);

  return (
    <article className="enterprise-card enterprise-card-hover rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/projects/${project.id}`}
            className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--it-text)] transition-colors hover:text-slate-300"
          >
            {project.name}
          </Link>
          <p className="mt-0.5 text-[13px] leading-5 text-[var(--it-muted)]">
            {deadlineLabel}
            {reasonText && (
              <>
                {" · "}
                <span className={health.status === "onTrack" ? "" : style.text}>{reasonText}</span>
              </>
            )}
          </p>
        </div>
        <span
          className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.chip}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
          {t(HEALTH_LABEL_KEY[health.status])}
        </span>
      </div>

      {health.total > 0 ? (
        <>
          <div
            className="mt-4 flex h-2.5 w-full gap-[3px]"
            role="img"
            aria-label={segments.map((s) => `${s.count} ${s.label}`).join(", ")}
          >
            {segments.map((s) => (
              <div
                key={s.key}
                className={`h-2.5 rounded-sm ${s.cls}`}
                style={{ flexGrow: s.count, flexBasis: 0, minWidth: "8px" }}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {segments.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                className="inline-flex items-center gap-1.5 text-[13px] capitalize text-[var(--it-muted)] transition-colors hover:text-slate-200"
              >
                <span className={`h-2 w-2 rounded-full ${s.cls}`} aria-hidden="true" />
                <span className="font-semibold text-slate-200">{s.count}</span> {s.label}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-[13px] text-[var(--it-muted)]">{t("noCandidatesInProject")}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t enterprise-divider pt-3.5">
        <div className="flex items-center gap-3 text-[13px] text-[var(--it-muted)]">
          {health.total > 0 && <span>{t("completionShort", { pct: health.pct })}</span>}
          {health.total > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{t("velocityWeek", { count: health.velocity.current })}</span>
            </>
          )}
          {health.medianScore !== null && (
            <>
              <span aria-hidden="true">·</span>
              <span>{t("medianScore", { score: health.medianScore })}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/candidates?invite=1&project=${project.id}`}
            className="text-[13px] font-medium text-slate-300 transition-colors hover:text-[var(--it-text)]"
          >
            {t("inviteShort")}
          </Link>
          <Link href={`/projects/${project.id}`} className="enterprise-link text-[13px] font-medium">
            {t("openProject")} →
          </Link>
        </div>
      </div>
    </article>
  );
}
