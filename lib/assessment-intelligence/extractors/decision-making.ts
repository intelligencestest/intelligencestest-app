import { scoreDM } from "@/lib/questions/decision-making";
import type { DMDimension } from "@/lib/questions/decision-making";
import { buildStructuredChoiceEvidence, type DimensionEvidenceConfig, type StructuredChoiceScore } from "./structured-choice";
import type { AssessmentResultInput, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function scoreFrom(input: AssessmentResultInput): StructuredChoiceScore<DMDimension> {
  if (input.scoreDetails?.type === "decision-making") {
    return input.scoreDetails as StructuredChoiceScore<DMDimension>;
  }

  const answers = answersFrom(input.rawAnswers);
  if (answers) return scoreDM(answers);

  const fallback = Math.max(0, Math.min(100, Math.round(input.score)));
  return {
    correct: 0,
    total: 0,
    percentage: fallback,
    dimensions: {
      Analysis: fallback,
      Judgment: fallback,
      "Risk Assessment": fallback,
      Speed: fallback,
    },
  };
}

const DIMENSIONS: Array<DimensionEvidenceConfig<DMDimension>> = [
  {
    id: "Analysis",
    competencyId: "evidence-analysis",
    label: { en: "Analysis", es: "Analisis" },
    positiveImpact: {
      en: "Supports defining criteria, testing assumptions, and using available information responsibly.",
      es: "Respalda definir criterios, probar supuestos y usar informacion disponible de forma responsable.",
    },
    riskImpact: {
      en: "May miss weak evidence, outdated data, or untested assumptions before deciding.",
      es: "Puede pasar por alto evidencia debil, datos desactualizados o supuestos no probados antes de decidir.",
    },
  },
  {
    id: "Judgment",
    competencyId: "judgment-under-ambiguity",
    label: { en: "Judgment", es: "Juicio" },
    positiveImpact: {
      en: "Supports balanced judgment when tradeoffs, uncertainty, or disagreement are present.",
      es: "Respalda juicio equilibrado cuando existen tradeoffs, incertidumbre o desacuerdo.",
    },
    riskImpact: {
      en: "May over-rely on authority, instinct, or consensus when evidence is ambiguous.",
      es: "Puede depender demasiado de autoridad, intuicion o consenso cuando la evidencia es ambigua.",
    },
  },
  {
    id: "Risk Assessment",
    competencyId: "risk-evaluation",
    label: { en: "Risk assessment", es: "Evaluacion de riesgos" },
    positiveImpact: {
      en: "Supports weighing probability, impact, mitigation, and expected value before action.",
      es: "Respalda ponderar probabilidad, impacto, mitigacion y valor esperado antes de actuar.",
    },
    riskImpact: {
      en: "May underestimate downside, monitoring needs, or mitigation requirements.",
      es: "Puede subestimar consecuencias, necesidades de monitoreo o requisitos de mitigacion.",
    },
  },
  {
    id: "Speed",
    competencyId: "decision-speed-calibration",
    label: { en: "Speed", es: "Velocidad" },
    positiveImpact: {
      en: "Supports matching decision pace to urgency, stakes, and reversibility.",
      es: "Respalda ajustar el ritmo decisorio a urgencia, riesgo y reversibilidad.",
    },
    riskImpact: {
      en: "May either rush high-stakes decisions or over-deliberate reversible choices.",
      es: "Puede apresurar decisiones de alto riesgo o sobreanalizar opciones reversibles.",
    },
  },
];

export function extractDecisionMakingEvidence(input: AssessmentResultInput, locale: IntelligenceLocale) {
  return buildStructuredChoiceEvidence({
    input,
    locale,
    assessmentKey: "decision-making",
    kind: "judgment",
    assessmentLabel: { en: "decision-making judgment", es: "juicio para toma de decisiones" },
    overallCompetencyId: "decision-quality",
    scored: scoreFrom(input),
    dimensions: DIMENSIONS,
    limitation: {
      en: "Decision Making measures structured judgment in assessment scenarios; it does not measure domain expertise, authority level, or full business context.",
      es: "Decision Making mide juicio estructurado en escenarios de evaluacion; no mide expertise del dominio, nivel de autoridad ni contexto completo del negocio.",
    },
  });
}
