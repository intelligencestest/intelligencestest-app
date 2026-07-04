import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const [{ data: projects }, { data: company }] = await Promise.all([
    admin
      .from("hiring_projects")
      .select("id, name, status")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    admin
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single(),
  ]);

  const selectedProjectId = params.project ?? projects?.[0]?.id ?? null;

  let results: {
    id: string;
    score: number;
    completed_at: string;
    raw_answers: unknown;
    assessment_id: string;
    candidate_id: string | null;
    candidates: { full_name: string; email: string } | null;
    assessments: { name: string; category: string | null } | null;
  }[] = [];

  if (selectedProjectId) {
    const { data } = await admin
      .from("results")
      .select("id, score, completed_at, raw_answers, assessment_id, candidate_id, candidates(full_name, email), assessments(name, category)")
      .eq("company_id", companyId)
      .eq("project_id", selectedProjectId)
      .order("score", { ascending: false })
      .returns<typeof results>();
    results = data ?? [];
  }

  return (
    <ReportsClient
      projects={projects ?? []}
      initialResults={results}
      selectedProjectId={selectedProjectId}
      companyName={company?.name ?? ""}
    />
  );
}
