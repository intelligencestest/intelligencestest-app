import { getLocale } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { assessmentName as termName } from "@/lib/i18n/assessment-terms";
import CandidatesClient from "./CandidatesClient";

const TEST_ROUTES: Record<string, string> = {
  "Critical Thinking Test": "critical-thinking",
  "Adversity Quotient (AQ) Test": "aq",
  "Emotional Intelligence Test": "emotional-intelligence",
  "Leadership Styles Test": "leadership-styles",
  "Numerical Intelligence Test": "numerical-intelligence",
  "Personality Type Test": "personality-type",
  "Situational Judgment Test": "situational-judgment",
  "Attention to Detail Test": "attention-detail",
  "Verbal Reasoning Test": "verbal-reasoning",
  "Abstract Reasoning Test": "abstract-reasoning",
  "Mechanical Reasoning Test": "mechanical-reasoning",
  "Communication Skills Test": "communication-skills",
  "Problem Solving Test": "problem-solving",
  "Work Style Assessment": "work-style",
  "Sales Aptitude Test": "sales-aptitude",
  "Customer Service Skills Test": "customer-service-skills",
  "Teamwork & Collaboration Test": "teamwork-collaboration",
  "Time Management Test": "time-management",
  "Stress Tolerance Test": "stress-tolerance",
  "Integrity & Ethics Test": "integrity-ethics",
  "Decision Making Test": "decision-making",
  "Learning Agility Test": "learning-agility",
};

export default async function CandidatesPage() {
  const locale = await getLocale();
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const [{ data: candidates }, { data: projects }] = await Promise.all([
    admin
      .from("candidates")
      .select("id, full_name, email, status, pipeline_stage, outcome, created_at, token, hiring_projects(id, name)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .returns<{ id: string; full_name: string; email: string; status: string; pipeline_stage: string; outcome: string; created_at: string; token: string | null; hiring_projects: { id: string; name: string } | null }[]>(),
    admin
      .from("hiring_projects")
      .select("id, name, status")
      .eq("company_id", companyId)
      .order("name"),
  ]);

  const projectIds = projects?.map((p) => p.id) ?? [];

  type PaRow = {
    project_id: string;
    assessments: { id: string; name: string; duration_minutes: number | null } | null;
  };

  let projectAssessments: Record<string, { name: string; route: string; label: string }[]> = {};

  if (projectIds.length > 0) {
    const { data: paRows } = await admin
      .from("project_assessments")
      .select("project_id, assessments(id, name, duration_minutes)")
      .in("project_id", projectIds)
      .returns<PaRow[]>();

    projectAssessments = (paRows ?? []).reduce<Record<string, { name: string; route: string; label: string }[]>>(
      (acc, row) => {
        const a = row.assessments;
        if (!a) return acc;
        const route = TEST_ROUTES[a.name] ?? a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const label = `${termName(a.name, locale)}${a.duration_minutes != null ? ` (${a.duration_minutes} min)` : ""}`;
        acc[row.project_id] = [...(acc[row.project_id] ?? []), { name: a.name, route, label }];
        return acc;
      },
      {}
    );
  }

  return (
    <CandidatesClient
      initialCandidates={candidates ?? []}
      projects={projects ?? []}
      companyId={companyId}
      projectAssessments={projectAssessments}
    />
  );
}
