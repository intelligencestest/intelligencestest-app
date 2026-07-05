import type { CompetencyDefinition, CompetencyId, IntelligenceLocale } from "./types";

export const COMPETENCY_TAXONOMY: Record<CompetencyId, CompetencyDefinition> = {
  "analytical-reasoning": {
    id: "analytical-reasoning",
    label: { en: "Analytical reasoning", es: "Razonamiento analitico" },
    category: { en: "Cognitive", es: "Cognitivo" },
    businessQuestion: {
      en: "Can this candidate reason through information and reach defensible conclusions?",
      es: "Puede esta persona razonar con informacion y llegar a conclusiones defendibles?",
    },
  },
  "decision-quality": {
    id: "decision-quality",
    label: { en: "Decision quality", es: "Calidad de decision" },
    category: { en: "Judgment", es: "Juicio" },
    businessQuestion: {
      en: "Can this candidate make structured decisions when evidence is incomplete?",
      es: "Puede esta persona tomar decisiones estructuradas cuando la evidencia es incompleta?",
    },
  },
  "evidence-analysis": {
    id: "evidence-analysis",
    label: { en: "Evidence analysis", es: "Analisis de evidencia" },
    category: { en: "Judgment", es: "Juicio" },
    businessQuestion: {
      en: "Can this candidate identify relevant information, assumptions, and decision criteria?",
      es: "Puede esta persona identificar informacion relevante, supuestos y criterios de decision?",
    },
  },
  "judgment-under-ambiguity": {
    id: "judgment-under-ambiguity",
    label: { en: "Judgment under ambiguity", es: "Juicio ante ambiguedad" },
    category: { en: "Judgment", es: "Juicio" },
    businessQuestion: {
      en: "Can this candidate make sound calls when evidence points in multiple directions?",
      es: "Puede esta persona tomar decisiones solidas cuando la evidencia apunta en varias direcciones?",
    },
  },
  "risk-evaluation": {
    id: "risk-evaluation",
    label: { en: "Risk evaluation", es: "Evaluacion de riesgos" },
    category: { en: "Judgment", es: "Juicio" },
    businessQuestion: {
      en: "Can this candidate evaluate downside, probability, impact, and mitigation?",
      es: "Puede esta persona evaluar impacto, probabilidad, consecuencias y mitigacion?",
    },
  },
  "decision-speed-calibration": {
    id: "decision-speed-calibration",
    label: { en: "Decision speed calibration", es: "Calibracion de velocidad decisoria" },
    category: { en: "Judgment", es: "Juicio" },
    businessQuestion: {
      en: "Can this candidate match decision speed to urgency, stakes, and reversibility?",
      es: "Puede esta persona ajustar la velocidad de decision a urgencia, riesgo y reversibilidad?",
    },
  },
  "structured-problem-solving": {
    id: "structured-problem-solving",
    label: { en: "Structured problem solving", es: "Resolucion estructurada de problemas" },
    category: { en: "Cognitive", es: "Cognitivo" },
    businessQuestion: {
      en: "Can this candidate break problems down, diagnose causes, and choose workable actions?",
      es: "Puede esta persona descomponer problemas, diagnosticar causas y elegir acciones viables?",
    },
  },
  "professional-communication": {
    id: "professional-communication",
    label: { en: "Professional communication", es: "Comunicacion profesional" },
    category: { en: "Communication", es: "Comunicacion" },
    businessQuestion: {
      en: "Can this candidate communicate clearly, adapt tone, and reduce misunderstanding at work?",
      es: "Puede esta persona comunicarse con claridad, adaptar el tono y reducir malentendidos en el trabajo?",
    },
  },
  "written-clarity": {
    id: "written-clarity",
    label: { en: "Written clarity", es: "Claridad escrita" },
    category: { en: "Communication", es: "Comunicacion" },
    businessQuestion: {
      en: "Can this candidate structure written updates so others can act on them confidently?",
      es: "Puede esta persona estructurar comunicaciones escritas para que otros actuen con confianza?",
    },
  },
  "active-listening": {
    id: "active-listening",
    label: { en: "Active listening", es: "Escucha activa" },
    category: { en: "Communication", es: "Comunicacion" },
    businessQuestion: {
      en: "Can this candidate listen accurately before responding or deciding?",
      es: "Puede esta persona escuchar con precision antes de responder o decidir?",
    },
  },
  "interpersonal-awareness": {
    id: "interpersonal-awareness",
    label: { en: "Interpersonal awareness", es: "Conciencia interpersonal" },
    category: { en: "Communication", es: "Comunicacion" },
    businessQuestion: {
      en: "Can this candidate read social cues and adjust behavior appropriately?",
      es: "Puede esta persona leer senales sociales y ajustar su conducta con criterio?",
    },
  },
  "integrity-judgment": {
    id: "integrity-judgment",
    label: { en: "Integrity judgment", es: "Criterio de integridad" },
    category: { en: "Integrity", es: "Integridad" },
    businessQuestion: {
      en: "Can this candidate choose transparent conduct when honesty has a cost?",
      es: "Puede esta persona elegir una conducta transparente cuando la honestidad tiene costo?",
    },
  },
  "ethical-compliance": {
    id: "ethical-compliance",
    label: { en: "Ethical compliance", es: "Cumplimiento etico" },
    category: { en: "Integrity", es: "Integridad" },
    businessQuestion: {
      en: "Can this candidate uphold policy, fairness, and compliance under pressure?",
      es: "Puede esta persona sostener politicas, equidad y cumplimiento bajo presion?",
    },
  },
  "trust-reliability": {
    id: "trust-reliability",
    label: { en: "Trust reliability", es: "Confiabilidad" },
    category: { en: "Integrity", es: "Integridad" },
    businessQuestion: {
      en: "Can this candidate protect trust through reliability, confidentiality, and timely disclosure?",
      es: "Puede esta persona proteger la confianza mediante fiabilidad, confidencialidad y comunicacion oportuna?",
    },
  },
  adaptability: {
    id: "adaptability",
    label: { en: "Adaptability", es: "Adaptabilidad" },
    category: { en: "Judgment", es: "Juicio" },
    businessQuestion: {
      en: "Can this candidate adjust constructively when conditions, tools, or priorities change?",
      es: "Puede esta persona ajustarse de forma constructiva cuando cambian condiciones, herramientas o prioridades?",
    },
  },
  "emotional-self-awareness": {
    id: "emotional-self-awareness",
    label: { en: "Emotional self-awareness", es: "Autoconciencia emocional" },
    category: { en: "Emotional intelligence", es: "Inteligencia emocional" },
    businessQuestion: {
      en: "Can this candidate recognize emotions and their impact before they distort behavior?",
      es: "Puede esta persona reconocer emociones y su impacto antes de que distorsionen su conducta?",
    },
  },
  "emotional-self-regulation": {
    id: "emotional-self-regulation",
    label: { en: "Emotional self-regulation", es: "Autorregulacion emocional" },
    category: { en: "Emotional intelligence", es: "Inteligencia emocional" },
    businessQuestion: {
      en: "Can this candidate manage reactions under pressure without escalating situations?",
      es: "Puede esta persona gestionar sus reacciones bajo presion sin escalar situaciones?",
    },
  },
  "achievement-motivation": {
    id: "achievement-motivation",
    label: { en: "Achievement motivation", es: "Motivacion de logro" },
    category: { en: "Emotional intelligence", es: "Inteligencia emocional" },
    businessQuestion: {
      en: "Can this candidate sustain initiative and constructive energy through slow progress?",
      es: "Puede esta persona sostener iniciativa y energia constructiva ante avances lentos?",
    },
  },
  "relationship-management": {
    id: "relationship-management",
    label: { en: "Relationship management", es: "Gestion de relaciones" },
    category: { en: "Emotional intelligence", es: "Inteligencia emocional" },
    businessQuestion: {
      en: "Can this candidate build, repair, and influence working relationships constructively?",
      es: "Puede esta persona construir, reparar e influir relaciones laborales de forma constructiva?",
    },
  },
  "team-cooperation": {
    id: "team-cooperation",
    label: { en: "Team cooperation", es: "Cooperacion en equipo" },
    category: { en: "Teamwork", es: "Trabajo en equipo" },
    businessQuestion: {
      en: "Can this candidate prioritize shared outcomes and support colleagues effectively?",
      es: "Puede esta persona priorizar resultados compartidos y apoyar eficazmente a sus colegas?",
    },
  },
  "team-reliability": {
    id: "team-reliability",
    label: { en: "Team reliability", es: "Fiabilidad en equipo" },
    category: { en: "Teamwork", es: "Trabajo en equipo" },
    businessQuestion: {
      en: "Can this candidate follow through dependably when others rely on their work?",
      es: "Puede esta persona cumplir con fiabilidad cuando otros dependen de su trabajo?",
    },
  },
  "conflict-resolution": {
    id: "conflict-resolution",
    label: { en: "Conflict resolution", es: "Resolucion de conflictos" },
    category: { en: "Teamwork", es: "Trabajo en equipo" },
    businessQuestion: {
      en: "Can this candidate address disagreement directly while preserving working relationships?",
      es: "Puede esta persona abordar desacuerdos directamente preservando relaciones de trabajo?",
    },
  },
  "customer-empathy": {
    id: "customer-empathy",
    label: { en: "Customer empathy", es: "Empatia con clientes" },
    category: { en: "Service", es: "Servicio" },
    businessQuestion: {
      en: "Can this candidate acknowledge customer emotion while moving toward resolution?",
      es: "Puede esta persona reconocer la emocion del cliente y avanzar hacia una solucion?",
    },
  },
  "customer-issue-resolution": {
    id: "customer-issue-resolution",
    label: { en: "Customer issue resolution", es: "Resolucion de incidencias" },
    category: { en: "Service", es: "Servicio" },
    businessQuestion: {
      en: "Can this candidate diagnose customer issues and coordinate a clear resolution?",
      es: "Puede esta persona diagnosticar incidencias y coordinar una resolucion clara?",
    },
  },
  "customer-communication": {
    id: "customer-communication",
    label: { en: "Customer communication", es: "Comunicacion con clientes" },
    category: { en: "Service", es: "Servicio" },
    businessQuestion: {
      en: "Can this candidate communicate clearly, accurately, and appropriately with customers?",
      es: "Puede esta persona comunicarse con claridad, precision y criterio con clientes?",
    },
  },
  "service-composure": {
    id: "service-composure",
    label: { en: "Service composure", es: "Compostura en servicio" },
    category: { en: "Service", es: "Servicio" },
    businessQuestion: {
      en: "Can this candidate remain patient and professional in difficult interactions?",
      es: "Puede esta persona mantener paciencia y profesionalismo en interacciones dificiles?",
    },
  },
  "prospecting-discipline": {
    id: "prospecting-discipline",
    label: { en: "Prospecting discipline", es: "Disciplina de prospeccion" },
    category: { en: "Sales", es: "Ventas" },
    businessQuestion: {
      en: "Can this candidate identify, qualify, and prioritize the right opportunities?",
      es: "Puede esta persona identificar, calificar y priorizar oportunidades correctas?",
    },
  },
  "consultative-selling": {
    id: "consultative-selling",
    label: { en: "Consultative selling", es: "Venta consultiva" },
    category: { en: "Sales", es: "Ventas" },
    businessQuestion: {
      en: "Can this candidate connect customer needs to business value without generic pitching?",
      es: "Puede esta persona conectar necesidades del cliente con valor de negocio sin discurso generico?",
    },
  },
  "objection-handling": {
    id: "objection-handling",
    label: { en: "Objection handling", es: "Manejo de objeciones" },
    category: { en: "Sales", es: "Ventas" },
    businessQuestion: {
      en: "Can this candidate explore resistance constructively and keep the opportunity moving?",
      es: "Puede esta persona explorar resistencia de forma constructiva y mantener avance comercial?",
    },
  },
  "deal-advancement": {
    id: "deal-advancement",
    label: { en: "Deal advancement", es: "Avance de oportunidades" },
    category: { en: "Sales", es: "Ventas" },
    businessQuestion: {
      en: "Can this candidate create clear next steps and move complex deals forward ethically?",
      es: "Puede esta persona crear pasos claros y avanzar oportunidades complejas de forma etica?",
    },
  },
  "strategic-direction": {
    id: "strategic-direction",
    label: { en: "Strategic direction", es: "Direccion estrategica" },
    category: { en: "Leadership", es: "Liderazgo" },
    businessQuestion: {
      en: "Does this candidate tend to create direction and connect work to a larger purpose?",
      es: "Tiende esta persona a crear direccion y conectar el trabajo con un proposito mayor?",
    },
  },
  "people-development": {
    id: "people-development",
    label: { en: "People development", es: "Desarrollo de personas" },
    category: { en: "Leadership", es: "Liderazgo" },
    businessQuestion: {
      en: "Does this candidate tend to develop people through feedback, coaching, and goals?",
      es: "Tiende esta persona a desarrollar personas mediante feedback, coaching y metas?",
    },
  },
  "team-cohesion": {
    id: "team-cohesion",
    label: { en: "Team cohesion", es: "Cohesion del equipo" },
    category: { en: "Leadership", es: "Liderazgo" },
    businessQuestion: {
      en: "Does this candidate tend to protect trust, morale, and working relationships?",
      es: "Tiende esta persona a proteger confianza, moral y relaciones de trabajo?",
    },
  },
  "participative-leadership": {
    id: "participative-leadership",
    label: { en: "Participative leadership", es: "Liderazgo participativo" },
    category: { en: "Leadership", es: "Liderazgo" },
    businessQuestion: {
      en: "Does this candidate tend to build commitment through input and shared ownership?",
      es: "Tiende esta persona a generar compromiso mediante participacion y responsabilidad compartida?",
    },
  },
  "execution-standards": {
    id: "execution-standards",
    label: { en: "Execution standards", es: "Estandares de ejecucion" },
    category: { en: "Leadership", es: "Liderazgo" },
    businessQuestion: {
      en: "Does this candidate tend to raise standards through pace, quality, and personal example?",
      es: "Tiende esta persona a elevar estandares mediante ritmo, calidad y ejemplo personal?",
    },
  },
  "directive-leadership": {
    id: "directive-leadership",
    label: { en: "Directive leadership", es: "Liderazgo directivo" },
    category: { en: "Leadership", es: "Liderazgo" },
    businessQuestion: {
      en: "Does this candidate tend to provide firm direction in urgent or high-risk contexts?",
      es: "Tiende esta persona a dar direccion firme en contextos urgentes o de alto riesgo?",
    },
  },
  "resilience-under-pressure": {
    id: "resilience-under-pressure",
    label: { en: "Resilience under pressure", es: "Resiliencia bajo presion" },
    category: { en: "Resilience", es: "Resiliencia" },
    businessQuestion: {
      en: "Can this candidate maintain effectiveness through setbacks and pressure?",
      es: "Puede esta persona mantener efectividad ante presion y contratiempos?",
    },
  },
  "adversity-control": {
    id: "adversity-control",
    label: { en: "Control in adversity", es: "Control ante adversidad" },
    category: { en: "Resilience", es: "Resiliencia" },
    businessQuestion: {
      en: "Does the candidate see useful actions within difficult circumstances?",
      es: "La persona identifica acciones utiles dentro de circunstancias dificiles?",
    },
  },
  "personal-accountability": {
    id: "personal-accountability",
    label: { en: "Personal accountability", es: "Responsabilidad personal" },
    category: { en: "Resilience", es: "Resiliencia" },
    businessQuestion: {
      en: "Does the candidate take ownership for improving difficult situations?",
      es: "La persona asume responsabilidad para mejorar situaciones dificiles?",
    },
  },
  "setback-containment": {
    id: "setback-containment",
    label: { en: "Setback containment", es: "Contencion de contratiempos" },
    category: { en: "Resilience", es: "Resiliencia" },
    businessQuestion: {
      en: "Can the candidate prevent one setback from spreading into unrelated work areas?",
      es: "Puede la persona evitar que un contratiempo afecte areas no relacionadas?",
    },
  },
  "recovery-orientation": {
    id: "recovery-orientation",
    label: { en: "Recovery orientation", es: "Orientacion a la recuperacion" },
    category: { en: "Resilience", es: "Resiliencia" },
    businessQuestion: {
      en: "Can the candidate recover in a healthy timeframe after adversity?",
      es: "Puede la persona recuperarse en un plazo saludable despues de la adversidad?",
    },
  },
  "assessment-performance": {
    id: "assessment-performance",
    label: { en: "Assessment performance", es: "Desempeno en evaluacion" },
    category: { en: "Evidence", es: "Evidencia" },
    businessQuestion: {
      en: "What does the completed assessment score support without additional instrument detail?",
      es: "Que respalda la puntuacion completada sin detalle adicional del instrumento?",
    },
  },
};

export function localize<T extends { en: string; es: string }>(text: T, locale: IntelligenceLocale): string {
  return text[locale] ?? text.es;
}

export function competencyLabel(id: CompetencyId, locale: IntelligenceLocale): string {
  return localize(COMPETENCY_TAXONOMY[id].label, locale);
}

export function competencyCategory(id: CompetencyId, locale: IntelligenceLocale): string {
  return localize(COMPETENCY_TAXONOMY[id].category, locale);
}
