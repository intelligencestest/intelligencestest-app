import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { toAppLocale } from "@/lib/i18n/locales";
import { analyzeResult } from "@/lib/report-scoring";
import { assessmentName as termName, categoryLabel as termCategory, dimensionLabel as termDimension } from "@/lib/i18n/assessment-terms";
import { buildAssessmentIntelligence, toExecutiveBrief } from "@/lib/assessment-intelligence";
import type { ConfidenceLevel, RiskSeverity } from "@/lib/assessment-intelligence";
import type { EvidenceDirection } from "@/lib/assessment-intelligence/types";
import { ConfidenceGauge } from "@/components/dashboard/ConfidenceGauge";
import ExportPdfButton from "../ExportPdfButton";

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

// Three-tone system driven by the app's shared --it-success/warning/danger
// tokens, so band/recommendation/confidence colors match the rest of the
// enterprise dashboard instead of this page's own bespoke palette.
const BAND_STYLE: Record<Band, { label: Record<ReportLang, string>; text: string; bg: string; bar: string; border: string }> = {
  high: {
    label: { es: "Alto", en: "High" },
    text: "text-[#15803d]",
    bg: "bg-[rgba(22,163,74,0.1)]",
    bar: "bg-[var(--it-success)]",
    border: "border-[var(--it-success)]/20",
  },
  medium: {
    label: { es: "Medio", en: "Medium" },
    text: "text-[#b45309]",
    bg: "bg-[rgba(217,119,6,0.1)]",
    bar: "bg-[var(--it-warning)]",
    border: "border-[var(--it-warning)]/20",
  },
  low: {
    label: { es: "Bajo", en: "Low" },
    text: "text-[#b91c1c]",
    bg: "bg-[rgba(220,38,38,0.1)]",
    bar: "bg-[var(--it-danger)]",
    border: "border-[var(--it-danger)]/20",
  },
};

/** The memo's decision verdict (ExecutiveBrief.recommendation.level). */
const DECISION_STYLE: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  interview: { dot: "bg-[var(--it-success)]", text: "text-[#166534]", bg: "bg-[rgba(22,163,74,0.1)]", border: "border-[var(--it-success)]/25" },
  review: { dot: "bg-[var(--it-warning)]", text: "text-[#92400e]", bg: "bg-[rgba(217,119,6,0.1)]", border: "border-[var(--it-warning)]/25" },
  do_not_proceed: { dot: "bg-[var(--it-danger)]", text: "text-[#991b1b]", bg: "bg-[rgba(220,38,38,0.1)]", border: "border-[var(--it-danger)]/25" },
};

const CONFIDENCE_STYLE: Record<ConfidenceLevel, { label: Record<ReportLang, string>; tone: "high" | "moderate" | "low" }> = {
  high: { label: { es: "Alta", en: "High" }, tone: "high" },
  moderate: { label: { es: "Media", en: "Moderate" }, tone: "moderate" },
  low: { label: { es: "Baja", en: "Low" }, tone: "low" },
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
    recLevel: {
      strong: "Sólido",
      proceed: "Avanzar",
      review: "Revisar",
      caution: "Cautela",
      notRecommended: "No recomendado",
    } as Record<string, string>,
    decisionLevel: {
      interview: "Entrevistar",
      review: "Revisión humana",
      do_not_proceed: "No avanzar",
    } as Record<string, string>,
    engineSignal: "Señal del motor",
    humanNote:
      "Esta recomendación es una ayuda a la decisión basada en evidencia de evaluaciones completadas. La decisión final es siempre del equipo de selección.",
    whyTitle: "Por qué esta recomendación",
    whySubtitle: "Fortalezas respaldadas por evidencia de evaluación, no por impresiones.",
    riskVerify: "Cómo verificarlo",
    risksSubtitle: "Cada riesgo incluye la evidencia que lo origina y cómo validarlo en entrevista.",
    verifyNextTitle: "Qué validar a continuación",
    verifyNextSubtitle: "La lista corta antes de la entrevista.",
    auditTitle: "Metodología y auditabilidad",
    auditTrace: (signals: number, assessments: number) =>
      `${signals} señal${signals === 1 ? "" : "es"} de evidencia trazable${signals === 1 ? "" : "s"} · ${assessments} evaluaci${assessments === 1 ? "ón completada" : "ones completadas"}`,
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
    recLevel: {
      strong: "Strong",
      proceed: "Proceed",
      review: "Review",
      caution: "Caution",
      notRecommended: "Not recommended",
    } as Record<string, string>,
    decisionLevel: {
      interview: "Interview",
      review: "Human review",
      do_not_proceed: "Do not proceed",
    } as Record<string, string>,
    engineSignal: "Engine signal",
    humanNote:
      "This recommendation is decision support built from completed-assessment evidence. The final decision always belongs to the hiring team.",
    whyTitle: "Why this recommendation",
    whySubtitle: "Strengths backed by assessment evidence, not impressions.",
    riskVerify: "How to verify",
    risksSubtitle: "Each risk includes the evidence behind it and how to validate it in the interview.",
    verifyNextTitle: "What to validate next",
    verifyNextSubtitle: "The short list before the interview.",
    auditTitle: "Methodology and auditability",
    auditTrace: (signals: number, assessments: number) =>
      `${signals} traceable evidence signal${signals === 1 ? "" : "s"} · ${assessments} completed assessment${assessments === 1 ? "" : "s"}`,
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
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="border-t enterprise-divider py-10">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--it-text)]">{title}</h2>
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
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-900/[0.07]">
        <div className={`h-full rounded-full ${BAND_STYLE[tone].bar}`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-6 text-[var(--it-muted)]">{children}</p>;
}

function MarkerList({ items, tone = "text-slate-200" }: { items: string[]; tone?: string }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--it-faint)]" aria-hidden="true" />
          <span className={`text-sm leading-6 ${tone}`}>{item}</span>
        </li>
      ))}
    </ul>
  );
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
      .eq("company_id", companyId)
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
  const executiveBrief = toExecutiveBrief(intelligence);

  const decisionStyle = DECISION_STYLE[executiveBrief.recommendation.level] ?? DECISION_STYLE.review;
  const confidenceStyle = CONFIDENCE_STYLE[executiveBrief.confidence.sourceLevel];
  const sourceAssessments = Array.from(
    new Set(intelligence.evidenceSignals.map((signal) => termName(signal.assessmentName, locale)))
  );

  return (
    <main className="min-h-screen bg-[var(--it-bg)] text-[var(--it-text)]">
      <div className="mx-auto max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/candidates/${candidate.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--it-muted)] transition-colors hover:text-[var(--it-text)]"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            {L.back as string}
          </Link>
          <div className="flex flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:items-center">
            <ExportPdfButton
              variant="toolbar"
              candidateName={name}
              candidateEmail={candidate.email || ""}
              companyName={companyName}
              projectName={projectName}
              candidateId={candidate.id}
              assessments={myResults.map((r) => ({
                id: r.id,
                assessmentId: r.assessment_id,
                name: r.assessments?.name ?? "—",
                score: r.score,
                completedAt: r.completed_at,
                category: r.assessments?.category ?? undefined,
                rawAnswers: r.raw_answers,
              }))}
            />
            <Link
              href={`/candidates/${candidate.id}`}
              className="enterprise-button inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold"
            >
              {L.reviewCandidate as string}
            </Link>
          </div>
        </div>

        <section className="enterprise-card relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--it-faint)]">{L.eyebrow as string}</p>
                <Pill className={`${decisionStyle.bg} ${decisionStyle.text} ${decisionStyle.border}`}>
                  <span className={`mr-2 h-1.5 w-1.5 rounded-full ${decisionStyle.dot}`} aria-hidden="true" />
                  {(L.decisionLevel as Record<string, string>)[executiveBrief.recommendation.level] ?? executiveBrief.recommendation.title}
                </Pill>
                {/* Auditability: the engine's raw signal stays visible next to the decision. */}
                <span className="text-xs text-[var(--it-faint)]">
                  {L.engineSignal as string}: {(L.recLevel as Record<string, string>)[executiveBrief.recommendation.sourceLevel]}
                </span>
              </div>
              {/* Editorial register — the verdict is the document's voice (design-language.md §2) */}
              <h1 className="font-editorial mt-5 max-w-4xl text-4xl font-medium leading-[1.12] text-[var(--it-text)] sm:text-5xl">
                {executiveBrief.recommendation.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{executiveBrief.recommendation.rationale}</p>
              <p className="mt-4 max-w-3xl text-[13px] leading-6 text-[var(--it-muted)]">{L.humanNote as string}</p>

              <div className="mt-8 flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[var(--it-hairline)] bg-[var(--it-bg)] text-sm font-semibold text-[var(--it-text)]">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="break-words text-base font-semibold text-[var(--it-text)]">{name}</p>
                  <p className="mt-0.5 break-words text-sm text-[var(--it-muted)]">{candidate.email || "—"}</p>
                </div>
              </div>

              <div className="mt-9 grid gap-4 border-t enterprise-divider pt-6 md:grid-cols-3">
                {[
                  { label: L.project as string, value: projectName },
                  { label: L.company as string, value: companyName },
                  { label: L.reportDate as string, value: reportDate },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--it-faint)]">{item.label}</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-200">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:border-l lg:border-[var(--it-hairline)] lg:pl-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--it-faint)]">{L.overall as string}</p>
              <p className={`mt-3 text-6xl font-semibold tracking-[-0.05em] ${BAND_STYLE[overallBand].text}`}>{overall}</p>
              <p className="mt-1 text-xs font-medium text-[var(--it-faint)]">{L.of100 as string}</p>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-[var(--it-muted)]">
                  <span>{BAND_STYLE[overallBand].label[locale]}</span>
                  <span>{overall}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-900/[0.07]">
                  <div className={`h-full rounded-full ${BAND_STYLE[overallBand].bar}`} style={{ width: `${overall}%` }} />
                </div>
              </div>

              <div className="mt-6 border-t border-[var(--it-hairline)] pt-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--it-faint)]">{L.confidence as string}</p>
                <ConfidenceGauge
                  score={executiveBrief.confidence.score}
                  tone={confidenceStyle.tone}
                  label={confidenceStyle.label[locale]}
                  sublabel={`${executiveBrief.confidence.score}/100`}
                />
              </div>

              <div className="mt-6 border-t border-[var(--it-hairline)] pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--it-faint)]">{L.coverage as string}</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">
                  {(L.coverageText as (done: number, total: number, pending: number) => string)(myResults.length, totalAssigned, pending.length)}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-2">
          {/* 1 · Why this recommendation — strengths backed by evidence. */}
          <SectionShell
            title={L.whyTitle as string}
            aside={<p className="mt-4 text-sm leading-6 text-[var(--it-muted)]">{L.whySubtitle as string}</p>}
          >
            {executiveBrief.strengths.length ? (
              <MarkerList items={executiveBrief.strengths} />
            ) : (
              <EmptyLine>{L.noStrengths as string}</EmptyLine>
            )}
          </SectionShell>

          {/* 2 · Risks to verify — evidence, impact, and how to check each one. */}
          <SectionShell
            title={L.risks as string}
            aside={<p className="mt-4 text-sm leading-6 text-[var(--it-muted)]">{L.risksSubtitle as string}</p>}
          >
            {executiveBrief.risks.length ? (
              <div className="space-y-4">
                {executiveBrief.risks.map((risk) => (
                  <article key={risk.id} className="rounded-xl border border-[var(--it-danger)]/20 bg-[rgba(220,38,38,0.03)] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--it-text)]">{risk.title}</p>
                      <Pill className="border-[var(--it-danger)]/20 bg-[rgba(220,38,38,0.08)] text-[#991b1b]">
                        {SEVERITY_LABEL[risk.severity][locale]}
                      </Pill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{risk.evidence}</p>
                    <p className="mt-2 text-[13px] leading-6 text-[var(--it-muted)]">{risk.businessImpact}</p>
                    <p className="mt-4 border-t border-[var(--it-hairline)] pt-3 text-sm leading-6 text-[var(--it-text)]">
                      <span className="font-semibold">{L.riskVerify as string}: </span>
                      {risk.verify}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyLine>{L.noRisks as string}</EmptyLine>
            )}
          </SectionShell>

          {/* 3 · Evidence — one document-style table, strongest signals first. */}
          <SectionShell
            title={L.evidenceTitle as string}
            aside={<p className="mt-4 text-sm leading-6 text-[var(--it-muted)]">{L.evidenceSubtitle as string}</p>}
          >
            <div className="divide-y divide-[var(--it-hairline)]">
              {executiveBrief.evidence.map((item) => (
                <div key={item.id} className="grid gap-3 py-5 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,1fr)_72px] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill className="border-[var(--it-hairline)] bg-gray-900/[0.03] text-slate-300">
                        {DIRECTION_LABEL[item.direction][locale]}
                      </Pill>
                      <span className="text-xs text-[var(--it-faint)]">{termName(item.assessment, locale)}</span>
                    </div>
                    <p className="mt-2.5 text-sm font-medium leading-6 text-[var(--it-text)]">{item.signal}</p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-300">{item.businessImpact}</p>
                  </div>
                  {typeof item.score === "number" ? (
                    <p className={`text-right text-2xl font-semibold tabular-nums tracking-tight ${BAND_STYLE[band(item.score)].text}`}>
                      {item.score}
                    </p>
                  ) : (
                    <p className="text-right text-2xl font-semibold text-[var(--it-faint)]">—</p>
                  )}
                </div>
              ))}
            </div>
          </SectionShell>

          {/* 4 · What to validate next — the short list, then the full interview kit. */}
          <SectionShell
            title={L.interviewTitle as string}
            aside={<p className="mt-4 text-sm leading-6 text-[var(--it-muted)]">{L.interviewSubtitle as string}</p>}
          >
            {executiveBrief.verifyNext.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--it-faint)]">
                  {L.verifyNextTitle as string}
                </p>
                <p className="mt-1 text-[13px] text-[var(--it-muted)]">{L.verifyNextSubtitle as string}</p>
                <ol className="mt-4 space-y-2.5">
                  {executiveBrief.verifyNext.map((item, index) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                      <span className="w-6 flex-shrink-0 font-semibold tabular-nums text-[var(--it-faint)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="space-y-4">
              {intelligence.interviewQuestions.map((question, index) => (
                <article key={`${question.competency}-${index}`} className="rounded-xl border border-[var(--it-hairline)] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--it-faint)]">
                        {L.validates as string}: {question.competency}
                      </p>
                      <p className="mt-3 text-base font-semibold leading-7 text-[var(--it-text)]">{question.question}</p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--it-faint)]">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-4 border-t enterprise-divider pt-4 text-sm leading-6 text-slate-300">
                    <span className="font-semibold text-slate-200">{L.whyItMatters as string}: </span>
                    {question.reason}
                  </p>
                </article>
              ))}
            </div>
          </SectionShell>

          <SectionShell title={L.breakdownTitle as string}>
            <div className="space-y-4">
              {rows.map(({ result, displayName, category, detail, band: resultBand }) => {
                const dimMax = detail?.dimensions?.length ? Math.max(...detail.dimensions.map((d) => d.max ?? d.value), 1) : 1;
                return (
                  <article key={result.id} className="rounded-xl border border-[var(--it-hairline)] p-5">
                    <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-[var(--it-text)]">{displayName}</h3>
                          <Pill className={`${BAND_STYLE[resultBand].bg} ${BAND_STYLE[resultBand].text} ${BAND_STYLE[resultBand].border}`}>
                            {BAND_STYLE[resultBand].label[locale]}
                          </Pill>
                        </div>
                        <p className="mt-1 text-sm text-[var(--it-muted)]">
                          {category} · {(L.completedOn as (date: string) => string)(new Date(result.completed_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short" }))}
                        </p>
                        {detail?.correct && (
                          <p className="mt-3 text-sm text-slate-300">
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
                      <div className="mt-5 border-t enterprise-divider pt-5">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--it-faint)]">{L.dimensions as string}</p>
                        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                          {detail.dimensions.map((dimension) => {
                            const max = dimension.max ?? dimMax;
                            const pct = Math.round((dimension.value / max) * 100);
                            return (
                              <div key={dimension.label}>
                                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                  <span className="truncate text-slate-300">{termDimension(dimension.label, locale)}</span>
                                  <span className="font-semibold text-slate-200">
                                    {dimension.value}
                                    {dimension.max ? `/${dimension.max}` : ""}
                                  </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-900/[0.07]">
                                  <div className="h-full rounded-full bg-[var(--it-primary)]" style={{ width: `${Math.min(pct, 100)}%` }} />
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

          {/* 5 · Methodology and auditability — how this memo was built, and its limits. */}
          <SectionShell
            title={L.auditTitle as string}
            aside={
              <p className="mt-4 text-sm leading-6 text-[var(--it-muted)]">
                {(L.auditTrace as (signals: number, assessments: number) => string)(
                  executiveBrief.source.evidenceSignalIds.length,
                  executiveBrief.source.completedAssessmentCount
                )}
              </p>
            }
          >
            <div className="grid gap-8 lg:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-[var(--it-text)]">{L.confidenceExplanation as string}</p>
                <ul className="mt-4 space-y-3">
                  {[...executiveBrief.confidence.factors, ...executiveBrief.confidence.limitations].map((factor) => (
                    <li key={factor} className="text-sm leading-6 text-slate-300">{factor}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--it-text)]">{L.limitations as string}</p>
                <MarkerList
                  tone="text-slate-300"
                  items={Array.from(new Set([L.roleFitLimit as string, ...executiveBrief.limitations]))}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--it-text)]">{L.evidenceSources as string}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sourceAssessments.map((source) => (
                    <Pill key={source} className="border-[var(--it-hairline)] bg-gray-900/[0.03] text-slate-300">{source}</Pill>
                  ))}
                </div>
                <p className="mt-5 text-sm font-semibold text-[var(--it-text)]">{L.engineVersion as string}</p>
                <p className="mt-2 break-all font-mono text-xs text-[var(--it-muted)]">{executiveBrief.source.engineVersion}</p>
              </div>
            </div>
          </SectionShell>
        </div>
      </div>
    </main>
  );
}
