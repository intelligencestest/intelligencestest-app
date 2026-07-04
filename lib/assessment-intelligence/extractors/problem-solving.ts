import { scorePS } from "@/lib/questions/problem-solving";
import { competencyLabel } from "../taxonomy";
import { clampScore, evidenceDirection, evidenceStrength } from "../scales";
import type { AssessmentResultInput, EvidenceSignal, IntelligenceLocale, ProblemSolvingScoreDetails } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function scoreFrom(input: AssessmentResultInput): ProblemSolvingScoreDetails {
  if (input.scoreDetails?.type === "problem-solving") return input.scoreDetails;

  const answers = answersFrom(input.rawAnswers);
  if (answers) {
    const scored = scorePS(answers);
    return {
      type: "problem-solving",
      correct: scored.correct,
      total: scored.total,
      percentage: scored.percentage,
      interpretation: scored.interpretation,
    };
  }

  return {
    type: "problem-solving",
    correct: 0,
    total: 0,
    percentage: clampScore(input.score),
  };
}

function statementFor(score: number, locale: IntelligenceLocale): string {
  if (score >= 80) {
    return locale === "es"
      ? "Evidencia fuerte de resolucion estructurada de problemas en la evaluacion completada."
      : "Strong evidence of structured problem solving in the completed assessment.";
  }
  if (score >= 65) {
    return locale === "es"
      ? "Evidencia favorable de resolucion de problemas, con validacion recomendada en entrevista."
      : "Favorable evidence of problem solving, with recommended interview validation.";
  }
  if (score >= 50) {
    return locale === "es"
      ? "Evidencia mixta de resolucion de problemas; conviene validar el proceso usado en casos reales."
      : "Mixed problem-solving evidence; the process used in real cases should be validated.";
  }
  return locale === "es"
    ? "Evidencia de riesgo en resolucion estructurada de problemas para roles con ambiguedad operativa."
    : "Risk evidence in structured problem solving for roles with operational ambiguity.";
}

function impactFor(score: number, locale: IntelligenceLocale): string {
  if (score >= 80) {
    return locale === "es"
      ? "Puede aportar diagnostico, priorizacion y accion practica ante problemas complejos."
      : "May contribute diagnosis, prioritization, and practical action on complex problems.";
  }
  if (score >= 65) {
    return locale === "es"
      ? "Puede abordar problemas operativos si la entrevista confirma aplicacion en el contexto del rol."
      : "May address operational problems if interview evidence confirms role-context application.";
  }
  if (score >= 50) {
    return locale === "es"
      ? "La evidencia sugiere base parcial; debe validarse con ejemplos de causa raiz, priorizacion y seguimiento."
      : "Evidence suggests a partial baseline; root-cause, prioritization, and follow-through examples should be validated.";
  }
  return locale === "es"
    ? "Puede requerir apoyo en roles donde deba diagnosticar causas, coordinar soluciones o actuar con informacion incompleta."
    : "May need support in roles requiring cause diagnosis, solution coordination, or action with incomplete information.";
}

export function extractProblemSolvingEvidence(input: AssessmentResultInput, locale: IntelligenceLocale): EvidenceSignal[] {
  const scored = scoreFrom(input);
  const normalizedScore = clampScore(scored.percentage || input.score);
  const assessmentId = input.assessmentId ?? input.id ?? input.name;

  return [
    {
      id: `${assessmentId}:problem-solving:structured-problem-solving`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey: "problem-solving",
      competencyId: "structured-problem-solving",
      competencyLabel: competencyLabel("structured-problem-solving", locale),
      kind: "problem-solving",
      score: normalizedScore,
      maxScore: 100,
      normalizedScore,
      direction: evidenceDirection(normalizedScore),
      strength: evidenceStrength(normalizedScore),
      statement: statementFor(normalizedScore, locale),
      businessImpact: impactFor(normalizedScore, locale),
      limitation:
        locale === "es"
          ? "Problem Solving mide desempeno en escenarios estructurados; no mide conocimiento tecnico especifico, autoridad real ni complejidad completa del rol."
          : "Problem Solving measures performance in structured scenarios; it does not measure specific technical knowledge, real authority, or full role complexity.",
      rawEvidence:
        scored.total > 0
          ? locale === "es"
            ? `${scored.correct}/${scored.total} respuestas correctas`
            : `${scored.correct}/${scored.total} correct answers`
          : locale === "es"
            ? `Puntuacion completada ${normalizedScore}/100`
            : `Completed score ${normalizedScore}/100`,
    },
  ];
}
