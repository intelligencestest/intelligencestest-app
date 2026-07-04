import { scoreSA } from "@/lib/questions/sales-aptitude";
import type { SADimension } from "@/lib/questions/sales-aptitude";
import { buildStructuredChoiceEvidence, type DimensionEvidenceConfig, type StructuredChoiceScore } from "./structured-choice";
import type { AssessmentResultInput, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function scoreFrom(input: AssessmentResultInput): StructuredChoiceScore<SADimension> {
  if (input.scoreDetails?.type === "sales-aptitude") {
    return input.scoreDetails as StructuredChoiceScore<SADimension>;
  }

  const answers = answersFrom(input.rawAnswers);
  if (answers) return scoreSA(answers);

  const fallback = Math.max(0, Math.min(100, Math.round(input.score)));
  return {
    correct: 0,
    total: 0,
    percentage: fallback,
    dimensions: {
      Prospecting: fallback,
      Persuasion: fallback,
      "Objection Handling": fallback,
      Closing: fallback,
    },
  };
}

const DIMENSIONS: Array<DimensionEvidenceConfig<SADimension>> = [
  {
    id: "Prospecting",
    competencyId: "prospecting-discipline",
    label: { en: "Prospecting", es: "Prospeccion" },
    positiveImpact: {
      en: "Supports targeted pipeline creation through research, qualification, and disciplined outreach.",
      es: "Respalda crear pipeline objetivo mediante investigacion, calificacion y alcance disciplinado.",
    },
    riskImpact: {
      en: "May rely on low-quality outreach or weak qualification, reducing pipeline efficiency.",
      es: "Puede depender de alcance de baja calidad o calificacion debil, reduciendo eficiencia del pipeline.",
    },
  },
  {
    id: "Persuasion",
    competencyId: "consultative-selling",
    label: { en: "Persuasion", es: "Persuasion" },
    positiveImpact: {
      en: "Supports consultative value communication tied to buyer goals and evidence.",
      es: "Respalda comunicacion consultiva de valor conectada a objetivos y evidencia del comprador.",
    },
    riskImpact: {
      en: "May default to generic pitching instead of connecting value to the buyer's situation.",
      es: "Puede caer en discurso generico en vez de conectar valor con la situacion del comprador.",
    },
  },
  {
    id: "Objection Handling",
    competencyId: "objection-handling",
    label: { en: "Objection handling", es: "Manejo de objeciones" },
    positiveImpact: {
      en: "Supports exploring resistance, clarifying value, and keeping conversations constructive.",
      es: "Respalda explorar resistencia, aclarar valor y mantener conversaciones constructivas.",
    },
    riskImpact: {
      en: "May discount, defend, or disengage before understanding the buyer's real concern.",
      es: "Puede descontar, defenderse o retirarse antes de entender la preocupacion real del comprador.",
    },
  },
  {
    id: "Closing",
    competencyId: "deal-advancement",
    label: { en: "Closing", es: "Cierre" },
    positiveImpact: {
      en: "Supports clear next steps, ethical urgency, and practical deal advancement.",
      es: "Respalda pasos claros, urgencia etica y avance practico de oportunidades.",
    },
    riskImpact: {
      en: "May allow deals to stall or use pressure tactics that weaken buyer trust.",
      es: "Puede permitir que oportunidades se estanquen o usar presion que debilite confianza del comprador.",
    },
  },
];

export function extractSalesAptitudeEvidence(input: AssessmentResultInput, locale: IntelligenceLocale) {
  return buildStructuredChoiceEvidence({
    input,
    locale,
    assessmentKey: "sales-aptitude",
    kind: "sales",
    assessmentLabel: { en: "sales aptitude", es: "aptitud comercial" },
    overallCompetencyId: "consultative-selling",
    scored: scoreFrom(input),
    dimensions: DIMENSIONS,
    limitation: {
      en: "Sales Aptitude measures sales judgment in structured scenarios; it does not measure territory knowledge, quota history, network strength, or product expertise.",
      es: "Sales Aptitude mide juicio comercial en escenarios estructurados; no mide conocimiento de territorio, historial de cuota, red de contactos ni expertise de producto.",
    },
  });
}
