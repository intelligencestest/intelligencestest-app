import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import ProjectDetailClient from "./ProjectDetailClient";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const [{ data: project }, { data: paRows }, { data: candidateRows }] = await Promise.all([
    admin
      .from("hiring_projects")
      .select("id, name, status, description, deadline, created_at")
      .eq("id", id)
      .eq("company_id", companyId)
      .single(),
    admin
      .from("project_assessments")
      .select("assessment_id, assessments(id, name, duration_minutes, question_count)")
      .eq("project_id", id),
    admin
      .from("candidates")
      .select("id, status")
      .eq("project_id", id),
  ]);

  if (!project) notFound();

  type PaRow = {
    assessment_id: string;
    assessments: { id: string; name: string; duration_minutes: number | null; question_count: number | null } | null;
  };

  const assessments = ((paRows ?? []) as PaRow[])
    .map((row) => {
      const a = row.assessments;
      if (!a) return null;
      return {
        id: a.id,
        name: a.name,
        route: TEST_ROUTES[a.name] ?? a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        duration_minutes: a.duration_minutes,
        question_count: a.question_count,
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  const candidates = candidateRows ?? [];
  const counts = {
    total: candidates.length,
    invited: candidates.filter((c) => c.status !== "completed").length,
    completed: candidates.filter((c) => c.status === "completed").length,
  };

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-slate-500 transition-colors hover:text-slate-300">
          Hiring Projects
        </Link>
        <svg className="h-3 w-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="truncate font-medium text-white">{project.name}</span>
      </nav>

      <ProjectDetailClient
        project={project}
        assessments={assessments}
        candidateCounts={counts}
      />
    </div>
  );
}
