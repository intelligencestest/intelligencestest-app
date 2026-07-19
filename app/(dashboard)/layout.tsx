import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import Sidebar from "@/components/Sidebar";
import { AccountMenu } from "@/components/dashboard/AccountMenu";
import { AppBreadcrumbs } from "@/components/dashboard/AppBreadcrumbs";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { toAppLocale } from "@/lib/i18n/locales";
import { getPlanUsageSummary, type PlanUsageSummary } from "@/lib/plan/limits";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

// Private product surface: never indexed (robots.ts is advisory; this is not).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName: string | undefined;
  const userEmail: string | undefined = user?.email ?? undefined;
  let reviewCount = 0;
  let planSummary: PlanUsageSummary | null = null;

  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("full_name, company_id")
      .eq("id", user.id)
      .single();
    userName = profile?.full_name ?? undefined;

    if (profile?.company_id) {
      // Inbox workload badge; uses the (company_id, pipeline_stage, outcome) index.
      const { count } = await admin
        .from("candidates")
        .select("id", { count: "exact", head: true })
        .eq("company_id", profile.company_id)
        .eq("pipeline_stage", "completed")
        .eq("outcome", "pending");
      reviewCount = count ?? 0;

      planSummary = await getPlanUsageSummary(admin, profile.company_id);
    }
  }

  const locale = toAppLocale(await getLocale());

  return (
    <div className="enterprise-shell flex h-screen overflow-hidden">
      <Sidebar reviewCount={reviewCount} />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full print:p-0">
          <div className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-4 border-b border-[var(--it-hairline)] bg-[var(--it-bg)]/92 px-6 py-2.5 backdrop-blur-md sm:px-8 lg:px-10 print:hidden">
            <AppBreadcrumbs />
            <AccountMenu userEmail={userEmail} userName={userName} />
          </div>
          <div className="space-y-6 px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
            {planSummary ? (
              <div className="print:hidden">
                <TrialBanner summary={planSummary} locale={locale} />
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
