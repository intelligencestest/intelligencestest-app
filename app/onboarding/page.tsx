"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  "Recruitment Agency",
  "Call Center / BPO",
  "SME / Startup",
  "Consulting Firm",
  "Enterprise HR",
  "Other",
] as const;

// Stored values stay canonical (English); only the display localizes.
const INDUSTRY_LABELS_ES: Record<string, string> = {
  "Recruitment Agency": "Agencia de reclutamiento",
  "Call Center / BPO": "Call center / BPO",
  "SME / Startup": "Pyme / Startup",
  "Consulting Firm": "Consultora",
  "Enterprise HR": "RR. HH. corporativo",
  Other: "Otro",
};

const LANGUAGES = [
  { value: "es", labelKey: "spanish", code: "ES" },
  { value: "en", labelKey: "english", code: "EN" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const language = useTranslations("language");
  const locale = useLocale();
  const es = toAppLocale(locale) === "es";
  const [form, setForm] = useState({ company_name: "", industry: "", language: toAppLocale(locale) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.company_name || !form.industry) {
      setError(t("requiredFields"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? t("genericError"));
      return;
    }

    // Set lang cookie client-side too so the next page immediately uses the right locale
    document.cookie = `${LANGUAGE_COOKIE}=${form.language}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
    document.cookie = `${LANGUAGE_OVERRIDE_COOKIE}=1; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, form.language);
    window.localStorage.setItem(LANGUAGE_OVERRIDE_STORAGE_KEY, "1");

    // The chosen workspace language decides whether the dashboard lives under /es.
    router.push(localePath("/dashboard", toAppLocale(form.language)));
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(79,70,229,0.06),transparent_34%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.055] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <BrandLockup
            subtitle={es ? "Plataforma de evaluación" : "Assessment Platform"}
            markClassName="h-10 w-10"
            titleClassName="tracking-normal"
          />
        </div>

        <div className="premium-card rounded-2xl p-8 shadow-xl">
          {/* Progress indicator */}
          <div className="mb-6 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#4f46e5]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#4f46e5]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#4f46e5]" />
          </div>

          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#4f46e5]/30 bg-[#4f46e5]/10 px-2.5 py-1 text-xs font-medium text-[#9BB8FF]">
              {t("step2")}
            </div>
            <h1 className="text-xl font-semibold text-[var(--it-text)]">{t("tellUsAbout")}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("tailorPlatform")}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                {t("companyName")} <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="Acme Recruitment Ltd"
                className="w-full rounded-xl border border-[#f3f4f6] bg-[#f8fafc] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/25 transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                {t("industry")} <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, industry }))}
                    className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                      form.industry === industry
                        ? "border-[#4f46e5] bg-[#4f46e5]/15 text-white"
                        : "border-[#f3f4f6] bg-[#f8fafc] text-slate-400 hover:border-[#d1d5db]"
                    }`}
                  >
                    {form.industry === industry && (
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4f46e5]" />
                    )}
                    {es ? INDUSTRY_LABELS_ES[industry] ?? industry : industry}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                {t("language")}
              </label>
              <p className="mb-2 text-xs text-slate-500">
                {t("languageDescription")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, language: lang.value }))}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors ${
                      form.language === lang.value
                        ? "border-[#4f46e5] bg-[#4f46e5]/15 text-white"
                        : "border-[#f3f4f6] bg-[#f8fafc] text-slate-400 hover:border-[#d1d5db]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{language(lang.labelKey)}</span>
                      <span className="mt-0.5 block text-xs font-normal text-slate-600">
                        {lang.value === "es" ? "LATAM" : es ? "Internacional" : "International"}
                      </span>
                    </span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                      form.language === lang.value
                        ? "border-[#4338ca]/35 bg-[#4f46e5] text-white"
                        : "border-[#f3f4f6] bg-[#ffffff] text-slate-500"
                    }`}>
                      {lang.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.company_name || !form.industry}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3730a3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("saving")}
                </>
              ) : (
                t("continueToDashboard")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
