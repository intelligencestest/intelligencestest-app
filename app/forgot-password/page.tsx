"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const auth = useTranslations("auth");
  const flow = useTranslations("authFlow");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        language: locale === "es" ? "es" : "en",
      }),
    });
    await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(flow("resetEmailError"));
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#07080F] text-slate-100 flex items-center justify-center p-4">
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitcher showLabel={false} />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(29,78,216,0.16),transparent_34%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.055] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-sm">
        <div className="premium-card rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#1D4ED8]/30 bg-[#1D4ED8]/15">
              <svg className="h-5 w-5 text-[#6B9FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.5 10.5V7.125a4.5 4.5 0 0 0-9 0V10.5m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v5.25a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18v-5.25A2.25 2.25 0 0 1 6.75 10.5Z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white">{flow("resetPasswordTitle")}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {flow("resetPasswordDescription")}
            </p>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {flow("resetLinkSent")}
              </div>
              <Link href="/login" className="block text-xs text-slate-500 hover:text-slate-300 transition-colors">
                ← {flow("backToSignIn")}
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">{auth("emailAddress")}</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={flow("emailPlaceholder")}
                    className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {flow("sending")}
                    </>
                  ) : (
                    flow("sendResetLink")
                  )}
                </button>
              </form>
              <div className="mt-5 text-center">
                <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  ← {flow("backToSignIn")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
