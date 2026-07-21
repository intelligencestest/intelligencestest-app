import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInternalAdmin } from "@/lib/internal-admin";

/**
 * Internal-admin gate for the whole /dev preview surface.
 *
 * /dev is deployed to production and is not in the proxy's PROTECTED list,
 * so routes here are publicly reachable unless something stops them. This
 * layout makes the gate the default: a new page under /dev is protected the
 * moment it is created, rather than depending on whoever adds it remembering
 * to write a guard. Every /dev page shipped so far was missing one.
 *
 * It 404s rather than rendering an access screen the way /admin does:
 * /admin is a destination operators navigate to and need feedback from,
 * whereas /dev is unlisted tooling that should not advertise its existence.
 *
 * IMPORTANT: this is a floor, not a ceiling. Layouts and pages render in
 * parallel in the App Router, so this check cannot prevent a page's own data
 * fetching from running -- it only stops the response being shown. Any /dev
 * page that touches real data must still guard itself, exactly as the
 * /admin pages do under their own layout.
 */

// Private surface: never indexed (robots.ts is advisory; this is not).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DevLayout({ children }: { children: React.ReactNode }) {
  const adminCtx = await getInternalAdmin();
  if (!adminCtx) notFound();

  return <>{children}</>;
}
