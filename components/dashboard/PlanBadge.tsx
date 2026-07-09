import type { PlanId } from "@/lib/plan/limits";

const PLAN_LABEL: Record<PlanId, { en: string; es: string }> = {
  trial: { en: "Free trial", es: "Prueba gratuita" },
  starter: { en: "Starter", es: "Starter" },
  professional: { en: "Professional", es: "Professional" },
  enterprise: { en: "Enterprise", es: "Enterprise" },
};

interface PlanBadgeProps {
  planId: PlanId | null;
  plan: string;
  locale: "en" | "es";
}

/** Small pill used on the dashboard trial banner and the Settings → Billing card. */
export function PlanBadge({ planId, plan, locale }: PlanBadgeProps) {
  const label = planId ? PLAN_LABEL[planId][locale] : plan;
  return (
    <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--it-primary)]/30 bg-[var(--it-primary-soft)] px-3 py-1 text-xs font-semibold text-[#9fb3e5]">
      {label}
    </span>
  );
}
