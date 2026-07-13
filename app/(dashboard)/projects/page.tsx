import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import ProjectsClient from "./ProjectsClient";

type PaRow = {
  project_id: string;
  assessments:
    | { id: string; name: string; duration_minutes: number | null }
    | { id: string; name: string; duration_minutes: number | null }[]
    | null;
};

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const [{ data: projects }, { data: candidateCounts }] = await Promise.all([
    admin
      .from("hiring_projects")
      .select("id, name, status, description, deadline, created_at, client_name, role_title")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    admin
      .from("candidates")
      .select("project_id, status")
      .eq("company_id", companyId),
  ]);

  const projectIds = projects?.map((p) => p.id) ?? [];

  let projectAssessments: Record<string, { id: string; name: string; duration_minutes: number | null }[]> = {};

  if (projectIds.length > 0) {
    const { data: paRows } = await admin
      .from("project_assessments")
      .select("project_id, assessments(id, name, duration_minutes)")
      .in("project_id", projectIds)
      .returns<PaRow[]>();

    projectAssessments = (paRows ?? []).reduce<typeof projectAssessments>((acc, row) => {
      const a = Array.isArray(row.assessments) ? row.assessments[0] : row.assessments;
      if (!a) return acc;
      acc[row.project_id] = [
        ...(acc[row.project_id] ?? []),
        { id: a.id, name: a.name, duration_minutes: a.duration_minutes },
      ];
      return acc;
    }, {});
  }

  const countsByProject = (candidateCounts ?? []).reduce(
    (acc: Record<string, { total: number; completed: number }>, c) => {
      if (!acc[c.project_id]) acc[c.project_id] = { total: 0, completed: 0 };
      acc[c.project_id].total++;
      if (c.status === "completed") acc[c.project_id].completed++;
      return acc;
    },
    {}
  );

  const activeCount = projects?.filter((p) => p.status === "active").length ?? 0;
  const totalCandidates = candidateCounts?.length ?? 0;

  return (
    <ProjectsClient
      projects={projects ?? []}
      countsByProject={countsByProject}
      projectAssessments={projectAssessments}
      activeCount={activeCount}
      totalCandidates={totalCandidates}
    />
  );
}
