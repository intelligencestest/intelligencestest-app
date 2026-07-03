import type { PdfDirection, PdfLocale } from "./types";

export interface PdfMessages {
  coverTitle: string;
  coverSubtitle: string;
  confidential: string;
  generated: string;
  candidate: string;
  company: string;
  role: string;
  email: string;
  completed: string;
  recruiter: string;
  executiveSummary: string;
  overallScore: string;
  completedAssessments: string;
  competencyScores: string;
  radarChart: string;
  barChart: string;
  strengths: string;
  developmentAreas: string;
  hiringRecommendation: string;
  interviewQuestions: string;
  benchmarkComparison: string;
  score: string;
  confidence: string;
  highConfidence: string;
  moderateConfidence: string;
  lowConfidence: string;
  noBenchmark: string;
  page: string;
  of: string;
}

const messages: Record<PdfLocale, PdfMessages> = {
  en: {
    coverTitle: "Candidate Assessment Report",
    coverSubtitle: "Executive hiring decision document",
    confidential: "Confidential",
    generated: "Generated",
    candidate: "Candidate",
    company: "Company",
    role: "Role",
    email: "Email",
    completed: "Completed",
    recruiter: "Recruiter",
    executiveSummary: "Executive Summary",
    overallScore: "Overall Score",
    completedAssessments: "Completed Assessments",
    competencyScores: "Competency Scores",
    radarChart: "Competency Radar",
    barChart: "Score Distribution",
    strengths: "Strengths",
    developmentAreas: "Development Areas",
    hiringRecommendation: "Hiring Recommendation",
    interviewQuestions: "Interview Questions",
    benchmarkComparison: "Benchmark Comparison",
    score: "Score",
    confidence: "Confidence",
    highConfidence: "High",
    moderateConfidence: "Moderate",
    lowConfidence: "Low",
    noBenchmark: "Benchmark data not available",
    page: "Page",
    of: "of",
  },
  es: {
    coverTitle: "Informe de Evaluacion del Candidato",
    coverSubtitle: "Documento ejecutivo para decisiones de contratacion",
    confidential: "Confidencial",
    generated: "Generado",
    candidate: "Candidato",
    company: "Empresa",
    role: "Rol",
    email: "Correo",
    completed: "Completado",
    recruiter: "Reclutador",
    executiveSummary: "Resumen Ejecutivo",
    overallScore: "Puntuacion General",
    completedAssessments: "Evaluaciones Completadas",
    competencyScores: "Puntuaciones por Competencia",
    radarChart: "Radar de Competencias",
    barChart: "Distribucion de Puntuaciones",
    strengths: "Fortalezas",
    developmentAreas: "Areas de Desarrollo",
    hiringRecommendation: "Recomendacion de Contratacion",
    interviewQuestions: "Preguntas de Entrevista",
    benchmarkComparison: "Comparacion con Referencia",
    score: "Puntuacion",
    confidence: "Confianza",
    highConfidence: "Alta",
    moderateConfidence: "Moderada",
    lowConfidence: "Baja",
    noBenchmark: "Datos de referencia no disponibles",
    page: "Pagina",
    of: "de",
  },
};

export function getPdfMessages(locale: PdfLocale = "es"): PdfMessages {
  return messages[locale] ?? messages.es;
}

export function getPdfDirection(locale: PdfLocale = "es", direction?: PdfDirection): PdfDirection {
  if (direction) return direction;
  return locale === "en" || locale === "es" ? "ltr" : "ltr";
}
