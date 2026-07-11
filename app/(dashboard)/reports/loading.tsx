/** Instant skeleton for the reports screen; mirrors header + panel grid. */
export default function ReportsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8" role="status" aria-label="Loading reports">
      <div className="space-y-2.5">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--it-border)]" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        <div className="enterprise-card space-y-4 rounded-xl p-5 xl:col-span-2">
          <div className="h-4 w-36 animate-pulse rounded bg-[var(--it-border)]" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-t border-[var(--it-border-soft)] pt-4">
              <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-[var(--it-border)]" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3.5 w-44 max-w-full animate-pulse rounded bg-[var(--it-border)]" />
                <div className="h-3 w-64 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
              </div>
              <div className="h-3.5 w-10 animate-pulse rounded bg-[var(--it-border-soft)]" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="enterprise-card h-52 animate-pulse rounded-xl" />
          <div className="enterprise-card h-40 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
