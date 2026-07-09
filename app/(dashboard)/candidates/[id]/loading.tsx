/**
 * Instant skeleton for the candidate results screen. Mirrors the identity /
 * verdict header and the evidence + rail grid so layout stays stable.
 */
export default function CandidateResultsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6" role="status" aria-label="Loading candidate">
      <div className="h-4 w-40 animate-pulse rounded bg-[var(--it-border-soft)]" />

      {/* Identity + verdict */}
      <div className="enterprise-card rounded-2xl p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-full bg-[var(--it-border)]" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-[var(--it-border)]" />
              <div className="h-3.5 w-64 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
              <div className="h-3.5 w-32 animate-pulse rounded bg-[var(--it-border-soft)]" />
            </div>
          </div>
          <div className="h-7 w-24 animate-pulse rounded-full bg-[var(--it-border-soft)]" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 border-t enterprise-divider pt-5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 w-24 animate-pulse rounded bg-[var(--it-border-soft)]" />
              <div className="h-9 w-16 animate-pulse rounded bg-[var(--it-border)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Evidence + rail */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
        <div className="space-y-4 xl:col-span-2">
          <div className="h-4 w-28 animate-pulse rounded bg-[var(--it-border-soft)]" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="enterprise-card space-y-4 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-4 w-44 animate-pulse rounded bg-[var(--it-border)]" />
                  <div className="h-3 w-28 animate-pulse rounded bg-[var(--it-border-soft)]" />
                </div>
                <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--it-border-soft)]" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-12 animate-pulse rounded bg-[var(--it-border)]" />
                <div className="h-2 flex-1 animate-pulse rounded-full bg-[var(--it-border-soft)]" />
              </div>
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-[var(--it-border-soft)]" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="enterprise-card h-64 animate-pulse rounded-xl" />
          <div className="enterprise-card h-40 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
