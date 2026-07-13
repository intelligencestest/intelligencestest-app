import { scoreAQ } from "@/lib/questions/aq";
import { competencyLabel } from "../taxonomy";
import { clampScore, evidenceDirection, evidenceStrength, normalizeScore } from "../scales";
import type { AQScoreDetails, AssessmentResultInput, CompetencyId, EvidenceSignal, IntelligenceLocale } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function scoreFrom(input: AssessmentResultInput): AQScoreDetails {
  if (input.scoreDetails?.type === "aq") return input.scoreDetails;

  const answers = answersFrom(input.rawAnswers);
  if (answers) {
    const scored = scoreAQ(answers);
    return {
      type: "aq",
      total: scored.total,
      control: scored.control,
      ownership: scored.ownership,
      reach: scored.reach,
      endurance: scored.endurance,
      interpretation: scored.interpretation,
      description: scored.description,
    };
  }

  const total = input.score > 100 ? clampScore(input.score, 200) : clampScore(input.score * 2, 200);
  const estimatedDimension = Math.round(total / 4);
  return {
    type: "aq",
    total,
    control: estimatedDimension,
    ownership: estimatedDimension,
    reach: estimatedDimension,
    endurance: estimatedDimension,
  };
}

const DIMENSIONS: Array<{
  id: "control" | "ownership" | "reach" | "endurance";
  competencyId: CompetencyId;
  label: { en: string; es: string; fr: string };
}> = [
  {
    id: "control",
    competencyId: "adversity-control",
    label: { en: "Control", es: "Control", fr: "Contrôle" },
  },
  {
    id: "ownership",
    competencyId: "personal-accountability",
    label: { en: "Ownership", es: "Responsabilidad", fr: "Responsabilité" },
  },
  {
    id: "reach",
    competencyId: "setback-containment",
    label: { en: "Reach", es: "Alcance", fr: "Portée" },
  },
  {
    id: "endurance",
    competencyId: "recovery-orientation",
    label: { en: "Endurance", es: "Duracion", fr: "Endurance" },
  },
];

function totalStatement(score: number, locale: IntelligenceLocale): string {
  if (score >= 80) {
    return locale === "es"
      ? "Evidencia fuerte de respuesta resiliente ante presion y contratiempos."
      : locale === "fr"
        ? "Preuves solides d'une réponse résiliente face à la pression et aux contretemps."
        : "Strong evidence of resilient response under pressure and setbacks.";
  }
  if (score >= 65) {
    return locale === "es"
      ? "Evidencia favorable de resiliencia, con validacion recomendada en situaciones reales."
      : locale === "fr"
        ? "Preuves favorables de résilience, à vérifier dans des situations réelles."
        : "Favorable evidence of resilience, with recommended validation in real situations.";
  }
  if (score >= 50) {
    return locale === "es"
      ? "Evidencia mixta de resiliencia; algunas dimensiones pueden requerir seguimiento."
      : locale === "fr"
        ? "Preuves contrastées de résilience ; certaines dimensions peuvent nécessiter un examen complémentaire."
        : "Mixed resilience evidence; some dimensions may require follow-up.";
  }
  return locale === "es"
    ? "Evidencia de riesgo en respuesta ante adversidad, presion o recuperacion despues de contratiempos."
    : locale === "fr"
      ? "Preuves de risque dans la réponse à l'adversité, à la pression ou au rétablissement après des contretemps."
      : "Risk evidence in response to adversity, pressure, or recovery after setbacks.";
}

function totalImpact(score: number, locale: IntelligenceLocale): string {
  if (score >= 80) {
    return locale === "es"
      ? "Puede sostener desempeno cuando existen obstaculos, presion o informacion imperfecta."
      : locale === "fr"
        ? "Peut maintenir sa performance face aux obstacles, à la pression ou à des informations imparfaites."
        : "May sustain performance when obstacles, pressure, or imperfect information are present.";
  }
  if (score >= 65) {
    return locale === "es"
      ? "Puede manejar contratiempos con efectividad si el contexto y los apoyos del rol son adecuados."
      : locale === "fr"
        ? "Peut gérer efficacement les contretemps lorsque le contexte et les soutiens du poste sont adaptés."
        : "May handle setbacks effectively when the role context and supports are appropriate.";
  }
  if (score >= 50) {
    return locale === "es"
      ? "La respuesta ante adversidad parece variable y debe validarse con ejemplos conductuales."
      : locale === "fr"
        ? "La réponse à l'adversité semble variable et doit être vérifiée par des exemples comportementaux."
        : "Response to adversity appears variable and should be validated with behavioral examples.";
  }
  return locale === "es"
    ? "Puede presentar mayor exposicion en roles con presion sostenida, ambiguedad o recuperacion rapida."
    : locale === "fr"
      ? "Peut présenter une exposition plus forte dans les postes marqués par une pression soutenue, l'ambiguïté ou des exigences de récupération rapide."
      : "May show higher exposure in roles with sustained pressure, ambiguity, or rapid recovery demands.";
}

function dimensionStatement(label: string, score: number, locale: IntelligenceLocale): string {
  if (score >= 65) {
    return locale === "es"
      ? `${label}: evidencia favorable en la dimension CORE completada.`
      : locale === "fr"
        ? `${label} : preuves favorables dans la dimension CORE évaluée.`
        : `${label}: favorable evidence in the completed CORE dimension.`;
  }
  if (score >= 50) {
    return locale === "es"
      ? `${label}: evidencia mixta; conviene validar consistencia con ejemplos laborales.`
      : locale === "fr"
        ? `${label} : preuves contrastées ; la cohérence doit être vérifiée à l'aide d'exemples professionnels.`
        : `${label}: mixed evidence; consistency should be validated with work examples.`;
  }
  return locale === "es"
    ? `${label}: senal de riesgo que requiere validacion directa en entrevista.`
    : locale === "fr"
      ? `${label} : signal de risque nécessitant une vérification directe en entretien.`
      : `${label}: risk signal requiring direct interview validation.`;
}

function dimensionImpact(competencyId: CompetencyId, score: number, locale: IntelligenceLocale): string {
  const risk = score < 50;
  const copy: Partial<Record<CompetencyId, { positive: { en: string; es: string; fr: string }; risk: { en: string; es: string; fr: string } }>> = {
    "adversity-control": {
      positive: {
        en: "Supports a tendency to look for actionable levers in difficult situations.",
        es: "Respalda una tendencia a buscar acciones posibles en situaciones dificiles.",
        fr: "Favorise la recherche de leviers d'action concrets dans les situations difficiles.",
      },
      risk: {
        en: "May feel reduced control when facing obstacles, increasing the need for structure or support.",
        es: "Puede sentir menor control ante obstaculos, elevando la necesidad de estructura o apoyo.",
        fr: "Peut ressentir un contrôle réduit face aux obstacles, ce qui accroît le besoin de structure ou de soutien.",
      },
    },
    "personal-accountability": {
      positive: {
        en: "Supports ownership of improvement even when the problem is shared or externally caused.",
        es: "Respalda asumir responsabilidad de mejora aun cuando el problema sea compartido o externo.",
        fr: "Favorise la prise de responsabilité pour améliorer la situation, même lorsque le problème est partagé ou externe.",
      },
      risk: {
        en: "May externalize setbacks or wait for others to resolve difficult situations.",
        es: "Puede externalizar contratiempos o esperar que otros resuelvan situaciones dificiles.",
        fr: "Peut attribuer les contretemps à des facteurs extérieurs ou attendre que d'autres résolvent les situations difficiles.",
      },
    },
    "setback-containment": {
      positive: {
        en: "Supports limiting the spread of one setback into unrelated tasks or relationships.",
        es: "Respalda limitar que un contratiempo afecte tareas o relaciones no relacionadas.",
        fr: "Favorise la limitation des effets d'un contretemps sur des tâches ou des relations non concernées.",
      },
      risk: {
        en: "Setbacks may spill into unrelated work areas and reduce consistency under pressure.",
        es: "Los contratiempos pueden extenderse a areas no relacionadas y reducir consistencia bajo presion.",
        fr: "Les contretemps peuvent se répercuter sur des domaines non concernés et réduire la constance sous pression.",
      },
    },
    "recovery-orientation": {
      positive: {
        en: "Supports recovery within a healthy timeframe after pressure or disappointment.",
        es: "Respalda recuperacion en un plazo saludable despues de presion o decepcion.",
        fr: "Favorise un rétablissement dans un délai raisonnable après une période de pression ou une déception.",
      },
      risk: {
        en: "Recovery after setbacks may take longer, which can matter in fast-paced roles.",
        es: "La recuperacion despues de contratiempos puede tomar mas tiempo, relevante en roles dinamicos.",
        fr: "Le rétablissement après des contretemps peut prendre davantage de temps, ce qui est important dans les postes à rythme soutenu.",
      },
    },
  };

  const fallback =
    locale === "es"
      ? "Debe validarse con ejemplos laborales recientes antes de usarlo como evidencia de ajuste."
      : locale === "fr"
        ? "Ce point doit être vérifié à l'aide d'exemples professionnels récents avant d'être utilisé comme élément d'adéquation au poste."
        : "Should be validated with recent work examples before using it as role-fit evidence.";

  return (risk ? copy[competencyId]?.risk[locale] : copy[competencyId]?.positive[locale]) ?? fallback;
}

export function extractAQEvidence(input: AssessmentResultInput, locale: IntelligenceLocale): EvidenceSignal[] {
  const scored = scoreFrom(input);
  const assessmentId = input.assessmentId ?? input.id ?? input.name;
  const totalNormalized = normalizeScore(scored.total, 200);
  const signals: EvidenceSignal[] = [
    {
      id: `${assessmentId}:aq:resilience-under-pressure`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey: "aq",
      competencyId: "resilience-under-pressure",
      competencyLabel: competencyLabel("resilience-under-pressure", locale),
      kind: "resilience",
      score: scored.total,
      maxScore: 200,
      normalizedScore: totalNormalized,
      direction: evidenceDirection(totalNormalized),
      strength: evidenceStrength(totalNormalized),
      statement: totalStatement(totalNormalized, locale),
      businessImpact: totalImpact(totalNormalized, locale),
      limitation:
        locale === "es"
          ? "AQ no mide habilidad tecnica, experiencia laboral, motivacion ni ajuste completo al rol."
          : locale === "fr"
            ? "L'AQ ne mesure ni les compétences techniques, ni l'expérience professionnelle, ni la motivation, ni l'adéquation globale au poste."
            : "AQ does not measure technical skill, work experience, motivation, or full role fit.",
      rawEvidence:
        locale === "es"
          ? `Puntuacion AQ total ${scored.total}/200`
          : locale === "fr"
            ? `Score AQ total : ${scored.total}/200`
            : `Total AQ score ${scored.total}/200`,
    },
  ];

  for (const dimension of DIMENSIONS) {
    const raw = scored[dimension.id];
    const normalizedScore = normalizeScore(raw, 50);
    const label = dimension.label[locale];
    signals.push({
      id: `${assessmentId}:aq:${dimension.id}`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey: "aq",
      competencyId: dimension.competencyId,
      competencyLabel: competencyLabel(dimension.competencyId, locale),
      dimensionId: dimension.id,
      dimensionLabel: label,
      kind: "resilience",
      score: raw,
      maxScore: 50,
      normalizedScore,
      direction: evidenceDirection(normalizedScore),
      strength: evidenceStrength(normalizedScore),
      statement: dimensionStatement(label, normalizedScore, locale),
      businessImpact: dimensionImpact(dimension.competencyId, normalizedScore, locale),
      limitation:
        locale === "es"
          ? "Debe validarse con ejemplos recientes de presion, responsabilidad y recuperacion."
          : locale === "fr"
            ? "Ce point doit être vérifié à l'aide d'exemples récents de pression, de responsabilité et de récupération."
            : "Should be validated with recent examples of pressure, accountability, and recovery.",
      rawEvidence: `${label} ${raw}/50`,
    });
  }

  return signals;
}
