import { CS_QUESTIONS, scoreCS, type CSdimension } from "@/lib/questions/communication-skills";
import { buildStructuredChoiceEvidence, type DimensionEvidenceConfig, type StructuredChoiceScore } from "./structured-choice";
import { clampScore } from "../scales";
import type { AssessmentResultInput, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

const DIMENSION_MAX: Record<CSdimension, number> = {
  Written: 45,
  Verbal: 45,
  Listening: 45,
  "Non-verbal": 40,
};

function normalizeDimensions(dimensions: Record<CSdimension, number>): Record<CSdimension, number> {
  return {
    Written: clampScore((dimensions.Written / DIMENSION_MAX.Written) * 100),
    Verbal: clampScore((dimensions.Verbal / DIMENSION_MAX.Verbal) * 100),
    Listening: clampScore((dimensions.Listening / DIMENSION_MAX.Listening) * 100),
    "Non-verbal": clampScore((dimensions["Non-verbal"] / DIMENSION_MAX["Non-verbal"]) * 100),
  };
}

function scoreFrom(input: AssessmentResultInput): StructuredChoiceScore<CSdimension> & { totalPoints: number } {
  if (input.scoreDetails?.type === "communication-skills") {
    const dimensions = input.scoreDetails.dimensions as Record<CSdimension, number>;
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
    const scored = scoreCS(answers);
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
    dimensions: { Written: fallback, Verbal: fallback, Listening: fallback, "Non-verbal": fallback },
    totalPoints: 0,
  };
}

const DIMENSIONS: Array<DimensionEvidenceConfig<CSdimension>> = [
  {
    id: "Written",
    competencyId: "written-clarity",
    label: { en: "Written communication", es: "Comunicacion escrita", fr: "Communication écrite" },
    positiveImpact: {
      en: "Supports clear written updates, fewer handoff errors, and better documentation quality.",
      es: "Respalda actualizaciones escritas claras, menos errores de traspaso y mejor calidad documental.",
      fr: "Favorise des mises à jour écrites claires, moins d'erreurs de transmission et une meilleure qualité documentaire.",
    },
    riskImpact: {
      en: "May create rework or misunderstanding when work depends on precise written instructions or updates.",
      es: "Puede generar retrabajo o malentendidos cuando el trabajo depende de instrucciones o actualizaciones escritas precisas.",
      fr: "Peut entraîner des reprises ou des malentendus lorsque le travail dépend d'instructions ou de mises à jour écrites précises.",
    },
  },
  {
    id: "Verbal",
    competencyId: "professional-communication",
    label: { en: "Verbal communication", es: "Comunicacion verbal", fr: "Communication orale" },
    positiveImpact: {
      en: "Supports clear explanations, confident participation, and appropriate adaptation to audience.",
      es: "Respalda explicaciones claras, participacion segura y adaptacion adecuada a la audiencia.",
      fr: "Favorise des explications claires, une participation assurée et une adaptation pertinente à l'auditoire.",
    },
    riskImpact: {
      en: "May reduce effectiveness in meetings, stakeholder updates, or roles requiring clear verbal influence.",
      es: "Puede reducir efectividad en reuniones, actualizaciones a interesados o roles que requieren influencia verbal clara.",
      fr: "Peut réduire l'efficacité en réunion, lors de points avec les parties prenantes ou dans les postes exigeant une influence orale claire.",
    },
  },
  {
    id: "Listening",
    competencyId: "active-listening",
    label: { en: "Active listening", es: "Escucha activa", fr: "Écoute active" },
    positiveImpact: {
      en: "Supports accurate understanding before action, fewer assumptions, and stronger stakeholder trust.",
      es: "Respalda comprension precisa antes de actuar, menos supuestos y mayor confianza de interesados.",
      fr: "Favorise une compréhension précise avant l'action, moins d'hypothèses et une plus grande confiance des parties prenantes.",
    },
    riskImpact: {
      en: "May miss context, emotional cues, or requirements that change the correct response.",
      es: "Puede omitir contexto, senales emocionales o requisitos que cambian la respuesta correcta.",
      fr: "Peut conduire à négliger le contexte, les signaux émotionnels ou les exigences qui modifient la réponse appropriée.",
    },
  },
  {
    id: "Non-verbal",
    competencyId: "interpersonal-awareness",
    label: { en: "Non-verbal awareness", es: "Conciencia no verbal", fr: "Sensibilité au non-verbal" },
    positiveImpact: {
      en: "Supports better reading of reactions, alignment between message and presence, and more polished interactions.",
      es: "Respalda mejor lectura de reacciones, coherencia entre mensaje y presencia, e interacciones mas profesionales.",
      fr: "Favorise une meilleure lecture des réactions, une cohérence entre le message et la présence, ainsi que des interactions plus professionnelles.",
    },
    riskImpact: {
      en: "May misread reactions or send unintended signals in sensitive conversations.",
      es: "Puede leer mal reacciones o enviar senales no intencionadas en conversaciones sensibles.",
      fr: "Peut conduire à mal interpréter des réactions ou à envoyer des signaux involontaires dans des échanges sensibles.",
    },
  },
];

export function extractCommunicationSkillsEvidence(input: AssessmentResultInput, locale: IntelligenceLocale) {
  const scored = scoreFrom(input);
  return buildStructuredChoiceEvidence({
    input,
    locale,
    assessmentKey: "communication-skills",
    kind: "communication",
    assessmentLabel: { en: "professional communication", es: "comunicacion profesional", fr: "communication professionnelle" },
    overallCompetencyId: "professional-communication",
    scored,
    dimensions: DIMENSIONS,
    limitation: {
      en: "Communication Skills is a self-report instrument; it should be validated with writing samples, role-play, or behavioral interview evidence.",
      es: "Communication Skills es un instrumento de autoinforme; debe validarse con muestras escritas, role-play o evidencia conductual en entrevista.",
      fr: "Communication Skills est un instrument d'autoévaluation ; ses résultats doivent être vérifiés à l'aide d'échantillons écrits, de mises en situation ou d'éléments comportementaux recueillis en entretien.",
    },
    rawEvidenceSummary:
      locale === "es"
        ? scored.totalPoints ? `${scored.totalPoints}/${CS_QUESTIONS.length * 5} puntos Likert` : "Puntuacion general inferida"
        : locale === "fr"
          ? scored.totalPoints ? `${scored.totalPoints}/${CS_QUESTIONS.length * 5} points Likert` : "Score global estimé"
          : scored.totalPoints ? `${scored.totalPoints}/${CS_QUESTIONS.length * 5} Likert points` : "Inferred overall score",
  });
}
