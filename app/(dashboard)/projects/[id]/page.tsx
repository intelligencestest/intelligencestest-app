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

type PaRow = {
  assessment_id: string;
  assessments: { id: string; name: string; duration_minutes: number | null; question_count: number | null }[];
};

type CandidateRow = {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
  results: { id: string; score: number; completed_at: string }[];
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const [{ data: project }, { data: paRows }, { data: candidateRows }, { data: libraryRows }] = await Promise.all([
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
      .select("id, full_name, status, created_at, results(id, score, completed_at)")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .returns<CandidateRow[]>(),
    admin
      .from("assessments")
      .select("id, name, category, duration_minutes, question_count, status")
      .eq("status", "active")
      .order("name"),
  ]);

  if (!project) notFound();

  const assessments = ((paRows ?? []) as PaRow[])
    .map((row) => {
      const a = row.assessments[0];
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

  const candidates = (candidateRows ?? []).map((c) => ({
    ...c,
    results: c.results ?? [],
  }));

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-slate-500 transition-colors hover:text-slate-300">
          Projects
        </Link>
        <svg className="h-3 w-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="truncate font-medium text-white">{project.name}</span>
      </nav>

      <ProjectDetailClient
        project={project}
        assessments={assessments}
        candidates={candidates}
        allAssessments={libraryRows ?? []}
      />
    </div>
  );
}
