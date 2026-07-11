/** Instant skeleton for the projects list; mirrors header + card grid. */
export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8" role="status" aria-label="Loading projects">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <div className="h-8 w-44 animate-pulse rounded bg-[var(--it-border)]" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-[var(--it-border)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="enterprise-card space-y-4 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="h-4 w-40 animate-pulse rounded bg-[var(--it-border)]" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-[var(--it-border-soft)]" />
            </div>
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[var(--it-border-soft)]" />
            <div className="h-2 w-full animate-pulse rounded-full bg-[var(--it-border-soft)]" />
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-[var(--it-border-soft)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
