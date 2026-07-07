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

  const { entries, totalCount } = await loadReviewQueue(
    admin,
    profile?.company_id,
    locale === "es" ? "es" : "en",
    Date.now()
  );

  return (
    <div className="mx-auto max-w-[960px] space-y-6 animate-fade-up">
      <header>
        <div className="enterprise-chip mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--it-info)] animate-soft-pulse" />
          {t("inboxBadge")}
        </div>
        <h1 className="text-3xl font-semibold text-white">{t("inboxTitle")}</h1>
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
