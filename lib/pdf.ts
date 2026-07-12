"use client";

import { assessmentName, dimensionLabel } from "@/lib/i18n/assessment-terms";
import { buildAssessmentIntelligence } from "@/lib/assessment-intelligence";
import { downloadEnterpriseReport } from "@/lib/pdf/download";
import type { EnterpriseReportData } from "@/lib/pdf/core/types";

export interface CTPDFData {
  candidateName: string;
  assessmentName: string;
  date: string;
  score: number;
  correct: number;
  total: number;
  interpretation: string;
  companyName?: string;
  candidateEmail?: string;
  locale?: "en" | "es";
}

export interface AQPDFData {
  candidateName: string;
  assessmentName: string;
  date: string;
  score: number;
  control: number;
  ownership: number;
  reach: number;
  endurance: number;
  interpretation: string;
  description: string;
  companyName?: string;
  candidateEmail?: string;
  locale?: "en" | "es";
}

type Locale = "en" | "es";

function clampScore(score: number, max = 100): number {
  return Math.max(0, Math.min(max, Math.round(score)));
}

function pct(score: number, max: number): number {
  return clampScore((score / max) * 100);
}

function baseReport({
  candidateName,
  candidateEmail,
  companyName,
  assessmentName,
  assessmentId,
  date,
  score,
  maxScore = 100,
  locale = "es",
}: {
  candidateName: string;
  candidateEmail?: string;
  companyName?: string;
  assessmentName: string;
  assessmentId?: string;
  date: string;
  score: number;
  maxScore?: number;
  locale?: Locale;
}): EnterpriseReportData {
  const displayName = assessmentName || (locale === "es" ? "Evaluacion" : "Assessment");
  const sourceId = assessmentId ?? displayName;

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
      id: `RPT-${Date.now().toString(36).toUpperCase()}`,
      title: locale === "es" ? "Informe ejecutivo de evaluacion" : "Executive Assessment Report",
      subtitle: locale === "es" ? "Documento ejecutivo para decisiones de contratacion" : "Executive hiring decision document",
      generatedAt: new Date().toISOString(),
      confidentialityLabel: locale === "es" ? "Confidencial" : "Confidential",
    },
    candidate: {
      name: candidateName || (locale === "es" ? "Candidato" : "Candidate"),
      email: candidateEmail,
      role: displayName,
      completedAt: date,
    },
    company: {
      name: companyName || "IntelligencesTest",
    },
    assessments: [
      {
        id: sourceId,
        name: displayName,
        category: locale === "es" ? "Evaluacion" : "Assessment",
        score,
        maxScore,
        completedAt: date,
        confidence: "low",
        status: "completed",
      },
    ],
    overallScore: maxScore === 100 ? score : pct(score, maxScore),
    overallScoreLabel: locale === "es" ? "Resultado de la evaluacion completada" : "Completed assessment result",
    executiveSummary: {
      headline:
        locale === "es"
          ? `Resultado ${score}/${maxScore} en ${assessmentName}.`
          : `Score ${score}/${maxScore} on ${assessmentName}.`,
      summary:
        locale === "es"
          ? "Este informe se basa en una sola evaluacion completada. La recomendacion debe validarse con entrevista estructurada y evidencia adicional del proceso."
          : "This report is based on one completed assessment. The recommendation should be validated with a structured interview and additional process evidence.",
      confidence: "low",
      evidence: [
        locale === "es" ? "Solo se incluye la evaluacion completada." : "Only the completed assessment is included.",
      ],
    },
  };
}

function recommendation(score: number, locale: Locale) {
  if (score >= 80) {
    return {
      level: "proceed" as const,
      title: locale === "es" ? "Avanzar con validacion estructurada" : "Proceed with structured validation",
      rationale:
        locale === "es"
          ? "El resultado individual es favorable, pero debe confirmarse con ejemplos conductuales y ajuste al rol."
          : "The individual result is favorable, but should be confirmed with behavioral examples and role fit.",
    };
  }

  if (score >= 60) {
    return {
      level: "review" as const,
      title: locale === "es" ? "Revisar con evidencia adicional" : "Review with additional evidence",
      rationale:
        locale === "es"
          ? "El resultado muestra una base funcional. La entrevista debe explorar consistencia y aplicacion practica."
          : "The result shows a functional baseline. The interview should explore consistency and practical application.",
    };
  }

  return {
    level: "caution" as const,
    title: locale === "es" ? "No avanzar sin validacion adicional" : "Do not advance without additional validation",
    rationale:
      locale === "es"
        ? "El resultado requiere exploracion antes de tomar una decision positiva."
        : "The result requires exploration before making a positive decision.",
  };
}

export async function downloadCTPDF(data: CTPDFData): Promise<void> {
  const locale = data.locale ?? "es";
  const assessment = assessmentName(data.assessmentName, locale);
  const score = clampScore(data.score);
  const report = baseReport({
    candidateName: data.candidateName,
    candidateEmail: data.candidateEmail,
    companyName: data.companyName,
    assessmentName: assessment,
    assessmentId: data.assessmentName,
    date: data.date,
    score,
    locale,
  });
  const intelligence = buildAssessmentIntelligence({
    locale,
    assessments: [
      {
        name: data.assessmentName,
        score,
        completedAt: data.date,
        scoreDetails: {
          type: "critical-thinking",
          correct: data.correct,
          total: data.total,
          percentage: score,
          interpretation: data.interpretation,
        },
      },
    ],
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

  await downloadEnterpriseReport({
    ...report,
    executiveSummary: {
      headline: intelligence.executiveSummary.headline,
      summary: intelligence.executiveSummary.summary,
      confidence: intelligence.confidence.level,
      evidence: intelligence.executiveSummary.evidence,
    },
    competencies,
    barChart: competencies.map((competency) => ({ label: competency.label, value: competency.score, sourceAssessmentId: competency.sourceAssessmentIds?.[0] })),
    strengths: intelligence.strengths,
    developmentAreas: intelligence.developmentAreas,
    hiringRecommendation: intelligence.recommendation,
    interviewQuestions: intelligence.interviewQuestions,
  });
}

export async function downloadAQPDF(data: AQPDFData): Promise<void> {
  const locale = data.locale ?? "es";
  const assessment = assessmentName(data.assessmentName, locale);
  const normalizedScore = pct(data.score, 200);
  const report = baseReport({
    candidateName: data.candidateName,
    candidateEmail: data.candidateEmail,
    companyName: data.companyName,
    assessmentName: assessment,
    assessmentId: data.assessmentName,
    date: data.date,
    score: clampScore(data.score, 200),
    maxScore: 200,
    locale,
  });

  const dimensions = [
    { id: "control", label: "control", score: data.control },
    { id: "ownership", label: "ownership", score: data.ownership },
    { id: "reach", label: "reach", score: data.reach },
    { id: "endurance", label: "endurance", score: data.endurance },
  ];
  const intelligence = buildAssessmentIntelligence({
    locale,
    assessments: [
      {
        name: data.assessmentName,
        score: normalizedScore,
        completedAt: data.date,
        scoreDetails: {
          type: "aq",
          total: data.score,
          control: data.control,
          ownership: data.ownership,
          reach: data.reach,
          endurance: data.endurance,
          interpretation: data.interpretation,
          description: data.description,
        },
      },
    ],
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

  await downloadEnterpriseReport({
    ...report,
    executiveSummary: {
      headline: intelligence.executiveSummary.headline,
      summary: intelligence.executiveSummary.summary,
      confidence: intelligence.confidence.level,
      evidence: intelligence.executiveSummary.evidence,
    },
    competencies,
    radarChart: dimensions.map((dimension) => ({
      label: dimensionLabel(dimension.label, locale),
      value: pct(dimension.score, 50),
      sourceAssessmentId: data.assessmentName,
    })),
    barChart: competencies.map((competency) => ({ label: competency.label, value: competency.score, sourceAssessmentId: competency.sourceAssessmentIds?.[0] })),
    strengths: intelligence.strengths,
    developmentAreas: intelligence.developmentAreas,
    hiringRecommendation: intelligence.recommendation,
    interviewQuestions: intelligence.interviewQuestions,
  });
}
