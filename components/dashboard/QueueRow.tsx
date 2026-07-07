import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { QueueEntry } from "@/lib/dashboard/queue";
import type { ConfidenceLevel, RecommendationLevel } from "@/lib/dashboard/queue-intelligence";
import { REVIEW_SLA_MS, shortDuration } from "@/lib/dashboard/format";

// Recommendation chips use the fixed status palette; icon + label always
// accompany color so identity is never color-alone.
const REC_STYLE: Record<RecommendationLevel, { chip: string; dot: string }> = {
  strong: { chip: "enterprise-chip-success", dot: "bg-[var(--it-success)]" },
  proceed: { chip: "enterprise-chip-info", dot: "bg-[var(--it-info)]" },
  review: { chip: "enterprise-chip-warning", dot: "bg-[var(--it-warning)]" },
  caution: { chip: "enterprise-chip-warning", dot: "bg-[var(--it-warning)]" },
  notRecommended: { chip: "enterprise-chip-danger", dot: "bg-[var(--it-danger)]" },
};

const REC_LABEL_KEY: Record<RecommendationLevel, string> = {
  strong: "recStrong",
  proceed: "recProceed",
  review: "recReview",
  caution: "recCaution",
  notRecommended: "recNotRecommended",
};

const CONFIDENCE_LABEL_KEY: Record<ConfidenceLevel, string> = {
  high: "confidenceHigh",
  moderate: "confidenceModerate",
  low: "confidenceLow",
};

const CONFIDENCE_FILL: Record<ConfidenceLevel, number> = { high: 3, moderate: 2, low: 1 };

export default async function QueueRow({ entry }: { entry: QueueEntry }) {
  const t = await getTranslations("dashboard");
  const intel = entry.intelligence;
  const overSla = entry.waitMs > REVIEW_SLA_MS;
  const rec = intel.recommendation;

  // One click target: the whole row opens the review. No inner links, so the
  // recruiter never has to aim at a name or a small "Review" affordance.
  return (
    <Link
      href={`/candidates/${entry.id}?ctx=review`}
      className="enterprise-table-row group block px-5 py-4 transition-colors hover:bg-white/[0.025] focus-visible:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--it-primary)]"
    >
      {/* Line 1 — who */}
      <div className="flex items-baseline gap-2">
        <span className="min-w-0 truncate text-[15px] font-semibold text-white transition-colors group-hover:text-[#d7e1ff]">
          {entry.fullName || t("unknown")}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--it-muted)]">
          {entry.projectName ?? t("aProject")}
          {" · "}
          {entry.assessmentTotal !== null && entry.assessmentTotal > 0
            ? t("queueAssessments", { done: entry.resultsCount, total: entry.assessmentTotal })
            : t("queueAssessmentsBare", { done: entry.resultsCount })}
        </span>
        <span
          className={`flex-shrink-0 whitespace-nowrap text-xs font-medium tabular-nums ${
            overSla ? "text-[#d2b174]" : "text-[var(--it-muted)]"
          }`}
        >
          {t("queueWaitingFor", { time: shortDuration(entry.waitMs) })}
        </span>
      </div>

      {/* Line 2 — recommendation, confidence, why */}
      <div className="mt-1.5 flex min-w-0 items-center gap-2.5">
        {rec ? (
          <span
            className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${REC_STYLE[rec].chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${REC_STYLE[rec].dot}`} aria-hidden="true" />
            {t(REC_LABEL_KEY[rec])}
          </span>
        ) : (
          // Placeholder slot: filled by the Assessment Intelligence Layer
          // snapshot once available for candidates without derivable evidence.
          <span className="enterprise-chip inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
            {t("queueIntelPending")}
          </span>
        )}
        {intel.confidence && (
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs text-[var(--it-muted)]">
            <span className="inline-flex items-center gap-0.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < CONFIDENCE_FILL[intel.confidence!] ? "bg-slate-300" : "bg-[var(--it-border)]"
                  }`}
                />
              ))}
            </span>
            {t("confidenceLabel")}: {t(CONFIDENCE_LABEL_KEY[intel.confidence])}
          </span>
        )}
        {intel.headline && (
          <span className="hidden min-w-0 truncate text-[13px] text-[var(--it-muted)] sm:inline" title={intel.headline}>
            {intel.headline}
          </span>
        )}
      </div>

      {/* Line 3 — evidence highlights + affordance */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        {intel.topCompetency && (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-slate-300">
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#91c7ad]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-6 6m6-6l6 6" />
            </svg>
            <span className="truncate">{intel.topCompetency}</span>
          </span>
        )}
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-slate-400">
          <svg
            className={`h-3.5 w-3.5 flex-shrink-0 ${intel.primaryRisk ? "text-[#d2b174]" : "text-[var(--it-faint)]"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M4.5 19.5h15L12 4.5l-7.5 15Z" />
          </svg>
          <span className={`truncate ${intel.primaryRisk ? "text-[#d2b174]" : ""}`}>
            {intel.primaryRisk ? intel.primaryRisk.label : t("queueRiskNone")}
          </span>
        </span>
        {intel.interviewKitReady && (
          <span className="hidden items-center gap-1.5 text-[13px] text-[var(--it-muted)] sm:inline-flex">
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#9bb7d2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a8.96 8.96 0 0 1-1.5 5L21 21l-4.35-1.45A9 9 0 1 1 21 12Z" />
            </svg>
            {t("queueInterviewKit")}
          </span>
        )}
        <span className="enterprise-link ml-auto flex-shrink-0 whitespace-nowrap text-[13px] font-medium">
          {t("queueReview")} →
        </span>
      </div>
    </Link>
  );
}
