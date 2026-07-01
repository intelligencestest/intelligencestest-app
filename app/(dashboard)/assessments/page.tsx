import AssessmentsClient from "./AssessmentsClient";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AssessmentsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const [{ data: assessments }, { data: projects }] = await Promise.all([
    admin
      .from("assessments")
      .select("id, name, category, description, duration_minutes, question_count, status")
      .order("category")
      .order("name"),
    admin
      .from("hiring_projects")
      .select("id, name")
      .eq("company_id", companyId)
      .eq("status", "active")
      .order("name"),
  ]);

  return <AssessmentsClient assessments={assessments ?? []} projects={projects ?? []} />;
}
