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
      : locale === "fr"
        ? "Preuves solides de résolution structurée de problèmes dans l'évaluation terminée."
        : "Strong evidence of structured problem solving in the completed assessment.";
  }
  if (score >= 65) {
    return locale === "es"
      ? "Evidencia favorable de resolucion de problemas, con validacion recomendada en entrevista."
      : locale === "fr"
        ? "Preuves favorables de résolution de problèmes, à vérifier lors d'un entretien."
        : "Favorable evidence of problem solving, with recommended interview validation.";
  }
  if (score >= 50) {
    return locale === "es"
      ? "Evidencia mixta de resolucion de problemas; conviene validar el proceso usado en casos reales."
      : locale === "fr"
        ? "Preuves contrastées de résolution de problèmes ; le processus mis en œuvre dans des cas réels doit être vérifié."
        : "Mixed problem-solving evidence; the process used in real cases should be validated.";
  }
  return locale === "es"
    ? "Evidencia de riesgo en resolucion estructurada de problemas para roles con ambiguedad operativa."
    : locale === "fr"
      ? "Preuves de risque concernant la résolution structurée de problèmes pour les postes marqués par une ambiguïté opérationnelle."
      : "Risk evidence in structured problem solving for roles with operational ambiguity.";
}

function impactFor(score: number, locale: IntelligenceLocale): string {
  if (score >= 80) {
    return locale === "es"
      ? "Puede aportar diagnostico, priorizacion y accion practica ante problemas complejos."
      : locale === "fr"
        ? "Peut contribuer au diagnostic, à la priorisation et à une action pragmatique face à des problèmes complexes."
        : "May contribute diagnosis, prioritization, and practical action on complex problems.";
  }
  if (score >= 65) {
    return locale === "es"
      ? "Puede abordar problemas operativos si la entrevista confirma aplicacion en el contexto del rol."
      : locale === "fr"
        ? "Peut traiter des problèmes opérationnels si l'entretien confirme l'application de cette capacité dans le contexte du poste."
        : "May address operational problems if interview evidence confirms role-context application.";
  }
  if (score >= 50) {
    return locale === "es"
      ? "La evidencia sugiere base parcial; debe validarse con ejemplos de causa raiz, priorizacion y seguimiento."
      : locale === "fr"
        ? "Les preuves suggèrent une base partielle ; des exemples d'analyse des causes profondes, de priorisation et de suivi doivent être vérifiés."
        : "Evidence suggests a partial baseline; root-cause, prioritization, and follow-through examples should be validated.";
  }
  return locale === "es"
    ? "Puede requerir apoyo en roles donde deba diagnosticar causas, coordinar soluciones o actuar con informacion incompleta."
    : locale === "fr"
      ? "Peut nécessiter un soutien dans les postes exigeant le diagnostic des causes, la coordination des solutions ou l'action avec des informations incomplètes."
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
          : locale === "fr"
            ? "Problem Solving mesure la performance dans des situations structurées ; il ne mesure ni les connaissances techniques spécifiques, ni l'autorité réelle, ni toute la complexité du poste."
            : "Problem Solving measures performance in structured scenarios; it does not measure specific technical knowledge, real authority, or full role complexity.",
      rawEvidence:
        scored.total > 0
          ? locale === "es"
            ? `${scored.correct}/${scored.total} respuestas correctas`
            : locale === "fr"
              ? `${scored.correct}/${scored.total} réponses correctes`
              : `${scored.correct}/${scored.total} correct answers`
          : locale === "es"
            ? `Puntuacion completada ${normalizedScore}/100`
            : locale === "fr"
              ? `Score obtenu : ${normalizedScore}/100`
              : `Completed score ${normalizedScore}/100`,
    },
  ];
}
