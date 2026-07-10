"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLogo";
import {
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  LANGUAGE_OVERRIDE_COOKIE,
  LANGUAGE_OVERRIDE_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  localePath,
  toAppLocale,
} from "@/lib/i18n/locales";

const INDUSTRIES = [
  { value: "Recruitment Agency", en: "Recruitment agency", es: "Agencia de reclutamiento" },
  { value: "Call Center / BPO", en: "Call center / BPO", es: "Call center / BPO" },
  { value: "SME / Startup", en: "SME / Startup", es: "Pyme / Startup" },
  { value: "Consulting Firm", en: "Consulting firm", es: "Consultora" },
  { value: "Enterprise HR", en: "Enterprise HR", es: "RR. HH. corporativo" },
  { value: "Other", en: "Other", es: "Otro" },
] as const;

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-1000", label: "201-1000" },
  { value: "1000+", label: "1000+" },
] as const;

const HIRING_VOLUMES = [
  { value: "1-3", label: "1-3" },
  { value: "4-10", label: "4-10" },
  { value: "11-25", label: "11-25" },
  { value: "26-50", label: "26-50" },
  { value: "50+", label: "50+" },
] as const;

const LANGUAGES = [
  { value: "es", labelKey: "spanish", code: "ES" },
  { value: "en", labelKey: "english", code: "EN" },
] as const;

type NextAction = "project" | "dashboard";

type OnboardingForm = {
  company_name: string;
  industry: string;
  company_size: string;
  hires_per_month: string;
  language: "en" | "es";
  next_action: NextAction;
};

export default function OnboardingPage() {
  const router = useRouter();
  const language = useTranslations("language");
  const locale = useLocale();
  const initialLocale = toAppLocale(locale);
  const es = initialLocale === "es";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>({
    company_name: "",
    industry: "",
    company_size: "",
    hires_per_month: "",
    language: initialLocale,
    next_action: "project",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const copy = es
    ? {
        eyebrow: "Configuracion inicial",
        welcomeTitle: "Configure su espacio de evaluacion.",
        welcomeBody:
          "En menos de un minuto dejaremos lista la cuenta para crear el primer proyecto, invitar candidatos y revisar informes ejecutivos.",
        included: ["14 dias de prueba", "2 proyectos", "10 invitaciones de candidatos"],
        start: "Comenzar configuracion",
        companyTitle: "Empresa",
        companyBody: "Estos datos ayudan a adaptar el espacio a su operacion de seleccion.",
        companyName: "Nombre de la empresa",
        companyPlaceholder: "Acme Recruitment Ltd",
        industry: "Industria",
        profileTitle: "Volumen de contratacion",
        profileBody: "Use esta informacion para priorizar limites, soporte y futuras recomendaciones.",
        companySize: "Tamano de empresa",
        hiresPerMonth: "Contrataciones al mes",
        languageTitle: "Idioma y siguiente paso",
        languageBody: "El idioma se aplicara al panel, invitaciones, evaluaciones e informes.",
        language: "Idioma de evaluacion",
        afterSetup: "Despues de configurar",
        createProject: "Crear el primer proyecto",
        createProjectHint: "Recomendado para ver valor de inmediato.",
        dashboard: "Ir al panel",
        dashboardHint: "Revisar el espacio antes de crear proyectos.",
        back: "Volver",
        next: "Continuar",
        finish: "Finalizar configuracion",
        saving: "Guardando...",
        requiredFields: "Complete los campos obligatorios antes de continuar.",
        genericError: "Algo salio mal. Intente de nuevo.",
        stepLabel: (current: number, total: number) => `Paso ${current} de ${total}`,
      }
    : {
        eyebrow: "Initial setup",
        welcomeTitle: "Set up your assessment workspace.",
        welcomeBody:
          "In less than a minute, we will prepare the account to create the first project, invite candidates, and review executive reports.",
        included: ["14-day trial", "2 projects", "10 candidate invitations"],
        start: "Start setup",
        companyTitle: "Company",
        companyBody: "These details help tailor the workspace to your hiring operation.",
        companyName: "Company name",
        companyPlaceholder: "Acme Recruitment Ltd",
        industry: "Industry",
        profileTitle: "Hiring volume",
        profileBody: "Use this information to prioritize limits, support, and future recommendations.",
        companySize: "Company size",
        hiresPerMonth: "Hires per month",
        languageTitle: "Language and next step",
        languageBody: "The language applies to the dashboard, invitations, assessments, and reports.",
        language: "Assessment language",
        afterSetup: "After setup",
        createProject: "Create the first project",
        createProjectHint: "Recommended to see value immediately.",
        dashboard: "Go to dashboard",
        dashboardHint: "Review the workspace before creating projects.",
        back: "Back",
        next: "Continue",
        finish: "Finish setup",
        saving: "Saving...",
        requiredFields: "Complete the required fields before continuing.",
        genericError: "Something went wrong. Please try again.",
        stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
      };

  const totalSteps = 4;
  const canContinue =
    step === 0 ||
    (step === 1 && Boolean(form.company_name.trim()) && Boolean(form.industry)) ||
    (step === 2 && Boolean(form.company_size) && Boolean(form.hires_per_month)) ||
    step === 3;

  const goNext = () => {
    setError("");
    if (!canContinue) {
      setError(copy.requiredFields);
      return;
    }
    setStep((current) => Math.min(totalSteps - 1, current + 1));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.company_name.trim() || !form.industry || !form.company_size || !form.hires_per_month) {
      setError(copy.requiredFields);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: form.company_name.trim(),
        industry: form.industry,
        company_size: form.company_size,
        hires_per_month: form.hires_per_month,
        language: form.language,
      }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? copy.genericError);
      return;
    }

    document.cookie = `${LANGUAGE_COOKIE}=${form.language}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
    document.cookie = `${LANGUAGE_OVERRIDE_COOKIE}=1; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, form.language);
    window.localStorage.setItem(LANGUAGE_OVERRIDE_STORAGE_KEY, "1");

    const destination = form.next_action === "project" ? "/projects/new" : "/dashboard";
    router.push(localePath(destination, toAppLocale(form.language)));
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--it-bg)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col justify-center">
        <div className="mb-8 flex items-center justify-center">
          <BrandLockup
            subtitle={es ? "Plataforma de evaluacion" : "Assessment Platform"}
            markClassName="h-10 w-10"
            titleClassName="tracking-normal"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--it-hairline)] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05),0_18px_45px_-24px_rgba(16,24,40,0.22)]">
          <div className="border-b border-[var(--it-hairline)] px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--it-faint)]">
                {copy.eyebrow}
              </p>
              <p className="text-xs font-medium text-[var(--it-muted)]">{copy.stepLabel(step + 1, totalSteps)}</p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full ${index <= step ? "bg-[var(--it-primary)]" : "bg-[var(--it-border-soft)]"}`}
                />
              ))}
            </div>
          </div>

          <div className="grid min-h-[430px] lg:grid-cols-[0.82fr_1.18fr]">
            <aside className="border-b border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-6 lg:border-b-0 lg:border-r">
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <p className="text-sm font-semibold text-[var(--it-primary-hover)]">
                    {step === 0
                      ? copy.eyebrow
                      : step === 1
                        ? copy.companyTitle
                        : step === 2
                          ? copy.profileTitle
                          : copy.languageTitle}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-[-0.01em] text-[var(--it-text)]">
                    {step === 0
                      ? copy.welcomeTitle
                      : step === 1
                        ? copy.companyTitle
                        : step === 2
                          ? copy.profileTitle
                          : copy.languageTitle}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-[var(--it-muted)]">
                    {step === 0
                      ? copy.welcomeBody
                      : step === 1
                        ? copy.companyBody
                        : step === 2
                          ? copy.profileBody
                          : copy.languageBody}
                  </p>
                </div>

                <div className="space-y-3">
                  {copy.included.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-medium text-[var(--it-text)]">
                      <CheckCircle2 className="h-4 w-4 text-[var(--it-success)]" strokeWidth={1.8} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="p-6">
              {error ? (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#b91c1c]">
                  {error}
                </div>
              ) : null}

              {step === 0 ? (
                <div className="flex h-full flex-col justify-center">
                  <p className="text-sm leading-6 text-[var(--it-muted)]">
                    {copy.welcomeBody}
                  </p>
                  <button
                    type="button"
                    onClick={goNext}
                    className="enterprise-button mt-8 inline-flex w-fit items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
                  >
                    {copy.start}
                    <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--it-text)]">
                      {copy.companyName}
                    </label>
                    <input
                      autoFocus
                      required
                      value={form.company_name}
                      onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                      placeholder={copy.companyPlaceholder}
                      className="w-full rounded-lg border border-[var(--it-border)] bg-white px-4 py-3 text-sm text-[var(--it-text)] outline-none placeholder:text-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/20"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-[var(--it-text)]">{copy.industry}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {INDUSTRIES.map((industry) => (
                        <ChoiceButton
                          key={industry.value}
                          selected={form.industry === industry.value}
                          onClick={() => setForm((f) => ({ ...f, industry: industry.value }))}
                        >
                          {es ? industry.es : industry.en}
                        </ChoiceButton>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-6">
                  <div>
                    <p className="mb-2 text-sm font-medium text-[var(--it-text)]">{copy.companySize}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {COMPANY_SIZES.map((size) => (
                        <ChoiceButton
                          key={size.value}
                          selected={form.company_size === size.value}
                          centered
                          onClick={() => setForm((f) => ({ ...f, company_size: size.value }))}
                        >
                          {size.label}
                        </ChoiceButton>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-[var(--it-text)]">{copy.hiresPerMonth}</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {HIRING_VOLUMES.map((volume) => (
                        <ChoiceButton
                          key={volume.value}
                          selected={form.hires_per_month === volume.value}
                          centered
                          onClick={() => setForm((f) => ({ ...f, hires_per_month: volume.value }))}
                        >
                          {volume.label}
                        </ChoiceButton>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-6">
                  <div>
                    <p className="mb-2 text-sm font-medium text-[var(--it-text)]">{copy.language}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {LANGUAGES.map((lang) => (
                        <ChoiceButton
                          key={lang.value}
                          selected={form.language === lang.value}
                          onClick={() => setForm((f) => ({ ...f, language: lang.value }))}
                        >
                          <span className="flex w-full items-center justify-between gap-3">
                            <span>{language(lang.labelKey)}</span>
                            <span className="rounded-md border border-[var(--it-hairline)] bg-white px-2 py-1 text-xs font-semibold">
                              {lang.code}
                            </span>
                          </span>
                        </ChoiceButton>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-[var(--it-text)]">{copy.afterSetup}</p>
                    <div className="grid gap-2">
                      <ChoiceButton
                        selected={form.next_action === "project"}
                        onClick={() => setForm((f) => ({ ...f, next_action: "project" }))}
                      >
                        <span>
                          <span className="block font-semibold">{copy.createProject}</span>
                          <span className="mt-0.5 block text-xs font-normal text-[var(--it-muted)]">{copy.createProjectHint}</span>
                        </span>
                      </ChoiceButton>
                      <ChoiceButton
                        selected={form.next_action === "dashboard"}
                        onClick={() => setForm((f) => ({ ...f, next_action: "dashboard" }))}
                      >
                        <span>
                          <span className="block font-semibold">{copy.dashboard}</span>
                          <span className="mt-0.5 block text-xs font-normal text-[var(--it-muted)]">{copy.dashboardHint}</span>
                        </span>
                      </ChoiceButton>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          {step > 0 ? (
            <div className="flex items-center justify-between border-t border-[var(--it-hairline)] px-6 py-4">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--it-muted)] transition-colors hover:bg-gray-900/[0.035] hover:text-[var(--it-text)]"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
                {copy.back}
              </button>
              {step < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue}
                  className="enterprise-button inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {copy.next}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="enterprise-button inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
                >
                  {loading ? copy.saving : copy.finish}
                  {!loading ? <ArrowRight className="h-4 w-4" strokeWidth={1.8} /> : null}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChoiceButton({
  selected,
  centered = false,
  onClick,
  children,
}: {
  selected: boolean;
  centered?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors ${
        centered ? "text-center" : ""
      } ${
        selected
          ? "border-[var(--it-primary)] bg-[var(--it-primary-soft)] text-[var(--it-primary-hover)]"
          : "border-[var(--it-hairline)] bg-white text-[var(--it-text)] hover:border-[var(--it-border)] hover:bg-[var(--it-surface-muted)]"
      }`}
    >
      {children}
    </button>
  );
}
