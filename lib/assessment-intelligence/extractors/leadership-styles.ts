import { LEADERSHIP_QUESTIONS, scoreLeadership } from "@/lib/questions/leadership-styles";
import type { LeadershipStyle } from "@/lib/questions/leadership-styles";
import { competencyLabel, localize } from "../taxonomy";
import { evidenceStrength, normalizeScore } from "../scales";
import type { AssessmentResultInput, CompetencyId, EvidenceSignal, IntelligenceLocale, LeadershipScoreDetails, LocalizedText } from "../types";

function answersFrom(rawAnswers: unknown): (number | null)[] | null {
  return Array.isArray(rawAnswers) ? rawAnswers.map((answer) => (typeof answer === "number" ? answer : null)) : null;
}

function scoreFrom(input: AssessmentResultInput): LeadershipScoreDetails {
  if (input.scoreDetails?.type === "leadership-styles") return input.scoreDetails;

  const answers = answersFrom(input.rawAnswers);
  if (answers) return { type: "leadership-styles", ...scoreLeadership(answers) };

  return {
    type: "leadership-styles",
    score: Math.max(0, Math.min(100, Math.round(input.score))),
    dominantStyle: "Visionary",
    counts: {
      Visionary: 0,
      Coaching: 0,
      Affiliative: 0,
      Democratic: 0,
      Pacesetting: 0,
      Commanding: 0,
    },
  };
}

const STYLE_CONFIG: Record<
  LeadershipStyle,
  {
    competencyId: CompetencyId;
    label: LocalizedText;
    impact: LocalizedText;
    overuseRisk: LocalizedText;
  }
> = {
  Visionary: {
    competencyId: "strategic-direction",
    label: { en: "Visionary", es: "Visionario", fr: "Visionnaire" },
    impact: {
      en: "May create direction, connect work to purpose, and help teams navigate change.",
      es: "Puede crear direccion, conectar el trabajo con proposito y ayudar al equipo a navegar cambios.",
      fr: "Peut donner une direction, relier le travail à une finalité et aider l'équipe à traverser les changements.",
    },
    overuseRisk: {
      en: "Overuse may become too conceptual if near-term execution and operating detail are not validated.",
      es: "El uso excesivo puede volverse demasiado conceptual si no se valida ejecucion cercana y detalle operativo.",
      fr: "Un usage excessif peut devenir trop conceptuel si l'exécution à court terme et le détail opérationnel ne sont pas vérifiés.",
    },
  },
  Coaching: {
    competencyId: "people-development",
    label: { en: "Coaching", es: "Coaching", fr: "Accompagnement" },
    impact: {
      en: "May support development through feedback, growth goals, and individual guidance.",
      es: "Puede apoyar desarrollo mediante feedback, metas de crecimiento y guia individual.",
      fr: "Peut favoriser le développement par les retours, les objectifs de progression et l'accompagnement individuel.",
    },
    overuseRisk: {
      en: "Overuse may slow urgent decisions if development conversations replace clear direction.",
      es: "El uso excesivo puede ralentizar decisiones urgentes si las conversaciones de desarrollo reemplazan direccion clara.",
      fr: "Un usage excessif peut ralentir les décisions urgentes si les échanges de développement remplacent une direction claire.",
    },
  },
  Affiliative: {
    competencyId: "team-cohesion",
    label: { en: "Affiliative", es: "Afiliativo", fr: "Affiliatif" },
    impact: {
      en: "May protect trust, morale, and emotional connection across the team.",
      es: "Puede proteger confianza, moral y conexion emocional dentro del equipo.",
      fr: "Peut protéger la confiance, le moral et le lien émotionnel au sein de l'équipe.",
    },
    overuseRisk: {
      en: "Overuse may avoid difficult performance conversations or necessary conflict.",
      es: "El uso excesivo puede evitar conversaciones dificiles de desempeno o conflicto necesario.",
      fr: "Un usage excessif peut conduire à éviter les conversations difficiles sur la performance ou les conflits nécessaires.",
    },
  },
  Democratic: {
    competencyId: "participative-leadership",
    label: { en: "Democratic", es: "Democratico", fr: "Participatif" },
    impact: {
      en: "May build commitment by involving people in decisions and shared ownership.",
      es: "Puede generar compromiso involucrando a las personas en decisiones y responsabilidad compartida.",
      fr: "Peut favoriser l'engagement en associant les personnes aux décisions et à la responsabilité partagée.",
    },
    overuseRisk: {
      en: "Overuse may slow execution when the situation requires a clear owner and fast decision.",
      es: "El uso excesivo puede frenar ejecucion cuando la situacion requiere responsable claro y decision rapida.",
      fr: "Un usage excessif peut ralentir l'exécution lorsque la situation exige un responsable clairement identifié et une décision rapide.",
    },
  },
  Pacesetting: {
    competencyId: "execution-standards",
    label: { en: "Pacesetting", es: "Marcador de ritmo", fr: "Exigeant" },
    impact: {
      en: "May raise standards through pace, quality, and personal example.",
      es: "Puede elevar estandares mediante ritmo, calidad y ejemplo personal.",
      fr: "Peut élever les standards par le rythme, la qualité et l'exemple personnel.",
    },
    overuseRisk: {
      en: "Overuse may create pressure, reduce coaching, or leave slower team members behind.",
      es: "El uso excesivo puede crear presion, reducir coaching o dejar atras a miembros con menor ritmo.",
      fr: "Un usage excessif peut créer de la pression, réduire l'accompagnement ou laisser de côté les membres de l'équipe au rythme plus lent.",
    },
  },
  Commanding: {
    competencyId: "directive-leadership",
    label: { en: "Commanding", es: "Directivo", fr: "Directif" },
    impact: {
      en: "May provide clarity and firm direction in urgent or high-risk situations.",
      es: "Puede aportar claridad y direccion firme en situaciones urgentes o de alto riesgo.",
      fr: "Peut apporter de la clarté et une direction ferme dans les situations urgentes ou à haut risque.",
    },
    overuseRisk: {
      en: "Overuse may reduce autonomy, psychological safety, and ownership if used outside urgent contexts.",
      es: "El uso excesivo puede reducir autonomia, seguridad psicologica y responsabilidad si se usa fuera de contextos urgentes.",
      fr: "Un usage excessif peut réduire l'autonomie, la sécurité psychologique et la responsabilisation s'il est utilisé hors des situations urgentes.",
    },
  },
};

function styleFrom(value: string): LeadershipStyle {
  return value in STYLE_CONFIG ? (value as LeadershipStyle) : "Visionary";
}

function strengthForShare(share: number) {
  if (share >= 50) return "strong";
  if (share >= 30) return "moderate";
  return "limited";
}

export function extractLeadershipStylesEvidence(input: AssessmentResultInput, locale: IntelligenceLocale): EvidenceSignal[] {
  const scored = scoreFrom(input);
  const assessmentId = input.assessmentId ?? input.id ?? input.name;
  const dominantStyle = styleFrom(scored.dominantStyle);
  const totalSelections = Math.max(
    Object.values(scored.counts).reduce((sum, count) => sum + count, 0),
    LEADERSHIP_QUESTIONS.length
  );
  const dominantCount = scored.counts[dominantStyle] ?? 0;
  const share = normalizeScore(dominantCount, totalSelections);
  const config = STYLE_CONFIG[dominantStyle];
  const label = localize(config.label, locale);

  const signals: EvidenceSignal[] = [
    {
      id: `${assessmentId}:leadership-styles:${dominantStyle.toLowerCase()}`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey: "leadership-styles",
      competencyId: config.competencyId,
      competencyLabel: competencyLabel(config.competencyId, locale),
      dimensionId: dominantStyle,
      dimensionLabel: label,
      kind: "leadership",
      score: dominantCount,
      maxScore: totalSelections,
      normalizedScore: share,
      direction: "positive",
      strength: strengthForShare(share),
      statement:
        locale === "es"
          ? `Estilo dominante reportado: ${label}; es una preferencia de liderazgo, no una puntuacion de calidad.`
          : locale === "fr"
            ? `Style dominant déclaré : ${label} ; il s'agit d'une préférence de leadership, et non d'un score de qualité.`
            : `Dominant reported style: ${label}; this is a leadership preference, not a quality score.`,
      businessImpact: localize(config.impact, locale),
      limitation:
        locale === "es"
          ? "Leadership Styles es descriptivo; no mide por si solo efectividad directiva, madurez, experiencia ni ajuste completo al rol."
          : locale === "fr"
            ? "Leadership Styles est descriptif ; il ne mesure pas à lui seul l'efficacité managériale, la maturité, l'expérience ni l'adéquation globale au poste."
            : "Leadership Styles is descriptive; it does not by itself measure leadership effectiveness, maturity, experience, or full role fit.",
      rawEvidence:
        locale === "es"
          ? `${dominantCount}/${totalSelections} respuestas alineadas al estilo ${label}`
          : locale === "fr"
            ? `${dominantCount}/${totalSelections} réponses alignées sur le style ${label}`
            : `${dominantCount}/${totalSelections} responses aligned to ${label} style`,
    },
  ];

  if (share >= 50) {
    const overuseScore = 100 - share;
    signals.push({
      id: `${assessmentId}:leadership-styles:${dominantStyle.toLowerCase()}:overuse`,
      assessmentId,
      assessmentName: input.name,
      assessmentKey: "leadership-styles",
      competencyId: config.competencyId,
      competencyLabel: competencyLabel(config.competencyId, locale),
      dimensionId: `${dominantStyle}:overuse`,
      dimensionLabel: locale === "es" ? `Sobreuso potencial: ${label}` : locale === "fr" ? `Usage excessif potentiel : ${label}` : `Potential overuse: ${label}`,
      kind: "leadership",
      score: share,
      maxScore: 100,
      normalizedScore: overuseScore,
      direction: "risk",
      strength: evidenceStrength(overuseScore),
      statement:
        locale === "es"
          ? `Posible riesgo de sobreuso del estilo ${label}; requiere validacion situacional.`
          : locale === "fr"
            ? `Risque potentiel d'usage excessif du style ${label} ; une vérification en situation est nécessaire.`
            : `Potential overuse risk for the ${label} style; situational validation is required.`,
      businessImpact: localize(config.overuseRisk, locale),
      limitation:
        locale === "es"
          ? "El sobreuso es una hipotesis de validacion basada en concentracion de estilo, no una conclusion definitiva."
          : locale === "fr"
            ? "L'usage excessif est une hypothèse à vérifier fondée sur la concentration d'un style, et non une conclusion définitive."
            : "Overuse is a validation hypothesis based on style concentration, not a definitive conclusion.",
      rawEvidence:
        locale === "es"
          ? `${share}/100 de concentracion en el estilo dominante`
          : locale === "fr"
            ? `${share}/100 de concentration dans le style dominant`
            : `${share}/100 concentration in the dominant style`,
    });
  }

  return signals;
}
