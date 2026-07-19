import type { AppLocale } from "@/lib/i18n/locales";
import type { PlanId } from "@/lib/plan/limits";

const PLAN_LABEL: Record<PlanId, Record<AppLocale, string>> = {
  trial: { en: "Free trial", es: "Prueba gratuita", fr: "Essai gratuit" },
  starter: { en: "Starter", es: "Starter", fr: "Starter" },
  professional: { en: "Professional", es: "Professional", fr: "Professional" },
  enterprise: { en: "Enterprise", es: "Enterprise", fr: "Enterprise" },
};

interface PlanBadgeProps {
  planId: PlanId | null;
  plan: string;
  locale: AppLocale;
}

/** Small pill used on the dashboard trial banner and the Settings → Billing card. */
export function PlanBadge({ planId, plan, locale }: PlanBadgeProps) {
  const label = planId ? PLAN_LABEL[planId][locale] : plan;
  return (
    <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--it-primary)]/30 bg-[var(--it-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--it-link)]">
      {label}
    </span>
  );
}
