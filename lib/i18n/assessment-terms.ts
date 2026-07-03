// Canonical Spanish terminology for assessment content.
// DB stores English names (assessments.name is the stable key used by
// routing, scoring, and the API) — every user-facing surface localizes
// through this module instead of showing the raw key.

export const ASSESSMENT_ES: Record<string, { name: string; short: string }> = {
  "Critical Thinking Test": { name: "Prueba de Pensamiento Crítico", short: "Pensamiento Crítico" },
  "Adversity Quotient (AQ) Test": { name: "Prueba de Cociente de Adversidad (AQ)", short: "Cociente de Adversidad" },
  "Emotional Intelligence Test": { name: "Prueba de Inteligencia Emocional", short: "Inteligencia Emocional" },
  "Fluid Intelligence Test": { name: "Prueba de Inteligencia Fluida", short: "Inteligencia Fluida" },
  "Social Intelligence Test": { name: "Prueba de Inteligencia Social", short: "Inteligencia Social" },
  "Leadership Styles Test": { name: "Prueba de Estilos de Liderazgo", short: "Estilos de Liderazgo" },
  "Numerical Intelligence Test": { name: "Prueba de Inteligencia Numérica", short: "Inteligencia Numérica" },
  "Personality Type Test": { name: "Prueba de Tipo de Personalidad", short: "Tipo de Personalidad" },
  "Situational Judgment Test": { name: "Prueba de Juicio Situacional", short: "Juicio Situacional" },
  "Attention to Detail Test": { name: "Prueba de Atención al Detalle", short: "Atención al Detalle" },
  "Verbal Reasoning Test": { name: "Prueba de Razonamiento Verbal", short: "Razonamiento Verbal" },
  "Abstract Reasoning Test": { name: "Prueba de Razonamiento Abstracto", short: "Razonamiento Abstracto" },
  "Mechanical Reasoning Test": { name: "Prueba de Razonamiento Mecánico", short: "Razonamiento Mecánico" },
  "Communication Skills Test": { name: "Prueba de Habilidades de Comunicación", short: "Comunicación" },
  "Problem Solving Test": { name: "Prueba de Resolución de Problemas", short: "Resolución de Problemas" },
  "Work Style Assessment": { name: "Evaluación de Estilo de Trabajo", short: "Estilo de Trabajo" },
  "Sales Aptitude Test": { name: "Prueba de Aptitud Comercial", short: "Aptitud Comercial" },
  "Customer Service Skills Test": { name: "Prueba de Atención al Cliente", short: "Atención al Cliente" },
  "Teamwork & Collaboration Test": { name: "Prueba de Trabajo en Equipo y Colaboración", short: "Trabajo en Equipo" },
  "Time Management Test": { name: "Prueba de Gestión del Tiempo", short: "Gestión del Tiempo" },
  "Stress Tolerance Test": { name: "Prueba de Tolerancia al Estrés", short: "Tolerancia al Estrés" },
  "Integrity & Ethics Test": { name: "Prueba de Integridad y Ética", short: "Integridad y Ética" },
  "Decision Making Test": { name: "Prueba de Toma de Decisiones", short: "Toma de Decisiones" },
  "Learning Agility Test": { name: "Prueba de Agilidad de Aprendizaje", short: "Agilidad de Aprendizaje" },
};

export const CATEGORY_ES: Record<string, string> = {
  Cognitive: "Cognitiva",
  Resilience: "Resiliencia",
  Personality: "Personalidad",
  Leadership: "Liderazgo",
  Behavioural: "Conductual",
  Character: "Carácter",
  Communication: "Comunicación",
  "Customer Service": "Atención al Cliente",
  "Emotional Intelligence": "Inteligencia Emocional",
  Judgment: "Juicio",
  "Numerical Reasoning": "Razonamiento Numérico",
  Productivity: "Productividad",
  Sales: "Ventas",
  Teamwork: "Trabajo en Equipo",
  Technical: "Técnica",
  "Workplace Judgment": "Juicio Laboral",
};

// Dimension / style labels emitted by the scoring instruments.
export const DIMENSION_ES: Record<string, string> = {
  // AQ CORE
  control: "Control",
  ownership: "Responsabilidad",
  reach: "Alcance",
  endurance: "Resistencia",
  // Goleman EQ
  "Self-awareness": "Autoconciencia",
  "Self-regulation": "Autorregulación",
  Motivation: "Motivación",
  Empathy: "Empatía",
  "Social Skills": "Habilidades Sociales",
  // Big Five
  Openness: "Apertura",
  Conscientiousness: "Responsabilidad",
  Extraversion: "Extraversión",
  Agreeableness: "Amabilidad",
  "Emotional Stability": "Estabilidad Emocional",
  // Workplace dimensions
  Accountability: "Rendición de Cuentas",
  Adaptability: "Adaptabilidad",
  Collaboration: "Colaboración",
  Communication: "Comunicación",
  "Decision Quality": "Calidad de Decisión",
  // Goleman leadership styles
  Visionary: "Visionario",
  Coaching: "Coaching",
  Affiliative: "Afiliativo",
  Democratic: "Democrático",
  Pacesetting: "Ejemplarizante",
  Commanding: "Autoritario",
};

// Spanish catalog descriptions, keyed by the canonical assessment name.
export const ASSESSMENT_DESC_ES: Record<string, string> = {
  "Critical Thinking Test": "Mide la capacidad de razonamiento analítico y pensamiento crítico.",
  "Numerical Intelligence Test": "Mide la capacidad de razonamiento cuantitativo.",
  "Personality Type Test": "Perfil completo de tipo de personalidad.",
  "Situational Judgment Test": "Mide el juicio práctico en escenarios laborales realistas.",
  "Emotional Intelligence Test": "Mide la inteligencia emocional en 5 dimensiones de Goleman.",
  "Leadership Styles Test": "Identifica el estilo de liderazgo dominante.",
  "Adversity Quotient (AQ) Test": "Mide la capacidad para enfrentar la adversidad y los desafíos.",
  "Attention to Detail Test":
    "Mide la precisión y exactitud mediante 40 preguntas de detección de errores en ortografía, datos, cálculos, formato y consistencia referencial.",
  "Verbal Reasoning Test":
    "Evalúa la comprensión, las relaciones entre palabras y la deducción lógica en 30 preguntas que incluyen analogías, el elemento que no corresponde y silogismos.",
  "Abstract Reasoning Test":
    "Evalúa el reconocimiento de patrones y el razonamiento no verbal mediante 25 preguntas de secuencias y matrices.",
  "Mechanical Reasoning Test":
    "Evalúa la comprensión de principios mecánicos — engranajes, palancas, poleas, fuerzas, circuitos y dinámica de fluidos — en 30 preguntas.",
  "Communication Skills Test":
    "Perfila la efectividad comunicativa en 4 dimensiones: comunicación escrita, verbal, escucha activa y comunicación no verbal. 35 afirmaciones de escala Likert.",
  "Problem Solving Test":
    "Evalúa la resolución de problemas y la calidad de decisiones en 30 escenarios laborales realistas.",
  "Work Style Assessment":
    "Perfila las preferencias de trabajo en 5 dimensiones: analítico, orientado al detalle, colaborativo, adaptable y orientado a resultados. 40 afirmaciones de escala Likert.",
  "Sales Aptitude Test":
    "Evalúa la aptitud en ventas B2B en 4 dimensiones: prospección, persuasión, manejo de objeciones y cierre. 35 preguntas basadas en escenarios.",
  "Customer Service Skills Test":
    "Evalúa la efectividad en atención al cliente en 4 dimensiones: empatía, resolución de problemas, comunicación y paciencia. 35 preguntas basadas en escenarios.",
  "Teamwork & Collaboration Test":
    "Perfila el estilo de trabajo colaborativo en 4 dimensiones: cooperación, comunicación, confiabilidad y resolución de conflictos. 35 afirmaciones de escala Likert.",
  "Time Management Test":
    "Evalúa la gestión del tiempo y las prioridades en 4 dimensiones: priorización, planificación, enfoque y gestión de plazos. 30 preguntas basadas en escenarios.",
  "Stress Tolerance Test":
    "Mide la resiliencia y la compostura bajo presión en 4 dimensiones: control emocional, resiliencia, estrategias de afrontamiento y rendimiento bajo presión. 30 afirmaciones de escala Likert.",
  "Integrity & Ethics Test":
    "Evalúa la integridad profesional en 4 dimensiones: honestidad, responsabilidad, ética y confiabilidad. 30 preguntas basadas en escenarios.",
  "Decision Making Test":
    "Evalúa la calidad de las decisiones en 4 dimensiones: análisis, juicio, evaluación de riesgos y velocidad. 30 preguntas basadas en escenarios.",
  "Learning Agility Test":
    "Mide la adaptabilidad y la mentalidad de crecimiento en 4 dimensiones: flexibilidad mental, velocidad de aprendizaje, receptividad al feedback y experimentación. 30 preguntas basadas en escenarios.",
};

type Loc = string;
const isEs = (locale: Loc) => locale === "es";

export function assessmentName(name: string, locale: Loc): string {
  return isEs(locale) ? ASSESSMENT_ES[name]?.name ?? name : name;
}

export function assessmentShort(name: string, fallbackShort: string, locale: Loc): string {
  return isEs(locale) ? ASSESSMENT_ES[name]?.short ?? fallbackShort : fallbackShort;
}

export function categoryLabel(category: string, locale: Loc): string {
  return isEs(locale) ? CATEGORY_ES[category] ?? category : category;
}

export function dimensionLabel(label: string, locale: Loc): string {
  return isEs(locale) ? DIMENSION_ES[label] ?? label : label;
}

export function assessmentDescription(name: string, fallback: string, locale: Loc): string {
  return isEs(locale) ? ASSESSMENT_DESC_ES[name] ?? fallback : fallback;
}
