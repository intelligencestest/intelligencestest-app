import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/PublicSite";
import { localePath, toAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { getPublicCopy } from "@/lib/public-site-copy";

const content = {
  es: {
    heroEyebrow: "IntelligencesTest App",
    headline: "La plataforma de evaluación de candidatos para empresas",
    subheadline:
      "Evalúe habilidades, personalidad y competencias antes de la entrevista con informes ejecutivos basados en evidencia.",
    primary: "Comenzar prueba gratuita",
    secondary: "Iniciar sesión",
    trust: ["30+ evaluaciones profesionales", "Informes ejecutivos", "Multi-idioma", "Seguridad empresarial"],
    flowEyebrow: "Producto interactivo",
    flowTitle: "Vea el sistema que usará cada día",
    flowBody: "No es una página de marketing larga. Es una vista directa del flujo de trabajo: proyecto, candidato, evaluación e informe.",
    steps: [
      ["Dashboard", "Prioridades, proyectos y candidatos que requieren atención."],
      ["Candidato", "Estado, invitación, puntuación, recomendación y notas."],
      ["Evaluación", "Biblioteca por categoría, duración y señales medidas."],
      ["Informe ejecutivo", "Recomendación, confianza, evidencia y guía de entrevista."],
    ],
    howTitle: "Cómo funciona",
    how: [
      ["Crear proyecto", "Defina el rol, el equipo y las evaluaciones necesarias."],
      ["Invitar candidatos", "Envíe enlaces seguros sin pedirles crear una cuenta."],
      ["Completar evaluaciones", "Los candidatos responden desde una experiencia simple y guiada."],
      ["Revisar informes", "Compare señales, riesgos y preguntas de entrevista."],
    ],
    modulesTitle: "Módulos del producto",
    modules: [
      ["Dashboard", "Qué requiere atención hoy."],
      ["Candidatos", "Pipeline, estado, resultados y notas."],
      ["Proyectos", "Campañas de contratación por rol o cliente."],
      ["Biblioteca de evaluaciones", "Cognitivo, personalidad, liderazgo, skills y comportamiento."],
      ["Informes ejecutivos", "Decisión, evidencia y guía para entrevista."],
      ["Billing", "Trial, límites, plan y suscripción."],
    ],
    reportTitle: "El informe ejecutivo es el producto",
    reportBody:
      "La exportación PDF queda como salida secundaria. La experiencia principal vive dentro de la plataforma, donde el equipo revisa evidencia y decide el siguiente paso.",
    pricingTitle: "Planes para empezar y escalar",
    pricing: [
      ["Trial", "14 días gratis", "Para probar el flujo completo.", "Comenzar"],
      ["Starter", "49 €/mes", "1 recruiter, 50 invitaciones y 2 proyectos.", "Empezar Starter"],
      ["Professional", "149 €/mes", "5 recruiters, 250 invitaciones y 10 proyectos.", "Empezar Professional"],
      ["Enterprise", "Contact Sales", "Límites, soporte y configuración a medida.", "Contactar ventas"],
    ],
    securityTitle: "Seguridad y confianza operacional",
    security: ["Enlaces seguros para candidatos", "Workspace por empresa", "Experiencia ES/EN", "Diseñado para equipos de RR. HH."],
    faqTitle: "Preguntas rápidas",
    faq: [
      ["¿Esto reemplaza WordPress?", "No. WordPress vende y educa. Esta página muestra qué se usa dentro del producto."],
      ["¿Los usuarios registrados ven esta página?", "No. Si ya tienen sesión, van directo al dashboard."],
      ["¿El informe es solo un PDF?", "No. El informe principal vive dentro de la plataforma; PDF es exportación."],
    ],
  },
  en: {
    heroEyebrow: "IntelligencesTest App",
    headline: "The candidate assessment platform for companies",
    subheadline:
      "Evaluate skills, personality, and workplace competencies before the interview with evidence-based executive reports.",
    primary: "Start free trial",
    secondary: "Log in",
    trust: ["30+ professional assessments", "Executive reports", "Multi-language", "Enterprise security"],
    flowEyebrow: "Interactive product",
    flowTitle: "See the system you will use every day",
    flowBody: "This is not a long marketing page. It is a direct view of the workflow: project, candidate, assessment, and report.",
    steps: [
      ["Dashboard", "Priorities, projects, and candidates that need attention."],
      ["Candidate", "Status, invitation, score, recommendation, and notes."],
      ["Assessment", "Library by category, duration, and measured signals."],
      ["Executive report", "Recommendation, confidence, evidence, and interview guide."],
    ],
    howTitle: "How it works",
    how: [
      ["Create project", "Define the role, team, and assessment battery."],
      ["Invite candidates", "Send secure links without asking candidates to create accounts."],
      ["Complete assessments", "Candidates answer through a simple guided experience."],
      ["Review reports", "Compare signals, risks, and interview questions."],
    ],
    modulesTitle: "Product modules",
    modules: [
      ["Dashboard", "What needs attention today."],
      ["Candidates", "Pipeline, status, results, and notes."],
      ["Projects", "Hiring campaigns by role or client."],
      ["Assessment library", "Cognitive, personality, leadership, skills, and behavior."],
      ["Executive reports", "Decision, evidence, and interview guidance."],
      ["Billing", "Trial, limits, plan, and subscription."],
    ],
    reportTitle: "The executive report is the product",
    reportBody:
      "PDF export stays secondary. The primary experience lives in the platform, where the team reviews evidence and decides the next step.",
    pricingTitle: "Plans to start and scale",
    pricing: [
      ["Trial", "14 days free", "Test the complete workflow.", "Start"],
      ["Starter", "€49/month", "1 recruiter, 50 invitations, and 2 projects.", "Start Starter"],
      ["Professional", "€149/month", "5 recruiters, 250 invitations, and 10 projects.", "Start Professional"],
      ["Enterprise", "Contact Sales", "Custom limits, support, and setup.", "Contact sales"],
    ],
    securityTitle: "Operational security and trust",
    security: ["Secure candidate links", "Company workspace isolation", "ES/EN experience", "Built for HR teams"],
    faqTitle: "Quick FAQ",
    faq: [
      ["Does this replace WordPress?", "No. WordPress sells and educates. This page shows what users work with inside the product."],
      ["Do logged-in users see this page?", "No. If they have a session, they go straight to the dashboard."],
      ["Is the report only a PDF?", "No. The main report lives inside the platform; PDF is an export."],
    ],
  },
} satisfies Record<AppLocale, {
  heroEyebrow: string;
  headline: string;
  subheadline: string;
  primary: string;
  secondary: string;
  trust: string[];
  flowEyebrow: string;
  flowTitle: string;
  flowBody: string;
  steps: Array<[string, string]>;
  howTitle: string;
  how: Array<[string, string]>;
  modulesTitle: string;
  modules: Array<[string, string]>;
  reportTitle: string;
  reportBody: string;
  pricingTitle: string;
  pricing: Array<[string, string, string, string]>;
  securityTitle: string;
  security: string[];
  faqTitle: string;
  faq: Array<[string, string]>;
}>;

const moduleIcons = [Gauge, Users, FolderKanban, ClipboardCheck, FileText, BarChart3] as const;

export default async function Home() {
  const locale = toAppLocale(await getLocale());
  const publicCopy = getPublicCopy(locale);
  const t = content[locale];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-700">
      <PublicHeader copy={publicCopy} />

      <section className="border-b border-[#e5e7eb] bg-[#f8fafc]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4f46e5]">{t.heroEyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#111827] sm:text-5xl lg:text-[3.6rem] lg:leading-[1.02]">
              {t.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#6b7280] sm:text-lg">
              {t.subheadline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={localePath("/signup", locale)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730a3]"
              >
                {t.primary}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href={localePath("/login", locale)}
                className="inline-flex items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-5 py-3 text-sm font-semibold text-[#374151] shadow-sm transition hover:bg-[#f3f4f6]"
              >
                {t.secondary}
              </Link>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {t.trust.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-[#4b5563]">
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a]" strokeWidth={2} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section id="product" className="scroll-mt-20 border-b border-[#e5e7eb] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4f46e5]">{t.flowEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">{t.flowTitle}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6b7280]">{t.flowBody}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {t.steps.map(([title, body], index) => (
                <article key={title} className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4">
                  <p className="text-xs font-semibold text-[#4f46e5]">0{index + 1}</p>
                  <h3 className="mt-3 text-sm font-semibold text-[#111827]">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#6b7280]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e5e7eb] bg-[#f8fafc] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">{t.howTitle}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.how.map(([title, body], index) => (
              <article key={title} className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-sm font-semibold text-[#4f46e5]">
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#e5e7eb] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">{t.modulesTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.modules.map(([title, body], index) => {
              const Icon = moduleIcons[index] ?? Gauge;
              return (
                <article key={title} className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
                  <Icon className="h-5 w-5 text-[#4f46e5]" strokeWidth={1.8} />
                  <h3 className="mt-5 text-base font-semibold text-[#111827]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">{body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[#e5e7eb] bg-[#111827] py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a5b4fc]">Executive Report</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t.reportTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">{t.reportBody}</p>
          </div>
          <ExecutiveReportPreview />
        </div>
      </section>

      <section id="pricing" className="scroll-mt-20 border-b border-[#e5e7eb] bg-[#f8fafc] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">{t.pricingTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {t.pricing.map(([name, price, body, cta]) => {
              const enterprise = name === "Enterprise";
              return (
                <article key={name} className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-[#111827]">{name}</h3>
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-[#111827]">{price}</p>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#6b7280]">{body}</p>
                  <Link
                    href={enterprise ? localePath("/contact", locale) : localePath("/signup", locale)}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3730a3]"
                  >
                    {cta}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="security" className="scroll-mt-20 border-b border-[#e5e7eb] bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:px-8">
          <div>
            <ShieldCheck className="h-8 w-8 text-[#4f46e5]" strokeWidth={1.8} />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#111827]">{t.securityTitle}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {t.security.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm font-medium text-[#374151]">
                <LockKeyhole className="h-4 w-4 text-[#4f46e5]" strokeWidth={1.8} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#111827]">{t.faqTitle}</h2>
          <div className="mt-8 space-y-3">
            {t.faq.map(([question, answer]) => (
              <details key={question} className="rounded-lg border border-[#e5e7eb] bg-white p-5">
                <summary className="cursor-pointer list-none text-sm font-semibold text-[#111827]">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-[#6b7280]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter copy={publicCopy} />
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="rounded-2xl border border-[#d1d5db] bg-white p-3 shadow-2xl shadow-slate-900/10">
      <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc]">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Hiring OS</p>
            <p className="text-xs text-[#6b7280]">Dashboard, candidate, assessment, report</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-3">
            {["Dashboard", "Candidates", "Assessments", "Reports"].map((item, index) => (
              <div key={item} className={`rounded-lg border p-3 text-sm font-semibold ${index === 0 ? "border-[#c7d2fe] bg-[#eef2ff] text-[#3730a3]" : "border-[#e5e7eb] bg-white text-[#374151]"}`}>
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Today</p>
                <p className="mt-1 text-xl font-semibold text-[#111827]">6 candidates need review</p>
              </div>
              <Gauge className="h-7 w-7 text-[#4f46e5]" strokeWidth={1.8} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["84%", "completion"],
                ["18", "active"],
                ["4", "projects"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
                  <p className="text-xl font-semibold text-[#111827]">{value}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {[
                ["Sales Representatives", "3 reports ready", "Review"],
                ["Customer Service", "5 invitations expiring", "Attention"],
              ].map(([role, body, badge]) => (
                <div key={role} className="rounded-lg border border-[#e5e7eb] bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{role}</p>
                      <p className="mt-1 text-xs text-[#6b7280]">{body}</p>
                    </div>
                    <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-xs font-semibold text-[#3730a3]">{badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecutiveReportPreview() {
  const rows = [
    ["Recommendation", "Advance to structured interview"],
    ["Confidence", "High"],
    ["Main strength", "Decision quality under pressure"],
    ["Risk", "Needs deeper customer escalation probe"],
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white p-4 text-[#111827] shadow-2xl shadow-black/25">
      <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-5">
        <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4f46e5]">Executive Summary</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">María García</h3>
            <p className="mt-1 text-sm text-[#6b7280]">Customer Service Supervisor</p>
          </div>
          <div className="rounded-lg bg-[#dcfce7] px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Recommendation</p>
            <p className="mt-1 text-sm font-semibold text-emerald-800">Advance</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Confidence</p>
            <p className="mt-3 text-4xl font-semibold text-[#111827]">87%</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
              <div className="h-full w-[87%] rounded-full bg-[#4f46e5]" />
            </div>
          </div>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Evidence</p>
            <div className="mt-4 space-y-3">
              {rows.map(([label, value]) => (
                <div key={label} className="grid gap-2 border-b border-[#f3f4f6] pb-3 text-sm last:border-0 last:pb-0 sm:grid-cols-[150px_1fr]">
                  <span className="font-medium text-[#6b7280]">{label}</span>
                  <span className="font-semibold text-[#111827]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-[#e5e7eb] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Interview Guide</p>
          <p className="mt-3 text-sm leading-6 text-[#374151]">
            Ask for a concrete example of handling an angry customer while balancing speed, empathy, and policy constraints.
          </p>
        </div>
      </div>
    </div>
  );
}
