import { scoreCServ } from "@/lib/questions/customer-service-skills";
import type { CServDimension } from "@/lib/questions/customer-service-skills";
import { buildStructuredChoiceEvidence, type DimensionEvidenceConfig, type StructuredChoiceScore } from "./structured-choice";
import type { AssessmentResultInput, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function scoreFrom(input: AssessmentResultInput): StructuredChoiceScore<CServDimension> {
  if (input.scoreDetails?.type === "customer-service") {
    return input.scoreDetails as StructuredChoiceScore<CServDimension>;
  }

  const answers = answersFrom(input.rawAnswers);
  if (answers) return scoreCServ(answers);

  const fallback = Math.max(0, Math.min(100, Math.round(input.score)));
  return {
    correct: 0,
    total: 0,
    percentage: fallback,
    dimensions: {
      Empathy: fallback,
      "Problem Resolution": fallback,
      Communication: fallback,
      Patience: fallback,
    },
  };
}

const DIMENSIONS: Array<DimensionEvidenceConfig<CServDimension>> = [
  {
    id: "Empathy",
    competencyId: "customer-empathy",
    label: { en: "Empathy", es: "Empatia", fr: "Empathie" },
    positiveImpact: {
      en: "Supports trust-building in emotionally charged customer interactions.",
      es: "Respalda construir confianza en interacciones con carga emocional.",
      fr: "Favorise la création de confiance dans les échanges clients chargés émotionnellement.",
    },
    riskImpact: {
      en: "May struggle to acknowledge customer emotion before moving into resolution.",
      es: "Puede costarle reconocer la emocion del cliente antes de pasar a la solucion.",
      fr: "Peut rendre plus difficile la reconnaissance de l'émotion du client avant de passer à la résolution.",
    },
  },
  {
    id: "Problem Resolution",
    competencyId: "customer-issue-resolution",
    label: { en: "Problem resolution", es: "Resolucion de incidencias", fr: "Résolution des problèmes clients" },
    positiveImpact: {
      en: "Supports diagnosing issues, coordinating internally, and closing the loop with customers.",
      es: "Respalda diagnosticar incidencias, coordinar internamente y cerrar el ciclo con clientes.",
      fr: "Favorise le diagnostic des problèmes, la coordination interne et le suivi jusqu'à leur résolution avec les clients.",
    },
    riskImpact: {
      en: "May resolve symptoms without fully diagnosing customer needs or root causes.",
      es: "Puede resolver sintomas sin diagnosticar plenamente necesidades del cliente o causas raiz.",
      fr: "Peut conduire à traiter les symptômes sans diagnostiquer pleinement les besoins du client ou les causes profondes.",
    },
  },
  {
    id: "Communication",
    competencyId: "customer-communication",
    label: { en: "Communication", es: "Comunicacion", fr: "Communication" },
    positiveImpact: {
      en: "Supports clear explanations, expectation-setting, and appropriate tone across channels.",
      es: "Respalda explicaciones claras, manejo de expectativas y tono apropiado en distintos canales.",
      fr: "Favorise des explications claires, une bonne gestion des attentes et un ton adapté sur les différents canaux.",
    },
    riskImpact: {
      en: "May create customer confusion through unclear updates or poorly calibrated tone.",
      es: "Puede generar confusion en clientes por actualizaciones poco claras o tono mal calibrado.",
      fr: "Peut créer de la confusion chez les clients par des mises à jour peu claires ou un ton mal adapté.",
    },
  },
  {
    id: "Patience",
    competencyId: "service-composure",
    label: { en: "Patience", es: "Paciencia", fr: "Patience" },
    positiveImpact: {
      en: "Supports composure when customers are slow, frustrated, repetitive, or upset.",
      es: "Respalda compostura cuando clientes estan lentos, frustrados, repetitivos o molestos.",
      fr: "Favorise le calme lorsque les clients sont lents, frustrés, répétitifs ou mécontents.",
    },
    riskImpact: {
      en: "May lose effectiveness in long, repetitive, or high-friction service interactions.",
      es: "Puede perder efectividad en interacciones largas, repetitivas o con alta friccion.",
      fr: "Peut réduire l'efficacité dans les interactions longues, répétitives ou particulièrement tendues.",
    },
  },
];

export function extractCustomerServiceEvidence(input: AssessmentResultInput, locale: IntelligenceLocale) {
  return buildStructuredChoiceEvidence({
    input,
    locale,
    assessmentKey: "customer-service",
    kind: "service",
    assessmentLabel: { en: "customer service judgment", es: "criterio de servicio al cliente", fr: "jugement en service client" },
    overallCompetencyId: "customer-issue-resolution",
    scored: scoreFrom(input),
    dimensions: DIMENSIONS,
    limitation: {
      en: "Customer Service Skills measures situational judgment in service scenarios; it does not measure product knowledge, typing speed, language fluency, or full role fit.",
      es: "Customer Service Skills mide juicio situacional en escenarios de servicio; no mide conocimiento de producto, velocidad de escritura, fluidez linguistica ni ajuste completo al rol.",
      fr: "Customer Service Skills mesure le jugement situationnel dans des scénarios de service ; il ne mesure ni la connaissance du produit, ni la vitesse de saisie, ni l'aisance linguistique, ni l'adéquation globale au poste.",
    },
  });
}
