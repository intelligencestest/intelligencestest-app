import Sidebar from "@/components/Sidebar";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName: string | undefined;
  const userEmail: string | undefined = user?.email ?? undefined;
  let reviewCount = 0;

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
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07080F]">
      <Sidebar userEmail={userEmail} userName={userName} reviewCount={reviewCount} />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 print:p-0">{children}</div>
      </main>
    </div>
  );
}
