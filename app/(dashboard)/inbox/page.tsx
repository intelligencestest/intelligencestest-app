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
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <header>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-soft-pulse" />
          {t("inboxBadge")}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t("inboxTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("inboxSubtitle", { count: totalCount })}</p>
      </header>

      <QueueSection entries={entries} totalCount={totalCount} sort={sort} basePath="/inbox" />

      {totalCount > entries.length && (
        <p className="text-center text-xs text-slate-500">
          {t("inboxShowingOldest", { count: entries.length, total: totalCount, limit: QUEUE_FETCH_LIMIT })}
        </p>
      )}
    </div>
  );
}
