import { extractAQEvidence } from "./extractors/aq";
import { extractCriticalThinkingEvidence } from "./extractors/critical-thinking";
import { extractScoreOnlyEvidence } from "./extractors/score-only";
import { assessmentKey, clampScore, evidenceDirection, evidenceStrength, riskSeverity } from "./scales";
import { competencyCategory } from "./taxonomy";
import type {
  AssessmentIntelligenceReport,
  AssessmentResultInput,
  CompetencyEvidence,
  ConfidenceAnalysis,
  EvidenceDirection,
  EvidenceSignal,
  HiringRisk,
  IntelligenceLocale,
  IntelligenceRecommendation,
  InterviewValidationQuestion,
} from "./types";

interface BuildAssessmentIntelligenceOptions {
  assessments: AssessmentResultInput[];
  locale?: IntelligenceLocale;
  roleRequirementsProvided?: boolean;
}

const COPY = {
  es: {
    noRoleModel:
      "No se proporciono un modelo de competencias del rol; el informe evalua desempeno en evaluaciones completadas, no ajuste completo al puesto.",
    singleAssessment: "La conclusion se basa en una sola evaluacion completada, por lo que la confianza no puede ser alta.",
    unsupported: "Algunas evaluaciones aun no tienen interpretacion metodologica especifica en el motor de inteligencia.",
    mixedEvidence: "La evidencia es mixta entre evaluaciones o dimensiones, por lo que la confianza disminuye.",
    evidenceCount: (count: number) => `${count} evaluacion${count === 1 ? "" : "es"} completada${count === 1 ? "" : "s"} analizada${count === 1 ? "" : "s"}.`,
    summaryHeadline: "Recomendacion basada en evidencia completada y trazable.",
    summaryBody:
      "La recomendacion usa senales de evidencia extraidas de evaluaciones completadas. Las conclusiones se limitan a los instrumentos disponibles y deben validarse con entrevista estructurada.",
    proceedTitle: "Avanzar con validacion estructurada",
    reviewTitle: "Revisar con validacion adicional",
    cautionTitle: "No avanzar sin evidencia adicional",
    strongTitle: "Avanzar con prioridad, sujeto a validacion",
    proceedRationale: "La evidencia completada respalda continuar el proceso, manteniendo validacion dirigida en entrevista.",
    reviewRationale: "La evidencia requiere revision antes de avanzar porque existen riesgos, mezcla de senales o cobertura limitada.",
    cautionRationale: "La evidencia disponible no respalda una decision positiva sin informacion adicional.",
    strongRationale: "La evidencia completada es favorable y consistente, aunque la decision final sigue dependiendo del rol, entrevista y referencias.",
    defaultStep: "Validar las senales reportadas con ejemplos conductuales recientes antes de tomar una decision final.",
    roleStep: "Comparar esta evidencia con las competencias criticas del rol antes de confirmar ajuste.",
    riskPrefix: "Validar riesgo",
    strengthPrefix: "Validar fortaleza",
  },
  en: {
    noRoleModel:
      "No role competency model was provided; this report evaluates completed assessment performance, not full role fit.",
    singleAssessment: "The conclusion is based on one completed assessment, so confidence cannot be high.",
    unsupported: "Some assessments do not yet have assessment-specific methodological interpretation in the intelligence engine.",
    mixedEvidence: "Evidence is mixed across assessments or dimensions, so confidence is reduced.",
    evidenceCount: (count: number) => `${count} completed assessment${count === 1 ? "" : "s"} analyzed.`,
    summaryHeadline: "Recommendation based on completed and traceable evidence.",
    summaryBody:
      "The recommendation uses evidence signals extracted from completed assessments. Conclusions are limited to the available instruments and should be validated through a structured interview.",
    proceedTitle: "Proceed with structured validation",
    reviewTitle: "Review with additional validation",
    cautionTitle: "Do not advance without additional evidence",
    strongTitle: "Proceed with priority, subject to validation",
    proceedRationale: "The completed evidence supports continuing the process, with targeted interview validation.",
    reviewRationale: "The evidence requires review before advancing because risks, mixed signals, or limited coverage are present.",
    cautionRationale: "The available evidence does not support a positive decision without additional information.",
    strongRationale: "The completed evidence is favorable and consistent, although the final decision still depends on role needs, interview, and references.",
    defaultStep: "Validate the reported signals with recent behavioral examples before making a final decision.",
    roleStep: "Compare this evidence with the role-critical competencies before confirming fit.",
    riskPrefix: "Validate risk",
    strengthPrefix: "Validate strength",
  },
} satisfies Record<IntelligenceLocale, Record<string, unknown>>;

function average(values: number[]): number {
  if (!values.length) return 0;
  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function copy(locale: IntelligenceLocale) {
  return COPY[locale];
}

function extractSignals(input: AssessmentResultInput, locale: IntelligenceLocale): EvidenceSignal[] {
  const key = assessmentKey(input.name);
  if (key === "critical-thinking") return extractCriticalThinkingEvidence(input, locale);
  if (key === "aq") return extractAQEvidence(input, locale);
  return extractScoreOnlyEvidence(input, locale);
}

function dominantDirection(signals: EvidenceSignal[]): EvidenceDirection {
  if (signals.some((signal) => signal.direction === "risk")) return "risk";
  if (signals.some((signal) => signal.direction === "mixed")) return "mixed";
  if (signals.some((signal) => signal.direction === "positive")) return "positive";
  return "neutral";
}

function buildCompetencyEvidence(signals: EvidenceSignal[], locale: IntelligenceLocale): CompetencyEvidence[] {
  const grouped = signals.reduce<Map<string, EvidenceSignal[]>>((acc, signal) => {
    const existing = acc.get(signal.competencyId) ?? [];
    existing.push(signal);
    acc.set(signal.competencyId, existing);
    return acc;
  }, new Map());

  return Array.from(grouped.values()).map((items) => {
    const score = average(items.map((item) => item.normalizedScore));
    const strongest = [...items].sort((a, b) => b.normalizedScore - a.normalizedScore)[0];
    return {
      competencyId: strongest.competencyId,
      label: strongest.competencyLabel,
      category: competencyCategory(strongest.competencyId, locale),
      score,
      direction: dominantDirection(items),
      strength: evidenceStrength(score),
      evidenceSignalIds: items.map((item) => item.id),
      summary: strongest.businessImpact,
    };
  });
}

function hasMixedEvidence(signals: EvidenceSignal[]): boolean {
  const hasPositive = signals.some((signal) => signal.direction === "positive");
  const hasRisk = signals.some((signal) => signal.direction === "risk");
  const spread = Math.max(...signals.map((signal) => signal.normalizedScore), 0) - Math.min(...signals.map((signal) => signal.normalizedScore), 100);
  return (hasPositive && hasRisk) || spread >= 35 || signals.some((signal) => signal.direction === "mixed");
}

function buildRisks(signals: EvidenceSignal[], locale: IntelligenceLocale): HiringRisk[] {
  return signals
    .filter((signal) => signal.direction === "risk")
    .map((signal, index) => ({
      id: `risk-${index + 1}-${signal.competencyId}`,
      competencyId: signal.competencyId,
      competencyLabel: signal.competencyLabel,
      severity: riskSeverity(signal.normalizedScore),
      statement: signal.statement,
      businessImpact: signal.businessImpact,
      evidenceSignalIds: [signal.id],
      validationFocus:
        locale === "es"
          ? `${copy(locale).riskPrefix}: ${signal.competencyLabel.toLowerCase()}`
          : `${copy(locale).riskPrefix}: ${signal.competencyLabel.toLowerCase()}`,
    }));
}

function questionForRisk(risk: HiringRisk, locale: IntelligenceLocale): string {
  const byCompetency: Partial<Record<string, { en: string; es: string }>> = {
    "analytical-reasoning": {
      es: "Cuénteme sobre una decision reciente en la que tuvo que analizar informacion incompleta. Que evidencia uso y que asumio?",
      en: "Tell me about a recent decision where you had to analyze incomplete information. What evidence did you use and what did you assume?",
    },
    "adversity-control": {
      es: "Describa una situacion dificil en la que encontro algo bajo su control. Que hizo primero?",
      en: "Describe a difficult situation where you found something within your control. What did you do first?",
    },
    "personal-accountability": {
      es: "Cuénteme sobre un resultado negativo compartido por varias personas. Que parte asumio como responsabilidad propia?",
      en: "Tell me about a negative outcome shared by several people. Which part did you take ownership for?",
    },
    "setback-containment": {
      es: "Describa un contratiempo que pudo haber afectado otras areas de trabajo. Como evito que se extendiera?",
      en: "Describe a setback that could have affected other work areas. How did you prevent it from spreading?",
    },
    "recovery-orientation": {
      es: "Cuénteme sobre una decepcion laboral importante. Cuanto tiempo tardo en recuperarse y que hizo para avanzar?",
      en: "Tell me about an important work disappointment. How long did recovery take and what did you do to move forward?",
    },
    "resilience-under-pressure": {
      es: "Describa una etapa de presion sostenida. Que habitos o decisiones le ayudaron a mantener efectividad?",
      en: "Describe a period of sustained pressure. Which habits or decisions helped you remain effective?",
    },
  };

  return byCompetency[risk.competencyId]?.[locale] ?? (locale === "es"
    ? `Comparta un ejemplo reciente que permita validar ${risk.competencyLabel.toLowerCase()} en el trabajo.`
    : `Share a recent example that would validate ${risk.competencyLabel.toLowerCase()} at work.`);
}

function questionForStrength(signal: EvidenceSignal, locale: IntelligenceLocale): InterviewValidationQuestion {
  return {
    competency: signal.competencyLabel,
    question:
      locale === "es"
        ? `Cuénteme sobre una situacion reciente donde demostro ${signal.competencyLabel.toLowerCase()} en un contexto de trabajo.`
        : `Tell me about a recent work situation where you demonstrated ${signal.competencyLabel.toLowerCase()}.`,
    reason:
      locale === "es"
        ? `${copy(locale).strengthPrefix}: confirmar que la senal se traduce en conducta laboral observable.`
        : `${copy(locale).strengthPrefix}: confirm the signal translates into observable workplace behavior.`,
    evidenceSignalIds: [signal.id],
  };
}

function buildInterviewQuestions(signals: EvidenceSignal[], risks: HiringRisk[], locale: IntelligenceLocale): InterviewValidationQuestion[] {
  const riskQuestions = risks.map((risk) => ({
    competency: risk.competencyLabel,
    question: questionForRisk(risk, locale),
    reason:
      locale === "es"
        ? `${risk.validationFocus}. Esta pregunta valida directamente la senal de riesgo reportada.`
        : `${risk.validationFocus}. This question directly validates the reported risk signal.`,
    evidenceSignalIds: risk.evidenceSignalIds,
    riskId: risk.id,
  }));

  const strengthQuestions = signals
    .filter((signal) => signal.direction === "positive")
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, Math.max(0, 4 - riskQuestions.length))
    .map((signal) => questionForStrength(signal, locale));

  return [...riskQuestions, ...strengthQuestions].slice(0, 6);
}

function calculateConfidence({
  signals,
  assessmentCount,
  risks,
  mixed,
  roleRequirementsProvided,
  locale,
}: {
  signals: EvidenceSignal[];
  assessmentCount: number;
  risks: HiringRisk[];
  mixed: boolean;
  roleRequirementsProvided: boolean;
  locale: IntelligenceLocale;
}): ConfidenceAnalysis {
  const c = copy(locale);
  let score = 35;
  const factors: string[] = [];
  const limitations: string[] = [];
  const hasScoreOnly = signals.some((signal) => signal.kind === "score-only");
  const knownSignals = signals.filter((signal) => signal.kind !== "score-only");

  if (assessmentCount >= 2) {
    score += 15;
    factors.push(c.evidenceCount(assessmentCount) as string);
  }
  if (knownSignals.length >= 2) {
    score += 12;
    factors.push(locale === "es" ? "Existen multiples senales metodologicas interpretables." : "Multiple methodologically interpretable signals are available.");
  }
  if (knownSignals.length > assessmentCount) {
    score += 8;
    factors.push(locale === "es" ? "Hay detalle por dimensiones, no solo puntuacion general." : "Dimension-level detail is available, not only overall score.");
  }
  if (risks.some((risk) => risk.severity === "high")) score -= 18;
  else if (risks.length) score -= 10;
  if (mixed) {
    score -= 18;
    limitations.push(c.mixedEvidence as string);
  }
  if (hasScoreOnly) {
    score -= 8;
    limitations.push(c.unsupported as string);
  }
  if (!roleRequirementsProvided) {
    score -= 8;
    limitations.push(c.noRoleModel as string);
  }
  if (assessmentCount === 1) {
    score = Math.min(score, 49);
    limitations.push(c.singleAssessment as string);
  }
  if (!roleRequirementsProvided) score = Math.min(score, 74);
  if (mixed) score = Math.min(score, 59);

  const bounded = clampScore(score);
  return {
    score: bounded,
    level: bounded >= 75 ? "high" : bounded >= 55 ? "moderate" : "low",
    factors: factors.length ? factors : [c.evidenceCount(assessmentCount) as string],
    limitations: Array.from(new Set(limitations)),
  };
}

function buildRecommendation({
  assessmentAverage,
  confidence,
  risks,
  mixed,
  evidenceSignalIds,
  roleRequirementsProvided,
  locale,
}: {
  assessmentAverage: number;
  confidence: ConfidenceAnalysis;
  risks: HiringRisk[];
  mixed: boolean;
  evidenceSignalIds: string[];
  roleRequirementsProvided: boolean;
  locale: IntelligenceLocale;
}): IntelligenceRecommendation {
  const c = copy(locale);
  const hasHighRisk = risks.some((risk) => risk.severity === "high");
  const hasRisk = risks.length > 0;

  let level: IntelligenceRecommendation["level"] = "review";
  let title = c.reviewTitle as string;
  let rationale = c.reviewRationale as string;

  if (assessmentAverage >= 85 && !hasRisk && !mixed && confidence.level === "high") {
    level = "strong";
    title = c.strongTitle as string;
    rationale = c.strongRationale as string;
  } else if (assessmentAverage >= 70 && !hasHighRisk && !mixed) {
    level = "proceed";
    title = c.proceedTitle as string;
    rationale = c.proceedRationale as string;
  } else if (assessmentAverage < 55 || hasHighRisk) {
    level = "caution";
    title = c.cautionTitle as string;
    rationale = c.cautionRationale as string;
  }

  const limitations = confidence.limitations;
  if (!roleRequirementsProvided && !limitations.includes(c.noRoleModel as string)) {
    limitations.push(c.noRoleModel as string);
  }

  return {
    level,
    title,
    rationale: `${rationale} ${limitations[0] ?? ""}`.trim(),
    confidence: confidence.level,
    evidenceSignalIds,
    riskIds: risks.map((risk) => risk.id),
    nextSteps: [c.defaultStep as string, c.roleStep as string],
    limitations,
  };
}

export function buildAssessmentIntelligence(options: BuildAssessmentIntelligenceOptions): AssessmentIntelligenceReport {
  const locale = options.locale ?? "es";
  const roleRequirementsProvided = options.roleRequirementsProvided ?? false;
  const assessments = options.assessments.filter((assessment) => assessment.name && Number.isFinite(assessment.score));
  const signals = assessments.flatMap((assessment) => extractSignals(assessment, locale));
  const competencyEvidence = buildCompetencyEvidence(signals, locale);
  const mixed = hasMixedEvidence(signals);
  const risks = buildRisks(signals, locale);
  const confidence = calculateConfidence({
    signals,
    assessmentCount: assessments.length,
    risks,
    mixed,
    roleRequirementsProvided,
    locale,
  });
  const assessmentAverage = average(assessments.map((assessment) => clampScore(assessment.score)));
  const recommendation = buildRecommendation({
    assessmentAverage,
    confidence,
    risks,
    mixed,
    evidenceSignalIds: signals.map((signal) => signal.id),
    roleRequirementsProvided,
    locale,
  });
  const interviewQuestions = buildInterviewQuestions(signals, risks, locale);
  const strengths = signals
    .filter((signal) => signal.direction === "positive")
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, 4)
    .map((signal) => `${signal.statement} ${signal.businessImpact}`);
  const developmentAreas = risks.length
    ? risks.map((risk) => `${risk.statement} ${risk.businessImpact}`)
    : confidence.limitations.slice(0, 3);

  return {
    locale,
    completedAssessmentCount: assessments.length,
    evidenceSignals: signals,
    competencyEvidence,
    strengths,
    developmentAreas,
    risks,
    interviewQuestions,
    confidence,
    recommendation,
    executiveSummary: {
      headline: copy(locale).summaryHeadline as string,
      summary: copy(locale).summaryBody as string,
      evidence: [
        copy(locale).evidenceCount(assessments.length) as string,
        ...signals.slice(0, 3).map((signal) => signal.statement),
        ...confidence.limitations.slice(0, 2),
      ],
    },
    methodologyLimitations: Array.from(new Set([...confidence.limitations, ...signals.map((signal) => signal.limitation).filter(Boolean)])) as string[],
  };
}
