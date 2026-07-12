"use client";

import { assessmentName, assessmentShort, categoryLabel } from "@/lib/i18n/assessment-terms";
import { buildAssessmentIntelligence, type AssessmentScoreDetails } from "@/lib/assessment-intelligence";
import { downloadEnterpriseReport } from "@/lib/pdf/download";
import type { EnterpriseReportData } from "@/lib/pdf/core/types";

export interface AssessmentScore {
  id?: string;
  assessmentId?: string;
  name: string;
  score: number;
  completedAt: string;
  category?: string;
  rawAnswers?: unknown;
  scoreDetails?: AssessmentScoreDetails;
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
    competencyDescription: (name: string) => `Evidencia disponible a partir de ${name}.`,
  },
  en: {
    title: "Executive Assessment Report",
    subtitle: "Executive hiring decision document",
    overallScore: "Average of completed assessments",
    unknownCompany: "Company",
    unknownProject: "Assessment Project",
    competencyDescription: (name: string) => `Available evidence from ${name}.`,
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

export function toEnterpriseReportData(data: ComprehensiveReportData): EnterpriseReportData {
  const locale = localeOf(data);
  const copy = COPY[locale];
  const assessments = normalizeAssessments(data.assessments);
  const intelligence = buildAssessmentIntelligence({ assessments, locale });
  const average = assessments.length ? clampScore(assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length) : 0;
  const candidateName = data.candidateName.trim() || (locale === "es" ? "Candidato" : "Candidate");
  const companyName = data.companyName.trim() || copy.unknownCompany;
  const projectName = data.projectName.trim() || copy.unknownProject;

  const completedAssessments = assessments.map((assessment) => {
    const sourceId = assessment.assessmentId ?? assessment.id ?? assessment.name;
    const sourceSignals = intelligence.evidenceSignals.filter((signal) => signal.assessmentId === sourceId);
    return {
      id: sourceId,
      name: displayName(assessment.name, locale),
      category: assessment.category ? categoryLabel(assessment.category, locale) : categoryFor(assessment.name, locale),
      score: assessment.score,
      completedAt: assessment.completedAt,
      confidence: intelligence.confidence.level,
      status: "completed" as const,
      dimensions: sourceSignals
        .filter((signal) => signal.dimensionId)
        .map((signal) => ({
          id: signal.dimensionId,
          label: signal.dimensionLabel ?? signal.competencyLabel,
          score: signal.normalizedScore,
          maxScore: 100,
          description: signal.statement,
        })),
    };
  });

  const competencies = intelligence.competencyEvidence.map((competency) => ({
    id: competency.competencyId,
    label: competency.label,
    score: competency.score,
    category: competency.category,
    description: competency.summary,
    evidence: competency.evidenceSignalIds.join(", "),
    sourceAssessmentIds: competency.evidenceSignalIds,
  }));

  return {
    locale,
    theme: {
      mode: "light",
      brandName: "IntelligencesTest",
      footerBrandName: "Powered by IntelligencesTest",
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
      headline: intelligence.executiveSummary.headline,
      summary: intelligence.executiveSummary.summary,
      confidence: intelligence.confidence.level,
      evidence: intelligence.executiveSummary.evidence,
    },
    competencies,
    radarChart: competencies.slice(0, 8).map((competency) => ({
      label: competency.label,
      value: competency.score,
      sourceAssessmentId: competency.sourceAssessmentIds?.[0],
    })),
    barChart: competencies.slice(0, 8).map((competency) => ({
      label: competency.label,
      value: competency.score,
      sourceAssessmentId: competency.sourceAssessmentIds?.[0],
    })),
    strengths: intelligence.strengths.length ? intelligence.strengths : intelligence.executiveSummary.evidence.slice(0, 2),
    developmentAreas: intelligence.developmentAreas.length ? intelligence.developmentAreas : intelligence.methodologyLimitations.slice(0, 3),
    hiringRecommendation: intelligence.recommendation,
    interviewQuestions: intelligence.interviewQuestions,
  };
}

export async function downloadComprehensiveReport(data: ComprehensiveReportData): Promise<void> {
  await downloadEnterpriseReport(toEnterpriseReportData(data));
}
