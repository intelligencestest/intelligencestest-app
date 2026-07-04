import { competencyLabel } from "../taxonomy";
import { clampScore, evidenceDirection, evidenceStrength } from "../scales";
import type { AssessmentResultInput, EvidenceSignal, IntelligenceLocale } from "../types";

export function extractScoreOnlyEvidence(input: AssessmentResultInput, locale: IntelligenceLocale): EvidenceSignal[] {
  const assessmentId = input.assessmentId ?? input.id ?? input.name;
  const normalizedScore = clampScore(input.score);

  return [
    {
      id: `${assessmentId}:score-only:assessment-performance`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey: "score-only",
      competencyId: "assessment-performance",
      competencyLabel: competencyLabel("assessment-performance", locale),
      kind: "score-only",
      score: normalizedScore,
      maxScore: 100,
      normalizedScore,
      direction: evidenceDirection(normalizedScore),
      strength: evidenceStrength(normalizedScore),
      statement:
        locale === "es"
          ? `${input.name}: puntuacion completada disponible, sin interpretacion metodologica especifica en esta fase.`
          : `${input.name}: completed score available, without assessment-specific methodological interpretation in this phase.`,
      businessImpact:
        locale === "es"
          ? "La puntuacion puede informar la conversacion, pero no debe usarse sola como conclusion de ajuste al rol."
          : "The score can inform the conversation, but should not be used alone as a role-fit conclusion.",
      limitation:
        locale === "es"
          ? "Este instrumento aun no esta mapeado al motor de inteligencia; la recomendacion debe tratarse como evidencia limitada."
          : "This instrument is not yet mapped into the intelligence engine; the recommendation should be treated as limited evidence.",
      rawEvidence:
        locale === "es"
          ? `Puntuacion completada ${normalizedScore}/100`
          : `Completed score ${normalizedScore}/100`,
    },
  ];
}
