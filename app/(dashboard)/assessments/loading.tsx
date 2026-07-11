/** Instant skeleton for the assessment library; mirrors header + category grid. */
export default function AssessmentsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8" role="status" aria-label="Loading assessments">
      <div className="space-y-2.5">
        <div className="h-8 w-56 animate-pulse rounded bg-[var(--it-border)]" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
      </div>
      {[0, 1].map((section) => (
        <div key={section} className="space-y-4">
          <div className="border-t border-[var(--it-hairline)] pt-4">
            <div className="h-5 w-36 animate-pulse rounded bg-[var(--it-border)]" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="enterprise-card space-y-3 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-4 w-40 animate-pulse rounded bg-[var(--it-border)]" />
                  <div className="h-3.5 w-14 animate-pulse rounded bg-[var(--it-border-soft)]" />
                </div>
                <div className="h-3.5 w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-[var(--it-border-soft)]" />
                <div className="border-t border-[var(--it-hairline)] pt-4">
                  <div className="h-9 w-full animate-pulse rounded-lg bg-[var(--it-border-soft)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
