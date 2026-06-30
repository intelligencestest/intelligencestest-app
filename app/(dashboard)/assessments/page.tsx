import AssessmentsClient from "./AssessmentsClient";
import { createAdminClient } from "@/lib/supabase-server";

export default async function AssessmentsPage() {
  const admin = createAdminClient();
  const { data: assessments } = await admin
    .from("assessments")
    .select("id, name, category, description, duration_minutes, question_count, status")
    .order("category")
    .order("name");

  return <AssessmentsClient assessments={assessments ?? []} />;
}
