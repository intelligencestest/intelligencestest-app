import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface ProcessHealthData {
  /** 30-day completion rate (%), null when no cohort. */
  completionRate: number | null;
  /** Delta vs the previous 30-day cohort, in percentage points. */
  rateDelta: number | null;
  /** Hires in the last 30 days. */
  hires: number;
  /** Completed → hired conversion (%), null when nobody completed yet. */
  conversion: number | null;
  onTrack: number;
  activeProjects: number;
}

/**
 * Tier-2 process health: trend metrics, deliberately quiet and last on the
 * page — the weekly self-check, not today's work.
 * TODO(phase-2): add median time-to-review once the event model records
 * stage-transition history.
 */
export default async function ProcessHealthStrip({ data }: { data: ProcessHealthData }) {
  const t = await getTranslations("dashboard");

  const items = [
    {
      key: "completion",
      label: t("kpiCompletionRate"),
      value: data.completionRate !== null ? `${data.completionRate}%` : "—",
      sub: t("kpiCompletionRateSub"),
      href: "/candidates?stage=invited",
      delta: data.rateDelta,
    },
    {
      key: "hires",
      label: t("kpiHires"),
      value: `${data.hires}`,
      sub: t("kpiHiresSub"),
      href: "/candidates?stage=hired",
      delta: null,
    },
    {
      key: "conversion",
      label: t("kpiConversion"),
      value: data.conversion !== null ? `${data.conversion}%` : "—",
      sub: t("kpiConversionSub"),
      href: "/candidates?stage=completed",
      delta: null,
    },
    {
      key: "ontrack",
      label: t("kpiOnTrack"),
      value: data.activeProjects > 0 ? `${data.onTrack}/${data.activeProjects}` : "—",
      sub: t("kpiOnTrackSub", { total: data.activeProjects }),
      href: "/projects",
      delta: null,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--it-border-soft)] bg-[var(--it-border-soft)] xl:grid-cols-4">
      {items.map((item) => {
        const trendUp = item.delta !== null && item.delta > 0;
        const trendDown = item.delta !== null && item.delta < 0;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`enterprise-card-hover relative border-l-2 bg-[var(--it-surface-muted)] p-4 pl-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] ${
              trendUp ? "border-l-[var(--it-success)]" : trendDown ? "border-l-[var(--it-danger)]" : "border-l-transparent"
            }`}
          >
            <p className="text-xs font-medium text-[var(--it-faint)]">{item.label}</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-semibold tabular-nums text-slate-200">{item.value}</span>
              {item.delta !== null && item.delta !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
                    trendUp ? "text-[#91c7ad]" : "text-[#d99792]"
                  }`}
                >
                  {trendUp ? (
                    <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                  )}
                  {trendUp ? "+" : ""}
                  {item.delta} pp
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--it-faint)]">{item.sub}</p>
          </Link>
        );
      })}
    </section>
  );
}
