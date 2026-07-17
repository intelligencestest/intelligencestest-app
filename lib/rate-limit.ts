// Minimal in-memory fixed-window rate limiter for single-instance deployments.
// Not distributed — resets on process restart and doesn't share state across
// instances. That's an acceptable trade-off for this app's current
// single-VPS deployment; move to a shared store (Redis, Postgres) if that
// ever changes.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map doesn't grow unbounded — runs at most
// once a minute, triggered by normal traffic rather than a background timer.
let lastSweep = 0;
function sweepExpired(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Returns true if the request identified by `key` is within `limit` calls
 * per `windowMs`, incrementing its count. Returns false once the limit is
 * exceeded for the remainder of the current window.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Best-effort client IP from proxy headers, for use as a rate-limit key. */
export function clientIpFrom(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
