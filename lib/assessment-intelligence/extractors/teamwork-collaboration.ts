import { scoreTW, TW_QUESTIONS, type TWDimension } from "@/lib/questions/teamwork-collaboration";
import { buildStructuredChoiceEvidence, type DimensionEvidenceConfig, type StructuredChoiceScore } from "./structured-choice";
import { clampScore } from "../scales";
import type { AssessmentResultInput, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

const DIMENSION_MAX: Record<TWDimension, number> = {
  Cooperation: 45,
  Communication: 45,
  Reliability: 45,
  "Conflict Resolution": 40,
};

function normalizeDimensions(dimensions: Record<TWDimension, number>): Record<TWDimension, number> {
  return {
    Cooperation: clampScore((dimensions.Cooperation / DIMENSION_MAX.Cooperation) * 100),
    Communication: clampScore((dimensions.Communication / DIMENSION_MAX.Communication) * 100),
    Reliability: clampScore((dimensions.Reliability / DIMENSION_MAX.Reliability) * 100),
    "Conflict Resolution": clampScore((dimensions["Conflict Resolution"] / DIMENSION_MAX["Conflict Resolution"]) * 100),
  };
}

function scoreFrom(input: AssessmentResultInput): StructuredChoiceScore<TWDimension> & { totalPoints: number } {
  if (input.scoreDetails?.type === "teamwork-collaboration") {
    const dimensions = input.scoreDetails.dimensions as Record<TWDimension, number>;
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
    const scored = scoreTW(answers);
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
    dimensions: { Cooperation: fallback, Communication: fallback, Reliability: fallback, "Conflict Resolution": fallback },
    totalPoints: 0,
  };
}

const DIMENSIONS: Array<DimensionEvidenceConfig<TWDimension>> = [
  {
    id: "Cooperation",
    competencyId: "team-cooperation",
    label: { en: "Cooperation", es: "Cooperacion" },
    positiveImpact: {
      en: "Supports shared goals, helpfulness, and stronger team execution.",
      es: "Respalda objetivos compartidos, apoyo a colegas y ejecucion de equipo mas solida.",
    },
    riskImpact: {
      en: "May prioritize individual preference over shared outcomes or under-support colleagues.",
      es: "Puede priorizar preferencias individuales sobre resultados compartidos o apoyar poco a colegas.",
    },
  },
  {
    id: "Communication",
    competencyId: "professional-communication",
    label: { en: "Team communication", es: "Comunicacion de equipo" },
    positiveImpact: {
      en: "Supports transparency, listening, and fewer coordination failures inside teams.",
      es: "Respalda transparencia, escucha y menos fallas de coordinacion dentro del equipo.",
    },
    riskImpact: {
      en: "May leave teammates without timely context, updates, or constructive feedback.",
      es: "Puede dejar a colegas sin contexto oportuno, actualizaciones o feedback constructivo.",
    },
  },
  {
    id: "Reliability",
    competencyId: "team-reliability",
    label: { en: "Reliability", es: "Fiabilidad" },
    positiveImpact: {
      en: "Supports dependable follow-through when team delivery depends on individual commitments.",
      es: "Respalda cumplimiento fiable cuando la entrega del equipo depende de compromisos individuales.",
    },
    riskImpact: {
      en: "May create delivery risk if commitments slip without early communication.",
      es: "Puede crear riesgo de entrega si compromisos se retrasan sin comunicacion temprana.",
    },
  },
  {
    id: "Conflict Resolution",
    competencyId: "conflict-resolution",
    label: { en: "Conflict resolution", es: "Resolucion de conflictos" },
    positiveImpact: {
      en: "Supports direct, professional disagreement handling without damaging collaboration.",
      es: "Respalda manejo directo y profesional de desacuerdos sin danar la colaboracion.",
    },
    riskImpact: {
      en: "May avoid difficult conversations or let friction build until team performance suffers.",
      es: "Puede evitar conversaciones dificiles o permitir que la friccion crezca hasta afectar el desempeno del equipo.",
    },
  },
];

export function extractTeamworkCollaborationEvidence(input: AssessmentResultInput, locale: IntelligenceLocale) {
  const scored = scoreFrom(input);
  return buildStructuredChoiceEvidence({
    input,
    locale,
    assessmentKey: "teamwork-collaboration",
    kind: "teamwork",
    assessmentLabel: { en: "teamwork and collaboration", es: "trabajo en equipo y colaboracion" },
    overallCompetencyId: "team-cooperation",
    scored,
    dimensions: DIMENSIONS,
    limitation: {
      en: "Teamwork & Collaboration is self-report; it should be validated with team examples, references, and manager feedback.",
      es: "Teamwork & Collaboration es autoinforme; debe validarse con ejemplos de equipo, referencias y feedback de responsables.",
    },
    rawEvidenceSummary:
      locale === "es"
        ? scored.totalPoints ? `${scored.totalPoints}/${TW_QUESTIONS.length * 5} puntos Likert` : "Puntuacion general inferida"
        : scored.totalPoints ? `${scored.totalPoints}/${TW_QUESTIONS.length * 5} Likert points` : "Inferred overall score",
  });
}
