import Sidebar from "@/components/Sidebar";
import { AccountMenu } from "@/components/dashboard/AccountMenu";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";
import { getLocale } from "next-intl/server";
import { getPlanUsageSummary, type PlanUsageSummary } from "@/lib/plan/limits";
import { TrialBanner } from "@/components/dashboard/TrialBanner";

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

  const locale = (await getLocale()) === "es" ? "es" : "en";

  return (
    <div className="enterprise-shell flex h-screen overflow-hidden">
      <Sidebar reviewCount={reviewCount} />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full space-y-4 p-4 sm:p-6 lg:p-8 xl:p-10 print:p-0">
          <div className="sticky top-0 z-30 -mx-4 -mt-4 flex justify-end border-b border-[var(--it-border)] bg-[var(--it-bg)]/92 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 xl:-mx-10 xl:-mt-10 xl:px-10 print:hidden">
            <AccountMenu userEmail={userEmail} userName={userName} />
          </div>
          {planSummary ? <TrialBanner summary={planSummary} locale={locale} /> : null}
          {children}
        </div>
      </main>
    </div>
  );
}
