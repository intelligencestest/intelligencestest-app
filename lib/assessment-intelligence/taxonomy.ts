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
