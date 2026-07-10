import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PIPELINE_STAGES, STAGE_COLOR, STAGE_LABEL_KEY, type StageCounts } from "@/lib/dashboard/stages";

/**
 * Company-wide six-stage funnel: where are candidates pooling? Each stage
 * links into the filtered candidate list.
 * TODO(phase-2): add week-over-week deltas and a pooling callout once the
 * event model provides stage history.
 */
export default async function PipelineStrip({ counts }: { counts: StageCounts }) {
  const t = await getTranslations("dashboard");
  const total = PIPELINE_STAGES.reduce((sum, s) => sum + counts[s], 0);
  const max = Math.max(...PIPELINE_STAGES.map((s) => counts[s]), 1);

  return (
    <section className="enterprise-card overflow-hidden rounded-xl">
      <div className="border-b enterprise-divider px-4 py-3.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--it-muted)]">{t("pipelineTitle")}</h2>
      </div>
      {total === 0 ? (
        <div className="px-5 py-8 text-center text-[13px] text-[var(--it-muted)]">{t("pipelineEmpty")}</div>
      ) : (
        <div className="space-y-1 px-4 py-3">
          {PIPELINE_STAGES.map((stage) => (
            <Link
              key={stage}
              href={`/candidates?stage=${stage}`}
              className="group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-900/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--it-primary)]"
            >
              <span className="flex w-24 flex-shrink-0 items-center gap-2 text-[13px] capitalize text-[var(--it-muted)] transition-colors group-hover:text-slate-200">
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STAGE_COLOR[stage]}`} aria-hidden="true" />
                <span className="truncate">{t(STAGE_LABEL_KEY[stage])}</span>
              </span>
              <span className="h-2 min-w-0 flex-1 rounded-sm bg-[#eef2f6]" aria-hidden="true">
                <span
                  className={`block h-2 rounded-sm ${STAGE_COLOR[stage]}`}
                  style={{ width: `${Math.max((counts[stage] / max) * 100, counts[stage] > 0 ? 6 : 0)}%` }}
                />
              </span>
              <span
                className={`w-8 flex-shrink-0 text-right text-[13px] font-semibold tabular-nums ${
                  counts[stage] > 0 ? "text-slate-200" : "text-[var(--it-faint)]"
                }`}
              >
                {counts[stage]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
