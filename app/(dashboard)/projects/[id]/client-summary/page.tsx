import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { toAppLocale } from "@/lib/i18n/locales";
import { buildAssessmentIntelligence } from "@/lib/assessment-intelligence";
import type { AssessmentResultInput, RecommendationLevel, ConfidenceLevel } from "@/lib/assessment-intelligence";
import ClientSummaryClient, { type SummaryCandidate } from "./ClientSummaryClient";

type SummaryLang = "es" | "en" | "fr";

type CandidateRow = {
  id: string;
  full_name: string;
  status: string;
  results: {
    id: string;
    score: number;
    completed_at: string;
    raw_answers: unknown;
    assessment_id: string;
    assessments: { id: string; name: string; category: string | null } | null;
  }[];
};

// Same fallback as the internal report / compare screen: real French
// engine content doesn't exist yet, so fr reads the es/en engine locale.
function engineLocale(locale: SummaryLang): "es" | "en" {
  return locale === "es" ? "es" : "en";
}

const RECOMMENDATION_ORDER: Record<RecommendationLevel, number> = {
  strong: 0,
  proceed: 1,
  review: 2,
  caution: 3,
  notRecommended: 4,
};

export default async function ClientSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale: SummaryLang = toAppLocale(await getLocale());

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const { data: project } = await admin
    .from("hiring_projects")
    .select("id, name, client_name, role_title, description, client_summary_note")
    .eq("id", id)
    .eq("company_id", companyId)
    .maybeSingle();

  if (!project) notFound();

  const { data: candidateRows } = await admin
    .from("candidates")
    .select("id, full_name, status, results(id, score, completed_at, raw_answers, assessment_id, assessments(id, name, category))")
    .eq("project_id", id)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .returns<CandidateRow[]>();

  const candidates = candidateRows ?? [];
  const completedCount = candidates.filter((c) => c.status === "completed").length;

  const summaryCandidates: SummaryCandidate[] = candidates
    .filter((c) => (c.results ?? []).length > 0)
    .map((candidate) => {
      const results = candidate.results ?? [];
      const assessments: AssessmentResultInput[] = results.map((r) => ({
        id: r.id,
        assessmentId: r.assessment_id,
        name: r.assessments?.name ?? "Assessment",
        category: r.assessments?.category ?? undefined,
        score: r.score,
        completedAt: r.completed_at,
        rawAnswers: r.raw_answers,
      }));

      const report = buildAssessmentIntelligence({ locale: engineLocale(locale), assessments });

      return {
        candidateId: candidate.id,
        name: candidate.full_name || "—",
        recommendation: report.recommendation.level as RecommendationLevel,
        confidence: report.confidence.level as ConfidenceLevel,
        rationale: report.recommendation.rationale,
        strengths: report.strengths.slice(0, 3),
        pointsToVerify: report.risks.slice(0, 3).map((r) => r.validationFocus),
        interviewFocus: report.interviewQuestions.slice(0, 2).map((q) => q.question),
      };
    })
    .sort((a, b) => RECOMMENDATION_ORDER[a.recommendation] - RECOMMENDATION_ORDER[b.recommendation]);

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-sm print:hidden">
        <Link href="/projects" className="text-slate-500 transition-colors hover:text-slate-300">
          {locale === "es" ? "Proyectos" : locale === "fr" ? "Projets clients" : "Client Shortlists"}
        </Link>
        <svg className="h-3 w-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/projects/${id}`} className="truncate text-slate-500 transition-colors hover:text-slate-300">
          {project.name}
        </Link>
        <svg className="h-3 w-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="truncate font-medium text-[var(--it-text)]">
          {locale === "es" ? "Resumen para el cliente" : locale === "fr" ? "Résumé client" : "Client summary"}
        </span>
      </nav>

      <ClientSummaryClient
        projectId={id}
        projectName={project.name}
        clientName={project.client_name}
        roleTitle={project.role_title}
        description={project.description}
        candidateCount={candidates.length}
        completedCount={completedCount}
        candidates={summaryCandidates}
        initialNote={project.client_summary_note}
        locale={locale}
      />
    </div>
  );
}
