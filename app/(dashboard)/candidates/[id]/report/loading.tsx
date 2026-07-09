/**
 * Instant skeleton for the executive report. Mirrors the toolbar, verdict
 * hero and the first stacked sections so the document doesn't jump in.
 */
export default function ExecutiveReportLoading() {
  return (
    <main className="min-h-screen bg-[var(--it-bg)] text-[var(--it-text)]" role="status" aria-label="Loading report">
      <div className="mx-auto max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10">
        {/* Toolbar */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--it-border-soft)]" />
          <div className="flex gap-2.5">
            <div className="h-10 w-32 animate-pulse rounded-lg bg-[var(--it-border-soft)]" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-[var(--it-border)]" />
          </div>
        </div>

        {/* Verdict hero */}
        <div className="enterprise-card rounded-2xl px-6 py-7 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-5">
              <div className="h-3 w-32 animate-pulse rounded bg-[var(--it-border-soft)]" />
              <div className="space-y-3">
                <div className="h-9 w-3/4 animate-pulse rounded bg-[var(--it-border)]" />
                <div className="h-9 w-1/2 animate-pulse rounded bg-[var(--it-border)]" />
              </div>
              <div className="h-4 w-full max-w-xl animate-pulse rounded bg-[var(--it-border-soft)]" />
              <div className="flex items-center gap-4 pt-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-[var(--it-border)]" />
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-[var(--it-border)]" />
                  <div className="h-3 w-40 animate-pulse rounded bg-[var(--it-border-soft)]" />
                </div>
              </div>
            </div>
            <div className="space-y-4 lg:border-l lg:border-[var(--it-hairline)] lg:pl-8">
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--it-border-soft)]" />
              <div className="h-14 w-24 animate-pulse rounded bg-[var(--it-border)]" />
              <div className="h-2 w-full animate-pulse rounded-full bg-[var(--it-border-soft)]" />
              <div className="h-16 w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
            </div>
          </div>
        </div>

        {/* Section shells */}
        {[0, 1].map((i) => (
          <div key={i} className="grid gap-8 border-t enterprise-divider py-10 lg:grid-cols-[260px_1fr]">
            <div className="h-6 w-40 animate-pulse rounded bg-[var(--it-border)]" />
            <div className="space-y-3">
              <div className="h-24 w-full animate-pulse rounded-xl bg-[var(--it-border-soft)]" />
              <div className="h-24 w-full animate-pulse rounded-xl bg-[var(--it-border-soft)]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
