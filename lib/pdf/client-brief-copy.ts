export type ClientBriefCopyLocale = "en" | "es" | "fr";

export interface ClientBriefEvidencePoint {
  label: string;
  score: number;
}

export interface ClientBriefSourceQuestion {
  competency: string;
  question: string;
}

export type CandidateTensionType =
  | "translation"
  | "spread_risk"
  | "evidence_reliability"
  | "balanced_boundary";

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

export interface CandidateInterviewPlanInput extends InterviewObjectiveInput {
  sourceQuestions: ClientBriefSourceQuestion[];
}

export interface CandidateInterviewProbe {
  focusLabel: string;
  question: string;
  verifies: string;
}

export interface CandidateInterviewPlan {
  tensionType: CandidateTensionType;
  profileConclusion: string;
  objectiveTitle: string;
  objectiveCopy: string;
  questions: CandidateInterviewProbe[];
}

interface EvidenceShape {
  count: number;
  ordered: ClientBriefEvidencePoint[];
  strongest: ClientBriefEvidencePoint;
  secondStrongest: ClientBriefEvidencePoint;
  softest: ClientBriefEvidencePoint;
  spread: number;
  average: number;
}

function localized(locale: ClientBriefCopyLocale, en: string, es: string, fr: string): string {
  return locale === "es" ? es : locale === "fr" ? fr : en;
}

function normalizeConfidence(confidence?: string): string {
  return confidence?.trim().toLowerCase() ?? "";
}

function evidenceShape(evidence: ClientBriefEvidencePoint[]): EvidenceShape | null {
  const ordered = evidence
    .filter((point) => point.label.trim() && Number.isFinite(point.score))
    .map((point) => ({ label: point.label.trim(), score: Math.max(0, Math.min(100, Math.round(point.score))) }))
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));

  if (ordered.length === 0) return null;
  const softest = ordered[0];
  const strongest = ordered[ordered.length - 1];
  const secondStrongest = ordered[ordered.length - 2] ?? strongest;
  return {
    count: ordered.length,
    ordered,
    strongest,
    secondStrongest,
    softest,
    spread: strongest.score - softest.score,
    average: ordered.reduce((sum, point) => sum + point.score, 0) / ordered.length,
  };
}

/**
 * Presentation-only classifier. It deliberately uses only values already
 * exposed to the client brief. The current data contract has one overall
 * confidence level, not per-competency confidence, so the translation rule
 * uses that real aggregate signal instead of inventing a confidence share.
 */
export function classifyCandidateTension(input: CandidateCopyInput): CandidateTensionType {
  const shape = evidenceShape(input.competencyEvidence);
  if (!shape) return "balanced_boundary";
  if (shape.spread >= 20) return "spread_risk";
  if (shape.average >= 95 && normalizeConfidence(input.confidence) === "high") return "translation";
  if (normalizeConfidence(input.confidence) === "low") return "evidence_reliability";
  return "balanced_boundary";
}

function profileConclusion(input: CandidateCopyInput, shape: EvidenceShape | null, tension: CandidateTensionType): string {
  if (!shape) {
    return localized(
      input.locale,
      "Available evidence requires role-specific confirmation",
      "La evidencia disponible requiere una confirmación específica para el puesto",
      "Les éléments disponibles exigent une confirmation liée au poste"
    );
  }

  if (tension === "translation") {
    return localized(
      input.locale,
      `Consistent evidence across all ${shape.count} competencies`,
      `Evidencia consistente en las ${shape.count} competencias`,
      `Éléments cohérents dans les ${shape.count} compétences évaluées`
    );
  }
  if (tension === "spread_risk") {
    return localized(
      input.locale,
      `${shape.spread}-point spread separates ${shape.strongest.label} from ${shape.softest.label}`,
      `Una diferencia de ${shape.spread} puntos separa ${shape.strongest.label} de ${shape.softest.label}`,
      `Un écart de ${shape.spread} points sépare « ${shape.strongest.label} » et « ${shape.softest.label} »`
    );
  }
  if (tension === "evidence_reliability") {
    return localized(
      input.locale,
      `Strongest result needs evidence validation: ${shape.strongest.label} at ${shape.strongest.score}`,
      `El resultado más sólido requiere validación: ${shape.strongest.label}, ${shape.strongest.score}/100`,
      `Résultat le plus élevé à confirmer : « ${shape.strongest.label} », ${shape.strongest.score}/100`
    );
  }
  return localized(
    input.locale,
    `Broad strength; ${shape.softest.label} at ${shape.softest.score} is the clearest boundary`,
    `Fortaleza amplia; ${shape.softest.label}, con ${shape.softest.score}/100, marca el principal límite`,
    `Profil globalement solide ; la compétence « ${shape.softest.label} », à ${shape.softest.score}/100, en marque la limite la plus nette`
  );
}

/**
 * Candidate-specific evidence for the page-2 narrative. This stays separate
 * from the interview plan so the same sentence cannot recur across pages.
 */
export function executiveSummaryEvidence(input: CandidateCopyInput): string {
  const shape = evidenceShape(input.competencyEvidence);

  if (!shape) {
    return localized(
      input.locale,
      `Available evidence should be confirmed through role-specific interview examples.`,
      `La evidencia disponible debe confirmarse con ejemplos específicos del puesto.`,
      `Les éléments disponibles doivent être confirmés par des exemples directement liés au poste.`
    );
  }

  const tension = classifyCandidateTension(input);
  if (tension === "translation") {
    return localized(
      input.locale,
      `Evidence is consistent across ${shape.count} competencies; ${shape.softest.label} at ${shape.softest.score}/100 is the key transfer test.`,
      `La evidencia es consistente en ${shape.count} competencias; ${shape.softest.label}, con ${shape.softest.score}/100, es la prueba de transferencia clave.`,
      `Les éléments sont cohérents dans ${shape.count} compétences ; « ${shape.softest.label} », à ${shape.softest.score}/100, constitue le principal test de transposition au poste.`
    );
  }
  if (tension === "spread_risk") {
    return localized(
      input.locale,
      `Evidence spans ${shape.spread} points, from ${shape.strongest.label} (${shape.strongest.score}/100) to ${shape.softest.label} (${shape.softest.score}/100); role relevance is the central interview decision.`,
      `La evidencia presenta una diferencia de ${shape.spread} puntos entre ${shape.strongest.label} (${shape.strongest.score}/100) y ${shape.softest.label} (${shape.softest.score}/100); la entrevista debe determinar cuánto pesa esa diferencia en el puesto.`,
      `Les résultats présentent un écart de ${shape.spread} points, de « ${shape.strongest.label} » (${shape.strongest.score}/100) à « ${shape.softest.label} » (${shape.softest.score}/100) ; l'entretien doit en déterminer l'incidence réelle sur le poste.`
    );
  }
  if (tension === "evidence_reliability") {
    return localized(
      input.locale,
      `The strongest result is ${shape.strongest.label} at ${shape.strongest.score}/100, but that evidence needs direct replication in interview.`,
      `El resultado más sólido es ${shape.strongest.label}, con ${shape.strongest.score}/100, pero debe confirmarse de forma directa y consistente en la entrevista.`,
      `Le résultat le plus élevé concerne « ${shape.strongest.label} », à ${shape.strongest.score}/100, mais il doit être reproduit directement en entretien.`
    );
  }
  return localized(
    input.locale,
    `Evidence is broadly strong; ${shape.softest.label} at ${shape.softest.score}/100 is the clearest boundary.`,
    `La evidencia es globalmente sólida; ${shape.softest.label}, con ${shape.softest.score}/100, marca el principal límite que debe comprobarse.`,
    `Les éléments sont globalement solides ; la compétence « ${shape.softest.label} », à ${shape.softest.score}/100, en marque la limite la plus nette.`
  );
}

function pointByLabel(shape: EvidenceShape, label: string): ClientBriefEvidencePoint | null {
  const normalized = label.trim().toLocaleLowerCase();
  return shape.ordered.find((point) => point.label.toLocaleLowerCase() === normalized) ?? null;
}

function uniquePoints(points: (ClientBriefEvidencePoint | null | undefined)[]): ClientBriefEvidencePoint[] {
  const seen = new Set<string>();
  return points.filter((point): point is ClientBriefEvidencePoint => {
    if (!point) return false;
    const key = point.label.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function selectProbePoints(
  shape: EvidenceShape,
  sourceQuestions: ClientBriefSourceQuestion[],
  tension: CandidateTensionType
): ClientBriefEvidencePoint[] {
  const sourcePoints = sourceQuestions.map((question) => pointByLabel(shape, question.competency));
  const descending = [...shape.ordered].sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  const preferred =
    tension === "translation"
      ? [...sourcePoints, ...descending]
      : [shape.strongest, shape.softest, ...sourcePoints, ...descending];
  return uniquePoints(preferred).slice(0, 4);
}

function probeCopy(
  locale: ClientBriefCopyLocale,
  tension: CandidateTensionType,
  index: number,
  point: ClientBriefEvidencePoint,
  shape: EvidenceShape,
  roleTitle: string
): CandidateInterviewProbe {
  const label = point.label;
  const score = point.score;
  const strongest = shape.strongest;
  const softest = shape.softest;
  const role = roleTitle.trim() || localized(locale, "the role", "el puesto", "le poste");
  const spanishRoleContext = roleTitle.trim() ? `el puesto de ${roleTitle.trim()}` : "el puesto";
  const frenchRoleContext = roleTitle.trim() ? `poste de ${roleTitle.trim()}` : "poste";

  if (tension === "translation") {
    if (index === 0) return {
      focusLabel: localized(locale, `Prove ${label} is repeatable`, `Demostrar que ${label} es repetible`, `Reproductibilité : ${label}`),
      question: localized(locale, `Describe a recent ${role} decision in which ${label.toLowerCase()} shaped your choice. What evidence did you use, what trade-off did you make, and what result followed?`, `Describa una decisión reciente en ${spanishRoleContext} en la que ${label.toLowerCase()} orientara su elección. ¿Qué evidencia utilizó, qué disyuntiva tuvo que resolver y qué resultado obtuvo?`, `Décrivez une décision récente liée au ${frenchRoleContext}, dans laquelle vous avez mobilisé « ${label} » pour orienter votre choix. Sur quelles preuves vous êtes-vous appuyé, quel arbitrage avez-vous fait et quel résultat avez-vous obtenu ?`),
      verifies: localized(locale, `${label} is ${score}/100. Confirm a repeatable evidence-to-action method rather than confidence in hindsight.`, `${label} alcanza ${score}/100. Confirme un método repetible que conecte la evidencia con la acción, no solo una explicación convincente a posteriori.`, `Le résultat « ${label} » atteint ${score}/100. Confirmez une méthode reproductible reliant les preuves à l'action, plutôt qu'une assurance reconstruite après coup.`),
    };
    if (index === 1) return {
      focusLabel: localized(locale, `Show ${label} in a shared result`, `Mostrar ${label} en un resultado compartido`, `Résultat collectif : ${label}`),
      question: localized(locale, `Tell me about a target involving other people where ${label.toLowerCase()} materially changed the result. What did you own, what did others own, and how was success measured?`, `Describa un objetivo compartido en el que ${label.toLowerCase()} cambiara de forma material el resultado. ¿Qué asumió usted, qué asumieron los demás y cómo se midió el éxito?`, `Parlez d'un objectif collectif dans lequel « ${label} » a réellement changé le résultat. De quoi étiez-vous responsable, de quoi les autres étaient-ils responsables et comment la réussite a-t-elle été mesurée ?`),
      verifies: localized(locale, `${label} is ${score}/100. Look for shared decisions, explicit ownership, and an outcome another person could verify.`, `${label} alcanza ${score}/100. Busque decisiones compartidas, responsabilidades explícitas y un resultado que otra persona pueda verificar.`, `Le résultat « ${label} » atteint ${score}/100. Recherchez des décisions partagées, des responsabilités explicites et un résultat qu'un tiers pourrait vérifier.`),
    };
    if (index === 2) return {
      focusLabel: localized(locale, `Test ${label} after a failed first approach`, `Probar ${label} tras fallar el primer enfoque`, `Après un premier échec : ${label}`),
      question: localized(locale, `Give an example of a plan that stopped working and required ${label.toLowerCase()}. What signal did you notice, what did you change, and what improved?`, `Dé un ejemplo de un plan que dejó de funcionar y exigió ${label.toLowerCase()}. ¿Qué señal detectó, qué cambió y qué mejoró?`, `Donnez un exemple de plan qui ne fonctionnait plus et vous a demandé de mobiliser « ${label} ». Quel signal avez-vous repéré, qu'avez-vous changé et qu'est-ce qui s'est amélioré ?`),
      verifies: localized(locale, `${label} is ${score}/100. Confirm changed behavior in response to evidence, not merely a successful ending.`, `${label} alcanza ${score}/100. Confirme un cambio de conducta en respuesta a la evidencia, no solo un desenlace positivo.`, `Le résultat « ${label} » atteint ${score}/100. Confirmez un changement de comportement fondé sur les preuves, et pas seulement une issue favorable.`),
    };
    return {
      focusLabel: localized(locale, `Link ${label} to changed action`, `Vincular ${label} con un cambio de actuación`, `Changement concret : ${label}`),
      question: localized(locale, `Walk through a recent example where ${label.toLowerCase()} changed another person's decision or the course of the work. What did you do, and what happened next?`, `Explique un ejemplo reciente en el que ${label.toLowerCase()} cambiara la decisión de otra persona o el curso del trabajo. ¿Qué hizo y qué ocurrió después?`, `Décrivez un exemple récent où « ${label} » a modifié la décision d'une autre personne ou le cours du travail. Qu'avez-vous fait et que s'est-il passé ensuite ?`),
      verifies: localized(locale, `${label} is ${score}/100. Confirm an observable response and changed action rather than fluency alone.`, `${label} alcanza ${score}/100. Confirme una respuesta observable y un cambio real de actuación, no solo fluidez verbal.`, `Le résultat « ${label} » atteint ${score}/100. Confirmez une réaction observable et un changement réel, plutôt qu'une simple aisance verbale.`),
    };
  }

  if (tension === "spread_risk") {
    const wideSpread = shape.spread >= 35;
    if (index === 0) return wideSpread
      ? {
          focusLabel: localized(locale, `${label} is exceptional; prove the shared outcome`, `${label} es excepcional; demostrar el resultado compartido`, `Résultat collectif : ${label}`),
          question: localized(locale, `Describe a team result that depended on your contribution and another person's. What did you own, what did they own, and how was the combined result measured?`, `Describa un resultado de equipo que dependiera de su contribución y de la de otra persona. ¿Qué asumió usted, qué asumió la otra persona y cómo se midió el resultado conjunto?`, `Décrivez un résultat d'équipe qui dépendait à la fois de votre contribution et de celle d'une autre personne. De quoi chacun était-il responsable et comment le résultat commun a-t-il été mesuré ?`),
          verifies: localized(locale, `${label} is ${score}/100. Confirm a specific shared result and distinguish the candidate's contribution from general team participation.`, `${label} alcanza ${score}/100. Confirme un resultado compartido concreto y distinga la contribución del candidato de la participación general del equipo.`, `Le résultat « ${label} » atteint ${score}/100. Confirmez un résultat collectif précis et distinguez la contribution du candidat de sa simple participation à l'équipe.`),
        }
      : {
          focusLabel: localized(locale, `${label} leads; test repeatability across contexts`, `${label} lidera; probar la repetibilidad entre contextos`, `Signal le plus élevé : ${label}`),
          question: localized(locale, `Compare two recent situations where ${label.toLowerCase()} required you to change your approach. What trigger did you notice in each, and which adjustment produced the better result?`, `Compare dos situaciones recientes en las que ${label.toLowerCase()} le exigiera cambiar de enfoque. ¿Qué señal detectó en cada una y qué ajuste produjo el mejor resultado?`, `Comparez deux situations récentes où vous avez dû changer d'approche pour mobiliser « ${label} ». Quel déclencheur avez-vous repéré dans chacune et quel ajustement a produit le meilleur résultat ?`),
          verifies: localized(locale, `${label} is ${score}/100. Confirm a repeatable adjustment method across more than one context before treating it as a protective strength.`, `${label} alcanza ${score}/100. Confirme un método de ajuste repetible en más de un contexto antes de considerarlo una fortaleza protectora.`, `Le résultat « ${label} » atteint ${score}/100. Confirmez une méthode d'ajustement reproductible dans plusieurs contextes avant d'en faire une force protectrice.`),
        };
    if (index === 1) return wideSpread
      ? {
          focusLabel: localized(locale, `${label} is the material risk; test sustained delivery`, `${label} es el riesgo material; probar la entrega sostenida`, `Risque principal : ${label}`),
          question: localized(locale, `Tell me about a work assignment with explicit performance measures that became difficult to sustain. How did you track progress, respond to slippage, and finish?`, `Describa una tarea con indicadores de rendimiento explícitos que resultara difícil de sostener. ¿Cómo siguió el progreso, respondió a los retrasos y completó la entrega?`, `Parlez d'une mission assortie d'indicateurs de performance explicites qu'il est devenu difficile de tenir. Comment avez-vous suivi l'avancement, réagi aux écarts et mené la mission à son terme ?`),
          verifies: localized(locale, `${label} is ${score}/100, the profile floor. Determine whether the lower signal appears in real delivery and whether the candidate has a reliable recovery method.`, `${label} alcanza ${score}/100 y marca el mínimo del perfil. Determine si esta señal más débil aparece en la ejecución real y si el candidato dispone de un método fiable de recuperación.`, `Le résultat « ${label} » atteint ${score}/100 et marque le plancher du profil. Déterminez si ce signal se manifeste dans l'exécution réelle et si le candidat dispose d'une méthode fiable de redressement.`),
        }
      : {
          focusLabel: localized(locale, `${label} sets the floor; test recurrence`, `${label} marca el mínimo; comprobar la recurrencia`, `Plancher du profil : ${label}`),
          question: localized(locale, `Tell me about a period when delivery quality or pace fell below the required standard. How did you diagnose the cause and restore performance?`, `Describa un periodo en el que la calidad o el ritmo de entrega quedara por debajo del nivel requerido. ¿Cómo diagnosticó la causa y recuperó el rendimiento?`, `Parlez d'une période où la qualité ou le rythme d'exécution est passé sous le niveau attendu. Comment avez-vous diagnostiqué la cause et rétabli la performance ?`),
          verifies: localized(locale, `${label} is ${score}/100. Determine whether the ${shape.spread}-point gap reflects a manageable condition or a recurring delivery risk.`, `${label} alcanza ${score}/100. Determine si la diferencia de ${shape.spread} puntos responde a una condición manejable o revela un riesgo recurrente de ejecución.`, `Le résultat « ${label} » atteint ${score}/100. Déterminez si l'écart de ${shape.spread} points correspond à une situation maîtrisable ou à un risque d'exécution récurrent.`),
        };
    if (index === 2) return wideSpread
      ? {
          focusLabel: localized(locale, `The gap matters when support and delivery collide`, `La diferencia importa cuando apoyo y entrega chocan`, `L'écart devient décisif lorsque soutien et exécution s'opposent`),
          question: localized(locale, `Give an example where helping the team competed with your own delivery target. How did you choose, and what happened to both outcomes?`, `Dé un ejemplo en el que ayudar al equipo compitiera con su propio objetivo de entrega. ¿Cómo decidió y qué ocurrió con ambos resultados?`, `Donnez un exemple où aider l'équipe entrait en concurrence avec votre propre objectif. Comment avez-vous tranché et quelles ont été les conséquences sur les deux résultats ?`),
          verifies: localized(locale, `This forces the ${strongest.score}/100 strength and ${softest.score}/100 floor into the same decision, showing whether the ${shape.spread}-point spread is material in practice.`, `Esta pregunta enfrenta la fortaleza de ${strongest.score}/100 y el mínimo de ${softest.score}/100 en una misma decisión para comprobar si la diferencia de ${shape.spread} puntos tiene consecuencias reales.`, `Cette question confronte la force à ${strongest.score}/100 et le plancher à ${softest.score}/100 dans une même décision, afin de vérifier si l'écart de ${shape.spread} points a un effet concret.`),
        }
      : {
          focusLabel: localized(locale, `${label} should make change usable for others`, `${label} debe convertir el cambio en una práctica compartida`, `Changement partagé : ${label}`),
          question: localized(locale, `Describe a change you understood quickly but others resisted. How did you explain it, respond to objections, and verify adoption?`, `Describa un cambio que entendió con rapidez, pero que otros se resistían a adoptar. ¿Cómo lo explicó, respondió a las objeciones y verificó su adopción?`, `Décrivez un changement que vous avez rapidement compris, mais auquel d'autres résistaient. Comment l'avez-vous expliqué, comment avez-vous répondu aux objections et vérifié son adoption ?`),
          verifies: localized(locale, `${label} is ${score}/100. Test whether rapid adjustment becomes shared execution rather than remaining an individual response.`, `${label} alcanza ${score}/100. Compruebe si la adaptación rápida se convierte en ejecución compartida, en lugar de quedarse en una respuesta individual.`, `Le résultat « ${label} » atteint ${score}/100. Vérifiez si l'adaptation rapide se traduit par une exécution collective plutôt que par une réponse purement individuelle.`),
        };
    return wideSpread
      ? {
          focusLabel: localized(locale, `${label} should protect the result`, `${label} debe proteger el resultado`, `Protection du résultat : ${label}`),
          question: localized(locale, `Describe a plan you changed after evidence showed it would miss the target. What changed in the plan, and what changed in the result?`, `Describa un plan que cambió después de que la evidencia indicara que no alcanzaría el objetivo. ¿Qué cambió en el plan y qué cambió en el resultado?`, `Décrivez un plan que vous avez modifié lorsque les preuves ont montré qu'il n'atteindrait pas l'objectif. Qu'avez-vous changé dans le plan et quel effet cela a-t-il eu sur le résultat ?`),
          verifies: localized(locale, `${label} is ${score}/100. Test whether that strength compensates for the softer ${softest.label} signal through timely, outcome-linked adjustment.`, `${label} alcanza ${score}/100. Compruebe si esa fortaleza compensa la señal más débil de ${softest.label} mediante un ajuste oportuno y vinculado al resultado.`, `Le résultat « ${label} » atteint ${score}/100. Vérifiez si cette force compense le signal plus faible « ${softest.label} » grâce à un ajustement rapide et lié au résultat.`),
        }
      : {
          focusLabel: localized(locale, `${label} must protect follow-through under ambiguity`, `${label} debe sostener la ejecución ante la ambigüedad`, `Suivi dans l'incertitude : ${label}`),
          question: localized(locale, `Give an example of changing course before the outcome was clear. What evidence justified the change, and how did you keep delivery accountable?`, `Dé un ejemplo de un cambio de rumbo antes de que el resultado estuviera claro. ¿Qué evidencia justificó el cambio y cómo mantuvo el control sobre la ejecución?`, `Donnez un exemple de changement de cap avant que le résultat ne soit certain. Quelles preuves ont justifié ce changement et comment avez-vous maintenu un suivi rigoureux de l'exécution ?`),
          verifies: localized(locale, `${label} is ${score}/100. Examine whether adjustment and judgment protect the softer ${softest.label} signal when information is incomplete.`, `${label} alcanza ${score}/100. Examine si la capacidad de ajuste y el criterio compensan la señal más débil de ${softest.label} cuando la información es incompleta.`, `Le résultat « ${label} » atteint ${score}/100. Examinez si l'ajustement et le jugement compensent le signal plus faible « ${softest.label} » lorsque les informations sont incomplètes.`),
        };
  }

  if (tension === "evidence_reliability") {
    if (index === 0) return {
      focusLabel: localized(locale, `Replicate the ${label} result`, `Replicar el resultado de ${label}`, `Reproductibilité : ${label}`),
      question: localized(locale, `Describe two different situations where ${label.toLowerCase()} shaped the result. What method was the same in both?`, `Describa dos situaciones distintas en las que ${label.toLowerCase()} influyera en el resultado. ¿Qué método aplicó en ambas?`, `Décrivez deux situations différentes où « ${label} » a influencé le résultat. Quelle méthode avez-vous appliquée dans les deux cas ?`),
      verifies: localized(locale, `${label} is ${score}/100. Two contexts test repeatability without treating one polished example as confirmation.`, `${label} alcanza ${score}/100. Dos contextos permiten comprobar la repetibilidad sin aceptar un único ejemplo bien contado como confirmación suficiente.`, `Le résultat « ${label} » atteint ${score}/100. Deux contextes permettent de tester la reproductibilité sans considérer un seul exemple bien présenté comme une confirmation suffisante.`),
    };
    if (index === 1) return {
      focusLabel: localized(locale, `Stress-test ${label}`, `Someter ${label} a presión`, `Mise à l'épreuve : ${label}`),
      question: localized(locale, `Tell me about a time ${label.toLowerCase()} did not work as expected. What condition changed the result, and what did you do next?`, `Describa una ocasión en la que ${label.toLowerCase()} no funcionara como esperaba. ¿Qué condición cambió el resultado y qué hizo después?`, `Parlez d'une situation où « ${label} » n'a pas produit l'effet attendu. Quelle condition a changé le résultat et qu'avez-vous fait ensuite ?`),
      verifies: localized(locale, `${label} is ${score}/100. Look for limits, counter-evidence, and a credible recovery rather than an unqualified success story.`, `${label} alcanza ${score}/100. Busque límites, evidencia en contra y una recuperación creíble, no un relato de éxito sin matices.`, `Le résultat « ${label} » atteint ${score}/100. Recherchez les limites, les contre-exemples et une reprise crédible, plutôt qu'un récit de réussite sans nuance.`),
    };
    if (index === 2) return {
      focusLabel: localized(locale, `Check ${label} across conditions`, `Comprobar ${label} en distintas condiciones`, `Variabilité selon le contexte : ${label}`),
      question: localized(locale, `Compare a situation where ${label.toLowerCase()} came easily with one where it required deliberate effort. What was different?`, `Compare una situación en la que ${label.toLowerCase()} surgiera con facilidad con otra en la que exigiera un esfuerzo deliberado. ¿Qué cambió entre ambas?`, `Comparez une situation où vous avez mobilisé « ${label} » facilement avec une autre où cela a demandé un effort délibéré. Qu'est-ce qui les différenciait ?`),
      verifies: localized(locale, `${label} is ${score}/100. Identify the conditions under which the signal strengthens or weakens.`, `${label} alcanza ${score}/100. Identifique las condiciones en las que la señal se fortalece o se debilita.`, `Le résultat « ${label} » atteint ${score}/100. Identifiez les conditions dans lesquelles le signal se renforce ou s'affaiblit.`),
    };
    return {
      focusLabel: localized(locale, `Tie ${label} to an outcome`, `Vincular ${label} con un resultado`, `Résultat observable : ${label}`),
      question: localized(locale, `Give a recent ${role} example where ${label.toLowerCase()} changed a measurable outcome. What evidence would another person use to confirm it?`, `Dé un ejemplo reciente relacionado con ${spanishRoleContext} en el que ${label.toLowerCase()} cambiara un resultado medible. ¿Qué evidencia podría utilizar otra persona para confirmarlo?`, `Donnez un exemple récent lié au ${frenchRoleContext}, dans lequel « ${label} » a modifié un résultat mesurable. Quelles preuves un tiers pourrait-il utiliser pour le confirmer ?`),
      verifies: localized(locale, `${label} is ${score}/100. Require an externally observable result before carrying the signal into the hiring decision.`, `${label} alcanza ${score}/100. Exija un resultado observable por terceros antes de incorporar la señal a la decisión de contratación.`, `Le résultat « ${label} » atteint ${score}/100. Exigez un résultat observable par un tiers avant d'intégrer ce signal à la décision de recrutement.`),
    };
  }

  if (index === 0) return {
    focusLabel: localized(locale, `${label} is the lead signal; test the method`, `${label} es la señal principal; comprobar el método`, `Signal principal : ${label}`),
    question: localized(locale, `Take me through a high-stakes ${role} decision where ${label.toLowerCase()} mattered. What options did you reject, why, and what happened next?`, `Explique una decisión importante en ${spanishRoleContext} en la que ${label.toLowerCase()} fuera determinante. ¿Qué opciones descartó, por qué y qué ocurrió después?`, `Décrivez une décision à fort enjeu liée au ${frenchRoleContext}, où « ${label} » a été déterminant. Qu'avez-vous écarté, pourquoi et avec quel résultat ?`),
    verifies: localized(locale, `${label} is ${score}/100, ${strongest.score - shape.secondStrongest.score} points above the next-strongest result. Confirm a method another interviewer can recognize and probe.`, `${label} alcanza ${score}/100, ${strongest.score - shape.secondStrongest.score} puntos por encima del siguiente resultado. Confirme un método que otro entrevistador pueda reconocer y contrastar.`, `Le résultat « ${label} » atteint ${score}/100, soit ${strongest.score - shape.secondStrongest.score} points au-dessus du suivant. Recherchez une méthode explicite et reproductible.`),
  };
  if (index === 1) return {
    focusLabel: localized(locale, `${label} is the boundary; test materiality`, `${label} marca el límite; comprobar su impacto`, `Limite du profil : ${label}`),
    question: localized(locale, `Describe a time a sound approach was limited by ${label.toLowerCase()}. What did you change, and did the outcome improve?`, `Describa una ocasión en la que un enfoque sólido quedara limitado por ${label.toLowerCase()}. ¿Qué cambió y mejoró el resultado?`, `Décrivez une situation où « ${label} » a limité une approche pourtant solide. Qu'avez-vous changé et le résultat s'est-il amélioré ?`),
    verifies: localized(locale, `${label} is the lowest observed result at ${score}/100. Determine whether that boundary materially limited an otherwise broad profile.`, `${label} es el resultado más bajo, con ${score}/100. Determine si este límite redujo de forma material un perfil que, por lo demás, es amplio.`, `Le résultat « ${label} » est le plus bas, à ${score}/100. Déterminez si cette limite a eu un effet concret sur le profil.`),
  };
  if (index === 2) return {
    focusLabel: localized(locale, `${label} must hold in a trade-off`, `${label} debe sostenerse ante una disyuntiva`, `Arbitrage : ${label}`),
    question: localized(locale, `Tell me about a decision where ${label.toLowerCase()} and ${softest.label.toLowerCase()} pulled in different directions. How did you preserve both?`, `Describa una decisión en la que ${label.toLowerCase()} y ${softest.label.toLowerCase()} exigieran respuestas distintas. ¿Cómo protegió ambos objetivos?`, `Parlez d'une décision où « ${label} » et « ${softest.label} » tiraient dans des directions différentes. Comment avez-vous préservé les deux ?`),
    verifies: localized(locale, `${label} is ${score}/100. Test whether broad strength remains useful when the profile boundary is required at the same time.`, `${label} alcanza ${score}/100. Compruebe si la fortaleza general sigue siendo útil cuando el principal límite del perfil también entra en juego.`, `Le résultat « ${label} » atteint ${score}/100. Vérifiez si cette force reste utile lorsque la limite du profil est sollicitée au même moment.`),
  };
  return {
    focusLabel: localized(locale, `${label} must survive incomplete evidence`, `${label} debe sostenerse con evidencia incompleta`, `Informations incomplètes : ${label}`),
    question: localized(locale, `Give an example of using ${label.toLowerCase()} before every fact was available. Which uncertainty mattered most, and what checkpoint told you to continue or change course?`, `Dé un ejemplo en el que aplicara ${label.toLowerCase()} antes de disponer de todos los hechos. ¿Qué incertidumbre era la más importante y qué punto de control le indicó si debía continuar o cambiar de rumbo?`, `Donnez un exemple où vous avez mobilisé « ${label} » sans disposer de tous les faits. Quelle incertitude comptait le plus et qu'est-ce qui vous a fait poursuivre ou changer de cap ?`),
    verifies: localized(locale, `${label} is ${score}/100. Confirm disciplined uncertainty management rather than a confident description of the final outcome.`, `${label} alcanza ${score}/100. Confirme una gestión disciplinada de la incertidumbre, no solo una descripción convincente del resultado final.`, `Le résultat « ${label} » atteint ${score}/100. Confirmez une gestion rigoureuse de l'incertitude, pas seulement un récit assuré du résultat final.`),
  };
}

function objectiveCopy(input: InterviewObjectiveInput, shape: EvidenceShape | null, tension: CandidateTensionType): { title: string; copy: string } {
  const name = input.candidateName.trim() || localized(input.locale, "The candidate", "El candidato", "Le candidat");
  const role = input.roleTitle.trim() || localized(input.locale, "the role", "el puesto", "le poste");
  const spanishRoleContext = input.roleTitle.trim() ? `el puesto de ${input.roleTitle.trim()}` : "el puesto";
  const frenchRoleContext = input.roleTitle.trim() ? `le poste de ${input.roleTitle.trim()}` : "le poste";
  if (!shape) return {
    title: localized(input.locale, "Validate the available evidence in role context", "Validar la evidencia disponible en el contexto del puesto", "Valider les éléments disponibles dans le contexte du poste"),
    copy: localized(input.locale, `Ask for recent ${role} examples and examine the decisions, alternatives, and observable outcomes before confirming the recommendation.`, `Solicite ejemplos recientes relacionados con ${spanishRoleContext} y examine las decisiones, las alternativas y los resultados observables antes de confirmar la recomendación.`, `Demandez des exemples récents liés au ${frenchRoleContext} et examinez les décisions, les options envisagées et les résultats observables avant de confirmer la recommandation.`),
  };
  if (tension === "translation") return {
    title: localized(input.locale, "Confirm consistent strength transfers to role performance", "Confirmar que la fortaleza consistente se transfiere al puesto", "Confirmer que la solidité du profil se transpose au poste"),
    copy: localized(input.locale, `${name}'s ${Math.round(shape.average)}/100 profile is high confidence across ${shape.count} competencies. Ask for recent, outcome-linked ${role} examples and treat fluent answers without decisions, trade-offs, or results as unconfirmed.`, `El perfil de ${name}, con ${Math.round(shape.average)}/100, muestra evidencia consistente en ${shape.count} competencias. Solicite ejemplos recientes de ${spanishRoleContext} vinculados a resultados y no dé por confirmadas las respuestas fluidas que omitan decisiones, disyuntivas o resultados.`, `Le profil de ${name}, à ${Math.round(shape.average)}/100, présente un niveau de confiance élevé dans ${shape.count} compétences. Demandez des exemples récents, liés aux résultats attendus du ${frenchRoleContext}, et ne considérez pas comme confirmées les réponses fluides qui n'explicitent ni décision, ni arbitrage, ni résultat.`),
  };
  if (tension === "spread_risk") return {
    title: localized(input.locale, `Determine whether the ${shape.spread}-point gap creates role risk`, `Determinar si la diferencia de ${shape.spread} puntos crea un riesgo para el puesto`, `Déterminer si l'écart de ${shape.spread} points crée un risque pour le poste`),
    copy: localized(input.locale, `${shape.strongest.label} reaches ${shape.strongest.score}/100 while ${shape.softest.label} is ${shape.softest.score}/100. Determine whether that spread is contextual variation or a material constraint on consistent ${role} delivery.`, `${shape.strongest.label} alcanza ${shape.strongest.score}/100, mientras que ${shape.softest.label} queda en ${shape.softest.score}/100. Determine si la diferencia responde al contexto o limita de forma material una ejecución consistente en ${spanishRoleContext}.`, `La compétence « ${shape.strongest.label} » atteint ${shape.strongest.score}/100, tandis que « ${shape.softest.label} » se situe à ${shape.softest.score}/100. Déterminez si cet écart tient au contexte ou s'il constitue une contrainte réelle pour une exécution constante dans ${frenchRoleContext}.`),
  };
  if (tension === "evidence_reliability") return {
    title: localized(input.locale, "Validate the headline result against uneven supporting evidence", "Validar el resultado principal frente a evidencia desigual", "Valider le résultat principal malgré des éléments de preuve inégaux"),
    copy: localized(input.locale, `${name}'s strongest result is ${shape.strongest.label} at ${shape.strongest.score}/100, but overall confidence is low. Require replication, counter-evidence, and an observable outcome before carrying the signal into the decision.`, `El resultado más sólido de ${name} es ${shape.strongest.label}, con ${shape.strongest.score}/100, pero la confianza global es baja. Exija repetibilidad, evidencia en contra y un resultado observable antes de incorporar esta señal a la decisión.`, `Le résultat le plus élevé de ${name} concerne « ${shape.strongest.label} », à ${shape.strongest.score}/100, mais le niveau de confiance global reste faible. Exigez une reproduction du signal, des contre-exemples et un résultat observable avant de l'intégrer à la décision.`),
  };
  return {
    title: localized(input.locale, `Confirm broad strength is not limited by ${shape.softest.label} at ${shape.softest.score}`, `Confirmar que ${shape.softest.label} no limita la fortaleza global`, `Vérifier la limite du profil : ${shape.softest.label}`),
    copy: localized(input.locale, `${name}'s ${Math.round(shape.average)}/100 profile is broadly strong rather than dependent on one result. Use the interview to test whether ${shape.softest.label} at ${shape.softest.score}/100 limits the rest of the evidence in real ${role} outcomes.`, `El perfil de ${name}, con ${Math.round(shape.average)}/100, es globalmente sólido y no depende de un único resultado. Use la entrevista para comprobar si ${shape.softest.label}, con ${shape.softest.score}/100, limita el resto de la evidencia en resultados reales de ${spanishRoleContext}.`, `Le profil de ${name}, à ${Math.round(shape.average)}/100, est globalement solide. Vérifiez en entretien si la compétence « ${shape.softest.label} », à ${shape.softest.score}/100, limite les autres éléments dans des situations réelles liées au ${frenchRoleContext}.`),
  };
}

export function buildCandidateInterviewPlan(input: CandidateInterviewPlanInput): CandidateInterviewPlan {
  const shape = evidenceShape(input.competencyEvidence);
  const tensionType = classifyCandidateTension(input);
  const objective = objectiveCopy(input, shape, tensionType);
  if (!shape) {
    return {
      tensionType,
      profileConclusion: profileConclusion(input, shape, tensionType),
      objectiveTitle: objective.title,
      objectiveCopy: objective.copy,
      questions: input.sourceQuestions.slice(0, 4).map((question, index) => ({
        focusLabel: localized(input.locale, `Resolve evidence question ${index + 1}`, `Resolver la pregunta de evidencia ${index + 1}`, `Résoudre la question de preuve ${index + 1}`),
        question: question.question,
        verifies: localized(input.locale, "Confirm a specific action, trade-off, and observable result.", "Confirme una acción concreta, una disyuntiva y un resultado observable.", "Confirmez une action précise, un arbitrage et un résultat observable."),
      })),
    };
  }

  const points = selectProbePoints(shape, input.sourceQuestions, tensionType);
  return {
    tensionType,
    profileConclusion: profileConclusion(input, shape, tensionType),
    objectiveTitle: objective.title,
    objectiveCopy: objective.copy,
    questions: points.map((point, index) => probeCopy(input.locale, tensionType, index, point, shape, input.roleTitle)),
  };
}

/** Compatibility helper for callers that need only the page objective. */
export function interviewObjective(input: InterviewObjectiveInput): { title: string; copy: string } {
  const plan = buildCandidateInterviewPlan({ ...input, sourceQuestions: [] });
  return { title: plan.objectiveTitle, copy: plan.objectiveCopy };
}
