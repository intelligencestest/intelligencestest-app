import { extractAQEvidence } from "./extractors/aq";
import { extractCommunicationSkillsEvidence } from "./extractors/communication-skills";
import { extractCriticalThinkingEvidence } from "./extractors/critical-thinking";
import { extractCustomerServiceEvidence } from "./extractors/customer-service";
import { extractDecisionMakingEvidence } from "./extractors/decision-making";
import { extractEmotionalIntelligenceEvidence } from "./extractors/emotional-intelligence";
import { extractIntegrityEthicsEvidence } from "./extractors/integrity-ethics";
import { extractLeadershipStylesEvidence } from "./extractors/leadership-styles";
import { extractProblemSolvingEvidence } from "./extractors/problem-solving";
import { extractScoreOnlyEvidence } from "./extractors/score-only";
import { extractSalesAptitudeEvidence } from "./extractors/sales-aptitude";
import { extractSituationalJudgmentEvidence } from "./extractors/situational-judgment";
import { extractTeamworkCollaborationEvidence } from "./extractors/teamwork-collaboration";
import { assessmentKey, clampScore, evidenceStrength, riskSeverity } from "./scales";
import { computeConfidenceV1, robustSD } from "./evidence-methodology";
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

export const ASSESSMENT_INTELLIGENCE_ENGINE_VERSION = "2026.07.04-ail-v1";

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
  fr: {
    noRoleModel:
      "Aucun modèle de compétences du poste n'a été fourni ; ce rapport évalue les résultats aux évaluations terminées, et non l'adéquation globale au poste.",
    singleAssessment: "La conclusion repose sur une seule évaluation terminée ; le niveau de confiance ne peut donc pas être élevé.",
    unsupported: "Certaines évaluations ne disposent pas encore d'une interprétation méthodologique spécifique dans le moteur d'analyse.",
    mixedEvidence: "Les preuves sont contrastées entre les évaluations ou les dimensions ; le niveau de confiance est donc réduit.",
    evidenceCount: (count: number) => `${count} évaluation${count === 1 ? "" : "s"} terminée${count === 1 ? "" : "s"} analysée${count === 1 ? "" : "s"}.`,
    summaryHeadline: "Recommandation fondée sur des preuves terminées et traçables.",
    summaryBody:
      "La recommandation s'appuie sur des signaux de preuve issus des évaluations terminées. Les conclusions se limitent aux instruments disponibles et doivent être vérifiées lors d'un entretien structuré.",
    proceedTitle: "Poursuivre avec une validation structurée",
    reviewTitle: "Examiner avec une validation complémentaire",
    cautionTitle: "Ne pas poursuivre sans éléments complémentaires",
    strongTitle: "Poursuivre en priorité, sous réserve de validation",
    proceedRationale: "Les preuves disponibles permettent de poursuivre le processus, avec une validation ciblée en entretien.",
    reviewRationale: "Les preuves doivent être examinées avant de poursuivre, car des risques, des signaux contrastés ou une couverture limitée sont présents.",
    cautionRationale: "Les preuves disponibles ne permettent pas d'étayer une conclusion favorable sans informations complémentaires.",
    strongRationale: "Les preuves disponibles sont favorables et cohérentes, mais la décision finale dépend toujours du poste, de l'entretien et des références.",
    defaultStep: "Vérifiez les signaux rapportés à l'aide d'exemples comportementaux récents avant toute décision finale.",
    roleStep: "Comparez ces preuves aux compétences essentielles du poste avant de confirmer l'adéquation.",
    riskPrefix: "Vérifier le risque",
    strengthPrefix: "Vérifier la force",
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
  if (key === "customer-service") return extractCustomerServiceEvidence(input, locale);
  if (key === "sales-aptitude") return extractSalesAptitudeEvidence(input, locale);
  if (key === "leadership-styles") return extractLeadershipStylesEvidence(input, locale);
  if (key === "decision-making") return extractDecisionMakingEvidence(input, locale);
  if (key === "problem-solving") return extractProblemSolvingEvidence(input, locale);
  if (key === "communication-skills") return extractCommunicationSkillsEvidence(input, locale);
  if (key === "integrity-ethics") return extractIntegrityEthicsEvidence(input, locale);
  if (key === "situational-judgment") return extractSituationalJudgmentEvidence(input, locale);
  if (key === "emotional-intelligence") return extractEmotionalIntelligenceEvidence(input, locale);
  if (key === "teamwork-collaboration") return extractTeamworkCollaborationEvidence(input, locale);
  return extractScoreOnlyEvidence(input, locale);
}

function assessmentDecisionScore(input: AssessmentResultInput): number {
  const key = assessmentKey(input.name);
  // Leadership Styles is descriptive: the score is style concentration, not
  // performance. Keep it neutral in recommendation math while its evidence
  // signals still inform strengths, risks, and validation questions.
  if (key === "leadership-styles") return 60;
  return clampScore(input.score);
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
  // MAD-based dispersion (evidence-methodology Stage 2) replaces the old
  // min/max range check: with 20+ dimension-level signals, a single small
  // sub-dimension outlier made the range test flag nearly every candidate
  // "mixed" — punishing measurement breadth instead of real inconsistency.
  const dispersion = robustSD(signals.map((signal) => signal.normalizedScore));
  // V2 veto calibration: only a genuinely weak dimension (<40, the existing
  // high-severity line) vetoes an otherwise-positive profile. Mediocre
  // 50-64 signals inform risks/limitations but no longer flag "mixed".
  const hasSevereRisk = signals.some((signal) => signal.direction === "risk" && signal.normalizedScore < 40);
  return (hasPositive && hasSevereRisk) || dispersion >= 25;
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
  const byCompetency: Partial<Record<string, Record<IntelligenceLocale, string>>> = {
    "analytical-reasoning": {
      es: "Cuénteme sobre una decision reciente en la que tuvo que analizar informacion incompleta. Que evidencia uso y que asumio?",
      en: "Tell me about a recent decision where you had to analyze incomplete information. What evidence did you use and what did you assume?",
      fr: "Parlez-moi d'une décision récente pour laquelle vous avez dû analyser des informations incomplètes. Quelles preuves avez-vous utilisées et quelles hypothèses avez-vous formulées ?",
    },
    "adversity-control": {
      es: "Describa una situacion dificil en la que encontro algo bajo su control. Que hizo primero?",
      en: "Describe a difficult situation where you found something within your control. What did you do first?",
      fr: "Décrivez une situation difficile dans laquelle vous avez identifié un élément sur lequel vous pouviez agir. Qu'avez-vous fait en premier ?",
    },
    "personal-accountability": {
      es: "Cuénteme sobre un resultado negativo compartido por varias personas. Que parte asumio como responsabilidad propia?",
      en: "Tell me about a negative outcome shared by several people. Which part did you take ownership for?",
      fr: "Parlez-moi d'un résultat négatif partagé par plusieurs personnes. Quelle part avez-vous assumée personnellement ?",
    },
    "setback-containment": {
      es: "Describa un contratiempo que pudo haber afectado otras areas de trabajo. Como evito que se extendiera?",
      en: "Describe a setback that could have affected other work areas. How did you prevent it from spreading?",
      fr: "Décrivez un contretemps susceptible d'affecter d'autres domaines de travail. Comment avez-vous évité qu'il ne se propage ?",
    },
    "recovery-orientation": {
      es: "Cuénteme sobre una decepcion laboral importante. Cuanto tiempo tardo en recuperarse y que hizo para avanzar?",
      en: "Tell me about an important work disappointment. How long did recovery take and what did you do to move forward?",
      fr: "Parlez-moi d'une déception professionnelle importante. Combien de temps vous a-t-il fallu pour vous en remettre et qu'avez-vous fait pour avancer ?",
    },
    "resilience-under-pressure": {
      es: "Describa una etapa de presion sostenida. Que habitos o decisiones le ayudaron a mantener efectividad?",
      en: "Describe a period of sustained pressure. Which habits or decisions helped you remain effective?",
      fr: "Décrivez une période de pression soutenue. Quelles habitudes ou décisions vous ont aidé à rester efficace ?",
    },
    "professional-communication": {
      es: "Cuénteme sobre una ocasion en la que tuvo que adaptar su comunicacion para una audiencia dificil. Que cambio y por que?",
      en: "Tell me about a time you had to adapt your communication for a difficult audience. What changed and why?",
      fr: "Parlez-moi d'une situation où vous avez dû adapter votre communication à un public difficile. Qu'avez-vous modifié et pourquoi ?",
    },
    "active-listening": {
      es: "Describa una situacion donde escuchar activamente cambio su decision o su respuesta.",
      en: "Describe a situation where active listening changed your decision or response.",
      fr: "Décrivez une situation dans laquelle l'écoute active a modifié votre décision ou votre réponse.",
    },
    "integrity-judgment": {
      es: "Cuénteme sobre una vez en la que decir la verdad tenia un costo profesional. Como actuo?",
      en: "Tell me about a time when telling the truth carried a professional cost. How did you act?",
      fr: "Parlez-moi d'une situation où dire la vérité avait un coût professionnel. Comment avez-vous agi ?",
    },
    "ethical-compliance": {
      es: "Describa una situacion donde tuvo que defender una regla, politica o estandar etico bajo presion.",
      en: "Describe a situation where you had to uphold a rule, policy, or ethical standard under pressure.",
      fr: "Décrivez une situation où vous avez dû faire respecter une règle, une politique ou une norme éthique sous pression.",
    },
    "trust-reliability": {
      es: "Cuénteme sobre una ocasion en la que no podia cumplir un compromiso tal como estaba acordado. Como manejo la confianza?",
      en: "Tell me about a time you could not meet a commitment exactly as agreed. How did you protect trust?",
      fr: "Parlez-moi d'une situation où vous ne pouviez pas respecter un engagement comme prévu. Comment avez-vous préservé la confiance ?",
    },
    adaptability: {
      es: "Describa un cambio inesperado que afecto su trabajo. Como reajusto prioridades y comunico el impacto?",
      en: "Describe an unexpected change that affected your work. How did you reset priorities and communicate impact?",
      fr: "Décrivez un changement imprévu qui a affecté votre travail. Comment avez-vous réajusté vos priorités et communiqué ses conséquences ?",
    },
    "emotional-self-awareness": {
      es: "Cuénteme sobre una situacion laboral donde reconocer su propia emocion cambio su respuesta.",
      en: "Tell me about a work situation where recognizing your own emotion changed your response.",
      fr: "Parlez-moi d'une situation professionnelle dans laquelle le fait de reconnaître votre propre émotion a modifié votre réponse.",
    },
    "emotional-self-regulation": {
      es: "Describa una conversacion tensa donde tuvo que controlar su primera reaccion para mantener efectividad.",
      en: "Describe a tense conversation where you had to manage your first reaction to remain effective.",
      fr: "Décrivez une conversation tendue dans laquelle vous avez dû maîtriser votre première réaction pour rester efficace.",
    },
    "relationship-management": {
      es: "Cuénteme sobre una relacion laboral que tuvo que reparar despues de un malentendido o conflicto.",
      en: "Tell me about a work relationship you had to repair after a misunderstanding or conflict.",
      fr: "Parlez-moi d'une relation professionnelle que vous avez dû réparer après un malentendu ou un conflit.",
    },
    "team-cooperation": {
      es: "Describa una ocasion en la que puso el resultado del equipo por encima de su preferencia personal.",
      en: "Describe a time when you put the team outcome ahead of your personal preference.",
      fr: "Décrivez une situation où vous avez fait passer le résultat de l'équipe avant votre préférence personnelle.",
    },
    "team-reliability": {
      es: "Cuénteme sobre una vez en la que otros dependian de su entrega y aparecio un obstaculo. Que hizo?",
      en: "Tell me about a time others depended on your delivery and an obstacle appeared. What did you do?",
      fr: "Parlez-moi d'une situation où d'autres personnes dépendaient de votre livraison et où un obstacle est apparu. Qu'avez-vous fait ?",
    },
    "conflict-resolution": {
      es: "Describa un desacuerdo laboral que resolvio directamente. Que hizo para separar el problema de lo personal?",
      en: "Describe a work disagreement you resolved directly. What did you do to separate the issue from the personal dynamic?",
      fr: "Décrivez un désaccord professionnel que vous avez traité directement. Qu'avez-vous fait pour séparer le problème de la relation personnelle ?",
    },
  };

  return byCompetency[risk.competencyId]?.[locale] ?? (locale === "es"
    ? `Comparta un ejemplo reciente que permita validar ${risk.competencyLabel.toLowerCase()} en el trabajo.`
    : locale === "fr"
      ? `Partagez un exemple récent permettant de vérifier ${risk.competencyLabel.toLowerCase()} en situation de travail.`
      : `Share a recent example that would validate ${risk.competencyLabel.toLowerCase()} at work.`);
}

function questionForStrength(signal: EvidenceSignal, locale: IntelligenceLocale): InterviewValidationQuestion {
  return {
    competency: signal.competencyLabel,
    question:
      locale === "es"
        ? `Cuénteme sobre una situacion reciente donde demostro ${signal.competencyLabel.toLowerCase()} en un contexto de trabajo.`
        : locale === "fr"
          ? `Parlez-moi d'une situation professionnelle récente dans laquelle vous avez démontré ${signal.competencyLabel.toLowerCase()}.`
          : `Tell me about a recent work situation where you demonstrated ${signal.competencyLabel.toLowerCase()}.`,
    reason:
      locale === "es"
        ? `${copy(locale).strengthPrefix}: confirmar que la senal se traduce en conducta laboral observable.`
        : locale === "fr"
          ? `${copy(locale).strengthPrefix}: confirmer que ce signal se traduit par un comportement professionnel observable.`
          : `${copy(locale).strengthPrefix}: confirm the signal translates into observable workplace behavior.`,
    evidenceSignalIds: [signal.id],
  };
}

function buildInterviewQuestions(signals: EvidenceSignal[], risks: HiringRisk[], locale: IntelligenceLocale): InterviewValidationQuestion[] {
  // Multiple signals (e.g. an assessment's "overall" signal and one of its
  // per-dimension signals) can share the same competencyId. Track which
  // competencies already have a question so we never ask the same thing twice.
  const usedCompetencyIds = new Set<string>();

  const riskQuestions = risks
    .filter((risk) => {
      if (usedCompetencyIds.has(risk.competencyId)) return false;
      usedCompetencyIds.add(risk.competencyId);
      return true;
    })
    .map((risk) => ({
      competency: risk.competencyLabel,
      question: questionForRisk(risk, locale),
      reason:
        locale === "es"
          ? `${risk.validationFocus}. Esta pregunta valida directamente la senal de riesgo reportada.`
          : locale === "fr"
            ? `${risk.validationFocus}. Cette question permet de vérifier directement le signal de risque rapporté.`
            : `${risk.validationFocus}. This question directly validates the reported risk signal.`,
      evidenceSignalIds: risk.evidenceSignalIds,
      riskId: risk.id,
    }));

  const strengthQuota = Math.max(0, 4 - riskQuestions.length);
  const strengthQuestions: InterviewValidationQuestion[] = [];
  const sortedPositiveSignals = signals
    .filter((signal) => signal.direction === "positive")
    .sort((a, b) => b.normalizedScore - a.normalizedScore);

  for (const signal of sortedPositiveSignals) {
    if (strengthQuestions.length >= strengthQuota) break;
    if (usedCompetencyIds.has(signal.competencyId)) continue;
    usedCompetencyIds.add(signal.competencyId);
    strengthQuestions.push(questionForStrength(signal, locale));
  }

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
  // Confidence now comes from the deterministic null-honest fallback model
  // (evidence-methodology Stage 2) instead of the old additive heuristic,
  // which structurally capped every full-bundle candidate at 54 ("low").
  const c = copy(locale);
  const factors: string[] = [];
  const limitations: string[] = [];
  const hasScoreOnly = signals.some((signal) => signal.kind === "score-only");
  const knownSignals = signals.filter((signal) => signal.kind !== "score-only");

  const byCompetency = new Map<string, number[]>();
  for (const signal of signals) {
    const list = byCompetency.get(signal.competencyId) ?? [];
    list.push(signal.normalizedScore);
    byCompetency.set(signal.competencyId, list);
  }
  const facetMeans = [...byCompetency.values()].map((values) => values.reduce((sum, v) => sum + v, 0) / values.length);

  const v1 = computeConfidenceV1({
    unitScores: signals.map((signal) => signal.normalizedScore),
    expectedUnits: signals.length,
    facetMeans: facetMeans.length >= 2 ? facetMeans : null,
    flaggedUnits: 0,
  });

  if (assessmentCount >= 2) factors.push(c.evidenceCount(assessmentCount) as string);
  if (knownSignals.length >= 2) {
    factors.push(locale === "es" ? "Existen multiples senales metodologicas interpretables." : locale === "fr" ? "Plusieurs signaux méthodologiques interprétables sont disponibles." : "Multiple methodologically interpretable signals are available.");
  }
  if (mixed) limitations.push(c.mixedEvidence as string);
  if (hasScoreOnly) limitations.push(c.unsupported as string);
  if (!roleRequirementsProvided) limitations.push(c.noRoleModel as string);
  if (assessmentCount === 1) limitations.push(c.singleAssessment as string);

  return {
    score: v1.score,
    level: v1.level,
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

  // "strong": clean, consistent, high-scoring evidence with non-low
  // confidence from the deterministic fallback model (single-assessment
  // profiles gate to low via <4 valid units, so they can never be strong).
  if (assessmentAverage >= 85 && !hasRisk && !mixed && confidence.level !== "low") {
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
    // Client-safe: never append confidence/limitation caveats here — those
    // are internal-only and belong on confidenceCaveat/limitations instead.
    // See lib/pdf/client-brief-template.ts and the client-summary page,
    // which read only .rationale and must never see internal caveat text.
    rationale,
    confidenceCaveat: limitations[0] ?? null,
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
  const assessmentAverage = average(assessments.map((assessment) => assessmentDecisionScore(assessment)));
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
    engineVersion: ASSESSMENT_INTELLIGENCE_ENGINE_VERSION,
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
