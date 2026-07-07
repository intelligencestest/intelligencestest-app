import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { PlanUsageSummary } from "@/lib/plan/limits";
import { PlanBadge } from "./PlanBadge";

interface TrialBannerProps {
  summary: PlanUsageSummary;
  locale: "en" | "es";
}

const SEVERITY = {
  info: { text: "text-[#9bb7d2]", bg: "bg-[rgba(82,122,163,0.08)]", ring: "ring-[rgba(82,122,163,0.28)]" },
  warning: { text: "text-[#d2b174]", bg: "bg-[rgba(184,134,47,0.08)]", ring: "ring-[rgba(184,134,47,0.28)]" },
  serious: { text: "text-[#d99792]", bg: "bg-[rgba(185,82,76,0.08)]", ring: "ring-[rgba(185,82,76,0.28)]" },
} as const;

function UsageStat({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  return (
    <span className="text-xs text-slate-400">
      {label} <span className="font-semibold text-slate-200">{used}</span>
      {limit !== null ? <span className="text-slate-500">/{limit}</span> : null}
    </span>
  );
}

/**
 * Trial urgency + usage strip for the dashboard shell. Silent for
 * Enterprise/legacy plans (nothing usage-limited to surface); a quiet
 * usage readout for Starter/Professional; an urgent, reddening banner as
 * a trial's 3 days run out, and a blocking "contact sales" banner once
 * it's expired.
 */
export async function TrialBanner({ summary, locale }: TrialBannerProps) {
  const t = await getTranslations("billing");
  const isTrial = summary.planId === "trial";
  const isMeteredPlan = isTrial || summary.planId === "starter" || summary.planId === "professional";

  if (!isMeteredPlan) return null;

  if (isTrial && summary.isTrialExpired) {
    const sev = SEVERITY.serious;
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ${sev.bg} ${sev.ring}`}
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center gap-3">
          <PlanBadge planId={summary.planId} plan={summary.plan} locale={locale} />
          <p className={`text-sm font-medium ${sev.text}`}>{t("trialExpiredTitle")}</p>
          <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden="true" />
          <UsageStat label={t("usageCandidates")} used={summary.usage.candidates} limit={summary.limits.candidates} />
          <UsageStat label={t("usageProjects")} used={summary.usage.projects} limit={summary.limits.projects} />
        </div>
        <Link
          href="/contact"
          className="flex-shrink-0 rounded-lg bg-[#1D4ED8] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1e40af]"
        >
          {t("contactSales")}
        </Link>
      </div>
    );
  }

  const days = summary.trialDaysLeft;
  const severity = isTrial ? (days !== null && days <= 1 ? SEVERITY.serious : SEVERITY.warning) : SEVERITY.info;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ${severity.bg} ${severity.ring}`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-3">
        <PlanBadge planId={summary.planId} plan={summary.plan} locale={locale} />
        {isTrial && days !== null ? (
          <p className={`text-sm font-medium ${severity.text}`}>
            {days === 0 ? t("trialLastDay") : days === 1 ? t("trialOneDayLeft") : t("trialDaysLeft", { days })}
          </p>
        ) : null}
        <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden="true" />
        <UsageStat label={t("usageCandidates")} used={summary.usage.candidates} limit={summary.limits.candidates} />
        <UsageStat label={t("usageProjects")} used={summary.usage.projects} limit={summary.limits.projects} />
      </div>
      <Link
        href="/contact"
        className="flex-shrink-0 rounded-lg border border-[#1D4ED8]/40 bg-[#1D4ED8]/10 px-3.5 py-1.5 text-xs font-semibold text-[#9BB8FF] transition-colors hover:bg-[#1D4ED8]/20"
      >
        {isTrial ? t("upgradeNow") : t("contactSales")}
      </Link>
    </div>
  );
}
