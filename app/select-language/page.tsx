"use client";

import { useState } from "react";

const LANGS = [
  {
    value: "en" as const,
    label: "English",
    sub: "Continue in English",
    code: "EN",
  },
  {
    value: "es" as const,
    label: "Español",
    sub: "Continuar en español",
    code: "ES",
  },
] as const;

export default function SelectLanguagePage() {
  const [picking, setPicking] = useState<"en" | "es" | null>(null);

  function pick(lang: "en" | "es") {
    if (picking) return;
    setPicking(lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000; samesite=lax`;
    window.location.assign("/signup");
  }

  return (
    <div className="min-h-screen bg-[#07080F] text-slate-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(29,78,216,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_28%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.055] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#5B7CFA]/30 bg-[#1D4ED8] shadow-[0_0_36px_rgba(29,78,216,0.38)]">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 4 7.2 12 11.4l8-4.2L12 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4 12.8 8 4.2 8-4.2M4 17.8l8 4.2 8-4.2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Intelligences Test</p>
            <p className="text-xs text-slate-500">Assessment Platform</p>
          </div>
        </div>

        <div className="premium-card rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-white">
              Choose your language
              <span className="mx-2 text-slate-600">/</span>
              Elija su idioma
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              This will be your default for the dashboard.
            </p>
          </div>

          <div className="space-y-3">
            {LANGS.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => pick(lang.value)}
                disabled={!!picking}
                className={`group flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-colors disabled:cursor-not-allowed ${
                  picking === lang.value
                    ? "border-[#1D4ED8] bg-[#1D4ED8]/15"
                    : "border-[#1E2240] bg-[#07080F] hover:border-[#2d3a70] hover:bg-[#0d1020]"
                }`}
              >
                <div>
                  <p className={`text-base font-semibold ${picking === lang.value ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                    {lang.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{lang.sub}</p>
                </div>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                  picking === lang.value
                    ? "border-[#6B9FFF]/35 bg-[#1D4ED8] text-white"
                    : "border-[#1E2240] bg-[#0D1020] text-slate-400 group-hover:border-[#2d3a70]"
                }`}>
                  {picking === lang.value ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    lang.code
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
