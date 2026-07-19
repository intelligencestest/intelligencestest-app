import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { PlanUsageSummary } from "@/lib/plan/limits";
import { localePath, type AppLocale } from "@/lib/i18n/locales";
import { PlanBadge } from "./PlanBadge";

interface TrialBannerProps {
  summary: PlanUsageSummary;
  locale: AppLocale;
}

const SEVERITY = {
  info: { text: "text-[#3a5c7e]", bg: "bg-[rgba(74,112,150,0.08)]", ring: "ring-[rgba(74,112,150,0.28)]" },
  warning: { text: "text-[#b45309]", bg: "bg-[rgba(217,119,6,0.08)]", ring: "ring-[rgba(217,119,6,0.28)]" },
  serious: { text: "text-[#b91c1c]", bg: "bg-[rgba(220,38,38,0.08)]", ring: "ring-[rgba(220,38,38,0.28)]" },
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
 * a trial runs out or the monthly candidate cap approaches (>=80%) or is
 * reached, and a blocking banner once a trial has expired.
 */
export async function TrialBanner({ summary, locale }: TrialBannerProps) {
  const t = await getTranslations("billing");
  const isTrial = summary.planId === "trial";
  const isMeteredPlan = isTrial || summary.planId === "starter" || summary.planId === "professional";
  const billingHref = localePath("/settings/billing", locale);

  if (!isMeteredPlan) return null;

  const candidateLimit = summary.limits.candidates;
  const candidateUsed = summary.usage.candidates;
  const candidateRatio = candidateLimit !== null && candidateLimit > 0 ? candidateUsed / candidateLimit : 0;

  // One message, highest urgency wins: expired trial > cap reached > cap approaching > trial countdown.
  let message: string | null = null;
  let severity: (typeof SEVERITY)[keyof typeof SEVERITY] = SEVERITY.info;
  let cta = isTrial ? t("upgradeNow") : t("contactSales");

  if (isTrial && summary.isTrialExpired) {
    message = t("trialExpiredTitle");
    severity = SEVERITY.serious;
  } else if (candidateLimit !== null && candidateRatio >= 1) {
    message = t(isTrial ? "trialCandidatesAtLimit" : "planCandidatesAtLimit", {
      used: candidateUsed,
      limit: candidateLimit,
    });
    severity = SEVERITY.serious;
    cta = t("upgradeNow");
  } else if (candidateLimit !== null && candidateRatio >= 0.8) {
    message = t(isTrial ? "trialCandidatesNearLimit" : "planCandidatesNearLimit", {
      used: candidateUsed,
      limit: candidateLimit,
    });
    severity = SEVERITY.warning;
    cta = t("upgradeNow");
  } else if (isTrial && summary.trialDaysLeft !== null) {
    const days = summary.trialDaysLeft;
    message = days === 0 ? t("trialLastDay") : days === 1 ? t("trialOneDayLeft") : t("trialDaysLeft", { days });
    severity = days <= 1 ? SEVERITY.serious : SEVERITY.warning;
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ${severity.bg} ${severity.ring}`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-3">
        <PlanBadge planId={summary.planId} plan={summary.plan} locale={locale} />
        {message ? <p className={`text-sm font-medium ${severity.text}`}>{message}</p> : null}
        <span className="hidden h-4 w-px bg-gray-900/10 sm:block" aria-hidden="true" />
        <UsageStat label={t("usageCandidates")} used={candidateUsed} limit={candidateLimit} />
        <UsageStat label={t("usageProjects")} used={summary.usage.projects} limit={summary.limits.projects} />
      </div>
      <Link
        href={billingHref}
        className="flex-shrink-0 rounded-lg border border-[var(--it-primary)]/40 bg-[var(--it-primary-soft)] px-3.5 py-1.5 text-xs font-semibold text-[var(--it-link)] transition-colors hover:bg-[var(--it-primary)]/20"
      >
        {cta}
      </Link>
    </div>
  );
}
