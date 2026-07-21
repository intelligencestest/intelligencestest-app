export type ClientBriefCopyLocale = "en" | "es" | "fr";

export interface ClientBriefEvidencePoint {
  label: string;
  score: number;
}

interface CandidateCopyInput {
  locale: ClientBriefCopyLocale;
  candidateName: string;
  confidence?: string;
  competencyEvidence: ClientBriefEvidencePoint[];
  narrativePosition?: "lead" | "alternate";
}

interface InterviewObjectiveInput extends CandidateCopyInput {
  roleTitle: string;
}

interface EvidenceShape {
  count: number;
  strongest: ClientBriefEvidencePoint;
  softest: ClientBriefEvidencePoint;
  spread: number;
}

function evidenceShape(evidence: ClientBriefEvidencePoint[]): EvidenceShape | null {
  const ordered = evidence
    .filter((point) => point.label.trim() && Number.isFinite(point.score))
    .map((point) => ({ label: point.label.trim(), score: Math.max(0, Math.min(100, Math.round(point.score))) }))
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));

  if (ordered.length === 0) return null;
  const softest = ordered[0];
  const strongest = ordered[ordered.length - 1];
  return {
    count: ordered.length,
    strongest,
    softest,
    spread: strongest.score - softest.score,
  };
}

/**
 * Candidate-specific evidence for the page-2 narrative. This intentionally
 * does not reuse either the recommendation rationale or the later interview
 * objective, so the report cannot repeat tier copy across candidates or
 * repeat the same candidate wording across pages.
 */
export function executiveSummaryEvidence(input: CandidateCopyInput): string {
  const shape = evidenceShape(input.competencyEvidence);
  const name = input.candidateName.trim() || "The candidate";

  if (!shape) {
    if (input.locale === "es") return `La evidencia disponible de ${name} debe confirmarse mediante ejemplos específicos del puesto en la entrevista.`;
    if (input.locale === "fr") return `Les éléments disponibles pour ${name} doivent être confirmés en entretien par des exemples propres au poste.`;
    return `The available evidence for ${name} should be confirmed through role-specific examples in interview.`;
  }

  if (shape.count === 1) {
    if (input.locale === "es") return `La evidencia disponible de ${name} se concentra en ${shape.softest.label}, con ${shape.softest.score}/100, una señal concreta que debe confirmarse en entrevista.`;
    if (input.locale === "fr") return `Les éléments disponibles pour ${name} portent sur ${shape.softest.label}, à ${shape.softest.score}/100, un signal précis à confirmer en entretien.`;
    return `The available evidence for ${name} centres on ${shape.softest.label} at ${shape.softest.score}/100, giving the interview one precise signal to confirm.`;
  }

  if (input.confidence === "high") {
    if (input.narrativePosition === "alternate") {
      if (input.locale === "es") return `En ${name}, el perfil es equilibrado y no depende de un único resultado sobresaliente; ${shape.softest.label}, con ${shape.softest.score}/100, ofrece la lectura más prudente que conviene confirmar.`;
      if (input.locale === "fr") return `Chez ${name}, le profil est équilibré et ne dépend pas d'un seul résultat dominant ; ${shape.softest.label}, à ${shape.softest.score}/100, offre la lecture la plus prudente à confirmer.`;
      return `For ${name}, the profile is balanced rather than dependent on one standout result; ${shape.softest.label} at ${shape.softest.score}/100 offers the most conservative reading to confirm.`;
    }
    if (input.locale === "es") return `La evidencia de ${name} se mantiene cohesionada en ${shape.count} competencias; ${shape.softest.label} es la dimensión menos marcada, con ${shape.softest.score}/100, y ofrece un punto concreto para confirmar en entrevista.`;
    if (input.locale === "fr") return `Les éléments concernant ${name} restent cohérents sur ${shape.count} compétences ; ${shape.softest.label} est la dimension la moins marquée, à ${shape.softest.score}/100, et constitue un point précis à confirmer en entretien.`;
    return `Evidence for ${name} is tightly grouped across ${shape.count} competencies; ${shape.softest.label} is the lowest observed dimension at ${shape.softest.score}/100, giving the interview a precise confirmation point.`;
  }

  if (input.narrativePosition === "alternate") {
    if (input.locale === "es") return `${name} aporta una fortaleza clara en ${shape.strongest.label} (${shape.strongest.score}/100), mientras que ${shape.softest.label} (${shape.softest.score}/100) constituye la prueba más exigente para la entrevista.`;
    if (input.locale === "fr") return `${name} présente un atout net en ${shape.strongest.label} (${shape.strongest.score}/100), tandis que ${shape.softest.label} (${shape.softest.score}/100) constitue le test le plus exigeant pour l'entretien.`;
    return `${name} brings clear upside in ${shape.strongest.label} (${shape.strongest.score}/100), while ${shape.softest.label} (${shape.softest.score}/100) is the sharper interview test.`;
  }
  if (input.locale === "es") return `La evidencia de ${name} presenta un perfil más diferenciado: ${shape.strongest.label} lidera con ${shape.strongest.score}/100, mientras que ${shape.softest.label}, con ${shape.softest.score}/100, define el principal punto a validar en entrevista.`;
  if (input.locale === "fr") return `Les éléments concernant ${name} dessinent un profil plus différencié : ${shape.strongest.label} arrive en tête à ${shape.strongest.score}/100, tandis que ${shape.softest.label}, à ${shape.softest.score}/100, constitue le principal point à valider en entretien.`;
  return `Evidence for ${name} is more differentiated: ${shape.strongest.label} leads at ${shape.strongest.score}/100, while ${shape.softest.label} at ${shape.softest.score}/100 defines the main point to validate in interview.`;
}

/** Candidate-specific interview framing, deliberately worded differently from executiveSummaryEvidence. */
export function interviewObjective(input: InterviewObjectiveInput): { title: string; copy: string } {
  const shape = evidenceShape(input.competencyEvidence);
  const name = input.candidateName.trim() || "the candidate";
  const role = input.roleTitle.trim() || (input.locale === "es" ? "el puesto" : input.locale === "fr" ? "le poste" : "the role");

  if (!shape) {
    if (input.locale === "es") return {
      title: `Validar la evidencia de ${name} en el contexto del puesto`,
      copy: `Solicite ejemplos recientes de ${role} y examine las decisiones, las alternativas consideradas y los resultados observables antes de confirmar la recomendación.`,
    };
    if (input.locale === "fr") return {
      title: `Valider les éléments concernant ${name} dans le contexte du poste`,
      copy: `Demandez des exemples récents liés au poste de ${role}, puis examinez les décisions, les options envisagées et les résultats observables avant de confirmer la recommandation.`,
    };
    return {
      title: `Validate ${name}'s evidence in role context`,
      copy: `Ask for recent ${role} examples and examine the decisions, alternatives considered, and observable outcomes before confirming the recommendation.`,
    };
  }

  if (shape.count === 1) {
    if (input.locale === "es") return {
      title: `Comprobar la evidencia de ${name} en ${shape.softest.label}`,
      copy: `Pida ejemplos recientes de ${role} que permitan observar ${shape.softest.label} (${shape.softest.score}/100) en decisiones, acciones y resultados concretos.`,
    };
    if (input.locale === "fr") return {
      title: `Éprouver les éléments de ${name} sur ${shape.softest.label}`,
      copy: `Demandez des exemples récents liés au poste de ${role} permettant d'observer ${shape.softest.label} (${shape.softest.score}/100) dans des décisions, des actions et des résultats concrets.`,
    };
    return {
      title: `Test ${name}'s evidence in ${shape.softest.label}`,
      copy: `Ask for recent ${role} examples that make ${shape.softest.label} (${shape.softest.score}/100) observable in specific decisions, actions, and outcomes.`,
    };
  }

  if (input.confidence === "high") {
    if (input.locale === "es") return {
      title: `Confirmar cómo ${name} aplica ${shape.softest.label} en el puesto`,
      copy: `Solicite ejemplos recientes de ${role} que muestren ${shape.softest.label} (${shape.softest.score}/100) en decisiones, concesiones y resultados; utilice ${shape.strongest.label} (${shape.strongest.score}/100) como punto de comparación.`,
    };
    if (input.locale === "fr") return {
      title: `Confirmer comment ${name} mobilise ${shape.softest.label} dans le poste`,
      copy: `Demandez des exemples récents liés au poste de ${role} qui rendent ${shape.softest.label} (${shape.softest.score}/100) observable dans les décisions, les arbitrages et les résultats ; utilisez ${shape.strongest.label} (${shape.strongest.score}/100) comme point de comparaison.`,
    };
    return {
      title: `Confirm ${name}'s ${shape.softest.label} evidence in role context`,
      copy: `Ask for recent examples relevant to the ${role} role that make ${shape.softest.label} (${shape.softest.score}/100) observable in decisions, trade-offs, and outcomes; use ${shape.strongest.label} (${shape.strongest.score}/100) as the comparison point.`,
    };
  }

  if (input.locale === "es") return {
    title: `Examinar la diferencia entre ${shape.strongest.label} y ${shape.softest.label} de ${name}`,
    copy: `Comience con situaciones en las que ${name} recurrió a ${shape.strongest.label} (${shape.strongest.score}/100) y después explore una presión comparable sobre ${shape.softest.label} (${shape.softest.score}/100) para determinar si la diferencia de ${shape.spread} puntos es relevante para el puesto.`,
  };
  if (input.locale === "fr") return {
    title: `Examiner l'écart de ${name} entre ${shape.strongest.label} et ${shape.softest.label}`,
    copy: `Commencez par des situations où ${name} s'est appuyé sur ${shape.strongest.label} (${shape.strongest.score}/100), puis explorez une pression comparable sur ${shape.softest.label} (${shape.softest.score}/100) afin de déterminer si l'écart de ${shape.spread} points est pertinent pour le poste.`,
  };
  return {
    title: `Test ${name}'s gap between ${shape.strongest.label} and ${shape.softest.label}`,
    copy: `Begin with situations where ${name} relied on ${shape.strongest.label} (${shape.strongest.score}/100), then examine equivalent pressure on ${shape.softest.label} (${shape.softest.score}/100) to establish whether the ${shape.spread}-point difference matters in this role.`,
  };
}
