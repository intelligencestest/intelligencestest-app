import { scoreIE, type IEDimension } from "@/lib/questions/integrity-ethics";
import { buildStructuredChoiceEvidence, type DimensionEvidenceConfig, type StructuredChoiceScore } from "./structured-choice";
import { clampScore } from "../scales";
import type { AssessmentResultInput, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function scoreFrom(input: AssessmentResultInput): StructuredChoiceScore<IEDimension> {
  if (input.scoreDetails?.type === "integrity-ethics") {
    return input.scoreDetails as StructuredChoiceScore<IEDimension>;
  }

  const answers = answersFrom(input.rawAnswers);
  if (answers) return scoreIE(answers);

  const fallback = clampScore(input.score);
  return {
    correct: 0,
    total: 0,
    percentage: fallback,
    dimensions: { Honesty: fallback, Accountability: fallback, Ethics: fallback, Trustworthiness: fallback },
  };
}

const DIMENSIONS: Array<DimensionEvidenceConfig<IEDimension>> = [
  {
    id: "Honesty",
    competencyId: "integrity-judgment",
    label: { en: "Honesty", es: "Honestidad", fr: "Honnêteté" },
    positiveImpact: {
      en: "Supports transparent communication when facts are uncomfortable or commercially inconvenient.",
      es: "Respalda comunicacion transparente cuando los hechos son incomodos o comercialmente inconvenientes.",
      fr: "Favorise une communication transparente lorsque les faits sont inconfortables ou commercialement défavorables.",
    },
    riskImpact: {
      en: "May create risk in roles requiring accurate disclosure, client trust, or reliable escalation.",
      es: "Puede crear riesgo en roles que requieren disclosure preciso, confianza de clientes o escalamiento fiable.",
      fr: "Peut créer un risque dans les postes exigeant une communication exacte des faits, la confiance des clients ou une escalade fiable.",
    },
  },
  {
    id: "Accountability",
    competencyId: "personal-accountability",
    label: { en: "Accountability", es: "Responsabilidad", fr: "Responsabilité" },
    positiveImpact: {
      en: "Supports ownership of mistakes, early escalation, and practical corrective action.",
      es: "Respalda asumir errores, escalar temprano y tomar acciones correctivas practicas.",
      fr: "Favorise la reconnaissance des erreurs, l'escalade précoce et des actions correctives pragmatiques.",
    },
    riskImpact: {
      en: "May deflect responsibility or delay corrective action when outcomes are negative.",
      es: "Puede desviar responsabilidad o retrasar acciones correctivas cuando los resultados son negativos.",
      fr: "Peut conduire à se décharger de la responsabilité ou à retarder les actions correctives lorsque les résultats sont négatifs.",
    },
  },
  {
    id: "Ethics",
    competencyId: "ethical-compliance",
    label: { en: "Ethics", es: "Etica", fr: "Éthique" },
    positiveImpact: {
      en: "Supports compliance, fairness, and principled conduct under pressure.",
      es: "Respalda cumplimiento, equidad y conducta basada en principios bajo presion.",
      fr: "Favorise le respect des règles, l'équité et une conduite fondée sur des principes sous pression.",
    },
    riskImpact: {
      en: "May compromise standards when pressured by authority, deadlines, or personal relationships.",
      es: "Puede comprometer estandares bajo presion de autoridad, plazos o relaciones personales.",
      fr: "Peut conduire à compromettre les normes sous la pression de l'autorité, des délais ou des relations personnelles.",
    },
  },
  {
    id: "Trustworthiness",
    competencyId: "trust-reliability",
    label: { en: "Trustworthiness", es: "Confiabilidad", fr: "Fiabilité" },
    positiveImpact: {
      en: "Supports dependable commitments, confidentiality, and trust maintenance with stakeholders.",
      es: "Respalda compromisos fiables, confidencialidad y mantenimiento de confianza con interesados.",
      fr: "Favorise des engagements fiables, la confidentialité et le maintien de la confiance avec les parties prenantes.",
    },
    riskImpact: {
      en: "May weaken stakeholder trust through late disclosure, unclear commitments, or poor confidentiality judgment.",
      es: "Puede debilitar la confianza por comunicacion tardia, compromisos poco claros o mal criterio de confidencialidad.",
      fr: "Peut fragiliser la confiance par une communication tardive, des engagements peu clairs ou un jugement insuffisant en matière de confidentialité.",
    },
  },
];

export function extractIntegrityEthicsEvidence(input: AssessmentResultInput, locale: IntelligenceLocale) {
  return buildStructuredChoiceEvidence({
    input,
    locale,
    assessmentKey: "integrity-ethics",
    kind: "integrity",
    assessmentLabel: { en: "integrity and ethical judgment", es: "integridad y criterio etico", fr: "intégrité et jugement éthique" },
    overallCompetencyId: "integrity-judgment",
    scored: scoreFrom(input),
    dimensions: DIMENSIONS,
    limitation: {
      en: "Integrity & Ethics uses situational choices; it supports risk screening but does not replace references, background checks, or policy-specific compliance review.",
      es: "Integrity & Ethics usa decisiones situacionales; apoya evaluacion de riesgo pero no reemplaza referencias, verificaciones ni revision de cumplimiento especifica.",
      fr: "Integrity & Ethics s'appuie sur des choix situationnels ; il aide à évaluer les risques, mais ne remplace ni les références, ni les vérifications, ni l'examen de conformité propre au poste.",
    },
  });
}
