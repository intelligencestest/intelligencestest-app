import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Check } from "lucide-react";
import { sortQueueEntries, type QueueEntry, type QueueSort } from "@/lib/dashboard/queue";
import QueueRow from "./QueueRow";

interface QueueSectionProps {
  entries: QueueEntry[];
  totalCount: number;
  sort: QueueSort;
  /** Path the sort-toggle links point at (dashboard or inbox). */
  basePath: string;
  /** Rows rendered before the "view all" link; omit to render everything. */
  limit?: number;
}

/** The recruiter's inbox: who to review next, and why them first. */
export default async function QueueSection({
  entries,
  totalCount,
  sort,
  basePath,
  limit,
}: QueueSectionProps) {
  const t = await getTranslations("dashboard");
  const sorted = sortQueueEntries(entries, sort);
  const visible = limit ? sorted.slice(0, limit) : sorted;
  // FIFO order decides who a review session starts with, regardless of view sort.
  const sessionStart = entries[0];

  // Sort links land back on the queue, not at the top of the page.
  const sortLink = (mode: QueueSort, label: string) => (
    <Link
      href={mode === "waiting" ? `${basePath}#queue` : `${basePath}?queue=recommendation#queue`}
      aria-current={sort === mode ? "true" : undefined}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] ${
        sort === mode
          ? "bg-gray-900/[0.055] text-slate-100 ring-1 ring-[var(--it-border)]"
          : "text-[var(--it-muted)] hover:text-slate-200"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <section id="queue" className="enterprise-card overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center gap-3 border-b enterprise-divider px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-[var(--it-text)]">{t("queueTitle")}</h2>
        </div>
        {totalCount > 0 && (
          <span className="enterprise-chip rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums">
            {totalCount}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {/* Controls only exist when there is something to control. */}
          {visible.length > 1 && (
            <div className="flex items-center gap-1">
              {sortLink("waiting", t("queueSortFifo"))}
              {sortLink("recommendation", t("queueSortRecommendation"))}
            </div>
          )}
          {sessionStart && (
            <Link
              href={`/candidates/${sessionStart.id}?ctx=review`}
              className="enterprise-button inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-link)]"
            >
              {t("queueStartSession")}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex items-start gap-2.5 px-6 py-8">
          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--it-success)]" strokeWidth={2} aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-slate-200">{t("queueEmptyTitle")}</p>
            <p className="mt-1 text-[13px] text-[var(--it-muted)]">{t("queueEmptyBody")}</p>
          </div>
        </div>
      ) : (
        <>
          <div>
            {visible.map((entry) => (
              <QueueRow key={entry.id} entry={entry} />
            ))}
          </div>
          {limit && totalCount > visible.length && (
            <Link
              href="/inbox"
              className="enterprise-link block border-t enterprise-divider px-5 py-3 text-center text-[13px] font-medium transition-colors hover:bg-gray-900/[0.025] focus-visible:bg-gray-900/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--it-primary)]"
            >
              {t("queueViewAll", { count: totalCount })} →
            </Link>
          )}
        </>
      )}
    </section>
  );
}
