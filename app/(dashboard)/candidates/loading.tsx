/**
 * Instant skeleton for the candidate roster. Mirrors the real header,
 * filter row and table so nothing shifts when data streams in.
 */
export default function CandidatesLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8" role="status" aria-label="Loading candidates">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <div className="h-8 w-40 animate-pulse rounded bg-[var(--it-border)]" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-[var(--it-border)]" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-11 flex-1 animate-pulse rounded-lg bg-[var(--it-border-soft)]" />
        <div className="h-11 w-full animate-pulse rounded-lg bg-[var(--it-border-soft)] sm:w-40" />
        <div className="h-11 w-full animate-pulse rounded-lg bg-[var(--it-border-soft)] sm:w-40" />
      </div>

      {/* Table */}
      <div className="enterprise-card overflow-hidden rounded-xl">
        <div className="border-b enterprise-divider px-6 py-3">
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--it-border-soft)]" />
        </div>
        <div className="divide-y divide-[var(--it-hairline)]">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-4 px-6 py-3">
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-[var(--it-border)]" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3.5 w-40 max-w-full animate-pulse rounded bg-[var(--it-border)]" />
                  <div className="h-3 w-52 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
                </div>
              </div>
              <div className="col-span-3 space-y-1.5">
                <div className="h-3.5 w-28 animate-pulse rounded bg-[var(--it-border-soft)]" />
                <div className="h-3 w-20 animate-pulse rounded bg-[var(--it-border-soft)]" />
              </div>
              <div className="col-span-2 h-3.5 w-20 animate-pulse rounded bg-[var(--it-border-soft)]" />
              <div className="col-span-2 flex justify-end">
                <div className="h-3.5 w-16 animate-pulse rounded bg-[var(--it-border-soft)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
