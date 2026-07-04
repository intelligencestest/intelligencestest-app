import { scoreResults } from "@/lib/questions/critical-thinking";
import { competencyLabel } from "../taxonomy";
import { clampScore, evidenceDirection, evidenceStrength } from "../scales";
import type { AssessmentResultInput, CriticalThinkingScoreDetails, EvidenceSignal, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function scoreFrom(input: AssessmentResultInput): CriticalThinkingScoreDetails {
  if (input.scoreDetails?.type === "critical-thinking") return input.scoreDetails;

  const answers = answersFrom(input.rawAnswers);
  if (answers) {
    const scored = scoreResults(answers);
    return {
      type: "critical-thinking",
      correct: scored.correct,
      total: scored.total,
      percentage: scored.percentage,
      interpretation: scored.interpretation,
    };
  }

  return {
    type: "critical-thinking",
    correct: 0,
    total: 0,
    percentage: clampScore(input.score),
  };
}

function statementFor(score: number, locale: IntelligenceLocale): string {
  if (score >= 80) {
    return locale === "es"
      ? "Evidencia fuerte de razonamiento analitico estructurado en la evaluacion completada."
      : "Strong evidence of structured analytical reasoning in the completed assessment.";
  }
  if (score >= 65) {
    return locale === "es"
      ? "Evidencia favorable de razonamiento analitico, con validacion recomendada en entrevista."
      : "Favorable evidence of analytical reasoning, with recommended interview validation.";
  }
  if (score >= 50) {
    return locale === "es"
      ? "Evidencia mixta de razonamiento analitico; conviene revisar ejemplos laborales concretos."
      : "Mixed evidence of analytical reasoning; concrete work examples should be reviewed.";
  }
  return locale === "es"
    ? "Evidencia de riesgo en razonamiento analitico para tareas que requieren inferencia y juicio estructurado."
    : "Risk evidence in analytical reasoning for tasks requiring inference and structured judgment.";
}

function businessImpactFor(score: number, locale: IntelligenceLocale): string {
  if (score >= 80) {
    return locale === "es"
      ? "Puede apoyar decisiones donde se deba separar evidencia relevante, supuestos y conclusiones."
      : "May support decisions that require separating relevant evidence, assumptions, and conclusions.";
  }
  if (score >= 65) {
    return locale === "es"
      ? "Puede contribuir a analisis de informacion, siempre que la entrevista confirme aplicacion practica."
      : "May contribute to information analysis if interview evidence confirms practical application.";
  }
  if (score >= 50) {
    return locale === "es"
      ? "El desempeno sugiere una base parcial; decisiones complejas deberian validarse con casos del rol."
      : "Performance suggests a partial baseline; complex decisions should be validated with role scenarios.";
  }
  return locale === "es"
    ? "Puede necesitar apoyo adicional en roles con alta ambiguedad, analisis o toma de decisiones critica."
    : "May need additional support in roles with high ambiguity, analysis, or critical decision-making.";
}

export function extractCriticalThinkingEvidence(input: AssessmentResultInput, locale: IntelligenceLocale): EvidenceSignal[] {
  const scored = scoreFrom(input);
  const normalizedScore = clampScore(scored.percentage || input.score);
  const assessmentId = input.assessmentId ?? input.id ?? input.name;
  const rawEvidence =
    scored.total > 0
      ? locale === "es"
        ? `${scored.correct}/${scored.total} respuestas correctas`
        : `${scored.correct}/${scored.total} correct answers`
      : undefined;

  return [
    {
      id: `${assessmentId}:critical-thinking:analytical-reasoning`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey: "critical-thinking",
      competencyId: "analytical-reasoning",
      competencyLabel: competencyLabel("analytical-reasoning", locale),
      kind: "ability",
      score: normalizedScore,
      maxScore: 100,
      normalizedScore,
      direction: evidenceDirection(normalizedScore),
      strength: evidenceStrength(normalizedScore),
      statement: statementFor(normalizedScore, locale),
      businessImpact: businessImpactFor(normalizedScore, locale),
      limitation:
        locale === "es"
          ? "Esta evaluacion no mide motivacion, experiencia tecnica, colaboracion ni ajuste completo al rol."
          : "This assessment does not measure motivation, technical experience, collaboration, or full role fit.",
      rawEvidence,
    },
  ];
}
