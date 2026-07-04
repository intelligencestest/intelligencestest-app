import Link from "next/link";
import { getTranslations } from "next-intl/server";
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

  const sortLink = (mode: QueueSort, label: string) => (
    <Link
      href={mode === "waiting" ? basePath : `${basePath}?queue=recommendation`}
      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
        sort === mode
          ? "bg-[#1D4ED8]/16 text-[#AFC7FF] ring-1 ring-[#1D4ED8]/35"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <section id="queue" className="premium-card overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#1E2240] px-5 py-3.5">
        <h2 className="text-sm font-semibold text-white">{t("queueTitle")}</h2>
        {totalCount > 0 && (
          <span className="rounded-full border border-[#1E2240] px-2.5 py-0.5 text-xs font-medium text-slate-400">
            {totalCount}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {sortLink("waiting", t("queueSortFifo"))}
          {sortLink("recommendation", t("queueSortRecommendation"))}
        </div>
        {sessionStart && (
          <Link
            href={`/candidates/${sessionStart.id}?ctx=review`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1e40af]"
          >
            {t("queueStartSession")}
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#0ca30c]/10 ring-1 ring-[#0ca30c]/25">
            <svg className="h-5 w-5 text-[#3fbf3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-200">{t("queueEmptyTitle")}</p>
          <p className="mt-1 text-[13px] text-slate-400">{t("queueEmptyBody")}</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-[#1E2240]">
            {visible.map((entry) => (
              <QueueRow key={entry.id} entry={entry} />
            ))}
          </div>
          {limit && totalCount > visible.length && (
            <Link
              href="/inbox"
              className="block border-t border-[#1E2240] px-5 py-3 text-center text-[13px] font-medium text-[#8CB1FF] transition-colors hover:bg-[#1E2240]/30"
            >
              {t("queueViewAll", { count: totalCount })} →
            </Link>
          )}
        </>
      )}
    </section>
  );
}
