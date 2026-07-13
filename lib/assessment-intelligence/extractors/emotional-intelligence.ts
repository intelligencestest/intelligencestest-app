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
    label: { en: "Self-awareness", es: "Autoconciencia", fr: "Conscience de soi" },
    positiveImpact: {
      en: "Supports better judgment by recognizing emotions, triggers, and personal impact early.",
      es: "Respalda mejor juicio al reconocer emociones, disparadores e impacto personal temprano.",
      fr: "Favorise un meilleur jugement en reconnaissant tôt les émotions, les déclencheurs et leur impact personnel.",
    },
    riskImpact: {
      en: "May react without noticing emotional drivers that influence judgment or communication.",
      es: "Puede reaccionar sin notar factores emocionales que influyen en juicio o comunicacion.",
      fr: "Peut conduire à réagir sans identifier les facteurs émotionnels qui influencent le jugement ou la communication.",
    },
  },
  {
    id: "Self-regulation",
    competencyId: "emotional-self-regulation",
    label: { en: "Self-regulation", es: "Autorregulacion", fr: "Autorégulation" },
    positiveImpact: {
      en: "Supports calm responses, conflict control, and steadier performance under pressure.",
      es: "Respalda respuestas calmadas, control de conflicto y desempeno mas estable bajo presion.",
      fr: "Favorise des réponses posées, la maîtrise des conflits et une performance plus stable sous pression.",
    },
    riskImpact: {
      en: "May escalate tension or lose effectiveness when frustration, stress, or conflict rises.",
      es: "Puede escalar tension o perder efectividad cuando aumentan frustracion, estres o conflicto.",
      fr: "Peut amplifier la tension ou réduire l'efficacité lorsque la frustration, le stress ou le conflit augmentent.",
    },
  },
  {
    id: "Motivation",
    competencyId: "achievement-motivation",
    label: { en: "Motivation", es: "Motivacion", fr: "Motivation" },
    positiveImpact: {
      en: "Supports initiative, persistence, and constructive energy when progress is slow.",
      es: "Respalda iniciativa, persistencia y energia constructiva cuando el progreso es lento.",
      fr: "Favorise l'initiative, la persévérance et une énergie constructive lorsque les progrès sont lents.",
    },
    riskImpact: {
      en: "May lose momentum when recognition is delayed or goals become difficult.",
      es: "Puede perder impulso cuando el reconocimiento se retrasa o las metas se vuelven dificiles.",
      fr: "Peut entraîner une perte d'élan lorsque la reconnaissance tarde ou que les objectifs deviennent difficiles.",
    },
  },
  {
    id: "Empathy",
    competencyId: "customer-empathy",
    label: { en: "Empathy", es: "Empatia", fr: "Empathie" },
    positiveImpact: {
      en: "Supports stronger stakeholder trust by understanding perspectives before responding.",
      es: "Respalda mayor confianza al entender perspectivas antes de responder.",
      fr: "Favorise une confiance accrue en comprenant les points de vue avant de répondre.",
    },
    riskImpact: {
      en: "May miss emotional context or respond too narrowly to the surface facts.",
      es: "Puede omitir contexto emocional o responder de forma demasiado estrecha a los hechos superficiales.",
      fr: "Peut conduire à négliger le contexte émotionnel ou à répondre de manière trop limitée aux faits apparents.",
    },
  },
  {
    id: "Social Skills",
    competencyId: "relationship-management",
    label: { en: "Social skills", es: "Habilidades sociales", fr: "Compétences sociales" },
    positiveImpact: {
      en: "Supports trust-building, influence without authority, and relationship repair after conflict.",
      es: "Respalda construir confianza, influir sin autoridad y reparar relaciones despues de conflicto.",
      fr: "Favorise la création de confiance, l'influence sans autorité et la réparation des relations après un conflit.",
    },
    riskImpact: {
      en: "May struggle to repair misunderstandings, influence constructively, or maintain trust after tension.",
      es: "Puede costarle reparar malentendidos, influir constructivamente o mantener confianza tras tension.",
      fr: "Peut rendre plus difficile la résolution des malentendus, l'influence constructive ou le maintien de la confiance après une tension.",
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
    assessmentLabel: { en: "emotional intelligence", es: "inteligencia emocional", fr: "intelligence émotionnelle" },
    overallCompetencyId: "relationship-management",
    scored,
    dimensions: DIMENSIONS,
    limitation: {
      en: "Emotional Intelligence is self-report; results should be validated with behavioral examples and reference evidence in high-stakes hiring.",
      es: "Emotional Intelligence es autoinforme; los resultados deben validarse con ejemplos conductuales y referencias en contrataciones de alto impacto.",
      fr: "Emotional Intelligence est une autoévaluation ; les résultats doivent être vérifiés au moyen d'exemples comportementaux et de références pour les recrutements à fort impact.",
    },
    rawEvidenceSummary:
      locale === "es"
        ? scored.totalPoints ? `${scored.totalPoints}/${EI_QUESTIONS.length * 5} puntos Likert` : "Puntuacion general inferida"
        : locale === "fr"
          ? scored.totalPoints ? `${scored.totalPoints}/${EI_QUESTIONS.length * 5} points Likert` : "Score global estimé"
          : scored.totalPoints ? `${scored.totalPoints}/${EI_QUESTIONS.length * 5} Likert points` : "Inferred overall score",
  });
}
