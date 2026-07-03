// Content engine for the executive candidate report.
// Every block is selected by the candidate's real score band, so no two
// profiles read the same. Spanish is the production language of the report.
// Bespoke content exists for the most-used instruments; the rest inherit a
// category-flavored fallback that is still band-dependent — never generic
// boilerplate repeated across bands.

export type Band = "high" | "medium" | "low";

export function bandOf(score: number): Band {
  return score >= 80 ? "high" : score >= 60 ? "medium" : "low";
}

export const BAND_LABEL_ES: Record<Band, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export interface MeaningBlock {
  /** Likely workplace behaviours at this band */
  behaviors: string[];
  /** Risk reading at this band */
  risk: string;
  /** What the hiring team should consider */
  considerations: string;
}

export interface AssessmentContent {
  /** What this instrument tells the business, in one line */
  focus: string;
  meaning: Record<Band, MeaningBlock>;
  /** Workplace-language strengths, used when the band is high */
  strengths: string[];
  /** Used when the band is medium or low */
  development: { risks: string[]; coaching: string[]; topics: string[] };
  interview: { validation: string[]; probing: string[]; leadership: string[] };
}

// ---------------------------------------------------------------------------
// Bespoke instrument content
// ---------------------------------------------------------------------------

const INTEGRITY: AssessmentContent = {
  focus: "Consistencia ética y fiabilidad de conducta en el entorno laboral",
  meaning: {
    high: {
      behaviors: [
        "Elige sistemáticamente respuestas asociadas a conducta confiable, incluso cuando la opción conveniente es otra",
        "Tiende a reportar irregularidades en lugar de ignorarlas",
        "Aplica las políticas de forma consistente bajo presión",
      ],
      risk: "Riesgo bajo de incidentes de cumplimiento o conducta.",
      considerations: "Perfil adecuado para funciones con manejo de dinero, datos sensibles o representación de la empresa.",
    },
    medium: {
      behaviors: [
        "Aplica criterios éticos correctos en situaciones claras",
        "En escenarios ambiguos puede priorizar la lealtad al equipo o la conveniencia sobre la norma",
      ],
      risk: "Riesgo moderado: la conducta depende del contexto y de la cultura del equipo.",
      considerations: "Conviene validar en entrevista cómo resolvió dilemas reales entre resultados y normas.",
    },
    low: {
      behaviors: [
        "Sus respuestas priorizaron con frecuencia la conveniencia sobre la norma",
        "Puede racionalizar excepciones a las políticas cuando hay presión de resultados",
      ],
      risk: "Riesgo elevado para posiciones con baja supervisión o acceso a activos sensibles.",
      considerations: "No descarta al candidato por sí solo, pero exige verificación de referencias y una entrevista conductual específica.",
    },
  },
  strengths: [
    "Toma de decisiones honesta bajo presión",
    "Cumplimiento consistente de políticas y procesos",
    "Disposición a asumir responsabilidad por errores propios",
    "Fiabilidad en el manejo de información y recursos",
  ],
  development: {
    risks: ["Decisiones inconsistentes en dilemas de lealtad vs. norma", "Tolerancia a atajos cuando 'todos lo hacen'"],
    coaching: ["Formación en política de cumplimiento con casos reales del negocio", "Acuerdos explícitos de conducta en el onboarding"],
    topics: ["Dilemas éticos vividos y cómo los resolvió", "Reacción ante instrucciones contrarias a la política"],
  },
  interview: {
    validation: [
      "Cuénteme una situación en la que aplicar la norma le costó un resultado. ¿Qué hizo?",
      "¿Alguna vez reportó una irregularidad de un compañero? ¿Cómo lo manejó?",
    ],
    probing: [
      "Describa una ocasión en la que rompió una regla para lograr un objetivo. ¿Lo volvería a hacer?",
      "Si su jefe le pide algo contrario a la política, ¿cuál es su primer paso?",
      "¿Qué haría si detecta que un compañero de alto desempeño falsea un reporte?",
    ],
    leadership: [
      "¿Cómo construiría una cultura de integridad en un equipo que hoy tolera atajos?",
      "¿Qué indicadores usaría para detectar riesgos de conducta antes de que escalen?",
    ],
  },
};

const CRITICAL_THINKING: AssessmentContent = {
  focus: "Capacidad de análisis, evaluación de argumentos y decisión con información incompleta",
  meaning: {
    high: {
      behaviors: [
        "Distingue hechos de supuestos y detecta inconsistencias en la información",
        "Llega a conclusiones sólidas con datos incompletos",
        "Cuestiona premisas antes de ejecutar",
      ],
      risk: "Riesgo bajo de errores de análisis en decisiones operativas.",
      considerations: "Apto para funciones que exigen priorizar, diagnosticar problemas y decidir sin supervisión constante.",
    },
    medium: {
      behaviors: [
        "Analiza correctamente problemas estructurados",
        "Puede necesitar apoyo cuando la información es contradictoria o el tiempo es escaso",
      ],
      risk: "Riesgo moderado en decisiones complejas sin acompañamiento.",
      considerations: "Rinde bien con procesos claros; verifique la complejidad analítica real del puesto.",
    },
    low: {
      behaviors: [
        "Tiende a aceptar la información tal como se presenta",
        "Le cuesta identificar la causa raíz frente a los síntomas",
      ],
      risk: "Riesgo alto en puestos que exigen diagnóstico autónomo o decisiones con ambigüedad.",
      considerations: "Considere el ajuste puesto-persona: puede desempeñarse bien en funciones guiadas por procedimiento.",
    },
  },
  strengths: [
    "Análisis riguroso antes de decidir",
    "Detección temprana de inconsistencias y errores",
    "Priorización eficaz con información incompleta",
  ],
  development: {
    risks: ["Conclusiones apresuradas ante presión de tiempo", "Dependencia de instrucciones detalladas"],
    coaching: ["Marcos simples de análisis (causa raíz, pros/contras ponderados)", "Revisión guiada de decisiones reales durante el onboarding"],
    topics: ["Un problema complejo que haya diagnosticado", "Una decisión que tomó con datos contradictorios"],
  },
  interview: {
    validation: [
      "Descríbame un problema donde la causa aparente no era la real. ¿Cómo lo descubrió?",
      "¿Qué decisión reciente tomó con información incompleta y cómo razonó el riesgo?",
    ],
    probing: [
      "Le doy un caso: las ventas caen 20% y el equipo culpa al precio. ¿Cómo lo verificaría?",
      "¿Cómo decide cuándo tiene suficiente información para actuar?",
    ],
    leadership: [
      "¿Cómo enseña a un equipo a cuestionar supuestos sin frenar la ejecución?",
    ],
  },
};

const AQ: AssessmentContent = {
  focus: "Respuesta ante la adversidad: control percibido, responsabilidad, contención y recuperación",
  meaning: {
    high: {
      behaviors: [
        "Mantiene el desempeño ante rechazos, picos de demanda y cambios de prioridades",
        "Contiene los problemas: un mal día no contamina el resto de su trabajo",
        "Se recupera rápido tras errores o conflictos",
      ],
      risk: "Riesgo bajo de rotación o caída de desempeño por estrés.",
      considerations: "Perfil valioso en operaciones exigentes: atención al cliente, ventas, plazos ajustados.",
    },
    medium: {
      behaviors: [
        "Gestiona la presión habitual, pero los reveses importantes pueden afectarle más tiempo del necesario",
        "Responde bien con apoyo del líder tras situaciones difíciles",
      ],
      risk: "Riesgo moderado en entornos de presión sostenida sin acompañamiento.",
      considerations: "Verifique la intensidad emocional real del puesto y la disponibilidad de soporte del supervisor.",
    },
    low: {
      behaviors: [
        "Los contratiempos tienden a extenderse a otras áreas de su trabajo",
        "La recuperación tras un revés es lenta y puede requerir intervención",
      ],
      risk: "Riesgo alto en puestos con rechazo frecuente o presión continua.",
      considerations: "Si el resto del perfil es fuerte, considere funciones con menor exposición a conflicto y un plan de acompañamiento.",
    },
  },
  strengths: [
    "Estabilidad de desempeño bajo presión",
    "Recuperación rápida tras errores y rechazos",
    "Sentido de control y responsabilidad ante problemas",
  ],
  development: {
    risks: ["Desgaste en picos de demanda prolongados", "Contagio emocional de un problema a otras tareas"],
    coaching: ["Técnicas de contención y cierre del día", "Check-ins breves del supervisor tras situaciones difíciles"],
    topics: ["Su peor semana laboral y cómo la gestionó", "Qué necesita de un líder después de un mal resultado"],
  },
  interview: {
    validation: [
      "Cuénteme el mayor revés de su carrera. ¿Qué hizo las primeras 48 horas?",
      "¿Cómo evita que un problema en un frente afecte el resto de su trabajo?",
    ],
    probing: [
      "Describa una época de presión sostenida. ¿Qué señales de desgaste notó en usted?",
      "¿Cuánto tiempo le toma volver a su nivel normal tras un fracaso importante?",
    ],
    leadership: [
      "¿Cómo sostiene la moral de un equipo tras perder un cliente importante?",
    ],
  },
};

const EQ: AssessmentContent = {
  focus: "Lectura y gestión de emociones propias y ajenas en el trabajo",
  meaning: {
    high: {
      behaviors: [
        "Lee el clima del equipo y ajusta su comunicación",
        "Gestiona desacuerdos sin escalar el conflicto",
        "Reconoce el impacto de sus emociones en sus decisiones",
      ],
      risk: "Riesgo bajo de conflictos interpersonales o comunicación deficiente.",
      considerations: "Apto para funciones con clientes, equipos o negociación.",
    },
    medium: {
      behaviors: [
        "Se relaciona con corrección en situaciones normales",
        "En conflicto o bajo presión puede perder precisión al leer a los demás",
      ],
      risk: "Riesgo moderado en puestos con alta carga interpersonal.",
      considerations: "Valide con ejemplos reales de conflicto y feedback recibido.",
    },
    low: {
      behaviors: [
        "Puede malinterpretar señales del equipo o del cliente",
        "El manejo del desacuerdo tiende a ser evasivo o reactivo",
      ],
      risk: "Riesgo alto en roles de servicio, liderazgo o venta consultiva.",
      considerations: "Considere el peso interpersonal real del puesto antes de avanzar.",
    },
  },
  strengths: [
    "Comunicación adaptada al interlocutor",
    "Manejo constructivo del desacuerdo",
    "Autoconciencia sobre su impacto en otros",
  ],
  development: {
    risks: ["Escalamiento de conflictos evitables", "Lectura errónea de clientes difíciles"],
    coaching: ["Práctica de escucha activa con retroalimentación", "Guiones de manejo de conversaciones difíciles"],
    topics: ["Un conflicto laboral y su papel en resolverlo", "El feedback más difícil que ha recibido"],
  },
  interview: {
    validation: [
      "Cuénteme una vez que cambió su postura tras entender la emoción detrás de la posición de otro.",
      "¿Cómo se da cuenta de que su estado de ánimo está afectando su trabajo?",
    ],
    probing: [
      "Describa un conflicto con un compañero. ¿Qué hizo usted, concretamente?",
      "¿Qué crítica sobre su trato con otros ha recibido más de una vez?",
    ],
    leadership: [
      "¿Cómo detecta y maneja la frustración silenciosa en su equipo?",
    ],
  },
};

// ---------------------------------------------------------------------------
// Category fallbacks — still band-dependent, flavored per category
// ---------------------------------------------------------------------------

function generic(focus: string, domain: string, highBehaviors: string[], lowRisk: string): AssessmentContent {
  return {
    focus,
    meaning: {
      high: {
        behaviors: highBehaviors,
        risk: `Riesgo bajo en las exigencias de ${domain} del puesto.`,
        considerations: `El resultado respalda confiar ${domain} de complejidad real al candidato desde el inicio.`,
      },
      medium: {
        behaviors: [
          `Cumple con solvencia las exigencias habituales de ${domain}`,
          "Las situaciones de mayor complejidad pueden requerir apoyo o más tiempo",
        ],
        risk: `Riesgo moderado si el puesto concentra exigencias altas de ${domain}.`,
        considerations: "Contraste la exigencia real del puesto con este resultado antes de ponderarlo.",
      },
      low: {
        behaviors: [
          `Mostró dificultades consistentes en los ejercicios de ${domain}`,
          "Es probable que necesite estructura y supervisión cercana en esta área",
        ],
        risk: lowRisk,
        considerations: "Evalúe si el puesto permite compensar esta área con fortalezas del resto del perfil.",
      },
    },
    strengths: [
      `Desempeño sólido y consistente en ${domain}`,
      "Resultados por encima del estándar del proceso en esta área",
    ],
    development: {
      risks: [`Errores o lentitud cuando la exigencia de ${domain} es alta`],
      coaching: [`Plan de práctica guiada en ${domain} durante el primer trimestre`],
      topics: [`Ejemplos concretos de su trabajo reciente que exijan ${domain}`],
    },
    interview: {
      validation: [
        `Descríbame el logro profesional que mejor demuestre su capacidad en ${domain}.`,
        "¿Qué parte de este tipo de trabajo le resulta natural y cuál le exige esfuerzo?",
      ],
      probing: [
        `Cuénteme una situación reciente donde ${domain} le haya puesto en dificultad. ¿Qué hizo?`,
        "¿Qué apoyo necesitaría de su líder en esta área durante los primeros meses?",
      ],
      leadership: [
        `¿Cómo elevaría el estándar de ${domain} en un equipo a su cargo?`,
      ],
    },
  };
}

const CATEGORY_FALLBACK_ES: Record<string, AssessmentContent> = {
  Cognitive: generic(
    "Capacidad de razonamiento y resolución de problemas",
    "el razonamiento y análisis",
    ["Resuelve problemas nuevos sin depender de procedimientos memorizados", "Aprende reglas y patrones con rapidez"],
    "Riesgo alto en puestos que exigen diagnóstico y decisión autónoma."
  ),
  "Numerical Reasoning": generic(
    "Razonamiento con datos numéricos y cuantitativos",
    "el trabajo con números y datos",
    ["Interpreta cifras y tendencias con precisión", "Detecta errores numéricos que otros pasan por alto"],
    "Riesgo alto en funciones con reporting, caja o análisis cuantitativo."
  ),
  Personality: generic(
    "Disposiciones estables de comportamiento laboral",
    "la consistencia conductual",
    ["Su perfil de trabajo declarado es consistente entre situaciones", "Alta previsibilidad de comportamiento para el equipo"],
    "Riesgo de fricción entre su estilo natural y las demandas del puesto."
  ),
  Resilience: generic(
    "Estabilidad y recuperación ante la presión",
    "la gestión de la presión",
    ["Mantiene el nivel ante contratiempos", "Se recupera rápido tras reveses"],
    "Riesgo alto en entornos de presión sostenida o rechazo frecuente."
  ),
  Leadership: generic(
    "Estilos y disposición para dirigir personas",
    "la dirección de personas",
    ["Adapta su estilo de dirección a la situación y a la persona", "Asume la responsabilidad del resultado del equipo"],
    "Riesgo alto si el puesto exige dirigir personas desde el primer día."
  ),
  Communication: generic(
    "Claridad y eficacia comunicativa en el trabajo",
    "la comunicación",
    ["Transmite ideas complejas con claridad", "Ajusta el mensaje a la audiencia"],
    "Riesgo alto en puestos de cara al cliente o coordinación entre áreas."
  ),
  Teamwork: generic(
    "Colaboración y contribución al equipo",
    "el trabajo en equipo",
    ["Prioriza el resultado colectivo sobre el lucimiento individual", "Colabora sin necesidad de supervisión"],
    "Riesgo de fricciones en equipos con alta interdependencia."
  ),
  "Customer Service": generic(
    "Orientación y resolución en la atención al cliente",
    "la atención al cliente",
    ["Mantiene la calidad de atención con clientes difíciles", "Resuelve en el primer contacto cuando es posible"],
    "Riesgo alto en operaciones de contacto directo con clientes."
  ),
  Sales: generic(
    "Aptitud para la venta y la persuasión",
    "la venta",
    ["Gestiona objeciones sin perder la relación", "Persiste tras el rechazo con método"],
    "Riesgo alto en funciones comerciales con meta individual."
  ),
  Productivity: generic(
    "Organización, prioridades y gestión del tiempo",
    "la organización y las prioridades",
    ["Prioriza por impacto y cumple plazos de forma consistente", "Protege el tiempo de las tareas importantes"],
    "Riesgo de plazos incumplidos en puestos con múltiples frentes."
  ),
  Judgment: generic(
    "Criterio para decidir en situaciones laborales reales",
    "el criterio en situaciones reales",
    ["Elige cursos de acción sensatos en escenarios ambiguos", "Pondera consecuencias antes de actuar"],
    "Riesgo alto en puestos con decisiones frecuentes sin supervisión."
  ),
  "Workplace Judgment": generic(
    "Criterio para decidir en situaciones laborales reales",
    "el criterio en situaciones reales",
    ["Elige cursos de acción sensatos en escenarios ambiguos", "Pondera consecuencias antes de actuar"],
    "Riesgo alto en puestos con decisiones frecuentes sin supervisión."
  ),
  Technical: generic(
    "Razonamiento técnico y mecánico aplicado",
    "el razonamiento técnico",
    ["Comprende sistemas físicos y procesos con rapidez", "Diagnostica fallas con lógica estructurada"],
    "Riesgo alto en funciones técnicas u operativas de planta."
  ),
  Character: generic(
    "Rasgos de carácter relevantes para el puesto",
    "la fiabilidad de conducta",
    ["Comportamiento consistente entre lo declarado y lo esperado", "Estabilidad de conducta ante presión"],
    "Riesgo de conducta inconsistente bajo presión o baja supervisión."
  ),
  Behavioural: generic(
    "Patrones de comportamiento y aprendizaje en el trabajo",
    "la adaptación y el aprendizaje",
    ["Incorpora feedback y ajusta su comportamiento con rapidez", "Aprende de errores sin repetirlos"],
    "Riesgo de adaptación lenta en entornos que cambian con frecuencia."
  ),
  "Emotional Intelligence": EQ,
};

const BESPOKE_ES: Record<string, AssessmentContent> = {
  "Integrity & Ethics Test": INTEGRITY,
  "Critical Thinking Test": CRITICAL_THINKING,
  "Adversity Quotient (AQ) Test": AQ,
  "Emotional Intelligence Test": EQ,
};

export function contentFor(assessmentName: string, category: string | null): AssessmentContent {
  return (
    BESPOKE_ES[assessmentName] ??
    (category ? CATEGORY_FALLBACK_ES[category] : undefined) ??
    CATEGORY_FALLBACK_ES.Cognitive
  );
}

export type ReportLang = "es" | "en";

const TONES: Record<ReportLang, Record<"leadership" | "validation" | "mixed" | "probing", string>> = {
  es: { leadership: "Potencial y liderazgo", validation: "Validación de fortaleza", mixed: "Validación y contraste", probing: "Exploración de riesgo" },
  en: { leadership: "Potential and leadership", validation: "Strength validation", mixed: "Validation and contrast", probing: "Risk exploration" },
};

/** Score-dependent interview questions for one assessment. */
export function interviewQuestions(
  content: AssessmentContent,
  score: number,
  lang: ReportLang = "es"
): { tone: string; questions: string[] } {
  const tones = TONES[lang];
  if (score >= 90) {
    return { tone: tones.leadership, questions: [...content.interview.leadership, content.interview.validation[0]] };
  }
  if (score >= 80) {
    return { tone: tones.validation, questions: content.interview.validation };
  }
  if (score >= 60) {
    return { tone: tones.mixed, questions: [content.interview.validation[0], ...content.interview.probing.slice(0, 2)] };
  }
  return { tone: tones.probing, questions: content.interview.probing };
}

// ---------------------------------------------------------------------------
// Recommendation engine
// ---------------------------------------------------------------------------

export type Recommendation = "proceed" | "reservations" | "interview" | "not_recommended";

export const RECOMMENDATION_ES: Record<Recommendation, { label: string; short: string }> = {
  proceed: { label: "Avanzar a la siguiente etapa", short: "Avanzar" },
  reservations: { label: "Avanzar con reservas", short: "Con reservas" },
  interview: { label: "Requiere entrevista adicional", short: "Entrevista adicional" },
  not_recommended: { label: "No recomendado para esta posición", short: "No recomendado" },
};

export interface Verdict {
  recommendation: Recommendation;
  confidence: "alta" | "media" | "limitada";
  confidenceReason: string;
  reasons: string[];
  risks: string[];
  nextSteps: string[];
}

export function buildVerdict(input: {
  scores: { name: string; score: number }[];
  assigned: number;
}): Verdict {
  const { scores, assigned } = input;
  const n = scores.length;
  const avg = Math.round(scores.reduce((s, r) => s + r.score, 0) / Math.max(n, 1));
  const min = Math.min(...scores.map((s) => s.score));
  const max = Math.max(...scores.map((s) => s.score));
  const lows = scores.filter((s) => s.score < 60);
  const highs = scores.filter((s) => s.score >= 80);

  let recommendation: Recommendation;
  if (avg >= 80 && min >= 60) recommendation = "proceed";
  else if (avg >= 70 && lows.length <= 1) recommendation = "reservations";
  else if (avg >= 55) recommendation = "interview";
  else recommendation = "not_recommended";

  const confidence = n >= 3 ? "alta" : n === 2 ? "media" : "limitada";
  const confidenceReason =
    n >= 3
      ? `Basada en ${n} evaluaciones completadas que cubren dimensiones distintas del perfil.`
      : n === 2
        ? "Basada en dos evaluaciones; una prueba adicional aumentaría la certeza."
        : "Basada en una sola evaluación: trate este informe como una primera señal, no como un veredicto.";

  const reasons: string[] = [];
  reasons.push(`Promedio general de ${avg} sobre 100 en ${n} evaluación${n === 1 ? "" : "es"}.`);
  if (highs.length > 0) reasons.push(`Desempeño alto en ${highs.map((h) => h.name).join(", ")}.`);
  if (lows.length > 0) reasons.push(`Resultados por debajo del umbral en ${lows.map((l) => l.name).join(", ")}.`);
  if (n >= 2 && max - min <= 15) reasons.push("Perfil consistente: baja dispersión entre pruebas.");
  if (n >= 2 && max - min >= 30) reasons.push(`Perfil desigual: ${max - min} puntos de diferencia entre su mejor y peor resultado.`);
  if (assigned > n) reasons.push(`Batería incompleta: ${assigned - n} evaluación${assigned - n === 1 ? "" : "es"} asignada${assigned - n === 1 ? "" : "s"} sin completar.`);

  const risks: string[] = [];
  lows.forEach((l) => risks.push(`${l.name}: resultado bajo (${l.score}); revise la sección de áreas de desarrollo.`));
  if (n === 1) risks.push("Evidencia limitada a un solo instrumento.");
  if (assigned > n) risks.push("La batería asignada no se completó; el perfil puede estar incompleto.");
  if (risks.length === 0) risks.push("Sin riesgos relevantes identificados en las evaluaciones completadas.");

  const nextSteps: string[] = [];
  if (recommendation === "proceed") {
    nextSteps.push("Programar entrevista utilizando la guía de este informe.");
    nextSteps.push("Verificar referencias laborales con foco en las fortalezas detectadas.");
  } else if (recommendation === "reservations") {
    nextSteps.push("Entrevistar con foco en las áreas señaladas antes de decidir.");
    if (assigned > n) nextSteps.push("Solicitar la finalización de la batería pendiente.");
    nextSteps.push("Contrastar las reservas con el desempeño en referencias.");
  } else if (recommendation === "interview") {
    nextSteps.push("Realizar una entrevista estructurada con las preguntas de exploración de este informe.");
    nextSteps.push("Considerar una evaluación adicional en el área más débil.");
  } else {
    nextSteps.push("Documentar la decisión y conservar este informe en el expediente del proceso.");
    nextSteps.push("Considerar al candidato para posiciones con exigencias distintas, si existe interés mutuo.");
  }

  return { recommendation, confidence, confidenceReason, reasons, risks, nextSteps };
}

/** One executive paragraph, composed from the candidate's actual results. */
export function executiveSummary(input: {
  name: string;
  projectName: string;
  scores: { name: string; score: number }[];
  verdict: Verdict;
}): string {
  const { name, projectName, scores, verdict } = input;
  const n = scores.length;
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const opening = `${name} completó ${n} evaluación${n === 1 ? "" : "es"} para la posición de ${projectName}.`;

  let evidence: string;
  if (n === 1) {
    const b = bandOf(best.score);
    evidence =
      b === "high"
        ? ` Su resultado en ${best.name} (${best.score}) se sitúa en la banda alta del instrumento.`
        : b === "medium"
          ? ` Su resultado en ${best.name} (${best.score}) se sitúa en el rango medio esperado.`
          : ` Su resultado en ${best.name} (${best.score}) quedó por debajo del rango esperado.`;
  } else {
    evidence = ` Su desempeño más sólido se observa en ${best.name} (${best.score})`;
    evidence +=
      worst.score < 70
        ? `, mientras que ${worst.name} (${worst.score}) concentra el mayor margen de desarrollo.`
        : `, con el resto de resultados en rangos consistentes.`;
  }

  const closing: Record<Recommendation, string> = {
    proceed: " En conjunto, la evidencia respalda avanzar a la etapa de entrevista.",
    reservations: " La evidencia respalda avanzar, con las reservas señaladas en la recomendación final.",
    interview: " La evidencia es mixta: se recomienda una entrevista adicional antes de decidir.",
    not_recommended: " La evidencia disponible no respalda avanzar en esta posición.",
  };

  return opening + evidence + closing[verdict.recommendation];
}

// ---------------------------------------------------------------------------
// English layer — an English workspace must read like an English product.
// Bespoke English instrument content can be added over time; until then the
// English report uses the band-dependent category content below.
// ---------------------------------------------------------------------------

export const BAND_LABEL: Record<ReportLang, Record<Band, string>> = {
  es: BAND_LABEL_ES,
  en: { high: "High", medium: "Medium", low: "Low" },
};

export const RECOMMENDATION_LABEL: Record<ReportLang, Record<Recommendation, { label: string; short: string }>> = {
  es: RECOMMENDATION_ES,
  en: {
    proceed: { label: "Proceed to the next stage", short: "Proceed" },
    reservations: { label: "Proceed with reservations", short: "With reservations" },
    interview: { label: "Additional interview required", short: "Additional interview" },
    not_recommended: { label: "Not recommended for this position", short: "Not recommended" },
  },
};

function genericEn(focus: string, domain: string, highBehaviors: string[], lowRisk: string): AssessmentContent {
  return {
    focus,
    meaning: {
      high: {
        behaviors: highBehaviors,
        risk: `Low risk against the ${domain} demands of the role.`,
        considerations: `The result supports trusting the candidate with real ${domain} responsibility from the start.`,
      },
      medium: {
        behaviors: [
          `Handles the usual ${domain} demands competently`,
          "Higher-complexity situations may require support or more time",
        ],
        risk: `Moderate risk if the role concentrates heavy ${domain} demands.`,
        considerations: "Contrast the real demands of the role with this result before weighting it.",
      },
      low: {
        behaviors: [
          `Showed consistent difficulty in the ${domain} exercises`,
          "Will likely need structure and close supervision in this area",
        ],
        risk: lowRisk,
        considerations: "Assess whether the role allows this area to be offset by the rest of the profile.",
      },
    },
    strengths: [
      `Solid, consistent performance in ${domain}`,
      "Results above the process standard in this area",
    ],
    development: {
      risks: [`Errors or slowness when ${domain} demands are high`],
      coaching: [`A guided practice plan for ${domain} during the first quarter`],
      topics: [`Concrete examples of recent work that required ${domain}`],
    },
    interview: {
      validation: [
        `Describe the professional achievement that best demonstrates your ability in ${domain}.`,
        "Which part of this kind of work comes naturally to you, and which takes effort?",
      ],
      probing: [
        `Tell me about a recent situation where ${domain} put you in difficulty. What did you do?`,
        "What support would you need from your manager in this area during the first months?",
      ],
      leadership: [`How would you raise the standard of ${domain} in a team you lead?`],
    },
  };
}

const CATEGORY_FALLBACK_EN: Record<string, AssessmentContent> = {
  Cognitive: genericEn("Reasoning and problem-solving ability", "reasoning and analysis",
    ["Solves novel problems without relying on memorized procedures", "Learns rules and patterns quickly"],
    "High risk in roles requiring autonomous diagnosis and decisions."),
  "Numerical Reasoning": genericEn("Quantitative and numerical reasoning", "working with numbers and data",
    ["Interprets figures and trends accurately", "Catches numerical errors others miss"],
    "High risk in roles involving reporting, cash handling, or quantitative analysis."),
  Personality: genericEn("Stable workplace behavioural dispositions", "behavioural consistency",
    ["Declared work style is consistent across situations", "Highly predictable behaviour for the team"],
    "Risk of friction between natural style and role demands."),
  Resilience: genericEn("Stability and recovery under pressure", "pressure management",
    ["Maintains performance through setbacks", "Recovers quickly after adversity"],
    "High risk in sustained-pressure or high-rejection environments."),
  Leadership: genericEn("Leadership styles and readiness to direct people", "directing people",
    ["Adapts leadership style to the situation and person", "Owns the team results"],
    "High risk if the role requires leading people from day one."),
  Communication: genericEn("Clarity and effectiveness of workplace communication", "communication",
    ["Conveys complex ideas clearly", "Adjusts the message to the audience"],
    "High risk in client-facing or cross-team coordination roles."),
  Teamwork: genericEn("Collaboration and team contribution", "teamwork",
    ["Prioritizes collective results over individual credit", "Collaborates without supervision"],
    "Risk of friction in highly interdependent teams."),
  "Customer Service": genericEn("Customer orientation and resolution", "customer service",
    ["Maintains service quality with difficult customers", "Resolves on first contact when possible"],
    "High risk in direct customer contact operations."),
  Sales: genericEn("Sales aptitude and persuasion", "selling",
    ["Handles objections without damaging the relationship", "Persists methodically after rejection"],
    "High risk in commercial roles with individual quotas."),
  Productivity: genericEn("Organization, priorities and time management", "organization and priorities",
    ["Prioritizes by impact and meets deadlines consistently", "Protects time for what matters"],
    "Risk of missed deadlines in multi-front roles."),
  Judgment: genericEn("Judgment in real workplace situations", "judgment in real situations",
    ["Chooses sensible courses of action in ambiguity", "Weighs consequences before acting"],
    "High risk in roles with frequent unsupervised decisions."),
  "Workplace Judgment": genericEn("Judgment in real workplace situations", "judgment in real situations",
    ["Chooses sensible courses of action in ambiguity", "Weighs consequences before acting"],
    "High risk in roles with frequent unsupervised decisions."),
  Technical: genericEn("Applied technical and mechanical reasoning", "technical reasoning",
    ["Understands physical systems and processes quickly", "Diagnoses faults with structured logic"],
    "High risk in technical or plant-floor roles."),
  Character: genericEn("Character traits relevant to the role", "behavioural reliability",
    ["Consistent behaviour between what is declared and expected", "Stable conduct under pressure"],
    "Risk of inconsistent conduct under pressure or low supervision."),
  Behavioural: genericEn("Workplace behaviour and learning patterns", "adaptation and learning",
    ["Incorporates feedback and adjusts quickly", "Learns from mistakes without repeating them"],
    "Risk of slow adaptation in fast-changing environments."),
  "Emotional Intelligence": genericEn("Reading and managing emotions at work", "interpersonal effectiveness",
    ["Reads the team climate and adjusts communication", "Manages disagreement without escalation"],
    "High risk in service, leadership, or consultative sales roles."),
};

export function contentForLocale(assessmentName: string, category: string | null, lang: ReportLang): AssessmentContent {
  if (lang === "es") return contentFor(assessmentName, category);
  return (category ? CATEGORY_FALLBACK_EN[category] : undefined) ?? CATEGORY_FALLBACK_EN.Cognitive;
}

/** Locale-aware verdict: same rules as buildVerdict, language-specific text. */
export function buildVerdictLocalized(
  input: { scores: { name: string; score: number }[]; assigned: number },
  lang: ReportLang
): Verdict {
  if (lang === "es") return buildVerdict(input);

  const { scores, assigned } = input;
  const n = scores.length;
  const avg = Math.round(scores.reduce((s, r) => s + r.score, 0) / Math.max(n, 1));
  const min = Math.min(...scores.map((s) => s.score));
  const max = Math.max(...scores.map((s) => s.score));
  const lows = scores.filter((s) => s.score < 60);
  const highs = scores.filter((s) => s.score >= 80);

  let recommendation: Recommendation;
  if (avg >= 80 && min >= 60) recommendation = "proceed";
  else if (avg >= 70 && lows.length <= 1) recommendation = "reservations";
  else if (avg >= 55) recommendation = "interview";
  else recommendation = "not_recommended";

  const confidence = n >= 3 ? "alta" : n === 2 ? "media" : "limitada";
  const confidenceReason =
    n >= 3
      ? `Based on ${n} completed assessments covering distinct dimensions of the profile.`
      : n === 2
        ? "Based on two assessments; an additional instrument would increase certainty."
        : "Based on a single assessment: treat this report as a first signal, not a verdict.";

  const reasons: string[] = [];
  reasons.push(`Overall average of ${avg} out of 100 across ${n} assessment${n === 1 ? "" : "s"}.`);
  if (highs.length > 0) reasons.push(`High performance in ${highs.map((h) => h.name).join(", ")}.`);
  if (lows.length > 0) reasons.push(`Results below threshold in ${lows.map((l) => l.name).join(", ")}.`);
  if (n >= 2 && max - min <= 15) reasons.push("Consistent profile: low dispersion between instruments.");
  if (n >= 2 && max - min >= 30) reasons.push(`Uneven profile: ${max - min} points between best and weakest result.`);
  if (assigned > n) reasons.push(`Incomplete battery: ${assigned - n} assigned assessment${assigned - n === 1 ? "" : "s"} not completed.`);

  const risks: string[] = [];
  lows.forEach((l) => risks.push(`${l.name}: low result (${l.score}); see the development areas section.`));
  if (n === 1) risks.push("Evidence limited to a single instrument.");
  if (assigned > n) risks.push("The assigned battery was not completed; the profile may be partial.");
  if (risks.length === 0) risks.push("No relevant risks identified in the completed assessments.");

  const nextSteps: string[] = [];
  if (recommendation === "proceed") {
    nextSteps.push("Schedule the interview using the guide in this report.");
    nextSteps.push("Check references with a focus on the detected strengths.");
  } else if (recommendation === "reservations") {
    nextSteps.push("Interview with focus on the flagged areas before deciding.");
    if (assigned > n) nextSteps.push("Request completion of the pending battery.");
    nextSteps.push("Contrast the reservations against reference checks.");
  } else if (recommendation === "interview") {
    nextSteps.push("Run a structured interview using the probing questions in this report.");
    nextSteps.push("Consider an additional assessment in the weakest area.");
  } else {
    nextSteps.push("Document the decision and archive this report in the process file.");
    nextSteps.push("Consider the candidate for roles with different demands, if there is mutual interest.");
  }

  return { recommendation, confidence, confidenceReason, reasons, risks, nextSteps };
}

/** Locale-aware executive paragraph. */
export function executiveSummaryLocalized(
  input: { name: string; projectName: string; scores: { name: string; score: number }[]; verdict: Verdict },
  lang: ReportLang
): string {
  if (lang === "es") return executiveSummary(input);

  const { name, projectName, scores, verdict } = input;
  const n = scores.length;
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const opening = `${name} completed ${n} assessment${n === 1 ? "" : "s"} for the ${projectName} position.`;

  let evidence: string;
  if (n === 1) {
    const b = bandOf(best.score);
    evidence =
      b === "high"
        ? ` Their result in ${best.name} (${best.score}) sits in the high band of the instrument.`
        : b === "medium"
          ? ` Their result in ${best.name} (${best.score}) sits within the expected mid range.`
          : ` Their result in ${best.name} (${best.score}) fell below the expected range.`;
  } else {
    evidence = ` Their strongest performance is in ${best.name} (${best.score})`;
    evidence +=
      worst.score < 70
        ? `, while ${worst.name} (${worst.score}) concentrates the greatest room for development.`
        : `, with the remaining results in consistent ranges.`;
  }

  const closing: Record<Recommendation, string> = {
    proceed: " Overall, the evidence supports advancing to the interview stage.",
    reservations: " The evidence supports advancing, with the reservations noted in the final recommendation.",
    interview: " The evidence is mixed: an additional interview is recommended before deciding.",
    not_recommended: " The available evidence does not support advancing for this position.",
  };

  return opening + evidence + closing[verdict.recommendation];
}
