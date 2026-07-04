import Link from "next/link";
import { getTranslations } from "next-intl/server";

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
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="premium-card premium-card-hover rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
        >
          <p className="text-xs font-medium text-slate-500">{item.label}</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold tracking-tight tabular-nums text-slate-200">{item.value}</span>
            {item.delta !== null && item.delta !== 0 && (
              <span
                className={`text-xs font-medium ${item.delta > 0 ? "text-[#3fbf3f]" : "text-[#f28b8b]"}`}
              >
                <span aria-hidden="true">{item.delta > 0 ? "▲" : "▼"}</span>{" "}
                {item.delta > 0 ? "+" : ""}
                {item.delta} pp
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
        </Link>
      ))}
    </section>
  );
}
