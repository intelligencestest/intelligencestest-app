import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName: string | undefined;
  let userEmail: string | undefined = user?.email ?? undefined;
  let activeAssessmentCount = 0;

  if (user) {
    const admin = createAdminClient();
    const [{ data: profile }, { count }] = await Promise.all([
      admin
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single(),
      admin
        .from("assessments")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);
    userName = profile?.full_name ?? undefined;
    activeAssessmentCount = count ?? 0;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07080F]">
      <Sidebar userEmail={userEmail} userName={userName} activeAssessmentCount={activeAssessmentCount} />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader />
        <div className="min-h-full p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
