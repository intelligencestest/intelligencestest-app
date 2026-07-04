/** Instant skeleton while the review queue and its intelligence resolve. */
export default function InboxLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" role="status" aria-label="Loading inbox">
      <div className="space-y-2.5">
        <div className="h-6 w-28 animate-pulse rounded-full bg-[#1E2240]/60" />
        <div className="h-8 w-56 animate-pulse rounded bg-[#1E2240]/60" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[#1E2240]/40" />
      </div>
      <div className="premium-card overflow-hidden rounded-xl">
        <div className="border-b border-[#1E2240] px-5 py-4">
          <div className="h-4 w-36 animate-pulse rounded bg-[#1E2240]/60" />
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2 border-b border-[#1E2240] px-5 py-4 last:border-b-0">
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#1E2240]/60" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#1E2240]/40" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#1E2240]/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
