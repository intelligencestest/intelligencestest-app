import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  Gauge,
  History,
  Inbox,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLogo";

type Locale = "en" | "es";

type DecisionOSHomeProps = {
  locale: Locale;
  homeHref: string;
  loginHref: string;
  demoHref: string;
  sampleHref: string;
};

const copy = {
  en: {
    nav: { product: "Product", workflow: "Workflow", trust: "Trust", login: "Sign in", demo: "Request demo" },
    eyebrow: "Hiring Decision OS",
    heroTitle: "Hiring decisions, backed by evidence.",
    heroBody:
      "Know who to interview, why they stand out, what to ask, and which risks to verify before your team makes the call.",
    demo: "Request demo",
    sample: "View sample report",
    heroNote: "Decision support for recruiters and hiring managers. Human judgment stays in control.",
    command: "Recruiter command center",
    commandNote: "Tuesday, 09:41 · 4 active roles",
    attention: "Needs attention",
    reviewed: "Reviewed today",
    signals: "Evidence signals",
    inboxKicker: "Attention inbox",
    inboxTitle: "Start with what needs a decision.",
    inboxBody:
      "A prioritized operating queue surfaces completed assessments, expiring invitations, strong profiles, risks, and stalled searches before they become delays.",
    briefKicker: "Executive candidate brief",
    briefTitle: "A decision brief, not another score screen.",
    briefBody:
      "Every recommendation is paired with confidence, supporting evidence, visible risks, and the next question your team should answer.",
    interviewKicker: "Interview readiness",
    interviewTitle: "Turn evidence into a sharper interview.",
    interviewBody:
      "Role-specific questions connect directly to the candidate's results, with probes and scoring guidance that keep evaluation structured.",
    calibrationKicker: "Role calibration",
    calibrationTitle: "Define the hiring bar before reviewing people.",
    calibrationBody:
      "Set the role, seniority, must-have competencies, deal-breakers, and priorities. IntelligencesTest recommends the assessment bundle and decision rubric for your review.",
    trustKicker: "Human in the loop",
    trustTitle: "Transparent by design. Accountable by default.",
    trustBody:
      "IntelligencesTest supports hiring judgment; it does not make the final hiring decision. Your team sees the evidence, understands uncertainty, and owns every outcome.",
    finalTitle: "Make every hiring decision easier to defend.",
    finalBody: "Give your team a shared, evidence-based path from application to interview decision.",
    footer: "Evidence-based hiring decision support for modern HR teams.",
  },
  es: {
    nav: { product: "Producto", workflow: "Flujo", trust: "Confianza", login: "Iniciar sesión", demo: "Solicitar demo" },
    eyebrow: "Sistema operativo de decisiones de contratación",
    heroTitle: "Decisiones de contratación, respaldadas por evidencia.",
    heroBody:
      "Sepa a quién entrevistar, por qué destaca, qué preguntar y qué riesgos verificar antes de que su equipo tome la decisión.",
    demo: "Solicitar demo",
    sample: "Ver informe de ejemplo",
    heroNote: "Apoyo a la decisión para recruiters y responsables de contratación. El juicio humano mantiene el control.",
    command: "Centro de mando del recruiter",
    commandNote: "Martes, 09:41 · 4 roles activos",
    attention: "Requiere atención",
    reviewed: "Revisados hoy",
    signals: "Señales de evidencia",
    inboxKicker: "Bandeja de atención",
    inboxTitle: "Empiece por lo que necesita una decisión.",
    inboxBody:
      "Una cola priorizada muestra evaluaciones completadas, invitaciones que caducan, perfiles sólidos, riesgos y procesos bloqueados antes de que se conviertan en retrasos.",
    briefKicker: "Resumen ejecutivo del candidato",
    briefTitle: "Un resumen para decidir, no otra pantalla de puntuaciones.",
    briefBody:
      "Cada recomendación incluye nivel de confianza, evidencia, riesgos visibles y la próxima pregunta que su equipo debe resolver.",
    interviewKicker: "Preparación de entrevista",
    interviewTitle: "Convierta la evidencia en una entrevista más precisa.",
    interviewBody:
      "Las preguntas específicas del rol se conectan con los resultados, con sondeos y criterios que mantienen una evaluación estructurada.",
    calibrationKicker: "Calibración del rol",
    calibrationTitle: "Defina el estándar antes de revisar personas.",
    calibrationBody:
      "Defina rol, seniority, competencias esenciales, criterios de descarte y prioridades. IntelligencesTest recomienda la batería y la rúbrica para su revisión.",
    trustKicker: "Supervisión humana",
    trustTitle: "Transparente por diseño. Responsable por defecto.",
    trustBody:
      "IntelligencesTest apoya el criterio de contratación; no toma la decisión final. Su equipo ve la evidencia, entiende la incertidumbre y asume cada resultado.",
    finalTitle: "Haga que cada decisión de contratación sea más fácil de defender.",
    finalBody: "Dé a su equipo un camino compartido y basado en evidencia desde la candidatura hasta la entrevista.",
    footer: "Apoyo a decisiones de contratación basado en evidencia para equipos de RR. HH.",
  },
} as const;

const inboxItems = {
  en: [
    ["3 candidates ready for review", "Evidence complete", "Review now", "success"],
    ["2 invitations expire today", "Sales Development", "Send reminder", "warning"],
    ["Strong profile detected", "Nadia Chen · Operations Lead", "Open brief", "info"],
    ["Risk signal needs verification", "Leadership scope · low coverage", "Add interview focus", "danger"],
    ["Project has been inactive for 5 days", "Finance Analyst", "Resolve blocker", "neutral"],
  ],
  es: [
    ["3 candidatos listos para revisión", "Evidencia completa", "Revisar ahora", "success"],
    ["2 invitaciones caducan hoy", "Desarrollo de ventas", "Enviar recordatorio", "warning"],
    ["Perfil sólido detectado", "Nadia Chen · Líder de operaciones", "Abrir resumen", "info"],
    ["Señal de riesgo por verificar", "Alcance de liderazgo · baja cobertura", "Añadir foco", "danger"],
    ["Proyecto inactivo durante 5 días", "Analista financiero", "Resolver bloqueo", "neutral"],
  ],
} as const;

const toneClass: Record<string, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  info: "bg-indigo-400",
  neutral: "bg-zinc-500",
};

function SectionIntro({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase text-indigo-300">{kicker}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-5 text-base leading-7 text-zinc-400">{body}</p>
    </div>
  );
}

function StatusDot({ tone }: { tone: string }) {
  return <span className={`h-2 w-2 shrink-0 rounded-full ${toneClass[tone]}`} aria-hidden="true" />;
}

function CommandCenter({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const candidates = locale === "en"
    ? [
        ["Nadia Chen", "Operations Lead", "Strong evidence", "92%", "Interview first"],
        ["Marcus Reed", "Operations Lead", "Proceed", "84%", "Review brief"],
        ["Elena Ruiz", "Operations Lead", "Verify", "71%", "Risk to check"],
      ]
    : [
        ["Nadia Chen", "Líder de operaciones", "Evidencia sólida", "92%", "Entrevistar primero"],
        ["Marcus Reed", "Líder de operaciones", "Avanzar", "84%", "Revisar resumen"],
        ["Elena Ruiz", "Líder de operaciones", "Verificar", "71%", "Riesgo por revisar"],
      ];

  return (
    <div className="relative mx-auto mt-14 max-w-6xl lg:mt-18">
      <div className="absolute inset-x-20 -top-10 h-40 bg-indigo-500/15 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#111113] shadow-[0_32px_100px_rgba(0,0,0,0.5)]">
        <div className="flex h-11 items-center gap-2 border-b border-white/8 bg-white/[0.025] px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="ml-3 hidden text-[11px] text-zinc-600 sm:block">app.intelligencestest.com/dashboard</span>
        </div>
        <div className="grid min-h-[510px] lg:grid-cols-[190px_1fr_270px]">
          <aside className="hidden border-r border-white/8 p-5 lg:block" aria-label="Product preview navigation">
            <p className="text-xs font-semibold text-white">Workspace</p>
            <div className="mt-5 space-y-1 text-xs text-zinc-500">
              <p className="rounded-md bg-white/[0.06] px-3 py-2 text-zinc-100">Command center</p>
              <p className="px-3 py-2">Attention inbox</p>
              <p className="px-3 py-2">Projects</p>
              <p className="px-3 py-2">Candidates</p>
              <p className="px-3 py-2">Reports</p>
            </div>
            <div className="mt-8 border-t border-white/8 pt-5">
              <p className="text-[11px] uppercase text-zinc-600">Active role</p>
              <p className="mt-2 text-xs font-medium text-zinc-300">Operations Lead</p>
              <p className="mt-1 text-[11px] text-zinc-600">12 candidates</p>
            </div>
          </aside>

          <div className="min-w-0 p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-lg font-semibold text-white">{t.command}</p>
                <p className="mt-1 text-xs text-zinc-500">{t.commandNote}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live evidence
              </span>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 border-y border-white/8 py-5">
              {[["6", t.attention], ["11", t.reviewed], ["38", t.signals]].map(([value, label]) => (
                <div key={label}>
                  <p className="text-xl font-semibold tabular-nums text-white sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[11px] text-zinc-500 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-200">Candidates to interview first</p>
                <p className="text-[11px] text-zinc-600">Ranked by role evidence</p>
              </div>
              <div className="mt-3 divide-y divide-white/8 rounded-lg border border-white/8 bg-white/[0.025]">
                {candidates.map((candidate, index) => (
                  <div key={candidate[0]} className="grid gap-3 px-4 py-4 sm:grid-cols-[28px_1fr_auto] sm:items-center">
                    <span className="text-xs tabular-nums text-zinc-600">0{index + 1}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-zinc-100">{candidate[0]}</p>
                        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400">{candidate[2]}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600">{candidate[1]} · {candidate[4]}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-zinc-200">{candidate[3]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="border-t border-white/8 bg-black/20 p-5 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-200">Decision brief</p>
              <span className="text-[10px] text-zinc-600">Nadia Chen</span>
            </div>
            <div className="mt-5 flex items-center justify-between border-b border-white/8 pb-5">
              <div>
                <p className="text-[11px] uppercase text-zinc-600">Recommendation</p>
                <p className="mt-1 text-lg font-semibold text-white">Interview first</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-zinc-600">Confidence</p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">High · 92%</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <Signal label="Decision judgment" value="Strong" width="92%" />
              <Signal label="Role alignment" value="Strong" width="86%" />
              <Signal label="People leadership" value="Verify" width="64%" warning />
            </div>
            <div className="mt-6 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-200">
                <CircleAlert className="h-3.5 w-3.5" /> Risk to verify
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-400">Limited evidence for delegation in a multi-team environment.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Signal({ label, value, width, warning = false }: { label: string; value: string; width: string; warning?: boolean }) {
  return (
    <div>
      <div className="flex justify-between gap-3 text-[11px]">
        <span className="text-zinc-500">{label}</span>
        <span className={warning ? "text-amber-300" : "text-zinc-300"}>{value}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full ${warning ? "bg-amber-400" : "bg-indigo-400"}`} style={{ width }} />
      </div>
    </div>
  );
}

function AttentionInbox({ locale }: { locale: Locale }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111113]">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-zinc-500" />
          <p className="text-sm font-semibold text-zinc-100">Attention inbox</p>
        </div>
        <span className="rounded-md bg-indigo-400/10 px-2 py-1 text-[11px] font-medium text-indigo-300">6 open</span>
      </div>
      <div className="divide-y divide-white/8">
        {inboxItems[locale].map(([title, meta, action, tone]) => (
          <div key={title} className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.025]">
            <StatusDot tone={tone} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-200">{title}</p>
              <p className="mt-1 truncate text-xs text-zinc-600">{meta}</p>
            </div>
            <span className="hidden text-xs text-zinc-500 sm:block">{action}</span>
            <ChevronRight className="h-4 w-4 text-zinc-700 transition-colors group-hover:text-zinc-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CandidateBrief({ locale }: { locale: Locale }) {
  const labels = locale === "en"
    ? { recommendation: "Recommendation", verdict: "Advance to structured interview", confidence: "High confidence", evidence: "Evidence", strengths: "Strengths", risks: "Risks", focus: "Interview focus", verify: "What to verify next" }
    : { recommendation: "Recomendación", verdict: "Avanzar a entrevista estructurada", confidence: "Confianza alta", evidence: "Evidencia", strengths: "Fortalezas", risks: "Riesgos", focus: "Foco de entrevista", verify: "Qué verificar después" };
  return (
    <div className="rounded-lg border border-white/10 bg-[#f4f2ed] p-5 text-[#18181b] sm:p-8">
      <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">Executive candidate brief</p>
          <h3 className="mt-3 text-2xl font-semibold">Nadia Chen</h3>
          <p className="mt-1 text-sm text-zinc-500">Operations Lead · Northstar Logistics</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-700/20 bg-emerald-700/[0.06] px-3 py-2 text-xs font-semibold text-emerald-800">
          <BadgeCheck className="h-4 w-4" /> {labels.confidence} · 92%
        </span>
      </div>
      <div className="grid gap-8 py-7 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">{labels.recommendation}</p>
          <p className="mt-3 text-2xl font-semibold leading-8">{labels.verdict}</p>
          <p className="mt-4 text-sm leading-6 text-zinc-600">Consistent evidence of analytical judgment, operational ownership, and calm decision-making under pressure.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            [labels.evidence, "4 aligned assessment signals", SearchCheck],
            [labels.strengths, "Prioritization · judgment · communication", BarChart3],
            [labels.risks, "Delegation evidence is incomplete", CircleAlert],
            [labels.focus, "Cross-functional conflict and coaching", MessageSquareText],
          ].map(([title, body, Icon]) => {
            const ItemIcon = Icon as typeof SearchCheck;
            return (
              <div key={title as string} className="border-t border-black/10 pt-4">
                <ItemIcon className="h-4 w-4 text-zinc-500" />
                <p className="mt-3 text-xs font-semibold uppercase text-zinc-500">{title as string}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-800">{body as string}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-500">{labels.verify}</p>
          <p className="mt-1 text-sm">Ask for a recent example of delegating a critical operational decision.</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-indigo-700">Open full evidence <ArrowRight className="h-3.5 w-3.5" /></span>
      </div>
    </div>
  );
}

function InterviewKit({ locale }: { locale: Locale }) {
  const isEn = locale === "en";
  const rows = [
    [isEn ? "Suggested question" : "Pregunta sugerida", isEn ? "Tell me about a decision you made with incomplete operational data. How did you set the threshold to act?" : "Hábleme de una decisión que tomó con datos operativos incompletos. ¿Cómo definió el umbral para actuar?"],
    [isEn ? "Follow-up probe" : "Pregunta de seguimiento", isEn ? "What evidence would have changed your decision?" : "¿Qué evidencia habría cambiado su decisión?"],
    [isEn ? "Strong answer" : "Respuesta sólida", isEn ? "Names the trade-off, sets a decision rule, and explains how the outcome was monitored." : "Nombra el equilibrio, define una regla de decisión y explica cómo supervisó el resultado."],
    [isEn ? "Weak signal" : "Señal débil", isEn ? "Relies on intuition without a threshold, owner, or feedback loop." : "Depende de la intuición sin umbral, responsable ni ciclo de aprendizaje."],
  ];
  return (
    <div className="rounded-lg border border-white/10 bg-[#111113]">
      <div className="flex flex-col gap-4 border-b border-white/8 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Operations Lead · Structured interview kit</p>
          <p className="mt-1 text-xs text-zinc-600">Generated from role criteria and candidate evidence</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-400"><Target className="h-3.5 w-3.5" /> Decision judgment</span>
      </div>
      <div className="divide-y divide-white/8">
        {rows.map(([label, body], index) => (
          <div key={label} className="grid gap-3 p-5 sm:grid-cols-[150px_1fr] sm:p-6">
            <p className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <span className="text-zinc-700">0{index + 1}</span>{label}
            </p>
            <p className={`text-sm leading-6 ${index === 2 ? "text-emerald-200" : index === 3 ? "text-amber-200" : "text-zinc-300"}`}>{body}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/8 bg-white/[0.02] px-5 py-4">
        <span className="text-xs text-zinc-500">Scorecard guidance · 1–5 behavioral anchors</span>
        <ListChecks className="h-4 w-4 text-indigo-300" />
      </div>
    </div>
  );
}

function RoleCalibration({ locale }: { locale: Locale }) {
  const isEn = locale === "en";
  const criteria = isEn
    ? [["Role", "Operations Lead"], ["Seniority", "Manager"], ["Must-have", "Judgment · ownership · communication"], ["Deal-breaker", "Low integrity evidence"], ["Priority", "Operate through ambiguity"]]
    : [["Rol", "Líder de operaciones"], ["Seniority", "Manager"], ["Esencial", "Criterio · responsabilidad · comunicación"], ["Descarte", "Baja evidencia de integridad"], ["Prioridad", "Operar con ambigüedad"]];
  return (
    <div className="grid overflow-hidden rounded-lg border border-white/10 bg-[#111113] lg:grid-cols-[1fr_0.9fr]">
      <div className="p-5 sm:p-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-white"><BriefcaseBusiness className="h-4 w-4 text-indigo-300" /> {isEn ? "Role profile" : "Perfil del rol"}</div>
        <div className="mt-6 divide-y divide-white/8 border-y border-white/8">
          {criteria.map(([label, value]) => (
            <div key={label} className="grid gap-2 py-4 sm:grid-cols-[110px_1fr]">
              <span className="text-xs text-zinc-600">{label}</span>
              <span className="text-sm text-zinc-300">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/8 bg-indigo-400/[0.035] p-5 sm:p-7 lg:border-l lg:border-t-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles className="h-4 w-4 text-indigo-300" /> {isEn ? "Recommended decision framework" : "Marco de decisión recomendado"}</div>
        <div className="mt-6 space-y-5">
          {["Decision Making", "Critical Thinking", "Communication Skills", "Integrity & Ethics"].map((item, index) => (
            <div key={item} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-[10px] text-zinc-500">0{index + 1}</span><span className="text-sm text-zinc-300">{item}</span></div>
              <Check className="h-4 w-4 text-emerald-300" />
            </div>
          ))}
        </div>
        <div className="mt-7 border-t border-white/8 pt-5">
          <div className="flex justify-between text-xs"><span className="text-zinc-500">Role evidence coverage</span><span className="font-semibold text-zinc-200">91%</span></div>
          <div className="mt-3 h-1.5 rounded-full bg-white/8"><div className="h-full w-[91%] rounded-full bg-indigo-400" /></div>
        </div>
      </div>
    </div>
  );
}

export function DecisionOSHome({ locale, homeHref, loginHref, demoHref, sampleHref }: DecisionOSHomeProps) {
  const t = copy[locale];
  const trustItems = locale === "en"
    ? [["Evidence for every recommendation", SearchCheck], ["Visible confidence levels", Gauge], ["Human override", UserCheck], ["Complete audit trail", History], ["Transparent candidate experience", ShieldCheck]]
    : [["Evidencia para cada recomendación", SearchCheck], ["Niveles de confianza visibles", Gauge], ["Decisión humana", UserCheck], ["Registro de auditoría completo", History], ["Experiencia transparente del candidato", ShieldCheck]];

  return (
    <main className="min-h-screen overflow-hidden bg-[#09090b] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#09090b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-6 lg:px-8">
          <Link href={homeHref} aria-label="IntelligencesTest home">
            <BrandLockup
              subtitle="Hiring Decision OS"
              markClassName="h-9 w-9 rounded-lg"
              titleClassName="text-zinc-100"
              subtitleClassName="text-zinc-600"
            />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-zinc-500 lg:flex" aria-label="Primary navigation">
            <a href="#product" className="transition-colors hover:text-white">{t.nav.product}</a>
            <a href="#workflow" className="transition-colors hover:text-white">{t.nav.workflow}</a>
            <a href="#trust" className="transition-colors hover:text-white">{t.nav.trust}</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href={loginHref} className="hidden px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white sm:inline-flex">{t.nav.login}</Link>
            <Link href={demoHref} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200">{t.nav.demo}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-white/8 px-5 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.14),transparent_62%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase text-indigo-300">{t.eyebrow}</p>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">{t.heroTitle}</h1>
            <p className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-8 text-zinc-400">{t.heroBody}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={demoHref} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200">{t.demo}<ArrowRight className="h-4 w-4" /></Link>
              <Link href={sampleHref} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/14 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.07]">{t.sample}<FileCheck2 className="h-4 w-4" /></Link>
            </div>
            <p className="mt-6 text-xs text-zinc-600">{t.heroNote}</p>
          </div>
          <CommandCenter locale={locale} />
        </div>
      </section>

      <section id="product" className="scroll-mt-20 border-b border-white/8 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20 lg:px-8">
          <SectionIntro kicker={t.inboxKicker} title={t.inboxTitle} body={t.inboxBody} />
          <AttentionInbox locale={locale} />
        </div>
      </section>

      <section id="candidate-brief" className="scroll-mt-20 border-b border-white/8 bg-[#0d0d0f] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionIntro kicker={t.briefKicker} title={t.briefTitle} body={t.briefBody} />
          <div className="mt-12"><CandidateBrief locale={locale} /></div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-20 border-b border-white/8 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-20 lg:px-8">
          <SectionIntro kicker={t.interviewKicker} title={t.interviewTitle} body={t.interviewBody} />
          <InterviewKit locale={locale} />
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#0d0d0f] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <SectionIntro kicker={t.calibrationKicker} title={t.calibrationTitle} body={t.calibrationBody} />
            <div className="hidden justify-end lg:flex"><BriefcaseBusiness className="h-16 w-16 text-white/5" /></div>
          </div>
          <div className="mt-12"><RoleCalibration locale={locale} /></div>
        </div>
      </section>

      <section id="trust" className="scroll-mt-20 border-b border-white/8 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <SectionIntro kicker={t.trustKicker} title={t.trustTitle} body={t.trustBody} />
            <div className="divide-y divide-white/8 border-y border-white/8">
              {trustItems.map(([label, Icon]) => {
                const TrustIcon = Icon as typeof SearchCheck;
                return (
                  <div key={label as string} className="flex items-center gap-4 py-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.04]"><TrustIcon className="h-4 w-4 text-indigo-300" /></span>
                    <span className="text-sm text-zinc-300">{label as string}</span>
                    <Check className="ml-auto h-4 w-4 text-zinc-600" />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              [LockKeyhole, "Workspace isolation", "Candidate and company data remain separated by workspace."],
              [Users, "Human ownership", "Recruiters review, override, and document the final decision."],
              [FileCheck2, "Defensible process", "Criteria, evidence, and actions remain traceable for review."],
            ].map(([Icon, title, body]) => {
              const FeatureIcon = Icon as typeof LockKeyhole;
              return (
                <div key={title as string} className="rounded-lg border border-white/8 p-6">
                  <FeatureIcon className="h-5 w-5 text-zinc-500" />
                  <h3 className="mt-5 text-sm font-semibold text-white">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{body as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative px-5 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.12),transparent_62%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-400">{t.finalBody}</p>
          <Link href={demoHref} className="mt-9 inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200">{t.demo}<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <BrandLockup markClassName="h-8 w-8 rounded-md" titleClassName="text-zinc-200" subtitleClassName="text-zinc-600" subtitle="Hiring Decision OS" />
          <p className="text-xs text-zinc-600">{t.footer}</p>
        </div>
      </footer>
    </main>
  );
}
