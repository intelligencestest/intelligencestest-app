/** Instant skeleton while the review queue and its intelligence resolve. */
export default function InboxLoading() {
  return (
    <div className="mx-auto max-w-[960px] space-y-6" role="status" aria-label="Loading inbox">
      <div className="space-y-2.5">
        <div className="h-8 w-56 animate-pulse rounded bg-[var(--it-border)]" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[var(--it-border-soft)]" />
      </div>
      <div className="enterprise-card overflow-hidden rounded-xl">
        <div className="border-b enterprise-divider px-5 py-4">
          <div className="h-4 w-36 animate-pulse rounded bg-[var(--it-border)]" />
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2 border-b enterprise-divider px-5 py-4 last:border-b-0">
            <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--it-border)]" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[var(--it-border-soft)]" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-[var(--it-border-soft)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
