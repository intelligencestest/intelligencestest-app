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
import { PublicFooter } from "@/components/public/PublicSite";
import type { PublicCopy } from "@/lib/public-site-copy";

type Locale = "en" | "es";

type DecisionOSHomeProps = {
  locale: Locale;
  homeHref: string;
  loginHref: string;
  demoHref: string;
  sampleHref: string;
  publicCopy: PublicCopy;
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
    ui: {
      workspace: "Workspace",
      commandCenter: "Command center",
      attentionInbox: "Attention inbox",
      projects: "Projects",
      candidates: "Candidates",
      reports: "Reports",
      activeRole: "Active role",
      roleName: "Operations Lead",
      roleCandidates: "12 candidates",
      liveEvidence: "Live evidence",
      interviewFirstList: "Candidates to interview first",
      rankedBy: "Ranked by role evidence",
      decisionBrief: "Decision brief",
      recommendation: "Recommendation",
      interviewFirst: "Interview first",
      confidence: "Confidence",
      confidenceValue: "High · 92%",
      signalJudgment: "Decision judgment",
      signalAlignment: "Role alignment",
      signalLeadership: "People leadership",
      signalStrong: "Strong",
      signalVerify: "Verify",
      riskToVerify: "Risk to verify",
      riskText: "Limited evidence for delegation in a multi-team environment.",
      openCount: "6 open",
      briefWho: "Operations Lead · Northstar Logistics",
      briefRationale: "Consistent evidence of analytical judgment, operational ownership, and calm decision-making under pressure.",
      evidenceBody: "4 aligned assessment signals",
      strengthsBody: "Prioritization · judgment · communication",
      risksBody: "Delegation evidence is incomplete",
      focusBody: "Cross-functional conflict and coaching",
      verifySentence: "Ask for a recent example of delegating a critical operational decision.",
      openFullEvidence: "Open full evidence",
      kitTitle: "Operations Lead · Structured interview kit",
      kitSubtitle: "Generated from role criteria and candidate evidence",
      scorecard: "Scorecard guidance · 1–5 behavioral anchors",
      coverage: "Role evidence coverage",
      assessments: ["Decision Making", "Critical Thinking", "Communication Skills", "Integrity & Ethics"],
    },
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
    ui: {
      workspace: "Espacio de trabajo",
      commandCenter: "Centro de mando",
      attentionInbox: "Bandeja de atención",
      projects: "Proyectos",
      candidates: "Candidatos",
      reports: "Informes",
      activeRole: "Rol activo",
      roleName: "Líder de operaciones",
      roleCandidates: "12 candidatos",
      liveEvidence: "Evidencia activa",
      interviewFirstList: "Candidatos para entrevistar primero",
      rankedBy: "Ordenados por evidencia del rol",
      decisionBrief: "Resumen de decisión",
      recommendation: "Recomendación",
      interviewFirst: "Entrevistar primero",
      confidence: "Confianza",
      confidenceValue: "Alta · 92%",
      signalJudgment: "Juicio de decisión",
      signalAlignment: "Encaje con el rol",
      signalLeadership: "Liderazgo de personas",
      signalStrong: "Sólido",
      signalVerify: "Verificar",
      riskToVerify: "Riesgo por verificar",
      riskText: "Evidencia limitada sobre delegación en un entorno multiequipo.",
      openCount: "6 abiertos",
      briefWho: "Líder de operaciones · Northstar Logistics",
      briefRationale: "Evidencia consistente de juicio analítico, responsabilidad operativa y toma de decisiones serena bajo presión.",
      evidenceBody: "4 señales de evaluación alineadas",
      strengthsBody: "Priorización · criterio · comunicación",
      risksBody: "La evidencia de delegación es incompleta",
      focusBody: "Conflicto interfuncional y coaching",
      verifySentence: "Pida un ejemplo reciente de delegación de una decisión operativa crítica.",
      openFullEvidence: "Ver evidencia completa",
      kitTitle: "Líder de operaciones · Kit de entrevista estructurada",
      kitSubtitle: "Generado a partir de los criterios del rol y la evidencia del candidato",
      scorecard: "Guía de puntuación · anclas conductuales 1–5",
      coverage: "Cobertura de evidencia del rol",
      assessments: ["Toma de Decisiones", "Pensamiento Crítico", "Habilidades de Comunicación", "Integridad y Ética"],
    },
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
      <p className="text-xs font-semibold uppercase text-indigo-700">{kicker}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-5 text-base leading-7 text-slate-600">{body}</p>
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
      <div className="absolute inset-x-24 -top-8 h-32 bg-indigo-100/70 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.28)]">
        <div className="flex h-11 items-center gap-2 border-b border-slate-200 bg-slate-50 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-3 hidden text-[11px] text-slate-400 sm:block">app.intelligencestest.com/dashboard</span>
        </div>
        <div className="grid min-h-[510px] lg:grid-cols-[190px_1fr_270px]">
          <aside className="hidden border-r border-slate-200 bg-slate-50/70 p-5 lg:block" aria-label="Product preview navigation">
            <p className="text-xs font-semibold text-slate-900">{t.ui.workspace}</p>
            <div className="mt-5 space-y-1 text-xs text-slate-500">
              <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900">{t.ui.commandCenter}</p>
              <p className="px-3 py-2">{t.ui.attentionInbox}</p>
              <p className="px-3 py-2">{t.ui.projects}</p>
              <p className="px-3 py-2">{t.ui.candidates}</p>
              <p className="px-3 py-2">{t.ui.reports}</p>
            </div>
            <div className="mt-8 border-t border-slate-200 pt-5">
              <p className="text-[11px] uppercase text-slate-400">{t.ui.activeRole}</p>
              <p className="mt-2 text-xs font-medium text-slate-700">{t.ui.roleName}</p>
              <p className="mt-1 text-[11px] text-slate-400">{t.ui.roleCandidates}</p>
            </div>
          </aside>

          <div className="min-w-0 p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-lg font-semibold text-slate-950">{t.command}</p>
                <p className="mt-1 text-xs text-slate-500">{t.commandNote}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t.ui.liveEvidence}
              </span>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 border-y border-slate-200 py-5">
              {[["6", t.attention], ["11", t.reviewed], ["38", t.signals]].map(([value, label]) => (
                <div key={label}>
                  <p className="text-xl font-semibold tabular-nums text-slate-950 sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-800">{t.ui.interviewFirstList}</p>
                <p className="text-[11px] text-slate-400">{t.ui.rankedBy}</p>
              </div>
              <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {candidates.map((candidate, index) => (
                  <div key={candidate[0]} className="grid gap-3 px-4 py-4 sm:grid-cols-[28px_1fr_auto] sm:items-center">
                    <span className="text-xs tabular-nums text-slate-400">0{index + 1}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{candidate[0]}</p>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{candidate[2]}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{candidate[1]} · {candidate[4]}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-slate-800">{candidate[3]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">{t.ui.decisionBrief}</p>
              <span className="text-[10px] text-slate-400">Nadia Chen</span>
            </div>
            <div className="mt-5 flex items-center justify-between border-b border-slate-200 pb-5">
              <div>
                <p className="text-[11px] uppercase text-slate-400">{t.ui.recommendation}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{t.ui.interviewFirst}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">{t.ui.confidence}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{t.ui.confidenceValue}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <Signal label={t.ui.signalJudgment} value={t.ui.signalStrong} width="92%" />
              <Signal label={t.ui.signalAlignment} value={t.ui.signalStrong} width="86%" />
              <Signal label={t.ui.signalLeadership} value={t.ui.signalVerify} width="64%" warning />
            </div>
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-800">
                <CircleAlert className="h-3.5 w-3.5" /> {t.ui.riskToVerify}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">{t.ui.riskText}</p>
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
        <span className="text-slate-500">{label}</span>
        <span className={warning ? "text-amber-700" : "text-slate-700"}>{value}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${warning ? "bg-amber-500" : "bg-indigo-600"}`} style={{ width }} />
      </div>
    </div>
  );
}

function AttentionInbox({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.24)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-slate-500" />
          <p className="text-sm font-semibold text-slate-900">{t.ui.attentionInbox}</p>
        </div>
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">{t.ui.openCount}</span>
      </div>
      <div className="divide-y divide-white/8">
        {inboxItems[locale].map(([title, meta, action, tone]) => (
          <div key={title} className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50">
            <StatusDot tone={tone} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-800">{title}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{meta}</p>
            </div>
            <span className="hidden text-xs text-slate-500 sm:block">{action}</span>
            <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-600" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CandidateBrief({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const labels = locale === "en"
    ? { recommendation: "Recommendation", verdict: "Advance to structured interview", confidence: "High confidence", evidence: "Evidence", strengths: "Strengths", risks: "Risks", focus: "Interview focus", verify: "What to verify next" }
    : { recommendation: "Recomendación", verdict: "Avanzar a entrevista estructurada", confidence: "Confianza alta", evidence: "Evidencia", strengths: "Fortalezas", risks: "Riesgos", focus: "Foco de entrevista", verify: "Qué verificar después" };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.24)] sm:p-8">
      <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">{t.briefKicker}</p>
          <h3 className="mt-3 text-2xl font-semibold">Nadia Chen</h3>
          <p className="mt-1 text-sm text-zinc-500">{t.ui.briefWho}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-700/20 bg-emerald-700/[0.06] px-3 py-2 text-xs font-semibold text-emerald-800">
          <BadgeCheck className="h-4 w-4" /> {labels.confidence} · 92%
        </span>
      </div>
      <div className="grid gap-8 py-7 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">{labels.recommendation}</p>
          <p className="mt-3 text-2xl font-semibold leading-8">{labels.verdict}</p>
          <p className="mt-4 text-sm leading-6 text-zinc-600">{t.ui.briefRationale}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            [labels.evidence, t.ui.evidenceBody, SearchCheck],
            [labels.strengths, t.ui.strengthsBody, BarChart3],
            [labels.risks, t.ui.risksBody, CircleAlert],
            [labels.focus, t.ui.focusBody, MessageSquareText],
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
          <p className="mt-1 text-sm">{t.ui.verifySentence}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-indigo-700">{t.ui.openFullEvidence} <ArrowRight className="h-3.5 w-3.5" /></span>
      </div>
    </div>
  );
}

function InterviewKit({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const isEn = locale === "en";
  const rows = [
    [isEn ? "Suggested question" : "Pregunta sugerida", isEn ? "Tell me about a decision you made with incomplete operational data. How did you set the threshold to act?" : "Hábleme de una decisión que tomó con datos operativos incompletos. ¿Cómo definió el umbral para actuar?"],
    [isEn ? "Follow-up probe" : "Pregunta de seguimiento", isEn ? "What evidence would have changed your decision?" : "¿Qué evidencia habría cambiado su decisión?"],
    [isEn ? "Strong answer" : "Respuesta sólida", isEn ? "Names the trade-off, sets a decision rule, and explains how the outcome was monitored." : "Nombra el equilibrio, define una regla de decisión y explica cómo supervisó el resultado."],
    [isEn ? "Weak signal" : "Señal débil", isEn ? "Relies on intuition without a threshold, owner, or feedback loop." : "Depende de la intuición sin umbral, responsable ni ciclo de aprendizaje."],
  ];
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{t.ui.kitTitle}</p>
          <p className="mt-1 text-xs text-slate-500">{t.ui.kitSubtitle}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600"><Target className="h-3.5 w-3.5" /> {t.ui.signalJudgment}</span>
      </div>
      <div className="divide-y divide-white/8">
        {rows.map(([label, body], index) => (
          <div key={label} className="grid gap-3 p-5 sm:grid-cols-[150px_1fr] sm:p-6">
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-slate-300">0{index + 1}</span>{label}
            </p>
            <p className={`text-sm leading-6 ${index === 2 ? "text-emerald-700" : index === 3 ? "text-amber-800" : "text-slate-700"}`}>{body}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
        <span className="text-xs text-slate-500">{t.ui.scorecard}</span>
        <ListChecks className="h-4 w-4 text-indigo-700" />
      </div>
    </div>
  );
}

function RoleCalibration({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const isEn = locale === "en";
  const criteria = isEn
    ? [["Role", "Operations Lead"], ["Seniority", "Manager"], ["Must-have", "Judgment · ownership · communication"], ["Deal-breaker", "Low integrity evidence"], ["Priority", "Operate through ambiguity"]]
    : [["Rol", "Líder de operaciones"], ["Seniority", "Manager"], ["Esencial", "Criterio · responsabilidad · comunicación"], ["Descarte", "Baja evidencia de integridad"], ["Prioridad", "Operar con ambigüedad"]];
  return (
    <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] lg:grid-cols-[1fr_0.9fr]">
      <div className="p-5 sm:p-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><BriefcaseBusiness className="h-4 w-4 text-indigo-700" /> {isEn ? "Role profile" : "Perfil del rol"}</div>
        <div className="mt-6 divide-y divide-slate-100 border-y border-slate-200">
          {criteria.map(([label, value]) => (
            <div key={label} className="grid gap-2 py-4 sm:grid-cols-[110px_1fr]">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-sm text-slate-700">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200 bg-indigo-50/50 p-5 sm:p-7 lg:border-l lg:border-t-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Sparkles className="h-4 w-4 text-indigo-700" /> {isEn ? "Recommended decision framework" : "Marco de decisión recomendado"}</div>
        <div className="mt-6 space-y-5">
          {t.ui.assessments.map((item, index) => (
            <div key={item} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[10px] text-slate-500 ring-1 ring-slate-200">0{index + 1}</span><span className="text-sm text-slate-700">{item}</span></div>
              <Check className="h-4 w-4 text-emerald-600" />
            </div>
          ))}
        </div>
        <div className="mt-7 border-t border-indigo-100 pt-5">
          <div className="flex justify-between text-xs"><span className="text-slate-500">{t.ui.coverage}</span><span className="font-semibold text-slate-800">91%</span></div>
          <div className="mt-3 h-1.5 rounded-full bg-indigo-100"><div className="h-full w-[91%] rounded-full bg-indigo-600" /></div>
        </div>
      </div>
    </div>
  );
}

export function DecisionOSHome({ locale, homeHref, loginHref, demoHref, sampleHref, publicCopy }: DecisionOSHomeProps) {
  const t = copy[locale];
  const trustItems = locale === "en"
    ? [["Evidence for every recommendation", SearchCheck], ["Visible confidence levels", Gauge], ["Human override", UserCheck], ["Complete audit trail", History], ["Transparent candidate experience", ShieldCheck]]
    : [["Evidencia para cada recomendación", SearchCheck], ["Niveles de confianza visibles", Gauge], ["Decisión humana", UserCheck], ["Registro de auditoría completo", History], ["Experiencia transparente del candidato", ShieldCheck]];

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#0f172a]">
      <div className="[--color-slate-50:#f8fafc] [--color-slate-100:#f1f5f9] [--color-slate-200:#e2e8f0] [--color-slate-300:#cbd5e1] [--color-slate-400:#94a3b8] [--color-slate-500:#64748b] [--color-slate-600:#475569] [--color-slate-700:#334155] [--color-slate-800:#1e293b] [--color-slate-900:#0f172a] [--color-slate-950:#020617]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-6 lg:px-8">
          <Link href={homeHref} aria-label="IntelligencesTest home">
            <BrandLockup
              subtitle={t.eyebrow}
              markClassName="h-9 w-9 rounded-lg"
              titleClassName="text-slate-950"
              subtitleClassName="text-slate-500"
            />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-500 lg:flex" aria-label="Primary navigation">
            <a href="#product" className="transition-colors hover:text-slate-950">{t.nav.product}</a>
            <a href="#workflow" className="transition-colors hover:text-slate-950">{t.nav.workflow}</a>
            <a href="#trust" className="transition-colors hover:text-slate-950">{t.nav.trust}</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href={loginHref} className="hidden px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 sm:inline-flex">{t.nav.login}</Link>
            <Link href={demoHref} className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-800">{t.nav.demo}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-slate-200 bg-[#fbfbfc] px-5 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.07),transparent_65%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase text-indigo-700">{t.eyebrow}</p>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] text-slate-950 sm:text-6xl lg:text-7xl">{t.heroTitle}</h1>
            <p className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-8 text-slate-600">{t.heroBody}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={demoHref} className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800">{t.demo}<ArrowRight className="h-4 w-4" /></Link>
              <Link href={sampleHref} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">{t.sample}<FileCheck2 className="h-4 w-4" /></Link>
            </div>
            <p className="mt-6 text-xs text-slate-500">{t.heroNote}</p>
          </div>
          <CommandCenter locale={locale} />
        </div>
      </section>

      <section id="product" className="scroll-mt-20 border-b border-slate-200 bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20 lg:px-8">
          <SectionIntro kicker={t.inboxKicker} title={t.inboxTitle} body={t.inboxBody} />
          <AttentionInbox locale={locale} />
        </div>
      </section>

      <section id="candidate-brief" className="scroll-mt-20 border-b border-slate-200 bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionIntro kicker={t.briefKicker} title={t.briefTitle} body={t.briefBody} />
          <div className="mt-12"><CandidateBrief locale={locale} /></div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-20 border-b border-slate-200 bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-20 lg:px-8">
          <SectionIntro kicker={t.interviewKicker} title={t.interviewTitle} body={t.interviewBody} />
          <InterviewKit locale={locale} />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <SectionIntro kicker={t.calibrationKicker} title={t.calibrationTitle} body={t.calibrationBody} />
            <div className="hidden justify-end lg:flex"><BriefcaseBusiness className="h-16 w-16 text-slate-200" /></div>
          </div>
          <div className="mt-12"><RoleCalibration locale={locale} /></div>
        </div>
      </section>

      <section id="trust" className="scroll-mt-20 border-b border-slate-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <SectionIntro kicker={t.trustKicker} title={t.trustTitle} body={t.trustBody} />
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {trustItems.map(([label, Icon]) => {
                const TrustIcon = Icon as typeof SearchCheck;
                return (
                  <div key={label as string} className="flex items-center gap-4 py-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50"><TrustIcon className="h-4 w-4 text-indigo-700" /></span>
                    <span className="text-sm text-slate-700">{label as string}</span>
                    <Check className="ml-auto h-4 w-4 text-emerald-600" />
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
                <div key={title as string} className="rounded-lg border border-slate-200 bg-white p-6">
                  <FeatureIcon className="h-5 w-5 text-slate-500" />
                  <h3 className="mt-5 text-sm font-semibold text-slate-950">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative bg-[#f6f7fb] px-5 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">{t.finalBody}</p>
          <Link href={demoHref} className="mt-9 inline-flex items-center justify-center gap-2 rounded-md bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800">{t.demo}<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      </div>
      <PublicFooter copy={publicCopy} />
    </main>
  );
}
