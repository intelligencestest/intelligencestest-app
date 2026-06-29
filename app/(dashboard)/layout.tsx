import Sidebar from "@/components/Sidebar";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName: string | undefined;
  let userEmail: string | undefined = user?.email ?? undefined;

  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single();
    userName = profile?.full_name ?? undefined;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07080F]">
      <Sidebar userEmail={userEmail} userName={userName} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 min-h-full">{children}</div>
      </main>
    </div>
  );
}
