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

export const ASSESSMENT_FR: Record<string, { name: string; short: string }> = {
  "Critical Thinking Test": { name: "Test de pensée critique", short: "Pensée critique" },
  "Adversity Quotient (AQ) Test": { name: "Test de quotient d'adversité (AQ)", short: "Quotient d'adversité" },
  "Emotional Intelligence Test": { name: "Test d'intelligence émotionnelle", short: "Intelligence émotionnelle" },
  "Fluid Intelligence Test": { name: "Test d'intelligence fluide", short: "Intelligence fluide" },
  "Social Intelligence Test": { name: "Test d'intelligence sociale", short: "Intelligence sociale" },
  "Leadership Styles Test": { name: "Test des styles de leadership", short: "Styles de leadership" },
  "Numerical Intelligence Test": { name: "Test d'intelligence numérique", short: "Intelligence numérique" },
  "Personality Type Test": { name: "Test de type de personnalité", short: "Type de personnalité" },
  "Situational Judgment Test": { name: "Test de jugement situationnel", short: "Jugement situationnel" },
  "Attention to Detail Test": { name: "Test d'attention aux détails", short: "Attention aux détails" },
  "Verbal Reasoning Test": { name: "Test de raisonnement verbal", short: "Raisonnement verbal" },
  "Abstract Reasoning Test": { name: "Test de raisonnement abstrait", short: "Raisonnement abstrait" },
  "Mechanical Reasoning Test": { name: "Test de raisonnement mécanique", short: "Raisonnement mécanique" },
  "Communication Skills Test": { name: "Test de compétences en communication", short: "Communication" },
  "Problem Solving Test": { name: "Test de résolution de problèmes", short: "Résolution de problèmes" },
  "Work Style Assessment": { name: "Évaluation du style de travail", short: "Style de travail" },
  "Sales Aptitude Test": { name: "Test d'aptitude commerciale", short: "Aptitude commerciale" },
  "Customer Service Skills Test": { name: "Test de compétences en service client", short: "Service client" },
  "Teamwork & Collaboration Test": { name: "Test de travail d'équipe et de collaboration", short: "Travail d'équipe" },
  "Time Management Test": { name: "Test de gestion du temps", short: "Gestion du temps" },
  "Stress Tolerance Test": { name: "Test de tolérance au stress", short: "Tolérance au stress" },
  "Integrity & Ethics Test": { name: "Test d'intégrité et d'éthique", short: "Intégrité et éthique" },
  "Decision Making Test": { name: "Test de prise de décision", short: "Prise de décision" },
  "Learning Agility Test": { name: "Test d'agilité d'apprentissage", short: "Agilité d'apprentissage" },
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

export const CATEGORY_FR: Record<string, string> = {
  Cognitive: "Cognitive",
  Resilience: "Résilience",
  Personality: "Personnalité",
  Leadership: "Leadership",
  Behavioural: "Comportementale",
  Character: "Caractère",
  Communication: "Communication",
  "Customer Service": "Service client",
  "Emotional Intelligence": "Intelligence émotionnelle",
  Judgment: "Jugement",
  "Numerical Reasoning": "Raisonnement numérique",
  Productivity: "Productivité",
  Sales: "Vente",
  Teamwork: "Travail d'équipe",
  Technical: "Technique",
  "Workplace Judgment": "Jugement en milieu professionnel",
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

export const DIMENSION_FR: Record<string, string> = {
  control: "Contrôle",
  ownership: "Responsabilité",
  reach: "Portée",
  endurance: "Endurance",
  "Self-awareness": "Conscience de soi",
  "Self-regulation": "Autorégulation",
  Motivation: "Motivation",
  Empathy: "Empathie",
  "Social Skills": "Compétences sociales",
  Openness: "Ouverture",
  Conscientiousness: "Conscienciosité",
  Extraversion: "Extraversion",
  Agreeableness: "Agréabilité",
  "Emotional Stability": "Stabilité émotionnelle",
  Accountability: "Responsabilité",
  Adaptability: "Adaptabilité",
  Collaboration: "Collaboration",
  Communication: "Communication",
  "Decision Quality": "Qualité de décision",
  Visionary: "Visionnaire",
  Coaching: "Coaching",
  Affiliative: "Affiliatif",
  Democratic: "Démocratique",
  Pacesetting: "Exigeant",
  Commanding: "Directif",
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

export const ASSESSMENT_DESC_FR: Record<string, string> = {
  "Critical Thinking Test": "Mesure la capacité de raisonnement analytique et de pensée critique.",
  "Numerical Intelligence Test": "Mesure la capacité de raisonnement quantitatif.",
  "Personality Type Test": "Dresse un profil complet du type de personnalité.",
  "Situational Judgment Test": "Mesure le jugement pratique dans des situations professionnelles réalistes.",
  "Emotional Intelligence Test": "Mesure l'intelligence émotionnelle selon les 5 dimensions de Goleman.",
  "Leadership Styles Test": "Identifie le style de leadership dominant.",
  "Adversity Quotient (AQ) Test": "Mesure la capacité à faire face à l'adversité et aux défis.",
  "Attention to Detail Test": "Évalue la précision grâce à 40 questions de détection d'erreurs d'orthographe, de données, de calculs, de format et de cohérence des références.",
  "Verbal Reasoning Test": "Évalue la compréhension, les relations entre les mots et la déduction logique à travers 30 questions comprenant des analogies, des intrus et des syllogismes.",
  "Abstract Reasoning Test": "Évalue la reconnaissance des schémas et le raisonnement non verbal à travers 25 questions de séquences et de matrices.",
  "Mechanical Reasoning Test": "Évalue la compréhension des principes mécaniques — engrenages, leviers, poulies, forces, circuits et dynamique des fluides — à travers 30 questions.",
  "Communication Skills Test": "Dresse le profil de l'efficacité de communication selon 4 dimensions : communication écrite, verbale, écoute active et communication non verbale. 35 affirmations sur une échelle de Likert.",
  "Problem Solving Test": "Évalue la résolution de problèmes et la qualité de décision dans 30 situations professionnelles réalistes.",
  "Work Style Assessment": "Dresse le profil des préférences de travail selon 5 dimensions : analytique, orienté détail, collaboratif, adaptable et orienté résultats. 40 affirmations sur une échelle de Likert.",
  "Sales Aptitude Test": "Évalue l'aptitude à la vente B2B selon 4 dimensions : prospection, persuasion, traitement des objections et conclusion. 35 questions fondées sur des situations.",
  "Customer Service Skills Test": "Évalue l'efficacité en service client selon 4 dimensions : empathie, résolution de problèmes, communication et patience. 35 questions fondées sur des situations.",
  "Teamwork & Collaboration Test": "Dresse le profil du style de travail collaboratif selon 4 dimensions : coopération, communication, fiabilité et gestion des conflits. 35 affirmations sur une échelle de Likert.",
  "Time Management Test": "Évalue la gestion du temps et des priorités selon 4 dimensions : priorisation, planification, concentration et gestion des échéances. 30 questions fondées sur des situations.",
  "Stress Tolerance Test": "Mesure la résilience et la maîtrise de soi sous pression selon 4 dimensions : contrôle émotionnel, résilience, stratégies d'adaptation et performance sous pression. 30 affirmations sur une échelle de Likert.",
  "Integrity & Ethics Test": "Évalue l'intégrité professionnelle selon 4 dimensions : honnêteté, responsabilité, éthique et fiabilité. 30 questions fondées sur des situations.",
  "Decision Making Test": "Évalue la qualité de décision selon 4 dimensions : analyse, jugement, évaluation des risques et rapidité. 30 questions fondées sur des situations.",
  "Learning Agility Test": "Mesure l'adaptabilité et l'état d'esprit de progression selon 4 dimensions : flexibilité mentale, vitesse d'apprentissage, ouverture au retour d'information et expérimentation. 30 questions fondées sur des situations.",
};

type Loc = string;

export function assessmentName(name: string, locale: Loc): string {
  if (locale === "fr") return ASSESSMENT_FR[name]?.name ?? name;
  return locale === "es" ? ASSESSMENT_ES[name]?.name ?? name : name;
}

export function assessmentShort(name: string, fallbackShort: string, locale: Loc): string {
  if (locale === "fr") return ASSESSMENT_FR[name]?.short ?? fallbackShort;
  return locale === "es" ? ASSESSMENT_ES[name]?.short ?? fallbackShort : fallbackShort;
}

export function categoryLabel(category: string, locale: Loc): string {
  if (locale === "fr") return CATEGORY_FR[category] ?? category;
  return locale === "es" ? CATEGORY_ES[category] ?? category : category;
}

export function dimensionLabel(label: string, locale: Loc): string {
  if (locale === "fr") return DIMENSION_FR[label] ?? label;
  return locale === "es" ? DIMENSION_ES[label] ?? label : label;
}

export function assessmentDescription(name: string, fallback: string, locale: Loc): string {
  if (locale === "fr") return ASSESSMENT_DESC_FR[name] ?? fallback;
  return locale === "es" ? ASSESSMENT_DESC_ES[name] ?? fallback : fallback;
}
