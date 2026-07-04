/**
 * Instant skeleton while dashboard queries and queue intelligence resolve.
 * Mirrors the real zone layout so nothing jumps when content streams in.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" role="status" aria-label="Loading dashboard">
      {/* Morning brief */}
      <div className="space-y-2.5">
        <div className="h-4 w-40 animate-pulse rounded bg-[#1E2240]/60" />
        <div className="h-8 w-72 animate-pulse rounded bg-[#1E2240]/60" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[#1E2240]/40" />
      </div>

      {/* Workload tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="premium-card rounded-xl p-5">
            <div className="h-3.5 w-24 animate-pulse rounded bg-[#1E2240]/60" />
            <div className="mt-3 h-8 w-12 animate-pulse rounded bg-[#1E2240]/60" />
            <div className="mt-2 h-3.5 w-32 animate-pulse rounded bg-[#1E2240]/40" />
          </div>
        ))}
      </div>

      {/* Queue + rail */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start">
        <div className="space-y-6 xl:col-span-2">
          <div className="premium-card overflow-hidden rounded-xl">
            <div className="border-b border-[#1E2240] px-5 py-4">
              <div className="h-4 w-36 animate-pulse rounded bg-[#1E2240]/60" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 border-b border-[#1E2240] px-5 py-4 last:border-b-0">
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#1E2240]/60" />
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#1E2240]/40" />
              </div>
            ))}
          </div>
          <div className="premium-card h-44 animate-pulse rounded-xl" />
        </div>
        <div className="space-y-6">
          <div className="premium-card h-56 animate-pulse rounded-xl" />
          <div className="premium-card h-72 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
