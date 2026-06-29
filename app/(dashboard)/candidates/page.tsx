import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import CandidatesClient from "./CandidatesClient";

export default async function CandidatesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const [{ data: candidates }, { data: projects }] = await Promise.all([
    admin
      .from("candidates")
      .select("id, full_name, email, status, created_at, token, hiring_projects(id, name)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .returns<{ id: string; full_name: string; email: string; status: string; created_at: string; token: string | null; hiring_projects: { id: string; name: string } | null }[]>(),
    admin
      .from("hiring_projects")
      .select("id, name, status")
      .eq("company_id", companyId)
      .order("name"),
  ]);

  return (
    <CandidatesClient
      initialCandidates={candidates ?? []}
      projects={projects ?? []}
      companyId={companyId}
    />
  );
}
