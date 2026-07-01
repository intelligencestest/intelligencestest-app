"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

interface Assessment {
  id: string;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number | null;
  question_count: number | null;
  status: string;
}

type Tone = {
  text: string;
  bg: string;
  border: string;
  dot: string;
  iconBg: string;
  iconBorder: string;
};

const categoryTones: Record<string, Tone> = {
  Cognitive: {
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    dot: "bg-blue-400",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/25",
  },
  Personality: {
    text: "text-pink-300",
    bg: "bg-pink-500/10",
    border: "border-pink-500/25",
    dot: "bg-pink-400",
    iconBg: "bg-pink-500/10",
    iconBorder: "border-pink-500/25",
  },
  "Workplace Judgment": {
    text: "text-indigo-300",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/25",
    dot: "bg-indigo-400",
    iconBg: "bg-indigo-500/10",
    iconBorder: "border-indigo-500/25",
  },
  Leadership: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    dot: "bg-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/25",
  },
  Resilience: {
    text: "text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    dot: "bg-orange-400",
    iconBg: "bg-orange-500/10",
    iconBorder: "border-orange-500/25",
  },
  Communication: {
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    dot: "bg-cyan-400",
    iconBg: "bg-cyan-500/10",
    iconBorder: "border-cyan-500/25",
  },
  "Work Style": {
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    dot: "bg-violet-400",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/25",
  },
  Mechanical: {
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    dot: "bg-amber-400",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/25",
  },
  Sales: {
    text: "text-green-300",
    bg: "bg-green-500/10",
    border: "border-green-500/25",
    dot: "bg-green-400",
    iconBg: "bg-green-500/10",
    iconBorder: "border-green-500/25",
  },
  "Customer Service": {
    text: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    dot: "bg-sky-400",
    iconBg: "bg-sky-500/10",
    iconBorder: "border-sky-500/25",
  },
  Teamwork: {
    text: "text-teal-300",
    bg: "bg-teal-500/10",
    border: "border-teal-500/25",
    dot: "bg-teal-400",
    iconBg: "bg-teal-500/10",
    iconBorder: "border-teal-500/25",
  },
  Productivity: {
    text: "text-yellow-300",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    dot: "bg-yellow-400",
    iconBg: "bg-yellow-500/10",
    iconBorder: "border-yellow-500/25",
  },
  Character: {
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    dot: "bg-violet-400",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/25",
  },
};

const fallbackTone: Tone = {
  text: "text-slate-300",
  bg: "bg-slate-500/10",
  border: "border-slate-500/20",
  dot: "bg-slate-500",
  iconBg: "bg-slate-500/10",
  iconBorder: "border-slate-500/20",
};

const CATEGORY_NAMES_ES: Record<string, string> = {
  "Cognitive": "Cognitivo",
  "Personality": "Personalidad",
  "Workplace Judgment": "Juicio Laboral",
  "Leadership": "Liderazgo",
  "Resilience": "Resiliencia",
  "Communication": "Comunicación",
  "Work Style": "Estilo de Trabajo",
  "Mechanical": "Razonamiento Mecánico",
  "Sales": "Ventas",
  "Customer Service": "Atención al Cliente",
  "Teamwork": "Trabajo en Equipo",
  "Productivity": "Productividad",
  "Character": "Carácter",
};

const ASSESSMENT_NAMES_ES: Record<string, string> = {
  "critical-thinking":      "Prueba de Pensamiento Crítico",
  "numerical-intelligence": "Prueba de Inteligencia Numérica",
  "personality-type":       "Prueba de Tipo de Personalidad",
  "situational-judgment":   "Prueba de Juicio Situacional",
  "emotional-intelligence": "Prueba de Inteligencia Emocional",
  "leadership-styles":      "Prueba de Estilos de Liderazgo",
  "aq":                     "Prueba de Cociente de Adversidad (CA)",
  "attention-detail":       "Prueba de Atención al Detalle",
  "verbal-reasoning":       "Prueba de Razonamiento Verbal",
  "abstract-reasoning":     "Prueba de Razonamiento Abstracto",
  "mechanical-reasoning":   "Prueba de Razonamiento Mecánico",
  "communication-skills":   "Prueba de Habilidades de Comunicación",
  "problem-solving":        "Prueba de Resolución de Problemas",
  "work-style":             "Evaluación de Estilo de Trabajo",
  "sales-aptitude":         "Prueba de Aptitud en Ventas",
  "customer-service-skills":"Prueba de Habilidades de Atención al Cliente",
  "teamwork-collaboration": "Prueba de Trabajo en Equipo y Colaboración",
  "time-management":        "Prueba de Gestión del Tiempo",
  "stress-tolerance":       "Prueba de Tolerancia al Estrés",
  "integrity-ethics":       "Prueba de Integridad y Ética",
  "decision-making":        "Prueba de Toma de Decisiones",
  "learning-agility":       "Prueba de Agilidad de Aprendizaje",
};

const ASSESSMENT_DESCS_ES: Record<string, string> = {
  "critical-thinking":
    "Mide la capacidad de razonamiento analítico y pensamiento crítico.",
  "numerical-intelligence":
    "Mide la capacidad de razonamiento cuantitativo.",
  "personality-type":
    "Perfil completo de tipo de personalidad.",
  "situational-judgment":
    "Mide el juicio práctico en escenarios laborales realistas.",
  "emotional-intelligence":
    "Mide la inteligencia emocional en 5 dimensiones de Goleman.",
  "leadership-styles":
    "Identifica el estilo de liderazgo dominante.",
  "aq":
    "Mide la capacidad para enfrentar la adversidad y los desafíos.",
  "attention-detail":
    "Mide la precisión y exactitud mediante 40 preguntas de detección de errores en ortografía, datos, cálculos, formato y consistencia referencial.",
  "verbal-reasoning":
    "Evalúa la comprensión, las relaciones entre palabras y la deducción lógica en 30 preguntas que incluyen analogías, el elemento que no corresponde y silogismos.",
  "abstract-reasoning":
    "Evalúa el reconocimiento de patrones y el razonamiento no verbal mediante 25 preguntas de secuencias y matrices.",
  "mechanical-reasoning":
    "Evalúa la comprensión de principios mecánicos — engranajes, palancas, poleas, fuerzas, circuitos y dinámica de fluidos — en 30 preguntas.",
  "communication-skills":
    "Perfila la efectividad comunicativa en 4 dimensiones: comunicación escrita, verbal, escucha activa y comunicación no verbal. 35 afirmaciones de escala Likert.",
  "problem-solving":
    "Evalúa la resolución de problemas y la calidad de decisiones en 30 escenarios laborales realistas.",
  "work-style":
    "Perfila las preferencias de trabajo en 5 dimensiones: analítico, orientado al detalle, colaborativo, adaptable y orientado a resultados. 40 afirmaciones de escala Likert.",
  "sales-aptitude":
    "Evalúa la aptitud en ventas B2B en 4 dimensiones: prospección, persuasión, manejo de objeciones y cierre. 35 preguntas basadas en escenarios.",
  "customer-service-skills":
    "Evalúa la efectividad en atención al cliente en 4 dimensiones: empatía, resolución de problemas, comunicación y paciencia. 35 preguntas basadas en escenarios.",
  "teamwork-collaboration":
    "Perfila el estilo de trabajo colaborativo en 4 dimensiones: cooperación, comunicación, confiabilidad y resolución de conflictos. 35 afirmaciones de escala Likert.",
  "time-management":
    "Evalúa la gestión del tiempo y las prioridades en 4 dimensiones: priorización, planificación, enfoque y gestión de plazos. 30 preguntas basadas en escenarios.",
  "stress-tolerance":
    "Mide la resiliencia y la compostura bajo presión en 4 dimensiones: control emocional, resiliencia, estrategias de afrontamiento y rendimiento bajo presión. 30 afirmaciones de escala Likert.",
  "integrity-ethics":
    "Evalúa la integridad profesional en 4 dimensiones: honestidad, responsabilidad, ética y confiabilidad. 30 preguntas basadas en escenarios.",
  "decision-making":
    "Evalúa la calidad de las decisiones en 4 dimensiones: análisis, juicio, evaluación de riesgos y velocidad. 30 preguntas basadas en escenarios.",
  "learning-agility":
    "Mide la adaptabilidad y la mentalidad de crecimiento en 4 dimensiones: flexibilidad mental, velocidad de aprendizaje, receptividad al feedback y experimentación. 30 preguntas basadas en escenarios.",
};

const preferredOrder = [
  "Critical Thinking Test",
  "Numerical Intelligence Test",
  "Personality Type Test",
  "Situational Judgment Test",
  "Emotional Intelligence Test",
  "Leadership Styles Test",
  "Adversity Quotient (AQ) Test",
  "Attention to Detail Test",
  "Verbal Reasoning Test",
  "Abstract Reasoning Test",
  "Mechanical Reasoning Test",
  "Communication Skills Test",
  "Problem Solving Test",
  "Work Style Test",
  "Sales Aptitude Test",
  "Customer Service Skills Test",
  "Teamwork & Collaboration Test",
  "Time Management Test",
  "Stress Tolerance Test",
  "Integrity & Ethics Test",
  "Decision Making Test",
  "Learning Agility Test",
];

type SampleEntry = {
  match: (name: string) => boolean;
  text: string;
  textEs: string;
  options: string[];
  optionsEs: string[];
};

const sampleQuestions: SampleEntry[] = [
  {
    match: (name) => name.includes("critical"),
    text: "All analysts review briefs before submitting reports. Maya submitted a report. What can be concluded?",
    textEs: "Todos los analistas revisan los informes antes de enviarlos. Maya envió un informe. ¿Qué se puede concluir?",
    options: ["Maya reviewed a brief", "Maya may have reviewed a brief", "All submitted reports are accurate", "No conclusion is possible"],
    optionsEs: ["Maya revisó un informe", "Maya puede haber revisado un informe", "Todos los informes enviados son precisos", "No se puede llegar a ninguna conclusión"],
  },
  {
    match: (name) => name.includes("numerical"),
    text: "Sales increased from 80 to 100 units. What was the percentage increase?",
    textEs: "Las ventas aumentaron de 80 a 100 unidades. ¿Cuál fue el aumento porcentual?",
    options: ["20%", "25%", "30%", "40%"],
    optionsEs: ["20%", "25%", "30%", "40%"],
  },
  {
    match: (name) => name.includes("personality"),
    text: "I plan my work carefully before moving into execution.",
    textEs: "Planifico mi trabajo cuidadosamente antes de pasar a la ejecución.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    optionsEs: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"],
  },
  {
    match: (name) => name.includes("situational"),
    text: "A stakeholder asks for an unrealistic deadline. What is the strongest response?",
    textEs: "Un interesado solicita un plazo poco realista. ¿Cuál es la respuesta más sólida?",
    options: ["Say yes and hope scope changes", "Explain tradeoffs and offer a realistic path", "Reject the request", "Ask someone else to respond"],
    optionsEs: ["Decir que sí y esperar que el alcance cambie", "Explicar las compensaciones y ofrecer un camino realista", "Rechazar la solicitud", "Pedir a otro que responda"],
  },
  {
    match: (name) => name.includes("emotional"),
    text: "I notice how my mood affects the way I communicate with others.",
    textEs: "Noto cómo mi estado de ánimo afecta la forma en que me comunico con los demás.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    optionsEs: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"],
  },
  {
    match: (name) => name.includes("leadership"),
    text: "A team is uncertain about direction. What do you do first?",
    textEs: "Un equipo no tiene clara la dirección. ¿Qué hace primero?",
    options: ["Set a clear future direction", "Coach individuals", "Repair morale", "Invite shared input"],
    optionsEs: ["Establecer una dirección futura clara", "Orientar a las personas", "Reconstruir la moral", "Invitar al equipo a participar"],
  },
  {
    match: (name) => name.includes("adversity") || name.includes("aq"),
    text: "When facing a difficult situation, I believe I can influence the outcome.",
    textEs: "Cuando me enfrento a una situación difícil, creo que puedo influir en el resultado.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    optionsEs: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"],
  },
  {
    match: (name) => name.includes("attention"),
    text: "Which entry does not match the formatting rule used by the rest of the list?",
    textEs: "¿Qué entrada no sigue la regla de formato usada por el resto de la lista?",
    options: ["AX-1042", "AX-1402", "AX-1047", "XA-1042"],
    optionsEs: ["AX-1042", "AX-1402", "AX-1047", "XA-1042"],
  },
  {
    match: (name) => name.includes("verbal"),
    text: "If all approved invoices are reviewed, and this invoice was not reviewed, what follows?",
    textEs: "Si todas las facturas aprobadas son revisadas, y esta factura no fue revisada, ¿qué se concluye?",
    options: ["It was approved", "It was not approved", "It may still be approved", "It was rejected"],
    optionsEs: ["Fue aprobada", "No fue aprobada", "Puede haber sido aprobada de todas formas", "Fue rechazada"],
  },
  {
    match: (name) => name.includes("abstract"),
    text: "Which pattern best completes the sequence?",
    textEs: "¿Qué patrón completa mejor la secuencia?",
    options: ["Same shape, darker fill", "Rotated shape, same fill", "New shape, lighter fill", "Mirrored shape, darker fill"],
    optionsEs: ["Misma forma, relleno más oscuro", "Forma girada, mismo relleno", "Nueva forma, relleno más claro", "Forma en espejo, relleno más oscuro"],
  },
  {
    match: (name) => name.includes("mechanical"),
    text: "If gear A turns clockwise and touches gear B, which direction does gear B turn?",
    textEs: "Si el engranaje A gira en sentido horario y toca al engranaje B, ¿en qué dirección gira el engranaje B?",
    options: ["Clockwise", "Counterclockwise", "It does not move", "Direction cannot be known"],
    optionsEs: ["En sentido horario", "En sentido antihorario", "No se mueve", "No se puede determinar la dirección"],
  },
  {
    match: (name) => name.includes("communication"),
    text: "A client misunderstood your update. What is the best next step?",
    textEs: "Un cliente malinterpretó su actualización. ¿Cuál es el mejor paso siguiente?",
    options: ["Repeat the same message", "Clarify the key point and next action", "Wait for them to calm down", "Send every detail"],
    optionsEs: ["Repetir el mismo mensaje", "Aclarar el punto clave y la próxima acción", "Esperar a que se calmen", "Enviar todos los detalles"],
  },
  {
    match: (name) => name.includes("problem"),
    text: "You have limited data and a deadline today. What is the best response?",
    textEs: "Tiene datos limitados y un plazo hoy. ¿Cuál es la mejor respuesta?",
    options: ["Wait for perfect data", "Use evidence, state assumptions, and flag risk", "Guess quickly", "Ask someone else to decide"],
    optionsEs: ["Esperar datos perfectos", "Usar la evidencia disponible, declarar supuestos y señalar el riesgo", "Adivinar rápidamente", "Pedir a alguien más que decida"],
  },
  {
    match: (name) => name.includes("work style"),
    text: "I prefer clear priorities and structured execution.",
    textEs: "Prefiero prioridades claras y una ejecución estructurada.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    optionsEs: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"],
  },
  {
    match: (name) => name.includes("sales aptitude") || name.includes("sales"),
    text: "A prospect says 'Your price is too high.' What is your best initial response?",
    textEs: "Un prospecto dice 'Su precio es demasiado alto.' ¿Cuál es su mejor respuesta inicial?",
    options: ["Offer a discount immediately", "Ask 'Compared to what?' and explore the value the investment generates", "Explain your cost structure in detail", "Tell them the price is non-negotiable"],
    optionsEs: ["Ofrecer un descuento de inmediato", "Preguntar '¿Comparado con qué?' y explorar el valor que genera la inversión", "Explicar su estructura de costos en detalle", "Decirle que el precio no es negociable"],
  },
  {
    match: (name) => name.includes("customer service"),
    text: "A customer is upset about a delayed order. What is your first action?",
    textEs: "Un cliente está molesto por un pedido retrasado. ¿Cuál es su primera acción?",
    options: ["Explain the reasons for the delay immediately", "Acknowledge their frustration and apologise before asking for details", "Transfer to a manager", "Look up the order number in silence"],
    optionsEs: ["Explicar de inmediato las razones del retraso", "Reconocer su frustración y disculparse antes de pedir detalles", "Transferir a un gerente", "Buscar el número de pedido en silencio"],
  },
  {
    match: (name) => name.includes("teamwork") || name.includes("collaboration"),
    text: "I step in to help a colleague who is struggling, even when it is not my formal responsibility.",
    textEs: "Intervengo para ayudar a un colega que tiene dificultades, incluso cuando no es formalmente mi responsabilidad.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    optionsEs: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"],
  },
  {
    match: (name) => name.includes("time management"),
    text: "You have four tasks due today. Two are urgent and important. What do you tackle first?",
    textEs: "Tiene cuatro tareas vencidas hoy. Dos son urgentes e importantes. ¿Con cuál empieza?",
    options: ["The easiest task to build momentum", "The two that are both urgent and important", "Work through the list in order", "Delegate the hardest task"],
    optionsEs: ["La tarea más fácil para ganar impulso", "Las dos que son urgentes e importantes", "Trabajar la lista en orden", "Delegar la tarea más difícil"],
  },
  {
    match: (name) => name.includes("stress tolerance"),
    text: "I remain calm and make sound decisions even when under significant time pressure.",
    textEs: "Me mantengo tranquilo/a y tomo decisiones acertadas incluso bajo una presión de tiempo significativa.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    optionsEs: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"],
  },
  {
    match: (name) => name.includes("integrity") || name.includes("ethics"),
    text: "You discover an error in a report already shared with leadership. What do you do?",
    textEs: "Descubre un error en un informe ya compartido con la dirección. ¿Qué hace?",
    options: ["Hope no one notices and correct it quietly next time", "Inform the relevant parties immediately and correct the error", "Wait to see if anyone raises it first", "Ask a colleague to flag it anonymously"],
    optionsEs: ["Esperar que nadie lo note y corregirlo silenciosamente la próxima vez", "Informar a las partes relevantes de inmediato y corregir el error", "Esperar a ver si alguien lo señala primero", "Pedir a un colega que lo señale anónimamente"],
  },
  {
    match: (name) => name.includes("decision making") || name.includes("decision-making"),
    text: "You must decide between two proposals with limited time. What is your first step?",
    textEs: "Debe decidir entre dos propuestas con tiempo limitado. ¿Cuál es su primer paso?",
    options: ["Choose the lower-cost option immediately", "Define clear evaluation criteria before comparing", "Go with the more recognisable brand", "Ask your manager to decide"],
    optionsEs: ["Elegir de inmediato la opción de menor costo", "Definir criterios de evaluación claros antes de comparar", "Optar por la marca más reconocida", "Pedir a su gerente que decida"],
  },
  {
    match: (name) => name.includes("learning agility"),
    text: "A colleague suggests a different approach to a task you have always done the same way. What do you do?",
    textEs: "Un colega sugiere un enfoque diferente para una tarea que siempre ha realizado de la misma manera. ¿Qué hace?",
    options: ["Dismiss it — your method is proven", "Evaluate it on its merits and pilot it if promising", "Adopt it only if instructed to by a manager", "Ignore it — experience outweighs novelty"],
    optionsEs: ["Descartarlo — su método está probado", "Evaluarlo por sus méritos y probarlo si es prometedor", "Adoptarlo solo si un gerente se lo indica", "Ignorarlo — la experiencia supera la novedad"],
  },
];

function isActive(assessment: Assessment) {
  return assessment.status === "active";
}

function slugForAssessment(name: string) {
  const normalized = name.toLowerCase();
  const mapped: Array<[RegExp, string]> = [
    [/critical.*thinking/, "critical-thinking"],
    [/numerical/, "numerical-intelligence"],
    [/personality.*type/, "personality-type"],
    [/situational.*judgment/, "situational-judgment"],
    [/emotional/, "emotional-intelligence"],
    [/leadership/, "leadership-styles"],
    [/adversity|aq/, "aq"],
    [/attention.*detail/, "attention-detail"],
    [/verbal.*reasoning/, "verbal-reasoning"],
    [/abstract.*reasoning/, "abstract-reasoning"],
    [/mechanical.*reasoning/, "mechanical-reasoning"],
    [/communication.*skills/, "communication-skills"],
    [/problem.*solving/, "problem-solving"],
    [/work.*style/, "work-style"],
    [/sales.*aptitude/, "sales-aptitude"],
    [/customer.*service/, "customer-service-skills"],
    [/teamwork|collaboration/, "teamwork-collaboration"],
    [/time.*management/, "time-management"],
    [/stress.*tolerance/, "stress-tolerance"],
    [/integrity.*ethics/, "integrity-ethics"],
    [/decision.*making/, "decision-making"],
    [/learning.*agility/, "learning-agility"],
  ];
  return mapped.find(([pattern]) => pattern.test(normalized))?.[1] ?? normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getTone(category: string) {
  return categoryTones[category] ?? fallbackTone;
}

function getSortIndex(name: string) {
  const index = preferredOrder.findIndex((item) => item.toLowerCase() === name.toLowerCase());
  return index === -1 ? preferredOrder.length : index;
}

function groupAssessments(assessments: Assessment[]) {
  const groups = new Map<string, Assessment[]>();
  assessments.forEach((assessment) => {
    const category = assessment.category || "Other";
    groups.set(category, [...(groups.get(category) ?? []), assessment]);
  });

  return [...groups.entries()]
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => {
        if (isActive(a) !== isActive(b)) return isActive(a) ? -1 : 1;
        return getSortIndex(a.name) - getSortIndex(b.name) || a.name.localeCompare(b.name);
      }),
    }))
    .sort((a, b) => {
      const aActive = a.items.filter(isActive).length;
      const bActive = b.items.filter(isActive).length;
      if (aActive !== bActive) return bActive - aActive;
      return a.category.localeCompare(b.category);
    });
}

export default function AssessmentsClient({ assessments }: { assessments: Assessment[] }) {
  const t = useTranslations("assessments");
  const locale = useLocale();
  const es = locale === "es";

  const [preview, setPreview] = useState<Assessment | null>(null);

  useEffect(() => {
    if (!preview) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPreview(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [preview]);

  const grouped = useMemo(() => groupAssessments(assessments), [assessments]);
  const activeCount = assessments.filter(isActive).length;
  const totalMinutes = assessments.filter(isActive).reduce((sum, a) => sum + (a.duration_minutes ?? 0), 0);

  function localName(assessment: Assessment) {
    const slug = slugForAssessment(assessment.name);
    return es ? (ASSESSMENT_NAMES_ES[slug] ?? assessment.name) : assessment.name;
  }

  function localDesc(assessment: Assessment, fallback: string) {
    const slug = slugForAssessment(assessment.name);
    return es ? (ASSESSMENT_DESCS_ES[slug] ?? assessment.description ?? fallback) : (assessment.description ?? fallback);
  }

  function localCategory(category: string) {
    return es ? (CATEGORY_NAMES_ES[category] ?? category) : category;
  }

  function getSample(assessment: Assessment) {
    const normalized = assessment.name.toLowerCase();
    const match = sampleQuestions.find((s) => s.match(normalized));
    if (!match) {
      return { text: t("fallbackSample"), options: ["Option A", "Option B", "Option C", "Option D"] };
    }
    return {
      text: es ? match.textEs : match.text,
      options: es ? match.optionsEs : match.options,
    };
  }

  const sample = preview ? getSample(preview) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
            {t("badge")}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("subtitle", { count: activeCount, categories: grouped.length })}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#1E2240] bg-[#0D1020] px-4 py-3">
            <p className="text-xs text-slate-500">{t("availableNow")}</p>
            <p className="mt-1 text-sm font-semibold text-white">{activeCount} {t("testsLabel")}</p>
          </div>
          <div className="rounded-xl border border-[#1E2240] bg-[#0D1020] px-4 py-3">
            <p className="text-xs text-slate-500">{t("totalBattery")}</p>
            <p className="mt-1 text-sm font-semibold text-white">{totalMinutes} min</p>
          </div>
        </div>
      </div>

      {grouped.map((group) => {
        const tone = getTone(group.category);
        const activeInCategory = group.items.filter(isActive).length;
        return (
          <section key={group.category} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={`${tone.bg} ${tone.border} inline-flex items-center gap-2 rounded-full border px-3 py-1.5`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                <h2 className={`text-sm font-semibold ${tone.text}`}>{localCategory(group.category)}</h2>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {t("activeOf", { active: activeInCategory, total: group.items.length })}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((assessment, index) => {
                const active = isActive(assessment);
                const route = slugForAssessment(assessment.name);
                return (
                  <div
                    key={assessment.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPreview(assessment)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setPreview(assessment);
                    }}
                    className={`group flex min-h-[320px] cursor-pointer flex-col rounded-xl border p-5 transition-colors animate-fade-up ${
                      active
                        ? "premium-card premium-card-hover"
                        : "border-[#1E2240] bg-[#0D1020]/68 hover:border-slate-600/40"
                    }`}
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className={`${active ? tone.bg : "bg-slate-500/10"} ${active ? tone.border : "border-slate-500/20"} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${active ? tone.dot : "bg-slate-500"}`} />
                        <span className={`text-xs font-medium ${active ? tone.text : "text-slate-400"}`}>{localCategory(assessment.category)}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        active
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-500"}`} />
                        {active ? t("active") : t("comingSoon")}
                      </span>
                    </div>

                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${active ? `${tone.iconBorder} ${tone.iconBg} ${tone.text}` : "border-[#1E2240] bg-[#07080F] text-slate-500"}`}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4.5h6m-8.25 3h10.5m-12 3h13.5M7.5 21h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 16.5 7.5h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 7.5 21Z" />
                      </svg>
                    </div>

                    <h3 className={`mb-2 text-base font-semibold ${active ? "text-white" : "text-slate-300"}`}>{localName(assessment)}</h3>
                    <p className={`flex-1 text-sm leading-relaxed ${active ? "text-slate-500" : "text-slate-600"}`}>
                      {localDesc(assessment, t("fallbackDescription"))}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                        <p className="text-xs text-slate-600">{t("duration")}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{assessment.duration_minutes ?? "-"} min</p>
                      </div>
                      <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                        <p className="text-xs text-slate-600">{t("questions")}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{assessment.question_count ?? "-"}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#1E2240] pt-4">
                      {active ? (
                        <Link
                          href={`/projects/new?assessment=${assessment.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/25 transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/50 focus:ring-offset-2 focus:ring-offset-[#0D1020]"
                        >
                          {t("addToProject")}
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="inline-flex w-full items-center justify-center rounded-xl border border-slate-500/20 bg-slate-500/10 px-4 py-2.5 text-sm font-semibold text-slate-400">
                          {t("comingSoon")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {preview && sample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#1E2240] bg-[#0D1020] p-6 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#07080F] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
                  {localCategory(preview.category)}
                </div>
                <h3 className="text-xl font-semibold text-white">{localName(preview)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{localDesc(preview, t("fallbackDescription"))}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#1E2240] hover:text-white"
                aria-label="Close preview"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-4">
                <p className="text-xs text-slate-500">{t("duration")}</p>
                <p className="mt-1 text-lg font-semibold text-white">{preview.duration_minutes ?? "-"} min</p>
              </div>
              <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-4">
                <p className="text-xs text-slate-500">{t("questions")}</p>
                <p className="mt-1 text-lg font-semibold text-white">{preview.question_count ?? "-"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1E2240] bg-[#07080F] p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{t("sampleQuestion")}</p>
              <p className="text-sm font-medium leading-relaxed text-white">{sample.text}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {sample.options.map((option, index) => (
                  <div key={option} className="rounded-lg border border-[#1E2240] bg-[#0D1020] px-3 py-2 text-sm text-slate-400">
                    <span className="mr-2 font-semibold text-slate-500">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="cursor-pointer rounded-xl border border-[#1E2240] px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {t("close")}
              </button>
              {isActive(preview) ? (
                <Link
                  href={`/projects/new?assessment=${preview.id}`}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  {t("addToProject")}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                  </svg>
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-xl border border-slate-500/20 bg-slate-500/10 px-4 py-2.5 text-sm font-semibold text-slate-400">
                  {t("comingSoon")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
