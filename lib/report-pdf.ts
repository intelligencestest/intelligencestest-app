"use client";

import { assessmentName, assessmentShort, categoryLabel } from "@/lib/i18n/assessment-terms";
import { downloadEnterpriseReport } from "@/lib/pdf/download";
import type { ConfidenceLevel, EnterpriseReportData, HiringRecommendationContent } from "@/lib/pdf/core/types";

export interface AssessmentScore {
  name: string;
  score: number;
  completedAt: string;
}

export interface ComprehensiveReportData {
  candidateName: string;
  candidateEmail: string;
  companyName: string;
  projectName: string;
  reportDate: string;
  reportId: string;
  assessments: AssessmentScore[];
  locale?: "en" | "es";
}

type Locale = "en" | "es";

const CATEGORY_BY_ASSESSMENT: Record<string, string> = {
  "Critical Thinking Test": "Cognitive",
  "Adversity Quotient (AQ) Test": "Resilience",
  "Emotional Intelligence Test": "Emotional Intelligence",
  "Leadership Styles Test": "Leadership",
  "Numerical Intelligence Test": "Numerical Reasoning",
  "Attention to Detail Test": "Cognitive",
  "Verbal Reasoning Test": "Cognitive",
  "Abstract Reasoning Test": "Cognitive",
  "Mechanical Reasoning Test": "Technical",
  "Communication Skills Test": "Communication",
  "Problem Solving Test": "Cognitive",
  "Work Style Assessment": "Productivity",
  "Sales Aptitude Test": "Sales",
  "Customer Service Skills Test": "Customer Service",
  "Teamwork & Collaboration Test": "Teamwork",
  "Time Management Test": "Productivity",
  "Stress Tolerance Test": "Resilience",
  "Integrity & Ethics Test": "Character",
  "Decision Making Test": "Judgment",
  "Learning Agility Test": "Cognitive",
  "Personality Type Test": "Personality",
  "Situational Judgment Test": "Workplace Judgment",
};

const COPY = {
  es: {
    title: "Informe ejecutivo de evaluacion",
    subtitle: "Documento ejecutivo para decisiones de contratacion",
    overallScore: "Promedio de evaluaciones completadas",
    unknownCompany: "Empresa",
    unknownProject: "Proyecto de evaluacion",
    lowConfidence: "La conclusion debe revisarse con cautela porque se basa en una sola evaluacion completada.",
    proceedTitle: "Avanzar con entrevista estructurada",
    strongTitle: "Avanzar con alta prioridad",
    reviewTitle: "Revisar con validacion adicional",
    cautionTitle: "No avanzar sin evidencia adicional",
    summaryHeadline: (avg: number) => `Promedio general ${avg}/100 basado solo en evaluaciones completadas.`,
    summaryBody: (count: number) =>
      `Este informe incluye ${count} evaluacion${count === 1 ? "" : "es"} completada${count === 1 ? "" : "s"} para apoyar una decision de seleccion. No se incluyen evaluaciones asignadas, incompletas o no relacionadas.`,
    evidenceCount: (count: number) => `${count} resultado${count === 1 ? "" : "s"} completado${count === 1 ? "" : "s"} incluido${count === 1 ? "" : "s"}.`,
    noFabricatedBenchmarks: "No se muestran benchmarks sin fuente validada.",
    highStrength: (name: string, score: number) => `${name}: evidencia favorable (${score}/100).`,
    midStrength: (name: string, score: number) => `${name}: base funcional para validar en entrevista (${score}/100).`,
    lowDevelopment: (name: string, score: number) => `${name}: requiere exploracion especifica en entrevista (${score}/100).`,
    defaultDevelopment: "Validar con ejemplos conductuales recientes antes de tomar una decision final.",
    competencyDescription: (name: string) => `Evidencia disponible a partir de ${name}.`,
    question: (name: string) => `Cuénteme sobre una situacion reciente donde demostro ${name.toLowerCase()} en un contexto de trabajo.`,
    questionReason: "Busca validar que la puntuacion se traduzca en conducta laboral observable.",
    rationaleStrong: "La evidencia completada muestra un perfil solido. La recomendacion sigue dependiendo de entrevista estructurada, referencias y ajuste al rol.",
    rationaleProceed: "La evidencia completada respalda continuar el proceso, con validacion dirigida en entrevista.",
    rationaleReview: "La evidencia es mixta. Conviene profundizar en ejemplos concretos antes de avanzar.",
    rationaleCaution: "La evidencia completada no es suficiente para recomendar avance sin informacion adicional.",
  },
  en: {
    title: "Executive Assessment Report",
    subtitle: "Executive hiring decision document",
    overallScore: "Average of completed assessments",
    unknownCompany: "Company",
    unknownProject: "Assessment Project",
    lowConfidence: "The conclusion should be reviewed carefully because it is based on one completed assessment.",
    proceedTitle: "Proceed with structured interview",
    strongTitle: "Proceed with high priority",
    reviewTitle: "Review with additional validation",
    cautionTitle: "Do not advance without more evidence",
    summaryHeadline: (avg: number) => `Overall average ${avg}/100 based only on completed assessments.`,
    summaryBody: (count: number) =>
      `This report includes ${count} completed assessment${count === 1 ? "" : "s"} to support a hiring decision. Assigned, incomplete, or unrelated assessments are not included.`,
    evidenceCount: (count: number) => `${count} completed result${count === 1 ? "" : "s"} included.`,
    noFabricatedBenchmarks: "Benchmarks without a validated source are not shown.",
    highStrength: (name: string, score: number) => `${name}: favorable evidence (${score}/100).`,
    midStrength: (name: string, score: number) => `${name}: functional baseline to validate in interview (${score}/100).`,
    lowDevelopment: (name: string, score: number) => `${name}: requires targeted interview exploration (${score}/100).`,
    defaultDevelopment: "Validate with recent behavioral examples before making a final decision.",
    competencyDescription: (name: string) => `Available evidence from ${name}.`,
    question: (name: string) => `Tell me about a recent work situation where you demonstrated ${name.toLowerCase()}.`,
    questionReason: "Validates whether the score translates into observable workplace behavior.",
    rationaleStrong: "The completed evidence shows a strong profile. The recommendation still depends on structured interview, references, and role fit.",
    rationaleProceed: "The completed evidence supports continuing the process, with targeted interview validation.",
    rationaleReview: "The evidence is mixed. Concrete examples should be reviewed before advancing.",
    rationaleCaution: "The completed evidence is not strong enough to recommend advancement without additional information.",
  },
} satisfies Record<Locale, Record<string, unknown>>;

function localeOf(data: ComprehensiveReportData): Locale {
  return data.locale === "en" ? "en" : "es";
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeAssessments(assessments: AssessmentScore[]): AssessmentScore[] {
  const seen = new Set<string>();
  return assessments
    .filter((assessment) => assessment.name && Number.isFinite(assessment.score))
    .map((assessment) => ({ ...assessment, score: clampScore(assessment.score) }))
    .filter((assessment) => {
      const key = `${assessment.name}:${assessment.completedAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function categoryFor(name: string, locale: Locale): string {
  const category = CATEGORY_BY_ASSESSMENT[name] ?? "Cognitive";
  return categoryLabel(category, locale);
}

function displayName(name: string, locale: Locale): string {
  return assessmentName(name, locale);
}

function shortName(name: string, locale: Locale): string {
  return assessmentShort(name, name.replace(" Test", "").replace(" Assessment", ""), locale);
}

function confidenceFor(count: number): ConfidenceLevel {
  if (count >= 4) return "high";
  if (count >= 2) return "moderate";
  return "low";
}

function recommendationFor(avg: number, count: number, locale: Locale): HiringRecommendationContent {
  const copy = COPY[locale];
  const lowConfidenceNote = count === 1 ? ` ${copy.lowConfidence}` : "";

  if (avg >= 85) {
    return {
      level: "strong",
      title: copy.strongTitle,
      rationale: `${copy.rationaleStrong}${lowConfidenceNote}`,
      confidence: confidenceFor(count),
      nextSteps: [copy.defaultDevelopment],
    };
  }

  if (avg >= 70) {
    return {
      level: "proceed",
      title: copy.proceedTitle,
      rationale: `${copy.rationaleProceed}${lowConfidenceNote}`,
      confidence: confidenceFor(count),
      nextSteps: [copy.defaultDevelopment],
    };
  }

  if (avg >= 55) {
    return {
      level: "review",
      title: copy.reviewTitle,
      rationale: `${copy.rationaleReview}${lowConfidenceNote}`,
      confidence: confidenceFor(count),
      nextSteps: [copy.defaultDevelopment],
    };
  }

  return {
    level: "caution",
    title: copy.cautionTitle,
    rationale: `${copy.rationaleCaution}${lowConfidenceNote}`,
    confidence: confidenceFor(count),
    nextSteps: [copy.defaultDevelopment],
  };
}

export function toEnterpriseReportData(data: ComprehensiveReportData): EnterpriseReportData {
  const locale = localeOf(data);
  const copy = COPY[locale];
  const assessments = normalizeAssessments(data.assessments);
  const average = assessments.length ? clampScore(assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length) : 0;
  const candidateName = data.candidateName.trim() || (locale === "es" ? "Candidato" : "Candidate");
  const companyName = data.companyName.trim() || copy.unknownCompany;
  const projectName = data.projectName.trim() || copy.unknownProject;

  const completedAssessments = assessments.map((assessment) => ({
    id: assessment.name,
    name: displayName(assessment.name, locale),
    category: categoryFor(assessment.name, locale),
    score: assessment.score,
    completedAt: assessment.completedAt,
    confidence: confidenceFor(assessments.length),
    status: "completed" as const,
  }));

  const competencies = assessments.map((assessment) => ({
    id: assessment.name,
    label: shortName(assessment.name, locale),
    score: assessment.score,
    category: categoryFor(assessment.name, locale),
    description: copy.competencyDescription(displayName(assessment.name, locale)),
    sourceAssessmentIds: [assessment.name],
  }));

  const strengths = assessments
    .filter((assessment) => assessment.score >= 65)
    .slice(0, 4)
    .map((assessment) =>
      assessment.score >= 80
        ? copy.highStrength(shortName(assessment.name, locale), assessment.score)
        : copy.midStrength(shortName(assessment.name, locale), assessment.score),
    );

  const developmentAreas = assessments
    .filter((assessment) => assessment.score < 70)
    .slice(0, 4)
    .map((assessment) => copy.lowDevelopment(shortName(assessment.name, locale), assessment.score));

  return {
    locale,
    theme: {
      mode: "light",
      brandName: "Intelligences Test",
      footerBrandName: "Powered by Intelligences Test",
      primaryColor: "#1D4ED8",
      accentColor: "#2563EB",
    },
    meta: {
      id: data.reportId,
      title: copy.title,
      subtitle: copy.subtitle,
      generatedAt: new Date().toISOString(),
      confidentialityLabel: locale === "es" ? "Confidencial" : "Confidential",
    },
    candidate: {
      name: candidateName,
      email: data.candidateEmail,
      role: projectName,
      completedAt: assessments.at(-1)?.completedAt,
    },
    company: {
      name: companyName,
    },
    assessments: completedAssessments,
    overallScore: average,
    overallScoreLabel: copy.overallScore,
    executiveSummary: {
      headline: copy.summaryHeadline(average),
      summary: copy.summaryBody(assessments.length),
      confidence: confidenceFor(assessments.length),
      evidence: [copy.evidenceCount(assessments.length), copy.noFabricatedBenchmarks],
    },
    competencies,
    radarChart: assessments.slice(0, 8).map((assessment) => ({
      label: shortName(assessment.name, locale),
      value: assessment.score,
      sourceAssessmentId: assessment.name,
    })),
    barChart: assessments.slice(0, 8).map((assessment) => ({
      label: shortName(assessment.name, locale),
      value: assessment.score,
      sourceAssessmentId: assessment.name,
    })),
    strengths: strengths.length ? strengths : [copy.midStrength(candidateName, average)],
    developmentAreas: developmentAreas.length ? developmentAreas : [copy.defaultDevelopment],
    hiringRecommendation: recommendationFor(average, assessments.length, locale),
    interviewQuestions: assessments.slice(0, 4).map((assessment) => ({
      competency: shortName(assessment.name, locale),
      question: copy.question(shortName(assessment.name, locale)),
      reason: copy.questionReason,
    })),
  };
}

export async function downloadComprehensiveReport(data: ComprehensiveReportData): Promise<void> {
  await downloadEnterpriseReport(toEnterpriseReportData(data));
}
