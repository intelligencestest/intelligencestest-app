"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Check, Clock, ListChecks, Loader2, Plus, X } from "lucide-react";

interface Assessment {
  id: string;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number | null;
  question_count: number | null;
  status: string;
}

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

interface Project {
  id: string;
  name: string;
}

export default function AssessmentsClient({ assessments, projects }: { assessments: Assessment[]; projects: Project[] }) {
  const t = useTranslations("assessments");
  const locale = useLocale();
  const es = locale === "es";

  const [preview, setPreview] = useState<Assessment | null>(null);
  const [projectPickerFor, setProjectPickerFor] = useState<string | null>(null);
  const [addingToProject, setAddingToProject] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!preview) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPreview(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [preview]);

  useEffect(() => {
    if (!projectPickerFor) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setProjectPickerFor(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [projectPickerFor]);

  const addToProject = async (projectId: string) => {
    if (!projectPickerFor) return;
    setAddingToProject(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: projectPickerFor }),
      });
      if (res.ok) {
        setJustAdded(projectId);
        setTimeout(() => {
          setJustAdded(null);
          setProjectPickerFor(null);
        }, 1200);
      }
    } catch {}
    setAddingToProject(null);
  };

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
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.01em] text-white">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--it-muted)]">
            {t("subtitle", { count: activeCount, categories: grouped.length })}
          </p>
        </div>
        <div className="flex items-center gap-6 border-t border-[var(--it-hairline)] pt-4 sm:border-t-0 sm:pt-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold text-white">{activeCount}</span>
            <span className="text-xs text-[var(--it-faint)]">{t("availableNow")}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold text-white">{totalMinutes} min</span>
            <span className="text-xs text-[var(--it-faint)]">{t("totalBattery")}</span>
          </div>
        </div>
      </div>

      {grouped.map((group) => {
        const activeInCategory = group.items.filter(isActive).length;
        return (
          <section key={group.category} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--it-hairline)] pt-4">
              <h2 className="text-lg font-semibold text-white">{localCategory(group.category)}</h2>
              <span className="text-xs font-medium text-[var(--it-faint)]">
                {t("activeOf", { active: activeInCategory, total: group.items.length })}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((assessment) => {
                const active = isActive(assessment);
                return (
                  <div
                    key={assessment.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPreview(assessment)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setPreview(assessment);
                    }}
                    className={`group flex cursor-pointer flex-col rounded-xl border p-5 transition-colors ${
                      active
                        ? "enterprise-card enterprise-card-hover"
                        : "border-[var(--it-hairline)] bg-white/[0.015] hover:border-[var(--it-border)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`text-[15px] font-semibold leading-snug ${active ? "text-white" : "text-slate-300"}`}>{localName(assessment)}</h3>
                      <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${active ? "text-[var(--it-muted)]" : "text-[var(--it-faint)]"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[var(--it-success)]" : "bg-[var(--it-faint)]"}`} aria-hidden="true" />
                        {active ? t("active") : t("comingSoon")}
                      </span>
                    </div>

                    <p className={`mt-2 flex-1 text-[13px] leading-relaxed ${active ? "text-[var(--it-muted)]" : "text-[var(--it-faint)]"}`}>
                      {localDesc(assessment, t("fallbackDescription"))}
                    </p>

                    <p className="mt-4 text-[13px] tabular-nums text-[var(--it-faint)]">
                      {assessment.duration_minutes ?? "-"} min
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      {assessment.question_count ?? "-"} {t("questions")}
                    </p>

                    <div className="mt-4 border-t border-[var(--it-hairline)] pt-4">
                      {active ? (
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); setProjectPickerFor(assessment.id); }}
                          className="enterprise-button inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                          {t("addToProject")}
                        </button>
                      ) : (
                        <span className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--it-hairline)] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-[var(--it-muted)]">
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
            className="enterprise-card w-full max-w-2xl rounded-2xl p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--it-faint)]">{localCategory(preview.category)}</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{localName(preview)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--it-muted)]">{localDesc(preview, t("fallbackDescription"))}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="cursor-pointer rounded-lg p-2 text-[var(--it-muted)] transition-colors hover:bg-white/[0.05] hover:text-white"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-6 border-t border-[var(--it-hairline)] pt-4">
              <div className="flex items-baseline gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--it-faint)]" strokeWidth={1.8} aria-hidden="true" />
                <span className="text-base font-semibold text-white">{preview.duration_minutes ?? "-"} min</span>
                <span className="text-xs text-[var(--it-faint)]">{t("duration")}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <ListChecks className="h-3.5 w-3.5 text-[var(--it-faint)]" strokeWidth={1.8} aria-hidden="true" />
                <span className="text-base font-semibold text-white">{preview.question_count ?? "-"}</span>
                <span className="text-xs text-[var(--it-faint)]">{t("questions")}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--it-hairline)] bg-white/[0.02] p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--it-faint)]">{t("sampleQuestion")}</p>
              <p className="text-sm font-medium leading-relaxed text-white">{sample.text}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {sample.options.map((option, index) => (
                  <div key={option} className="rounded-lg border border-[var(--it-hairline)] px-3 py-2 text-sm text-[var(--it-muted)]">
                    <span className="mr-2 font-semibold text-[var(--it-faint)]">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="enterprise-button-secondary cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium"
              >
                {t("close")}
              </button>
              {isActive(preview) ? (
                <button
                  type="button"
                  onClick={() => { setPreview(null); setProjectPickerFor(preview.id); }}
                  className="enterprise-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  {t("addToProject")}
                </button>
              ) : (
                <span className="inline-flex items-center justify-center rounded-xl border border-[var(--it-hairline)] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-[var(--it-muted)]">
                  {t("comingSoon")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project picker modal */}
      {projectPickerFor && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setProjectPickerFor(null)}
        >
          <div
            className="enterprise-card w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">{t("addToProjectTitle")}</h2>
              <button
                type="button"
                onClick={() => setProjectPickerFor(null)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[var(--it-muted)] transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="py-2">
                <p className="mb-4 text-sm text-[var(--it-muted)]">{t("noActiveProjects")}</p>
                <Link
                  href={`/projects/new?assessment=${projectPickerFor}`}
                  className="enterprise-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  {t("createNewProject")}
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    disabled={addingToProject === project.id || justAdded === project.id}
                    onClick={() => addToProject(project.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--it-hairline)] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed"
                  >
                    <span className="truncate text-sm text-slate-300">{project.name}</span>
                    {justAdded === project.id ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#91c7ad]">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                        {t("added")}
                      </span>
                    ) : addingToProject === project.id ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--it-muted)]" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <span className="shrink-0 text-xs font-medium text-[#9fb3e5]">{t("add")}</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-[var(--it-hairline)] pt-2">
                  <Link
                    href={`/projects/new?assessment=${projectPickerFor}`}
                    className="block px-1 py-1 text-xs text-[var(--it-muted)] transition-colors hover:text-slate-300"
                  >
                    + {t("createNewProject")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
