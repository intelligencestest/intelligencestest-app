import { EI_QUESTIONS, scoreEI, type EIDimension } from "@/lib/questions/emotional-intelligence";
import { buildStructuredChoiceEvidence, type DimensionEvidenceConfig, type StructuredChoiceScore } from "./structured-choice";
import { clampScore } from "../scales";
import type { AssessmentResultInput, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

const DIMENSION_MAX: Record<EIDimension, number> = {
  "Self-awareness": 40,
  "Self-regulation": 40,
  Motivation: 40,
  Empathy: 40,
  "Social Skills": 40,
};

function normalizeDimensions(dimensions: Record<EIDimension, number>): Record<EIDimension, number> {
  return {
    "Self-awareness": clampScore((dimensions["Self-awareness"] / DIMENSION_MAX["Self-awareness"]) * 100),
    "Self-regulation": clampScore((dimensions["Self-regulation"] / DIMENSION_MAX["Self-regulation"]) * 100),
    Motivation: clampScore((dimensions.Motivation / DIMENSION_MAX.Motivation) * 100),
    Empathy: clampScore((dimensions.Empathy / DIMENSION_MAX.Empathy) * 100),
    "Social Skills": clampScore((dimensions["Social Skills"] / DIMENSION_MAX["Social Skills"]) * 100),
  };
}

function scoreFrom(input: AssessmentResultInput): StructuredChoiceScore<EIDimension> & { totalPoints: number } {
  if (input.scoreDetails?.type === "emotional-intelligence") {
    const dimensions = input.scoreDetails.dimensions as Record<EIDimension, number>;
    return {
      correct: 0,
      total: 0,
      percentage: clampScore(input.scoreDetails.percentage),
      dimensions: normalizeDimensions(dimensions),
      totalPoints: input.scoreDetails.total,
    };
  }

  const answers = answersFrom(input.rawAnswers);
  if (answers) {
    const scored = scoreEI(answers);
    return {
      correct: 0,
      total: 0,
      percentage: scored.percentage,
      dimensions: normalizeDimensions(scored.dimensions),
      totalPoints: scored.total,
    };
  }

  const fallback = clampScore(input.score);
  return {
    correct: 0,
    total: 0,
    percentage: fallback,
    dimensions: {
      "Self-awareness": fallback,
      "Self-regulation": fallback,
      Motivation: fallback,
      Empathy: fallback,
      "Social Skills": fallback,
    },
    totalPoints: 0,
  };
}

const DIMENSIONS: Array<DimensionEvidenceConfig<EIDimension>> = [
  {
    id: "Self-awareness",
    competencyId: "emotional-self-awareness",
    label: { en: "Self-awareness", es: "Autoconciencia" },
    positiveImpact: {
      en: "Supports better judgment by recognizing emotions, triggers, and personal impact early.",
      es: "Respalda mejor juicio al reconocer emociones, disparadores e impacto personal temprano.",
    },
    riskImpact: {
      en: "May react without noticing emotional drivers that influence judgment or communication.",
      es: "Puede reaccionar sin notar factores emocionales que influyen en juicio o comunicacion.",
    },
  },
  {
    id: "Self-regulation",
    competencyId: "emotional-self-regulation",
    label: { en: "Self-regulation", es: "Autorregulacion" },
    positiveImpact: {
      en: "Supports calm responses, conflict control, and steadier performance under pressure.",
      es: "Respalda respuestas calmadas, control de conflicto y desempeno mas estable bajo presion.",
    },
    riskImpact: {
      en: "May escalate tension or lose effectiveness when frustration, stress, or conflict rises.",
      es: "Puede escalar tension o perder efectividad cuando aumentan frustracion, estres o conflicto.",
    },
  },
  {
    id: "Motivation",
    competencyId: "achievement-motivation",
    label: { en: "Motivation", es: "Motivacion" },
    positiveImpact: {
      en: "Supports initiative, persistence, and constructive energy when progress is slow.",
      es: "Respalda iniciativa, persistencia y energia constructiva cuando el progreso es lento.",
    },
    riskImpact: {
      en: "May lose momentum when recognition is delayed or goals become difficult.",
      es: "Puede perder impulso cuando el reconocimiento se retrasa o las metas se vuelven dificiles.",
    },
  },
  {
    id: "Empathy",
    competencyId: "customer-empathy",
    label: { en: "Empathy", es: "Empatia" },
    positiveImpact: {
      en: "Supports stronger stakeholder trust by understanding perspectives before responding.",
      es: "Respalda mayor confianza al entender perspectivas antes de responder.",
    },
    riskImpact: {
      en: "May miss emotional context or respond too narrowly to the surface facts.",
      es: "Puede omitir contexto emocional o responder de forma demasiado estrecha a los hechos superficiales.",
    },
  },
  {
    id: "Social Skills",
    competencyId: "relationship-management",
    label: { en: "Social skills", es: "Habilidades sociales" },
    positiveImpact: {
      en: "Supports trust-building, influence without authority, and relationship repair after conflict.",
      es: "Respalda construir confianza, influir sin autoridad y reparar relaciones despues de conflicto.",
    },
    riskImpact: {
      en: "May struggle to repair misunderstandings, influence constructively, or maintain trust after tension.",
      es: "Puede costarle reparar malentendidos, influir constructivamente o mantener confianza tras tension.",
    },
  },
];

export function extractEmotionalIntelligenceEvidence(input: AssessmentResultInput, locale: IntelligenceLocale) {
  const scored = scoreFrom(input);
  return buildStructuredChoiceEvidence({
    input,
    locale,
    assessmentKey: "emotional-intelligence",
    kind: "emotional-intelligence",
    assessmentLabel: { en: "emotional intelligence", es: "inteligencia emocional" },
    overallCompetencyId: "relationship-management",
    scored,
    dimensions: DIMENSIONS,
    limitation: {
      en: "Emotional Intelligence is self-report; results should be validated with behavioral examples and reference evidence in high-stakes hiring.",
      es: "Emotional Intelligence es autoinforme; los resultados deben validarse con ejemplos conductuales y referencias en contrataciones de alto impacto.",
    },
    rawEvidenceSummary:
      locale === "es"
        ? scored.totalPoints ? `${scored.totalPoints}/${EI_QUESTIONS.length * 5} puntos Likert` : "Puntuacion general inferida"
        : scored.totalPoints ? `${scored.totalPoints}/${EI_QUESTIONS.length * 5} Likert points` : "Inferred overall score",
  });
}
