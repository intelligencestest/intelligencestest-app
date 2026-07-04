import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { QueueEntry } from "@/lib/dashboard/queue";
import type { ConfidenceLevel, RecommendationLevel } from "@/lib/dashboard/queue-intelligence";
import { REVIEW_SLA_MS, shortDuration } from "@/lib/dashboard/format";

// Recommendation chips use the fixed status palette; icon + label always
// accompany color so identity is never color-alone.
const REC_STYLE: Record<RecommendationLevel, { chip: string; dot: string }> = {
  strong: { chip: "bg-[#0ca30c]/10 text-[#3fbf3f] ring-[#0ca30c]/25", dot: "bg-[#3fbf3f]" },
  proceed: { chip: "bg-[#3987e5]/10 text-[#6da7ec] ring-[#3987e5]/25", dot: "bg-[#6da7ec]" },
  review: { chip: "bg-[#fab219]/10 text-[#fab219] ring-[#fab219]/25", dot: "bg-[#fab219]" },
  caution: { chip: "bg-[#ec835a]/10 text-[#ec835a] ring-[#ec835a]/25", dot: "bg-[#ec835a]" },
  notRecommended: { chip: "bg-[#d03b3b]/10 text-[#f28b8b] ring-[#d03b3b]/25", dot: "bg-[#e05252]" },
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

  return (
    <div className="group px-5 py-3.5 transition-colors hover:bg-[#1E2240]/30">
      {/* Line 1 — who */}
      <div className="flex items-baseline gap-2">
        <Link
          href={`/candidates/${entry.id}?ctx=review`}
          className="min-w-0 truncate text-sm font-semibold text-white transition-colors hover:text-[#AFC7FF]"
        >
          {entry.fullName || t("unknown")}
        </Link>
        <span className="min-w-0 flex-1 truncate text-[13px] text-slate-400">
          {entry.projectName ?? t("aProject")}
          {" · "}
          {entry.assessmentTotal !== null && entry.assessmentTotal > 0
            ? t("queueAssessments", { done: entry.resultsCount, total: entry.assessmentTotal })
            : t("queueAssessmentsBare", { done: entry.resultsCount })}
        </span>
        <span
          className={`flex-shrink-0 whitespace-nowrap text-xs font-medium ${
            overSla ? "text-[#fab219]" : "text-slate-400"
          }`}
        >
          {t("queueWaitingFor", { time: shortDuration(entry.waitMs) })}
        </span>
      </div>

      {/* Line 2 — recommendation, confidence, why */}
      <div className="mt-1.5 flex min-w-0 items-center gap-2.5">
        {rec ? (
          <span
            className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${REC_STYLE[rec].chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${REC_STYLE[rec].dot}`} aria-hidden="true" />
            {t(REC_LABEL_KEY[rec])}
          </span>
        ) : (
          // Placeholder slot: filled by the Assessment Intelligence Layer
          // snapshot once available for candidates without derivable evidence.
          <span className="inline-flex flex-shrink-0 items-center rounded-full bg-[#1E2240]/60 px-2.5 py-0.5 text-xs font-medium text-slate-400 ring-1 ring-[#1E2240]">
            {t("queueIntelPending")}
          </span>
        )}
        {intel.confidence && (
          <span
            className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs text-slate-400"
            title={t("confidenceLabel")}
          >
            <span className="inline-flex items-center gap-0.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < CONFIDENCE_FILL[intel.confidence!] ? "bg-slate-300" : "bg-[#1E2240]"
                  }`}
                />
              ))}
            </span>
            {t("confidenceLabel")}: {t(CONFIDENCE_LABEL_KEY[intel.confidence])}
          </span>
        )}
        {intel.headline && (
          <span className="min-w-0 truncate text-[13px] text-slate-400">{intel.headline}</span>
        )}
      </div>

      {/* Line 3 — evidence highlights + action */}
      <div className="mt-1.5 flex items-center gap-4">
        {intel.topCompetency && (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-slate-300">
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#3fbf3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-6 6m6-6l6 6" />
            </svg>
            <span className="truncate">{intel.topCompetency}</span>
          </span>
        )}
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-slate-400">
          <svg
            className={`h-3.5 w-3.5 flex-shrink-0 ${intel.primaryRisk ? "text-[#ec835a]" : "text-slate-500"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M4.5 19.5h15L12 4.5l-7.5 15Z" />
          </svg>
          <span className={`truncate ${intel.primaryRisk ? "text-[#ec835a]" : ""}`}>
            {intel.primaryRisk ? intel.primaryRisk.label : t("queueRiskNone")}
          </span>
        </span>
        {intel.interviewKitReady && (
          <span className="hidden items-center gap-1.5 text-[13px] text-slate-400 sm:inline-flex">
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#6da7ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a8.96 8.96 0 0 1-1.5 5L21 21l-4.35-1.45A9 9 0 1 1 21 12Z" />
            </svg>
            {t("queueInterviewKit")}
          </span>
        )}
        <Link
          href={`/candidates/${entry.id}?ctx=review`}
          className="ml-auto flex-shrink-0 whitespace-nowrap text-[13px] font-medium text-[#8CB1FF] group-hover:underline"
        >
          {t("queueReview")} →
        </Link>
      </div>
    </div>
  );
}
