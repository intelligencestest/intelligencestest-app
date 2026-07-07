import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { toAppLocale } from "@/lib/i18n/locales";
import { analyzeResult } from "@/lib/report-scoring";
import { assessmentName as termName, categoryLabel as termCategory, dimensionLabel as termDimension } from "@/lib/i18n/assessment-terms";
import { buildAssessmentIntelligence } from "@/lib/assessment-intelligence";
import type {
  AssessmentIntelligenceReport,
  ConfidenceLevel,
  IntelligenceRecommendation,
  RiskSeverity,
} from "@/lib/assessment-intelligence";
import type { EvidenceDirection } from "@/lib/assessment-intelligence/types";

type ReportLang = "es" | "en";
type Band = "high" | "medium" | "low";

type ResultRow = {
  id: string;
  score: number;
  completed_at: string;
  raw_answers: unknown;
  assessment_id: string;
  assessments: { id: string; name: string; category: string | null } | null;
};

const BAND_STYLE: Record<Band, { label: Record<ReportLang, string>; text: string; bg: string; bar: string; border: string }> = {
  high: {
    label: { es: "Alto", en: "High" },
    text: "text-[#2f8f6b]",
    bg: "bg-[#2f8f6b]/10",
    bar: "bg-[#2f8f6b]",
    border: "border-[#2f8f6b]/20",
  },
  medium: {
    label: { es: "Medio", en: "Medium" },
    text: "text-[#b8812f]",
    bg: "bg-[#b8812f]/10",
    bar: "bg-[#b8812f]",
    border: "border-[#b8812f]/20",
  },
  low: {
    label: { es: "Bajo", en: "Low" },
    text: "text-[#c44f4f]",
    bg: "bg-[#c44f4f]/10",
    bar: "bg-[#c44f4f]",
    border: "border-[#c44f4f]/20",
  },
};

const RECOMMENDATION_STYLE: Record<IntelligenceRecommendation["level"], { dot: string; text: string; bg: string; border: string }> = {
  strong: { dot: "bg-[#2f8f6b]", text: "text-[#b9e6d3]", bg: "bg-[#2f8f6b]/10", border: "border-[#2f8f6b]/25" },
  proceed: { dot: "bg-[#2f8f6b]", text: "text-[#b9e6d3]", bg: "bg-[#2f8f6b]/10", border: "border-[#2f8f6b]/25" },
  review: { dot: "bg-[#c7a15a]", text: "text-[#ead6ad]", bg: "bg-[#c7a15a]/10", border: "border-[#c7a15a]/25" },
  caution: { dot: "bg-[#c44f4f]", text: "text-[#f0b9b9]", bg: "bg-[#c44f4f]/10", border: "border-[#c44f4f]/25" },
  notRecommended: { dot: "bg-[#c44f4f]", text: "text-[#f0b9b9]", bg: "bg-[#c44f4f]/10", border: "border-[#c44f4f]/25" },
};

const CONFIDENCE_STYLE: Record<ConfidenceLevel, { label: Record<ReportLang, string>; text: string; bg: string; border: string }> = {
  high: {
    label: { es: "Alta", en: "High" },
    text: "text-[#b9e6d3]",
    bg: "bg-[#2f8f6b]/10",
    border: "border-[#2f8f6b]/20",
  },
  moderate: {
    label: { es: "Media", en: "Moderate" },
    text: "text-[#ead6ad]",
    bg: "bg-[#c7a15a]/10",
    border: "border-[#c7a15a]/20",
  },
  low: {
    label: { es: "Baja", en: "Low" },
    text: "text-[#f0b9b9]",
    bg: "bg-[#c44f4f]/10",
    border: "border-[#c44f4f]/20",
  },
};

const DIRECTION_LABEL: Record<EvidenceDirection, Record<ReportLang, string>> = {
  positive: { es: "Evidencia favorable", en: "Favorable evidence" },
  mixed: { es: "Evidencia mixta", en: "Mixed evidence" },
  risk: { es: "Riesgo", en: "Risk" },
  neutral: { es: "Evidencia neutral", en: "Neutral evidence" },
};

const SEVERITY_LABEL: Record<RiskSeverity, Record<ReportLang, string>> = {
  high: { es: "Alto", en: "High" },
  medium: { es: "Medio", en: "Medium" },
  low: { es: "Bajo", en: "Low" },
};

const COPY = {
  es: {
    back: "Volver al perfil",
    eyebrow: "Informe ejecutivo",
    title: "Revisión ejecutiva del candidato",
    subtitle: "Diseñado para revisar evidencia, validar riesgos y tomar una decisión dentro de la plataforma.",
    reviewCandidate: "Revisar candidato",
    project: "Proyecto",
    company: "Empresa",
    reportDate: "Fecha",
    decision: "Decisión",
    keyMessage: "Mensaje clave",
    confidence: "Confianza",
    overall: "Evaluación global",
    coverage: "Cobertura",
    completed: "completadas",
    of100: "de 100",
    executiveSummary: "Resumen ejecutivo",
    evidenceTitle: "Evidencia",
    evidenceSubtitle: "Señales extraídas únicamente de evaluaciones completadas.",
    competencies: "Competencias",
    supportingEvidence: "Evidencia de soporte",
    risks: "Riesgos",
    contradictions: "Contradicciones",
    assessmentCoverage: "Cobertura de evaluación",
    noRisks: "No se detectaron riesgos metodológicos claros en la evidencia disponible.",
    noContradictions: "No hay señales mixtas relevantes entre los instrumentos completados.",
    mixedSignal: "Coexisten señales favorables y de riesgo. La entrevista debe confirmar qué señal pesa más para el rol.",
    businessTitle: "Interpretación de negocio",
    strengths: "Fortalezas",
    development: "Áreas de desarrollo",
    limitations: "Limitaciones",
    noStrengths: "No hay fortalezas suficientemente respaldadas por evidencia alta.",
    noDevelopment: "No hay áreas de desarrollo específicas fuera de las limitaciones metodológicas.",
    interviewTitle: "Validación en entrevista",
    interviewSubtitle: "Preguntas ligadas directamente a fortalezas o riesgos reportados.",
    whyItMatters: "Por qué importa",
    validates: "Valida",
    breakdownTitle: "Desglose de evaluaciones",
    assessment: "Evaluación",
    category: "Categoría",
    score: "Puntuación",
    interpretation: "Lectura",
    dimensions: "Dimensiones",
    methodologyTitle: "Metodología",
    confidenceExplanation: "Explicación de confianza",
    evidenceSources: "Fuentes de evidencia",
    engineVersion: "Versión del motor",
    roleFitLimit: "Sin modelo de competencias del rol, este informe evalúa desempeño en evaluaciones completadas; no afirma ajuste completo al puesto.",
    invitedOn: (date: string) => `Invitado el ${date}`,
    coverageText: (done: number, total: number, pending: number) =>
      pending > 0 ? `${done}/${total} evaluaciones completadas; ${pending} pendiente${pending === 1 ? "" : "s"}.` : `${done}/${total} evaluaciones completadas.`,
    completedOn: (date: string) => `Completada el ${date}`,
    correct: (correct: number, total: number) => `${correct} de ${total} respuestas correctas`,
  },
  en: {
    back: "Back to profile",
    eyebrow: "Executive report",
    title: "Candidate executive review",
    subtitle: "Built to review evidence, validate risks, and make a decision inside the platform.",
    reviewCandidate: "Review candidate",
    project: "Project",
    company: "Company",
    reportDate: "Date",
    decision: "Decision",
    keyMessage: "Key message",
    confidence: "Confidence",
    overall: "Overall assessment",
    coverage: "Coverage",
    completed: "completed",
    of100: "out of 100",
    executiveSummary: "Executive summary",
    evidenceTitle: "Evidence",
    evidenceSubtitle: "Signals extracted only from completed assessments.",
    competencies: "Competencies",
    supportingEvidence: "Supporting evidence",
    risks: "Risks",
    contradictions: "Contradictions",
    assessmentCoverage: "Assessment coverage",
    noRisks: "No clear methodological risks were detected in the available evidence.",
    noContradictions: "No material mixed signals were found across completed instruments.",
    mixedSignal: "Favorable and risk signals coexist. The interview should confirm which signal matters most for the role.",
    businessTitle: "Business interpretation",
    strengths: "Strengths",
    development: "Development areas",
    limitations: "Limitations",
    noStrengths: "No strengths are sufficiently supported by high evidence.",
    noDevelopment: "No specific development areas beyond methodological limitations.",
    interviewTitle: "Interview validation",
    interviewSubtitle: "Questions tied directly to reported strengths or risks.",
    whyItMatters: "Why it matters",
    validates: "Validates",
    breakdownTitle: "Assessment breakdown",
    assessment: "Assessment",
    category: "Category",
    score: "Score",
    interpretation: "Reading",
    dimensions: "Dimensions",
    methodologyTitle: "Methodology",
    confidenceExplanation: "Confidence explanation",
    evidenceSources: "Evidence sources",
    engineVersion: "Engine version",
    roleFitLimit: "Without a role competency model, this report evaluates completed assessment performance; it does not claim full role fit.",
    invitedOn: (date: string) => `Invited on ${date}`,
    coverageText: (done: number, total: number, pending: number) =>
      pending > 0 ? `${done}/${total} assessments completed; ${pending} pending.` : `${done}/${total} assessments completed.`,
    completedOn: (date: string) => `Completed on ${date}`,
    correct: (correct: number, total: number) => `${correct} of ${total} correct answers`,
  },
} satisfies Record<ReportLang, Record<string, unknown>>;

function band(score: number): Band {
  return score >= 80 ? "high" : score >= 60 ? "medium" : "low";
}

function SectionShell({
  eyebrow,
  title,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="border-t border-white/[0.08] py-10">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71809d]">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">{title}</h2>
          {aside}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

function ScoreLine({ score, tone }: { score: number; tone: Band }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-10 text-right text-sm font-semibold ${BAND_STYLE[tone].text}`}>{score}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div className={`h-full rounded-full ${BAND_STYLE[tone].bar}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-white/[0.1] px-4 py-3 text-sm leading-6 text-[#8b98b3]">{children}</p>;
}

function directionBorder(direction: EvidenceDirection) {
  if (direction === "positive") return "border-[#2f8f6b]/25";
  if (direction === "risk") return "border-[#c44f4f]/25";
  if (direction === "mixed") return "border-[#c7a15a]/25";
  return "border-white/[0.1]";
}

function topEvidence(report: AssessmentIntelligenceReport) {
  return [...report.evidenceSignals]
    .sort((a, b) => {
      const rank = { risk: 4, mixed: 3, positive: 2, neutral: 1 } satisfies Record<EvidenceDirection, number>;
      return rank[b.direction] - rank[a.direction] || b.normalizedScore - a.normalizedScore;
    })
    .slice(0, 7);
}

export default async function ExecutiveReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale: ReportLang = toAppLocale(await getLocale());
  const L = COPY[locale];
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const { data: candidate } = await admin
    .from("candidates")
    .select("id, full_name, email, created_at, company_id, project_id, hiring_projects(id, name)")
    .eq("id", id)
    .eq("company_id", companyId)
    .returns<{
      id: string;
      full_name: string;
      email: string;
      created_at: string;
      company_id: string;
      project_id: string;
      hiring_projects: { id: string; name: string } | null;
    }[]>()
    .maybeSingle();

  if (!candidate) notFound();

  const [{ data: results }, { data: projectAssessments }, { data: company }] = await Promise.all([
    admin
      .from("results")
      .select("id, score, completed_at, raw_answers, assessment_id, assessments(id, name, category)")
      .eq("candidate_id", candidate.id)
      .order("completed_at", { ascending: true })
      .returns<ResultRow[]>(),
    admin
      .from("project_assessments")
      .select("assessment_id, assessments(id, name, category)")
      .eq("project_id", candidate.project_id)
      .returns<{ assessment_id: string; assessments: { id: string; name: string; category: string | null } | null }[]>(),
    admin.from("companies").select("name").eq("id", candidate.company_id).single(),
  ]);

  const myResults = results ?? [];
  if (myResults.length === 0) notFound();

  const name = candidate.full_name?.trim() || (locale === "es" ? "Candidato" : "Candidate");
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const projectName = candidate.hiring_projects?.name ?? "—";
  const companyName = company?.name ?? "—";
  const reportDate = new Date().toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });
  const invitedDate = new Date(candidate.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });

  const completedAssessmentIds = new Set(myResults.map((r) => r.assessment_id));
  const pending = (projectAssessments ?? []).filter((pa) => !completedAssessmentIds.has(pa.assessment_id));
  const totalAssigned = Math.max((projectAssessments ?? []).length, myResults.length);
  const overall = Math.round(myResults.reduce((sum, result) => sum + result.score, 0) / myResults.length);
  const overallBand = band(overall);

  const rows = myResults.map((result) => ({
    result,
    displayName: result.assessments ? termName(result.assessments.name, locale) : "—",
    category: result.assessments?.category ? termCategory(result.assessments.category, locale) : "—",
    detail: result.assessments ? analyzeResult(result.assessments.name, result.raw_answers) : null,
    band: band(result.score),
  }));

  const intelligence = buildAssessmentIntelligence({
    locale,
    roleRequirementsProvided: false,
    assessments: myResults.map((result) => ({
      id: result.id,
      assessmentId: result.assessment_id,
      name: result.assessments?.name ?? "Assessment",
      category: result.assessments?.category ?? undefined,
      score: result.score,
      completedAt: result.completed_at,
      rawAnswers: result.raw_answers,
    })),
  });

  const recommendationStyle = RECOMMENDATION_STYLE[intelligence.recommendation.level];
  const confidenceStyle = CONFIDENCE_STYLE[intelligence.confidence.level];
  const competencies = [...intelligence.competencyEvidence].sort((a, b) => b.score - a.score).slice(0, 6);
  const evidenceSignals = topEvidence(intelligence);
  const positiveSignals = intelligence.evidenceSignals.filter((signal) => signal.direction === "positive");
  const riskSignals = intelligence.evidenceSignals.filter((signal) => signal.direction === "risk");
  const mixedSignals = intelligence.evidenceSignals.filter((signal) => signal.direction === "mixed");
  const hasContradiction = mixedSignals.length > 0 || (positiveSignals.length > 0 && riskSignals.length > 0);
  const sourceAssessments = Array.from(
    new Set(intelligence.evidenceSignals.map((signal) => termName(signal.assessmentName, locale)))
  );

  return (
    <main className="min-h-screen bg-[#07080F] text-[#eef3ff]">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/candidates/${candidate.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8b98b3] transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
            </svg>
            {L.back as string}
          </Link>
          <Link
            href={`/candidates/${candidate.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-[#e8edf7] px-4 py-2.5 text-sm font-semibold text-[#0b1020] transition-colors hover:bg-white"
          >
            {L.reviewCandidate as string}
          </Link>
        </div>

        <section className="rounded-[28px] border border-white/[0.08] bg-[#0b0f1a] px-6 py-7 shadow-[0_30px_120px_rgba(0,0,0,0.38)] sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71809d]">{L.eyebrow as string}</p>
                <Pill className={`${recommendationStyle.bg} ${recommendationStyle.text} ${recommendationStyle.border}`}>
                  <span className={`mr-2 h-1.5 w-1.5 rounded-full ${recommendationStyle.dot}`} aria-hidden="true" />
                  {intelligence.recommendation.title}
                </Pill>
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
                {intelligence.recommendation.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#a8b3ca]">{intelligence.recommendation.rationale}</p>

              <div className="mt-8 flex min-w-0 items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.09] bg-[#07080F] text-sm font-semibold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="break-words text-base font-semibold text-white">{name}</p>
                  <p className="mt-0.5 break-words text-sm text-[#8b98b3]">{candidate.email || "—"}</p>
                </div>
              </div>

              <div className="mt-9 grid gap-4 border-t border-white/[0.08] pt-6 md:grid-cols-3">
                {[
                  { label: L.project as string, value: projectName },
                  { label: L.company as string, value: companyName },
                  { label: L.reportDate as string, value: reportDate },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#71809d]">{item.label}</p>
                    <p className="mt-1 truncate text-sm font-medium text-[#d9e2f2]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#71809d]">{L.overall as string}</p>
                  <p className={`mt-3 text-6xl font-semibold tracking-[-0.05em] ${BAND_STYLE[overallBand].text}`}>{overall}</p>
                  <p className="mt-1 text-xs font-medium text-[#71809d]">{L.of100 as string}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-[#8b98b3]">
                    <span>{BAND_STYLE[overallBand].label[locale]}</span>
                    <span>{overall}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className={`h-full rounded-full ${BAND_STYLE[overallBand].bar}`} style={{ width: `${overall}%` }} />
                  </div>
                </div>
                <div className={`rounded-xl border px-4 py-3 ${confidenceStyle.bg} ${confidenceStyle.border}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#71809d]">{L.confidence as string}</p>
                  <p className={`mt-1 text-sm font-semibold ${confidenceStyle.text}`}>
                    {confidenceStyle.label[locale]} · {intelligence.confidence.score}/100
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#71809d]">{L.coverage as string}</p>
                  <p className="mt-1 text-sm font-semibold text-[#d9e2f2]">
                    {(L.coverageText as (done: number, total: number, pending: number) => string)(myResults.length, totalAssigned, pending.length)}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-10 rounded-[28px] border border-white/[0.08] bg-[#0b0f1a] px-6 sm:px-8 lg:px-10">
          <SectionShell
            eyebrow="01"
            title={L.executiveSummary as string}
            aside={
              <p className="mt-4 text-sm leading-6 text-[#8b98b3]">
                {(L.invitedOn as (date: string) => string)(invitedDate)}
              </p>
            }
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl bg-white/[0.03] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#71809d]">{L.keyMessage as string}</p>
                <p className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-white">{intelligence.executiveSummary.headline}</p>
                <p className="mt-4 text-sm leading-7 text-[#a8b3ca]">{intelligence.executiveSummary.summary}</p>
              </div>
              <div className="space-y-3">
                {intelligence.executiveSummary.evidence.slice(0, 4).map((item) => (
                  <div key={item} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm leading-6 text-[#d9e2f2]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </SectionShell>

          <SectionShell
            eyebrow="02"
            title={L.evidenceTitle as string}
            aside={<p className="mt-4 text-sm leading-6 text-[#8b98b3]">{L.evidenceSubtitle as string}</p>}
          >
            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <div>
                <h3 className="mb-4 text-sm font-semibold text-white">{L.competencies as string}</h3>
                <div className="space-y-3">
                  {competencies.map((competency) => {
                    const tone = band(competency.score);
                    return (
                      <article key={competency.competencyId} className="rounded-2xl border border-white/[0.08] p-4">
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{competency.label}</p>
                            <p className="mt-0.5 text-xs text-[#71809d]">{competency.category}</p>
                          </div>
                          <span className={`text-lg font-semibold ${BAND_STYLE[tone].text}`}>{competency.score}</span>
                        </div>
                        <ScoreLine score={competency.score} tone={tone} />
                        <p className="mt-3 text-sm leading-6 text-[#a8b3ca]">{competency.summary}</p>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-white">{L.supportingEvidence as string}</h3>
                  <div className="space-y-3">
                    {evidenceSignals.map((signal) => (
                      <article key={signal.id} className={`rounded-2xl border p-4 ${directionBorder(signal.direction)}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill className="border-white/[0.08] bg-white/[0.03] text-[#a8b3ca]">{DIRECTION_LABEL[signal.direction][locale]}</Pill>
                          <span className="text-xs text-[#71809d]">{termName(signal.assessmentName, locale)}</span>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-6 text-white">{signal.statement}</p>
                        <p className="mt-2 text-sm leading-6 text-[#a8b3ca]">{signal.businessImpact}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-white">{L.risks as string}</h3>
                    {intelligence.risks.length ? (
                      <div className="space-y-3">
                        {intelligence.risks.slice(0, 4).map((risk) => (
                          <article key={risk.id} className="rounded-2xl border border-[#c44f4f]/20 bg-[#c44f4f]/[0.04] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-white">{risk.competencyLabel}</p>
                              <Pill className="border-[#c44f4f]/20 bg-[#c44f4f]/10 text-[#f0b9b9]">{SEVERITY_LABEL[risk.severity][locale]}</Pill>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#a8b3ca]">{risk.statement}</p>
                            <p className="mt-2 text-xs leading-5 text-[#8b98b3]">{risk.businessImpact}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <EmptyLine>{L.noRisks as string}</EmptyLine>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-white">{L.contradictions as string}</h3>
                    {hasContradiction ? (
                      <div className="rounded-2xl border border-[#c7a15a]/20 bg-[#c7a15a]/[0.05] p-4">
                        <p className="text-sm leading-6 text-[#ead6ad]">
                          {mixedSignals[0]?.statement ?? (L.mixedSignal as string)}
                        </p>
                        {mixedSignals[0]?.businessImpact && <p className="mt-2 text-xs leading-5 text-[#a8b3ca]">{mixedSignals[0].businessImpact}</p>}
                      </div>
                    ) : (
                      <EmptyLine>{L.noContradictions as string}</EmptyLine>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionShell>

          <SectionShell eyebrow="03" title={L.businessTitle as string}>
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">{L.strengths as string}</h3>
                {intelligence.strengths.length ? (
                  <ul className="space-y-3">
                    {intelligence.strengths.map((strength) => (
                      <li key={strength} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm leading-6 text-[#d9e2f2]">
                        {strength}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyLine>{L.noStrengths as string}</EmptyLine>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">{L.development as string}</h3>
                {intelligence.developmentAreas.length ? (
                  <ul className="space-y-3">
                    {intelligence.developmentAreas.map((area) => (
                      <li key={area} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm leading-6 text-[#d9e2f2]">
                        {area}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyLine>{L.noDevelopment as string}</EmptyLine>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">{L.limitations as string}</h3>
                <ul className="space-y-3">
                  {Array.from(new Set([L.roleFitLimit as string, ...intelligence.methodologyLimitations])).map((limitation) => (
                    <li key={limitation} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm leading-6 text-[#a8b3ca]">
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionShell>

          <SectionShell
            eyebrow="04"
            title={L.interviewTitle as string}
            aside={<p className="mt-4 text-sm leading-6 text-[#8b98b3]">{L.interviewSubtitle as string}</p>}
          >
            <div className="space-y-4">
              {intelligence.interviewQuestions.map((question, index) => (
                <article key={`${question.competency}-${index}`} className="rounded-2xl border border-white/[0.08] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#71809d]">
                        {L.validates as string}: {question.competency}
                      </p>
                      <p className="mt-3 text-base font-semibold leading-7 text-white">{question.question}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#71809d]">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-4 border-t border-white/[0.08] pt-4 text-sm leading-6 text-[#a8b3ca]">
                    <span className="font-semibold text-[#d9e2f2]">{L.whyItMatters as string}: </span>
                    {question.reason}
                  </p>
                </article>
              ))}
            </div>
          </SectionShell>

          <SectionShell eyebrow="05" title={L.breakdownTitle as string}>
            <div className="space-y-4">
              {rows.map(({ result, displayName, category, detail, band: resultBand }) => {
                const dimMax = detail?.dimensions?.length ? Math.max(...detail.dimensions.map((d) => d.max ?? d.value), 1) : 1;
                return (
                  <article key={result.id} className="rounded-2xl border border-white/[0.08] p-5">
                    <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-white">{displayName}</h3>
                          <Pill className={`${BAND_STYLE[resultBand].bg} ${BAND_STYLE[resultBand].text} ${BAND_STYLE[resultBand].border}`}>
                            {BAND_STYLE[resultBand].label[locale]}
                          </Pill>
                        </div>
                        <p className="mt-1 text-sm text-[#8b98b3]">
                          {category} · {(L.completedOn as (date: string) => string)(new Date(result.completed_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short" }))}
                        </p>
                        {detail?.correct && (
                          <p className="mt-3 text-sm text-[#a8b3ca]">
                            {(L.correct as (correct: number, total: number) => string)(detail.correct.correct, detail.correct.total)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className={`text-right text-4xl font-semibold tracking-tight ${BAND_STYLE[resultBand].text}`}>{result.score}</p>
                        <ScoreLine score={result.score} tone={resultBand} />
                      </div>
                    </div>

                    {detail?.dimensions && detail.dimensions.length > 0 && (
                      <div className="mt-5 border-t border-white/[0.08] pt-5">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#71809d]">{L.dimensions as string}</p>
                        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                          {detail.dimensions.map((dimension) => {
                            const max = dimension.max ?? dimMax;
                            const pct = Math.round((dimension.value / max) * 100);
                            return (
                              <div key={dimension.label}>
                                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                  <span className="truncate text-[#a8b3ca]">{termDimension(dimension.label, locale)}</span>
                                  <span className="font-semibold text-[#d9e2f2]">
                                    {dimension.value}
                                    {dimension.max ? `/${dimension.max}` : ""}
                                  </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                                  <div className="h-full rounded-full bg-[#6f8fbf]" style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </SectionShell>

          <SectionShell eyebrow="06" title={L.methodologyTitle as string}>
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.08] p-5">
                <p className="text-sm font-semibold text-white">{L.confidenceExplanation as string}</p>
                <ul className="mt-4 space-y-3">
                  {[...intelligence.confidence.factors, ...intelligence.confidence.limitations].map((factor) => (
                    <li key={factor} className="text-sm leading-6 text-[#a8b3ca]">{factor}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/[0.08] p-5">
                <p className="text-sm font-semibold text-white">{L.evidenceSources as string}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sourceAssessments.map((source) => (
                    <Pill key={source} className="border-white/[0.08] bg-white/[0.03] text-[#a8b3ca]">{source}</Pill>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.08] p-5">
                <p className="text-sm font-semibold text-white">{L.engineVersion as string}</p>
                <p className="mt-4 break-all rounded-xl bg-white/[0.035] px-3 py-2 font-mono text-xs text-[#a8b3ca]">
                  {intelligence.engineVersion}
                </p>
              </div>
            </div>
          </SectionShell>
        </div>
      </div>
    </main>
  );
}
