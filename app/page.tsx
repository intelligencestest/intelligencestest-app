import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/PublicSite";
import { localePath, toAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

/**
 * Product entrance for app.intelligencestest.com. Six sections, one question
 * each: Hero (what is this) → Workspace (what will I use) → Executive report
 * (why is this different) → Pricing (how do I start) → Security (can I trust
 * it) → Footer (where next). The report is the climax; everything before it
 * builds toward it. Marketing lives on the WordPress site, not here.
 */
const content = {
  en: {
    heroTitle: "Hiring decisions, backed by evidence.",
    heroBody:
      "Run validated assessments, review every candidate in one queue, and end each search with an executive report your team can act on.",
    heroPrimary: "Start free trial",
    heroSecondary: "Read a sample report",
    heroMicro: "14-day trial · No credit card · Candidates never create accounts",

    workKicker: "The workspace",
    workTitle: "Know who to review next, and why.",
    workBody:
      "Invitations, completions, and results land in one queue, ranked by evidence — so the morning starts with decisions, not triage.",

    reportKicker: "The executive report",
    reportTitle: "Every assessment ends in a decision.",
    reportBody:
      "One page per candidate: the recommendation, the evidence behind it, and the interview questions to validate it. Structured for a hiring decision, not a data export.",

    pricingTitle: "Start free. Upgrade when the team does.",
    pricingBody: "Every plan begins with a 14-day trial. No credit card required.",
    plans: [
      { name: "Starter", price: "€49", period: "/month", body: "1 recruiter · 50 invitations · 2 projects", cta: "Start with Starter", highlight: false },
      { name: "Professional", price: "€149", period: "/month", body: "5 recruiters · 250 invitations · 10 projects", cta: "Start with Professional", highlight: true, tag: "Most teams" },
      { name: "Enterprise", price: "Custom", period: "", body: "Unlimited usage · Priority support · Guided setup", cta: "Contact sales", highlight: false },
    ],

    securityTitle: "Built to be trusted with candidate data.",
    securityItems: [
      ["Isolated workspaces", "Each company's candidates, results, and reports live in a strictly separated workspace."],
      ["Expiring candidate links", "Candidates receive tokenized links, valid for seven days. They never create accounts."],
      ["Evidence, not scraping", "Reports are built only from assessments your candidates complete — nothing else."],
      ["Bilingual by design", "The full experience — assessments, workspace, and reports — runs in English and Spanish."],
    ],

    // Workspace frame
    mGreeting: "Good morning, Elena",
    mBrief: "3 candidates are waiting for review · 2 invitations expire today",
    mStats: [
      ["3", "to review"],
      ["2", "in interview"],
      ["4", "hires this month"],
    ],
    mQueueTitle: "Review queue",
    mRows: [
      { name: "María García", meta: "Customer Support Supervisor · 3/3 assessments · waiting 2 h", verdict: "Strong", tone: "strong" },
      { name: "Daniel Ortiz", meta: "Sales Development · 3/3 assessments · waiting 5 h", verdict: "Proceed", tone: "proceed" },
      { name: "Anna Keller", meta: "Administrative Analyst · 2/3 assessments · waiting 26 h", verdict: "Review", tone: "review" },
    ],
    mReview: "Review",

    // Report frame
    rEyebrow: "Executive report",
    rVerdict: "Proceed",
    rHeadline: "Consistent evidence of strong analytical judgment.",
    rWho: "María García · Customer Support Supervisor · Reviewed 12 Feb",
    rScore: ["87", "overall score"],
    rConfidence: ["High", "confidence"],
    rCoverage: ["3/3", "assessments"],
    rEvidenceTitle: "Evidence",
    rEvidence: [
      { tag: "Favorable", tone: "strong", text: "Top-quartile decision quality under time pressure across both cognitive instruments." },
      { tag: "Favorable", tone: "strong", text: "Communication profile matches customer-facing escalation work." },
      { tag: "Risk", tone: "risk", text: "Limited evidence on delegation; validate in interview before a team-lead scope." },
    ],
    rInterviewTitle: "Interview guide",
    rInterview: "Ask for a concrete case of handling an escalated customer while balancing speed, empathy, and policy constraints.",
  },
  es: {
    heroTitle: "Decisiones de contratación, respaldadas por evidencia.",
    heroBody:
      "Aplique evaluaciones validadas, revise cada candidato en una sola cola y cierre cada búsqueda con un informe ejecutivo sobre el que su equipo puede actuar.",
    heroPrimary: "Comenzar prueba gratuita",
    heroSecondary: "Ver un informe de ejemplo",
    heroMicro: "14 días de prueba · Sin tarjeta · Los candidatos no crean cuentas",

    workKicker: "El espacio de trabajo",
    workTitle: "Sepa a quién revisar ahora, y por qué.",
    workBody:
      "Invitaciones, evaluaciones completadas y resultados llegan a una sola cola, ordenada por evidencia — la mañana empieza con decisiones, no con triaje.",

    reportKicker: "El informe ejecutivo",
    reportTitle: "Cada evaluación termina en una decisión.",
    reportBody:
      "Una página por candidato: la recomendación, la evidencia que la respalda y las preguntas de entrevista para validarla. Estructurado para decidir, no para exportar datos.",

    pricingTitle: "Empiece gratis. Amplíe cuando el equipo crezca.",
    pricingBody: "Todos los planes empiezan con 14 días de prueba. Sin tarjeta de crédito.",
    plans: [
      { name: "Starter", price: "49 €", period: "/mes", body: "1 recruiter · 50 invitaciones · 2 proyectos", cta: "Empezar con Starter", highlight: false },
      { name: "Professional", price: "149 €", period: "/mes", body: "5 recruiters · 250 invitaciones · 10 proyectos", cta: "Empezar con Professional", highlight: true, tag: "La mayoría de equipos" },
      { name: "Enterprise", price: "A medida", period: "", body: "Uso ilimitado · Soporte prioritario · Configuración guiada", cta: "Contactar ventas", highlight: false },
    ],

    securityTitle: "Diseñado para custodiar datos de candidatos.",
    securityItems: [
      ["Workspaces aislados", "Los candidatos, resultados e informes de cada empresa viven en un workspace estrictamente separado."],
      ["Enlaces que caducan", "Los candidatos reciben enlaces tokenizados, válidos durante siete días. Nunca crean cuentas."],
      ["Evidencia, no rastreo", "Los informes se construyen solo con las evaluaciones que completan sus candidatos — nada más."],
      ["Bilingüe por diseño", "La experiencia completa — evaluaciones, workspace e informes — funciona en español e inglés."],
    ],

    mGreeting: "Buenos días, Elena",
    mBrief: "3 candidatos esperan revisión · 2 invitaciones caducan hoy",
    mStats: [
      ["3", "por revisar"],
      ["2", "en entrevista"],
      ["4", "contrataciones este mes"],
    ],
    mQueueTitle: "Cola de revisión",
    mRows: [
      { name: "María García", meta: "Supervisora de Atención al Cliente · 3/3 evaluaciones · espera 2 h", verdict: "Sólido", tone: "strong" },
      { name: "Daniel Ortiz", meta: "Desarrollo de Ventas · 3/3 evaluaciones · espera 5 h", verdict: "Avanzar", tone: "proceed" },
      { name: "Anna Keller", meta: "Analista Administrativa · 2/3 evaluaciones · espera 26 h", verdict: "Revisar", tone: "review" },
    ],
    mReview: "Revisar",

    rEyebrow: "Informe ejecutivo",
    rVerdict: "Avanzar",
    rHeadline: "Evidencia consistente de sólido juicio analítico.",
    rWho: "María García · Supervisora de Atención al Cliente · Revisado 12 feb",
    rScore: ["87", "puntuación global"],
    rConfidence: ["Alta", "confianza"],
    rCoverage: ["3/3", "evaluaciones"],
    rEvidenceTitle: "Evidencia",
    rEvidence: [
      { tag: "Favorable", tone: "strong", text: "Calidad de decisión en el cuartil superior bajo presión de tiempo en ambos instrumentos cognitivos." },
      { tag: "Favorable", tone: "strong", text: "El perfil de comunicación encaja con trabajo de escalaciones de cara al cliente." },
      { tag: "Riesgo", tone: "risk", text: "Evidencia limitada sobre delegación; validar en entrevista antes de un alcance de liderazgo." },
    ],
    rInterviewTitle: "Guía de entrevista",
    rInterview: "Pida un caso concreto de gestión de un cliente escalado equilibrando rapidez, empatía y límites de política.",
  },
} satisfies Record<AppLocale, Record<string, unknown>>;

const VERDICT_TONE: Record<string, string> = {
  strong: "border-[rgba(22,163,74,0.25)] bg-[rgba(22,163,74,0.07)] text-[#15803d]",
  proceed: "border-[rgba(22,163,74,0.25)] bg-[rgba(22,163,74,0.07)] text-[#15803d]",
  review: "border-[rgba(217,119,6,0.28)] bg-[rgba(217,119,6,0.07)] text-[#b45309]",
  risk: "border-[rgba(220,38,38,0.25)] bg-[rgba(220,38,38,0.06)] text-[#b91c1c]",
};

export default async function Home() {
  const locale = toAppLocale(await getLocale());
  const publicCopy = getPublicCopy(locale);
  const t = content[locale];

  return (
    <main className="min-h-screen bg-[var(--it-bg)] text-[var(--it-text)]">
      <PublicHeader copy={publicCopy} />

      {/* 1 · Hero — what is this? */}
      <section className="border-b border-[var(--it-hairline)] bg-white">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 sm:py-28">
          <h1 className="font-editorial text-balance text-[2.75rem] font-medium leading-[1.1] text-[var(--it-text)] sm:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--it-muted)]">{t.heroBody}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={localePath("/signup", locale)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--it-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--it-primary-hover)]"
            >
              {t.heroPrimary}
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
            <a
              href="#report"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--it-border)] bg-white px-6 py-3 text-sm font-semibold text-[#374151] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-[var(--it-surface-muted)]"
            >
              {t.heroSecondary}
            </a>
          </div>
          <p className="mt-6 text-[13px] text-[var(--it-faint)]">{t.heroMicro}</p>
        </div>
      </section>

      {/* 2 · Workspace — what will I use? */}
      <section id="product" className="scroll-mt-20 border-b border-[var(--it-hairline)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--it-link)]">{t.workKicker}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--it-text)] sm:text-4xl">{t.workTitle}</h2>
            <p className="mt-4 text-base leading-7 text-[var(--it-muted)]">{t.workBody}</p>
          </div>
          <div className="mt-12">
            <WorkspaceFrame t={t} />
          </div>
        </div>
      </section>

      {/* 3 · Executive report — why is this different? (the climax) */}
      <section id="report" className="scroll-mt-20 border-b border-[var(--it-hairline)] bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--it-link)]">{t.reportKicker}</p>
            <h2 className="font-editorial mt-3 text-balance text-3xl font-medium text-[var(--it-text)] sm:text-[2.6rem] sm:leading-tight">
              {t.reportTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--it-muted)]">{t.reportBody}</p>
          </div>
          <div className="mx-auto mt-14 max-w-4xl">
            <ReportFrame t={t} />
          </div>
        </div>
      </section>

      {/* 4 · Pricing — how do I start? */}
      <section id="pricing" className="scroll-mt-20 border-b border-[var(--it-hairline)] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--it-text)] sm:text-4xl">{t.pricingTitle}</h2>
            <p className="mt-4 text-base leading-7 text-[var(--it-muted)]">{t.pricingBody}</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {t.plans.map((plan) => (
              <article
                key={plan.name}
                className={`flex flex-col rounded-xl border bg-white p-6 ${
                  plan.highlight
                    ? "border-[var(--it-primary)]/40 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-16px_rgba(79,70,229,0.25)]"
                    : "border-[var(--it-hairline)] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[var(--it-text)]">{plan.name}</h3>
                  {"tag" in plan && plan.tag ? (
                    <span className="rounded-full border border-[var(--it-primary)]/30 bg-[var(--it-primary-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--it-link)]">
                      {plan.tag}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight text-[var(--it-text)]">{plan.price}</span>
                  {plan.period ? <span className="text-sm text-[var(--it-muted)]">{plan.period}</span> : null}
                </p>
                <p className="mt-3 flex-1 text-sm leading-6 text-[var(--it-muted)]">{plan.body}</p>
                <Link
                  href={plan.name === "Enterprise" ? localePath("/contact", locale) : localePath("/signup", locale)}
                  className={
                    plan.highlight
                      ? "mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[var(--it-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--it-primary-hover)]"
                      : "mt-6 inline-flex w-full items-center justify-center rounded-lg border border-[var(--it-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-[var(--it-surface-muted)]"
                  }
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Security — can I trust it? */}
      <section id="security" className="scroll-mt-20 border-b border-[var(--it-hairline)] bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-[var(--it-text)] sm:text-4xl">
            {t.securityTitle}
          </h2>
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {t.securityItems.map(([title, body]) => (
              <div key={title} className="border-t border-[var(--it-hairline)] pt-5">
                <h3 className="text-sm font-semibold text-[var(--it-text)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--it-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Footer — where do I go next? */}
      <PublicFooter copy={publicCopy} />
    </main>
  );
}

type Copy = (typeof content)["en"];

/** The workspace as it actually renders: greeting, workload, review queue. */
function WorkspaceFrame({ t }: { t: Copy }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--it-hairline)] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05),0_24px_48px_-24px_rgba(16,24,40,0.15)]">
      <div className="flex items-center gap-1.5 border-b border-[var(--it-hairline)] bg-[var(--it-surface-muted)] px-4 py-3" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e5e7eb]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e5e7eb]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e5e7eb]" />
        <span className="ml-3 hidden rounded-md bg-white px-3 py-1 text-[11px] text-[var(--it-faint)] ring-1 ring-[var(--it-hairline)] sm:inline-block">
          app.intelligencestest.com/dashboard
        </span>
      </div>
      <div className="grid lg:grid-cols-[200px_1fr]">
        <div className="hidden border-r border-[var(--it-hairline)] bg-white p-4 lg:block" aria-hidden="true">
          <div className="space-y-1 text-[13px] font-medium">
            <p className="rounded-md bg-gray-900/[0.055] px-3 py-1.5 text-[var(--it-text)]">Dashboard</p>
            <p className="px-3 py-1.5 text-[var(--it-muted)]">Inbox</p>
          </div>
          <p className="mt-5 mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--it-faint)]">Pipeline</p>
          <div className="space-y-1 text-[13px] font-medium text-[var(--it-muted)]">
            <p className="px-3 py-1.5">Projects</p>
            <p className="px-3 py-1.5">Candidates</p>
            <p className="px-3 py-1.5">Assessments</p>
          </div>
          <p className="mt-5 mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--it-faint)]">Insight</p>
          <p className="px-3 py-1.5 text-[13px] font-medium text-[var(--it-muted)]">Reports</p>
        </div>
        <div className="bg-[var(--it-bg)] p-6 sm:p-8">
          <p className="font-editorial text-2xl font-medium text-[var(--it-text)]">{t.mGreeting}</p>
          <p className="mt-1.5 text-sm text-[var(--it-muted)]">{t.mBrief}</p>

          <div className="mt-6 flex items-start gap-10 border-t border-[var(--it-hairline)] pt-5">
            {t.mStats.map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-semibold tabular-nums text-[var(--it-text)]">{value}</p>
                <p className="mt-0.5 text-[13px] text-[var(--it-muted)]">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-[var(--it-hairline)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <p className="border-b border-[var(--it-hairline)] px-5 py-3.5 text-sm font-semibold text-[var(--it-text)]">
              {t.mQueueTitle}
            </p>
            {t.mRows.map((row) => (
              <div key={row.name} className="flex items-center gap-4 border-b border-[var(--it-border-soft)] px-5 py-4 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--it-text)]">{row.name}</p>
                  <p className="mt-0.5 truncate text-[13px] text-[var(--it-muted)]">{row.meta}</p>
                </div>
                <span className={`inline-flex flex-shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${VERDICT_TONE[row.tone]}`}>
                  {row.verdict}
                </span>
                <span className="hidden flex-shrink-0 text-[13px] font-medium text-[var(--it-link)] sm:inline">{t.mReview} →</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The executive report as a document: verdict, evidence, interview guide. */
function ReportFrame({ t }: { t: Copy }) {
  return (
    <div className="rounded-2xl border border-[var(--it-hairline)] bg-white p-7 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_24px_48px_-24px_rgba(16,24,40,0.15)] sm:p-10">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--it-faint)]">{t.rEyebrow}</p>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${VERDICT_TONE.proceed}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" aria-hidden="true" />
          {t.rVerdict}
        </span>
      </div>
      <h3 className="font-editorial mt-4 max-w-2xl text-balance text-2xl font-medium leading-snug text-[var(--it-text)] sm:text-[2rem]">
        {t.rHeadline}
      </h3>
      <p className="mt-3 text-sm text-[var(--it-muted)]">{t.rWho}</p>

      <div className="mt-7 flex flex-wrap items-start gap-x-12 gap-y-5 border-y border-[var(--it-hairline)] py-6">
        {[t.rScore, t.rConfidence, t.rCoverage].map(([value, label]) => (
          <div key={label}>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-[var(--it-text)]">{value}</p>
            <p className="mt-1 text-[13px] text-[var(--it-muted)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--it-faint)]">{t.rEvidenceTitle}</p>
          <ul className="mt-4 space-y-4">
            {t.rEvidence.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className={`mt-0.5 inline-flex flex-shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${VERDICT_TONE[item.tone]}`}>
                  {item.tag}
                </span>
                <p className="text-sm leading-6 text-[#374151]">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-[var(--it-hairline)] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--it-faint)]">{t.rInterviewTitle}</p>
          <p className="mt-4 text-sm leading-6 text-[#374151]">{t.rInterview}</p>
        </div>
      </div>
    </div>
  );
}
