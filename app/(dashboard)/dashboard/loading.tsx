/**
 * Instant skeleton while dashboard queries and queue intelligence resolve.
 * Mirrors the real zone layout so nothing jumps when content streams in.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8" role="status" aria-label="Loading dashboard">
      {/* Morning brief */}
      <div className="space-y-2.5">
        <div className="h-4 w-40 animate-pulse rounded bg-[var(--it-border)]" />
        <div className="h-8 w-72 animate-pulse rounded bg-[var(--it-border)]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
      </div>

      {/* Workload tiles */}
      <div className="enterprise-card grid grid-cols-1 overflow-hidden rounded-xl sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-[var(--it-border-soft)] p-5 sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
            <div className="h-3.5 w-24 animate-pulse rounded bg-[var(--it-border)]" />
            <div className="mt-3 h-8 w-12 animate-pulse rounded bg-[var(--it-border)]" />
            <div className="mt-2 h-3.5 w-32 animate-pulse rounded bg-[var(--it-border-soft)]" />
          </div>
        ))}
      </div>

      {/* Queue + rail */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2.05fr)_minmax(300px,0.95fr)] xl:items-start">
        <div className="space-y-8">
          <div className="enterprise-card overflow-hidden rounded-xl">
            <div className="border-b enterprise-divider px-5 py-4">
              <div className="h-4 w-36 animate-pulse rounded bg-[var(--it-border)]" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 border-b enterprise-divider px-5 py-4 last:border-b-0">
                <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--it-border)]" />
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-[var(--it-border-soft)]" />
              </div>
            ))}
          </div>
          <div className="enterprise-card h-44 animate-pulse rounded-xl" />
        </div>
        <div className="space-y-8">
          <div className="enterprise-card h-56 animate-pulse rounded-xl" />
          <div className="enterprise-card h-72 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
