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
