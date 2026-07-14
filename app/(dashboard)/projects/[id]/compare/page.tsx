import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { toAppLocale } from "@/lib/i18n/locales";
import {
  buildAssessmentIntelligence,
  toQueueIntelligenceProjection,
  RECOMMENDATION_ORDER,
} from "@/lib/assessment-intelligence";
import type { AssessmentResultInput, RecommendationLevel } from "@/lib/assessment-intelligence";
import CompareClient, { type CompareRow } from "./CompareClient";

type CompareLang = "es" | "en" | "fr";

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

// buildAssessmentIntelligence only has real es/en content; fr falls back to
// en for now (same pattern as the report page before French content landed).
function engineLocale(locale: CompareLang): "es" | "en" {
  return locale === "es" ? "es" : "en";
}

export default async function ComparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale: CompareLang = toAppLocale(await getLocale());

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const { data: project } = await admin
    .from("hiring_projects")
    .select("id, name, client_name")
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

  const rows: CompareRow[] = candidates.map((candidate) => {
    const results = candidate.results ?? [];
    if (results.length === 0) {
      return {
        candidateId: candidate.id,
        name: candidate.full_name || "—",
        status: candidate.status,
        resultsCount: 0,
        recommendation: null,
        confidence: null,
        evidenceStrength: null,
        topStrength: null,
        topRisk: null,
        interviewFocus: null,
      };
    }

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
    const projection = toQueueIntelligenceProjection(report);
    const evidenceCount = projection.evidenceSignalIds.length;

    return {
      candidateId: candidate.id,
      name: candidate.full_name || "—",
      status: candidate.status,
      resultsCount: results.length,
      recommendation: projection.recommendation,
      confidence: projection.confidence,
      evidenceStrength: evidenceCount >= 4 ? "strong" : evidenceCount >= 2 ? "moderate" : "limited",
      topStrength: projection.topCompetency,
      topRisk: projection.primaryRisk ? { label: projection.primaryRisk.label, severity: projection.primaryRisk.severity } : null,
      interviewFocus: report.interviewQuestions[0]?.competency ?? null,
    };
  });

  const order = (level: RecommendationLevel | null) => (level ? RECOMMENDATION_ORDER[level] : 99);
  rows.sort((a, b) => order(a.recommendation) - order(b.recommendation));

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-sm">
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
          {locale === "es" ? "Comparar" : locale === "fr" ? "Comparer" : "Compare"}
        </span>
      </nav>

      <CompareClient rows={rows} projectId={id} projectName={project.name} clientName={project.client_name} locale={locale} />
    </div>
  );
}
