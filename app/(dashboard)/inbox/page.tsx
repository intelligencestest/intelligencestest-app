import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { loadReviewQueue, QUEUE_FETCH_LIMIT, type QueueSort } from "@/lib/dashboard/queue";
import QueueSection from "@/components/dashboard/QueueSection";

/**
 * Review inbox: the full candidate queue, built for burn-down sessions.
 * TODO(intelligence-layer): cursor pagination over candidate_intelligence
 * snapshots replaces the fetch cap.
 */
export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ queue?: string }>;
}) {
  const { queue: queueParam } = await searchParams;
  const sort: QueueSort = queueParam === "recommendation" ? "recommendation" : "waiting";

  const locale = await getLocale();
  const t = await getTranslations("dashboard");
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user!.id)
    .single();

  // Server component, one render per request; the queue's "waiting since" math needs the real request-time clock.
  const { entries, totalCount } = await loadReviewQueue(
    admin,
    profile?.company_id,
    locale === "es" ? "es" : "en",
    Date.now() // eslint-disable-line react-hooks/purity
  );

  return (
    <div className="mx-auto max-w-[960px] space-y-6 animate-fade-up">
      <header>
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.01em] text-white">{t("inboxTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--it-muted)]">{t("inboxSubtitle", { count: totalCount })}</p>
      </header>

      <QueueSection entries={entries} totalCount={totalCount} sort={sort} basePath="/inbox" />

      {totalCount > entries.length && (
        <p className="text-center text-xs text-[var(--it-faint)]">
          {t("inboxShowingOldest", { count: entries.length, total: totalCount, limit: QUEUE_FETCH_LIMIT })}
        </p>
      )}
    </div>
  );
}
