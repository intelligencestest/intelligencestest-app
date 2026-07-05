import { scoreSJT, type SJTDimension } from "@/lib/questions/situational-judgment";
import { buildStructuredChoiceEvidence, type DimensionEvidenceConfig, type StructuredChoiceScore } from "./structured-choice";
import { clampScore } from "../scales";
import type { AssessmentResultInput, IntelligenceLocale, SituationalJudgmentScoreDetails } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function normalizeDimensions(dimensions: SituationalJudgmentScoreDetails["dimensions"]): Record<SJTDimension, number> {
  return {
    "Decision Quality": clampScore((dimensions["Decision Quality"]?.score ?? 0) / Math.max(dimensions["Decision Quality"]?.max ?? 1, 1) * 100),
    Collaboration: clampScore((dimensions.Collaboration?.score ?? 0) / Math.max(dimensions.Collaboration?.max ?? 1, 1) * 100),
    Accountability: clampScore((dimensions.Accountability?.score ?? 0) / Math.max(dimensions.Accountability?.max ?? 1, 1) * 100),
    Adaptability: clampScore((dimensions.Adaptability?.score ?? 0) / Math.max(dimensions.Adaptability?.max ?? 1, 1) * 100),
    Communication: clampScore((dimensions.Communication?.score ?? 0) / Math.max(dimensions.Communication?.max ?? 1, 1) * 100),
  };
}

function scoreFrom(input: AssessmentResultInput): StructuredChoiceScore<SJTDimension> & { totalPoints: number; maxPoints: number } {
  if (input.scoreDetails?.type === "situational-judgment") {
    return {
      correct: input.scoreDetails.total,
      total: input.scoreDetails.max,
      percentage: clampScore(input.scoreDetails.percentage),
      dimensions: normalizeDimensions(input.scoreDetails.dimensions),
      totalPoints: input.scoreDetails.total,
      maxPoints: input.scoreDetails.max,
    };
  }

  const answers = answersFrom(input.rawAnswers);
  if (answers) {
    const scored = scoreSJT(answers);
    return {
      correct: scored.total,
      total: scored.max,
      percentage: scored.percentage,
      dimensions: normalizeDimensions(scored.dimensions),
      totalPoints: scored.total,
      maxPoints: scored.max,
    };
  }

  const fallback = clampScore(input.score);
  return {
    correct: 0,
    total: 0,
    percentage: fallback,
    dimensions: {
      "Decision Quality": fallback,
      Collaboration: fallback,
      Accountability: fallback,
      Adaptability: fallback,
      Communication: fallback,
    },
    totalPoints: 0,
    maxPoints: 0,
  };
}

const DIMENSIONS: Array<DimensionEvidenceConfig<SJTDimension>> = [
  {
    id: "Decision Quality",
    competencyId: "decision-quality",
    label: { en: "Decision quality", es: "Calidad de decision" },
    positiveImpact: {
      en: "Supports practical judgment when tradeoffs, incomplete evidence, or policy constraints are present.",
      es: "Respalda juicio practico cuando existen tradeoffs, evidencia incompleta o limites de politica.",
    },
    riskImpact: {
      en: "May choose weak responses when situations require evidence, tradeoff thinking, or clear escalation.",
      es: "Puede elegir respuestas debiles cuando la situacion exige evidencia, tradeoffs o escalamiento claro.",
    },
  },
  {
    id: "Collaboration",
    competencyId: "team-cooperation",
    label: { en: "Collaboration", es: "Colaboracion" },
    positiveImpact: {
      en: "Supports constructive teamwork, shared ownership, and better cross-functional execution.",
      es: "Respalda trabajo colaborativo, responsabilidad compartida y mejor ejecucion transversal.",
    },
    riskImpact: {
      en: "May work around people or escalate friction instead of aligning around shared outcomes.",
      es: "Puede rodear a las personas o escalar friccion en vez de alinear resultados compartidos.",
    },
  },
  {
    id: "Accountability",
    competencyId: "personal-accountability",
    label: { en: "Accountability", es: "Responsabilidad" },
    positiveImpact: {
      en: "Supports early ownership, transparent recovery plans, and learning from mistakes.",
      es: "Respalda asumir responsabilidad temprano, planes transparentes de recuperacion y aprendizaje de errores.",
    },
    riskImpact: {
      en: "May delay ownership or focus on explanations instead of corrective action.",
      es: "Puede retrasar asumir responsabilidad o enfocarse en explicaciones en vez de acciones correctivas.",
    },
  },
  {
    id: "Adaptability",
    competencyId: "adaptability",
    label: { en: "Adaptability", es: "Adaptabilidad" },
    positiveImpact: {
      en: "Supports constructive adjustment when priorities, tools, or requirements change.",
      es: "Respalda ajuste constructivo cuando cambian prioridades, herramientas o requisitos.",
    },
    riskImpact: {
      en: "May become rigid, delay action, or change direction without understanding impact.",
      es: "Puede volverse rigido, demorar accion o cambiar direccion sin entender el impacto.",
    },
  },
  {
    id: "Communication",
    competencyId: "professional-communication",
    label: { en: "Communication", es: "Comunicacion" },
    positiveImpact: {
      en: "Supports clear context, expectations, pushback, and next steps in ambiguous situations.",
      es: "Respalda contexto claro, expectativas, objeciones constructivas y proximos pasos en situaciones ambiguas.",
    },
    riskImpact: {
      en: "May leave stakeholders unclear on impact, tradeoffs, or ownership.",
      es: "Puede dejar a interesados sin claridad sobre impacto, tradeoffs o responsables.",
    },
  },
];

export function extractSituationalJudgmentEvidence(input: AssessmentResultInput, locale: IntelligenceLocale) {
  const scored = scoreFrom(input);
  return buildStructuredChoiceEvidence({
    input,
    locale,
    assessmentKey: "situational-judgment",
    kind: "situational-judgment",
    assessmentLabel: { en: "workplace situational judgment", es: "juicio situacional laboral" },
    overallCompetencyId: "judgment-under-ambiguity",
    scored,
    dimensions: DIMENSIONS,
    limitation: {
      en: "Situational Judgment measures preferred responses to workplace scenarios; it should be validated with examples from the candidate's actual work history.",
      es: "Situational Judgment mide respuestas preferidas ante escenarios laborales; debe validarse con ejemplos reales del historial laboral del candidato.",
    },
    rawEvidenceSummary:
      locale === "es"
        ? scored.maxPoints ? `${scored.totalPoints}/${scored.maxPoints} puntos situacionales` : "Puntuacion general inferida"
        : scored.maxPoints ? `${scored.totalPoints}/${scored.maxPoints} situational points` : "Inferred overall score",
  });
}
