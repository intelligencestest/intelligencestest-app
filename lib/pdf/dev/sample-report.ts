import fs from "node:fs";
import path from "node:path";
import type { EnterpriseReportData, PdfDirection, PdfLocale, PdfThemeMode } from "../core/types";

export interface PdfPreviewOptions {
  locale?: PdfLocale;
  mode?: PdfThemeMode;
  direction?: PdfDirection;
}

export function parsePdfPreviewOptions(params: URLSearchParams): Required<PdfPreviewOptions> {
  const localeParam = params.get("locale");
  const modeParam = params.get("mode");
  const directionParam = params.get("direction");

  return {
    locale: localeParam === "en" ? "en" : "es",
    mode: modeParam === "dark" ? "dark" : "light",
    direction: directionParam === "rtl" ? "rtl" : "ltr",
  };
}

function previewLogoPath(): string | undefined {
  const localLogo = path.join(process.cwd(), "public", "intelligencestest-email-logo.png");
  if (!fs.existsSync(localLogo)) return undefined;
  const base64 = fs.readFileSync(localLogo).toString("base64");
  return `data:image/png;base64,${base64}`;
}

export function buildPdfPreviewReport(options: PdfPreviewOptions = {}): EnterpriseReportData {
  const locale = options.locale ?? "es";
  const isEnglish = locale === "en";
  const mode = options.mode ?? "light";
  const direction = options.direction ?? "ltr";
  const logoUrl = previewLogoPath();

  return {
    locale,
    direction,
    theme: {
      mode,
      direction,
      brandName: "Intelligences Test",
      footerBrandName: "Powered by Intelligences Test",
      primaryColor: "#1D4ED8",
      accentColor: "#2563EB",
      logoUrl,
    },
    meta: {
      id: "DEV-PDF-001",
      title: isEnglish ? "Candidate Assessment Report" : "Informe de Evaluacion del Candidato",
      subtitle: isEnglish ? "Executive hiring decision document" : "Documento ejecutivo para decisiones de contratacion",
      description: isEnglish
        ? "Development preview for the reusable React PDF reporting system."
        : "Vista de desarrollo para el sistema reutilizable de reportes React PDF.",
      generatedAt: "2026-07-03T10:00:00Z",
      confidentialityLabel: isEnglish ? "Confidential" : "Confidencial",
      keywords: ["react-pdf", "assessment", "candidate report", "development preview"],
      accessibilitySummary: isEnglish
        ? "Structured candidate report with headings, scores, charts, and interview guidance."
        : "Informe estructurado de candidato con secciones, puntuaciones, graficos y guia de entrevista.",
    },
    candidate: {
      id: "dev-candidate-001",
      name: isEnglish ? "Sofia Martinez" : "Sofia Martinez",
      email: "sofia.martinez@example.com",
      role: isEnglish ? "Customer Success Supervisor" : "Supervisora de Atencion al Cliente",
      location: isEnglish ? "Guatemala City" : "Ciudad de Guatemala",
      completedAt: "2026-07-03T09:30:00Z",
    },
    company: {
      name: isEnglish ? "Acme Contact Center" : "Acme Centro de Contacto",
      industry: isEnglish ? "Customer operations" : "Operaciones de atencion al cliente",
      recruiterName: isEnglish ? "Talent Team" : "Equipo de Talento",
      recruiterEmail: "talent@example.com",
    },
    assessments: [
      {
        id: "critical-thinking",
        name: isEnglish ? "Critical Thinking Test" : "Prueba de Pensamiento Critico",
        category: isEnglish ? "Cognitive" : "Cognitivo",
        score: 82,
        confidence: "moderate",
        status: "completed",
        completedAt: "2026-07-03T09:00:00Z",
        dimensions: [
          { label: isEnglish ? "Analysis" : "Analisis", score: 84 },
          { label: isEnglish ? "Inference" : "Inferencia", score: 79 },
          { label: isEnglish ? "Evaluation" : "Evaluacion", score: 83 },
        ],
      },
      {
        id: "aq",
        name: isEnglish ? "Adversity Quotient (AQ) Test" : "Prueba de Cociente de Adversidad (AQ)",
        category: isEnglish ? "Resilience" : "Resiliencia",
        score: 74,
        confidence: "moderate",
        status: "completed",
        completedAt: "2026-07-03T09:30:00Z",
        dimensions: [
          { label: "Control", score: 72 },
          { label: isEnglish ? "Ownership" : "Responsabilidad", score: 78 },
          { label: isEnglish ? "Reach" : "Alcance", score: 70 },
          { label: isEnglish ? "Endurance" : "Duracion", score: 76 },
        ],
      },
      {
        id: "assigned-not-completed",
        name: isEnglish ? "Leadership Styles Test" : "Prueba de Estilos de Liderazgo",
        category: isEnglish ? "Leadership" : "Liderazgo",
        score: 91,
        status: "assigned",
      },
    ],
    executiveSummary: {
      headline: isEnglish
        ? "Solid evidence to continue, with structured interview validation."
        : "Evidencia solida para avanzar, con validacion estructurada en entrevista.",
      summary: isEnglish
        ? "The completed results suggest strong analytical capability and stable response under pressure. The report intentionally excludes assigned or incomplete assessments, so the recommendation is based only on completed evidence."
        : "Los resultados completados sugieren buena capacidad analitica y respuesta estable ante presion. El informe excluye evaluaciones asignadas o incompletas, por lo que la recomendacion se basa solo en evidencia completada.",
      confidence: "moderate",
      evidence: isEnglish
        ? ["Two completed assessments included.", "One assigned but incomplete assessment is intentionally excluded."]
        : ["Se incluyen dos evaluaciones completadas.", "Una evaluacion asignada pero incompleta queda excluida intencionalmente."],
    },
    competencies: [
      {
        id: "critical-thinking",
        label: isEnglish ? "Critical Thinking" : "Pensamiento Critico",
        score: 82,
        description: isEnglish
          ? "Identifies patterns, evaluates evidence, and reaches structured conclusions."
          : "Identifica patrones, evalua evidencia y llega a conclusiones estructuradas.",
        sourceAssessmentIds: ["critical-thinking"],
      },
      {
        id: "resilience",
        label: isEnglish ? "Resilience Under Pressure" : "Resiliencia bajo Presion",
        score: 74,
        description: isEnglish
          ? "Maintains functional performance when constraints, ambiguity, or setbacks appear."
          : "Mantiene desempeno funcional ante restricciones, ambiguedad o contratiempos.",
        sourceAssessmentIds: ["aq"],
      },
      {
        id: "ownership",
        label: isEnglish ? "Ownership" : "Responsabilidad",
        score: 78,
        description: isEnglish
          ? "Shows willingness to act and recover when outcomes are not ideal."
          : "Muestra disposicion para actuar y recuperarse cuando los resultados no son ideales.",
        sourceAssessmentIds: ["aq"],
      },
      {
        id: "decision-quality",
        label: isEnglish ? "Decision Quality" : "Calidad de Decision",
        score: 80,
        description: isEnglish
          ? "Uses available evidence before making a recommendation."
          : "Usa evidencia disponible antes de formular una recomendacion.",
        sourceAssessmentIds: ["critical-thinking"],
      },
    ],
    radarChart: [
      { label: isEnglish ? "Analysis" : "Analisis", value: 84, sourceAssessmentId: "critical-thinking" },
      { label: isEnglish ? "Evaluation" : "Evaluacion", value: 83, sourceAssessmentId: "critical-thinking" },
      { label: isEnglish ? "Control" : "Control", value: 72, sourceAssessmentId: "aq" },
      { label: isEnglish ? "Ownership" : "Responsabilidad", value: 78, sourceAssessmentId: "aq" },
      { label: isEnglish ? "Endurance" : "Duracion", value: 76, sourceAssessmentId: "aq" },
    ],
    barChart: [
      { label: isEnglish ? "Critical Thinking" : "Pensamiento Critico", value: 82, color: "#059669", sourceAssessmentId: "critical-thinking" },
      { label: isEnglish ? "Adversity Quotient" : "Cociente de Adversidad", value: 74, color: "#2563EB", sourceAssessmentId: "aq" },
      { label: isEnglish ? "Assigned Incomplete" : "Asignada Incompleta", value: 91, color: "#DC2626", sourceAssessmentId: "assigned-not-completed" },
    ],
    strengths: isEnglish
      ? [
          "Strong evidence of structured reasoning and clear prioritization.",
          "Stable resilience profile for roles with pressure and operational variability.",
          "Good readiness for interview validation around customer-facing decisions.",
        ]
      : [
          "Evidencia fuerte de razonamiento estructurado y priorizacion clara.",
          "Perfil de resiliencia estable para roles con presion y variabilidad operativa.",
          "Buena preparacion para validar decisiones de atencion al cliente en entrevista.",
        ],
    developmentAreas: isEnglish
      ? [
          "Validate examples of performance during high-volume customer escalations.",
          "Explore how the candidate communicates tradeoffs when speed and quality compete.",
        ]
      : [
          "Validar ejemplos de desempeno durante escalaciones de alto volumen.",
          "Explorar como comunica alternativas cuando velocidad y calidad compiten.",
        ],
    hiringRecommendation: {
      level: "proceed",
      title: isEnglish ? "Proceed with structured validation" : "Avanzar con validacion estructurada",
      rationale: isEnglish
        ? "The recommendation is based only on completed assessment results. The evidence supports continuing the process, while the interview should validate role-specific examples and pressure handling."
        : "La recomendacion se basa solo en evaluaciones completadas. La evidencia respalda continuar el proceso, mientras la entrevista debe validar ejemplos especificos del rol y manejo de presion.",
      confidence: "moderate",
      nextSteps: isEnglish
        ? ["Run a structured interview focused on operational judgment.", "Ask for examples from customer escalation scenarios."]
        : ["Realizar entrevista estructurada enfocada en criterio operativo.", "Solicitar ejemplos de escenarios de escalacion con clientes."],
    },
    interviewQuestions: [
      {
        competency: isEnglish ? "Critical Thinking" : "Pensamiento Critico",
        question: isEnglish
          ? "Tell me about a time you had incomplete information but still needed to make a customer-impacting decision."
          : "Cuénteme sobre una vez en que tuvo informacion incompleta pero debia tomar una decision con impacto en clientes.",
        reason: isEnglish
          ? "Validates evidence gathering, tradeoff judgment, and decision clarity."
          : "Valida busqueda de evidencia, criterio ante alternativas y claridad de decision.",
      },
      {
        competency: isEnglish ? "Resilience" : "Resiliencia",
        question: isEnglish
          ? "Describe a high-pressure situation where your first plan failed. What did you do next?"
          : "Describa una situacion de alta presion donde su primer plan fallo. ¿Que hizo despues?",
        reason: isEnglish
          ? "Validates ownership and recovery behavior."
          : "Valida responsabilidad y conducta de recuperacion.",
      },
    ],
    benchmarkComparison: [
      {
        label: isEnglish ? "Customer operations benchmark" : "Referencia de operaciones de clientes",
        candidateScore: 82,
        benchmarkScore: 75,
        source: isEnglish ? "Mock internal benchmark for development preview" : "Referencia interna simulada para vista de desarrollo",
        note: isEnglish
          ? "Displayed because the benchmark includes a source."
          : "Se muestra porque la referencia incluye fuente.",
      },
      {
        label: isEnglish ? "Unsupported benchmark" : "Referencia sin soporte",
        candidateScore: 99,
        benchmarkScore: 65,
        note: isEnglish
          ? "This should be filtered out because it has no source."
          : "Esto debe filtrarse porque no tiene fuente.",
      },
    ],
  };
}
