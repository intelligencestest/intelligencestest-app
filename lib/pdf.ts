"use client";

import { assessmentName, dimensionLabel } from "@/lib/i18n/assessment-terms";
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
      brandName: "Intelligences Test",
      footerBrandName: "Powered by Intelligences Test",
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
      name: companyName || "Intelligences Test",
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
        locale === "es" ? "No se muestran benchmarks sin fuente validada." : "Benchmarks without a validated source are not shown.",
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
  const rec = recommendation(score, locale);

  await downloadEnterpriseReport({
    ...report,
    competencies: [
      {
        id: "critical-thinking",
        label: locale === "es" ? "Pensamiento critico" : "Critical thinking",
        score,
        description:
          locale === "es"
            ? `${data.correct} de ${data.total} respuestas correctas.`
            : `${data.correct} of ${data.total} correct answers.`,
        sourceAssessmentIds: [data.assessmentName],
      },
    ],
    barChart: [{ label: assessment, value: score, sourceAssessmentId: data.assessmentName }],
    strengths: [data.interpretation],
    developmentAreas: [
      locale === "es"
        ? "Validar el razonamiento con preguntas situacionales relacionadas al rol."
        : "Validate reasoning with role-related situational questions.",
    ],
    hiringRecommendation: {
      ...rec,
      confidence: "low",
      nextSteps: [
        locale === "es"
          ? "Realizar entrevista estructurada enfocada en analisis, inferencia y toma de decisiones."
          : "Run a structured interview focused on analysis, inference, and decision making.",
      ],
    },
    interviewQuestions: [
      {
        competency: locale === "es" ? "Pensamiento critico" : "Critical thinking",
        question:
          locale === "es"
            ? "Cuénteme sobre una decision reciente en la que tuvo que evaluar informacion incompleta."
            : "Tell me about a recent decision where you had to evaluate incomplete information.",
        reason:
          locale === "es"
            ? "Valida si el resultado se traduce en razonamiento observable."
            : "Validates whether the result translates into observable reasoning.",
      },
    ],
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
  const rec = recommendation(normalizedScore, locale);

  const dimensions = [
    { id: "control", label: "control", score: data.control },
    { id: "ownership", label: "ownership", score: data.ownership },
    { id: "reach", label: "reach", score: data.reach },
    { id: "endurance", label: "endurance", score: data.endurance },
  ];

  await downloadEnterpriseReport({
    ...report,
    competencies: dimensions.map((dimension) => ({
      id: dimension.id,
      label: dimensionLabel(dimension.label, locale),
      score: pct(dimension.score, 50),
      description:
        locale === "es"
          ? `Dimension CORE puntuada en ${dimension.score}/50.`
          : `CORE dimension scored at ${dimension.score}/50.`,
      sourceAssessmentIds: [data.assessmentName],
    })),
    radarChart: dimensions.map((dimension) => ({
      label: dimensionLabel(dimension.label, locale),
      value: pct(dimension.score, 50),
      sourceAssessmentId: data.assessmentName,
    })),
    barChart: dimensions.map((dimension) => ({
      label: dimensionLabel(dimension.label, locale),
      value: pct(dimension.score, 50),
      sourceAssessmentId: data.assessmentName,
    })),
    strengths: [data.interpretation],
    developmentAreas: [data.description],
    hiringRecommendation: {
      ...rec,
      confidence: "low",
      nextSteps: [
        locale === "es"
          ? "Validar con ejemplos concretos de presion, contratiempos y recuperacion."
          : "Validate with concrete examples of pressure, setbacks, and recovery.",
      ],
    },
    interviewQuestions: [
      {
        competency: locale === "es" ? "Resiliencia" : "Resilience",
        question:
          locale === "es"
            ? "Describa una situacion en la que un plan fallo y tuvo que recuperarse rapidamente."
            : "Describe a situation where a plan failed and you had to recover quickly.",
        reason:
          locale === "es"
            ? "Valida responsabilidad, control y recuperacion ante adversidad."
            : "Validates ownership, control, and recovery under adversity.",
      },
    ],
  });
}
