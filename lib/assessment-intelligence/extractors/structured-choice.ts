import { competencyLabel, localize } from "../taxonomy";
import { clampScore, evidenceDirection, evidenceStrength } from "../scales";
import type {
  AssessmentResultInput,
  CompetencyId,
  EvidenceKind,
  EvidenceSignal,
  IntelligenceLocale,
  LocalizedText,
} from "../types";

export interface StructuredChoiceScore<D extends string> {
  correct: number;
  total: number;
  percentage: number;
  dimensions: Record<D, number>;
}

export interface DimensionEvidenceConfig<D extends string> {
  id: D;
  competencyId: CompetencyId;
  label: LocalizedText;
  positiveImpact: LocalizedText;
  riskImpact: LocalizedText;
}

interface BuildStructuredChoiceEvidenceOptions<D extends string> {
  input: AssessmentResultInput;
  locale: IntelligenceLocale;
  assessmentKey: EvidenceSignal["assessmentKey"];
  kind: EvidenceKind;
  assessmentLabel: LocalizedText;
  overallCompetencyId: CompetencyId;
  scored: StructuredChoiceScore<D>;
  dimensions: Array<DimensionEvidenceConfig<D>>;
  limitation: LocalizedText;
  rawEvidenceSummary?: string;
}

function safeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function overallStatement(label: string, score: number, locale: IntelligenceLocale): string {
  if (score >= 80) {
    return locale === "es"
      ? `Evidencia fuerte en ${label} dentro de la evaluacion completada.`
      : `Strong evidence in ${label} within the completed assessment.`;
  }
  if (score >= 65) {
    return locale === "es"
      ? `Evidencia favorable en ${label}, con validacion recomendada en entrevista.`
      : `Favorable evidence in ${label}, with recommended interview validation.`;
  }
  if (score >= 50) {
    return locale === "es"
      ? `Evidencia mixta en ${label}; conviene revisar ejemplos laborales concretos.`
      : `Mixed evidence in ${label}; concrete work examples should be reviewed.`;
  }
  return locale === "es"
    ? `Senal de riesgo en ${label} para roles donde esta capacidad sea critica.`
    : `Risk signal in ${label} for roles where this capability is critical.`;
}

function dimensionStatement(label: string, score: number, locale: IntelligenceLocale): string {
  if (score >= 65) {
    return locale === "es"
      ? `${label}: evidencia favorable en la dimension completada.`
      : `${label}: favorable evidence in the completed dimension.`;
  }
  if (score >= 50) {
    return locale === "es"
      ? `${label}: evidencia mixta; debe validarse consistencia con situaciones reales.`
      : `${label}: mixed evidence; consistency should be validated with real situations.`;
  }
  return locale === "es"
    ? `${label}: senal de riesgo que requiere validacion directa en entrevista.`
    : `${label}: risk signal requiring direct interview validation.`;
}

function impactFor<D extends string>(
  dimension: DimensionEvidenceConfig<D>,
  score: number,
  locale: IntelligenceLocale
): string {
  if (score >= 65) return localize(dimension.positiveImpact, locale);
  if (score >= 50) {
    return locale === "es"
      ? `${localize(dimension.positiveImpact, locale)} Debe confirmarse con evidencia conductual del rol.`
      : `${localize(dimension.positiveImpact, locale)} It should be confirmed with role-specific behavioral evidence.`;
  }
  return localize(dimension.riskImpact, locale);
}

export function buildStructuredChoiceEvidence<D extends string>({
  input,
  locale,
  assessmentKey,
  kind,
  assessmentLabel,
  overallCompetencyId,
  scored,
  dimensions,
  limitation,
  rawEvidenceSummary,
}: BuildStructuredChoiceEvidenceOptions<D>): EvidenceSignal[] {
  const assessmentId = input.assessmentId ?? input.id ?? input.name;
  const label = localize(assessmentLabel, locale);
  const totalScore = clampScore(scored.percentage || input.score);

  const signals: EvidenceSignal[] = [
    {
      id: `${assessmentId}:${assessmentKey}:overall`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey,
      competencyId: overallCompetencyId,
      competencyLabel: competencyLabel(overallCompetencyId, locale),
      kind,
      score: totalScore,
      maxScore: 100,
      normalizedScore: totalScore,
      direction: evidenceDirection(totalScore),
      strength: evidenceStrength(totalScore),
      statement: overallStatement(label, totalScore, locale),
      businessImpact:
        totalScore >= 65
          ? locale === "es"
            ? "Puede aportar evidencia util para roles donde esta competencia sea central, sujeto a entrevista estructurada."
            : "May provide useful evidence for roles where this competency is central, subject to structured interview validation."
          : locale === "es"
            ? "Puede requerir mayor validacion antes de usar esta evaluacion como apoyo para avanzar en el proceso."
            : "May require additional validation before using this assessment as support for advancing the process.",
      limitation: localize(limitation, locale),
      rawEvidence: rawEvidenceSummary ?? (locale === "es"
        ? `${scored.correct}/${scored.total} respuestas correctas`
        : `${scored.correct}/${scored.total} correct answers`),
    },
  ];

  for (const dimension of dimensions) {
    const dimensionScore = clampScore(scored.dimensions[dimension.id] ?? 0);
    const dimensionLabel = localize(dimension.label, locale);
    signals.push({
      id: `${assessmentId}:${assessmentKey}:${safeId(dimension.id)}`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey,
      competencyId: dimension.competencyId,
      competencyLabel: competencyLabel(dimension.competencyId, locale),
      dimensionId: dimension.id,
      dimensionLabel,
      kind,
      score: dimensionScore,
      maxScore: 100,
      normalizedScore: dimensionScore,
      direction: evidenceDirection(dimensionScore),
      strength: evidenceStrength(dimensionScore),
      statement: dimensionStatement(dimensionLabel, dimensionScore, locale),
      businessImpact: impactFor(dimension, dimensionScore, locale),
      limitation: localize(limitation, locale),
      rawEvidence: `${dimensionLabel} ${dimensionScore}/100`,
    });
  }

  return signals;
}
