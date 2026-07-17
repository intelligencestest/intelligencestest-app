"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  LANGUAGE_OVERRIDE_COOKIE,
  LANGUAGE_OVERRIDE_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  localePath,
  toAppLocale,
} from "@/lib/i18n/locales";
import { publicContentUrl } from "@/lib/public-links";
import { BrandLockup } from "@/components/brand/BrandLogo";
import { createClient } from "@/lib/supabase";

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const locale = toAppLocale(useLocale());
  const auth = useTranslations("auth");
  const flow = useTranslations("authFlow");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [recoveryRedirecting, setRecoveryRedirecting] = useState(false);
  const [error, setError] = useState("");

  const completeLogin = async () => {
    // Workspace language is the single source of truth: clear any legacy
    // personal override and sync the session language from the company. The
    // company language then decides whether the dashboard lives under /es.
    window.localStorage.removeItem(LANGUAGE_OVERRIDE_STORAGE_KEY);
    window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    document.cookie = `${LANGUAGE_OVERRIDE_COOKIE}=; path=/; max-age=0; samesite=lax`;
    const sync = await fetch("/api/auth/session-language", { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    const companyLocale = toAppLocale(sync?.language, locale);
    router.push(localePath("/dashboard", companyLocale));
    router.refresh();
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const linkType = url.searchParams.get("type") ?? hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    const isRecovery = linkType === "recovery" || Boolean(url.searchParams.get("code"));
    if (isRecovery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecoveryRedirecting(true);
      window.location.replace(`${localePath("/reset-password", locale)}${url.search}${url.hash}`);
      return;
    }

    // Signup confirmation / magic-link tokens land here as URL-fragment
    // tokens (not a recovery link) — establish the session directly and go
    // straight to the dashboard instead of routing through /reset-password,
    // which is reserved for actual password-recovery links.
    if (accessToken && refreshToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecoveryRedirecting(true);
      const supabase = createClient();
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
        if (error) {
          setRecoveryRedirecting(false);
          setError(flow("failedCreateAccount"));
          return;
        }
        void completeLogin();
      });
    }
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(flow("enterEmailPassword"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        setError(flow("emailNotConfirmed"));
      } else if (authError.message.toLowerCase().includes("invalid login credentials")) {
        setError(flow("invalidLogin"));
      } else {
        setError(authError.message);
      }
      return;
    }
    await completeLogin();
  };

  const handleGoogle = async () => {
    setOauthLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?lang=${locale}`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[var(--it-bg)]">
      <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_520px]">
        <section className="hidden lg:flex flex-col justify-between border-r border-[var(--it-hairline)] bg-white px-10 py-8 xl:px-14">
          <BrandLockup subtitle={flow("brandSubtitle")} />

          <div className="max-w-xl">
            <h1 className="font-editorial max-w-lg text-4xl font-medium leading-[1.15] text-[var(--it-text)] xl:text-5xl">
              {flow("loginHeroTitle")}
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[var(--it-muted)]">
              {flow("loginHeroBody")}
            </p>

            <div className="mt-12 flex max-w-lg items-start gap-10 border-t border-[var(--it-hairline)] pt-6">
              {[
                ["22+", flow("assessmentsStat")],
                ["25m", flow("timedSessionsStat")],
                ["100%", flow("dataIsolatedStat")],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-xl font-semibold tabular-nums text-[var(--it-text)]">{value}</p>
                  <p className="mt-1 text-[13px] text-[var(--it-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-[var(--it-faint)]">
            {flow("builtFor")}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <BrandLockup subtitle={flow("brandSubtitle")} />
            </div>

            <div className="rounded-2xl border border-[var(--it-hairline)] bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-16px_rgba(16,24,40,0.12)] sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--it-text)]">{auth("welcomeBack")}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {auth("noAccountYet")}{" "}
                  <Link href={localePath("/signup", locale)} className="text-[#4338ca] hover:text-[#3730a3] transition-colors">
                    {auth("createOneFree")}
                  </Link>
                </p>
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={oauthLoading}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--it-border)] bg-white px-4 py-3 text-sm font-medium text-[#374151] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:bg-[var(--it-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {oauthLoading ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <GoogleIcon />
                )}
                {auth("continueWithGoogle")}
              </button>

              <div className="mb-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-[#f3f4f6]" />
                <span className="text-xs text-[var(--it-faint)]">{auth("orSignInWithEmail")}</span>
                <span className="h-px flex-1 bg-[#f3f4f6]" />
              </div>

              {recoveryRedirecting && (
                <div className="mb-5 rounded-xl border border-[#f3f4f6] bg-[#f8fafc] p-4 text-sm text-slate-300">
                  {flow("preparingPasswordReset")}
                </div>
              )}

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-[#b91c1c]">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {!recoveryRedirecting && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#374151]">{auth("emailAddress")}</label>
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--it-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.2 5.47a2.25 2.25 0 0 1-2.5 0L2.25 7.5" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={flow("emailPlaceholder")}
                      className="w-full rounded-lg border border-[var(--it-border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--it-text)] outline-none transition-colors placeholder:text-[var(--it-faint)] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/25"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-[#374151]">{auth("password")}</label>
                    <Link href={localePath("/forgot-password", locale)} className="text-xs text-slate-500 hover:text-[#4338ca] transition-colors">
                      {auth("forgotPassword")}
                    </Link>
                  </div>
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--it-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.5 10.5V7.125a4.5 4.5 0 0 0-9 0V10.5m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v5.25a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18v-5.25A2.25 2.25 0 0 1 6.75 10.5Z" />
                    </svg>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={flow("passwordEnterPlaceholder")}
                      className="w-full rounded-lg border border-[var(--it-border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--it-text)] outline-none transition-colors placeholder:text-[var(--it-faint)] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/25"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/45 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {auth("signingIn")}
                    </>
                  ) : (
                    auth("signIn")
                  )}
                </button>
              </form>
              )}

              <div className="mt-6 border-t border-[#f3f4f6] pt-5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{flow("protectedBy")}</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[#15803d]">{flow("secure")}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-[var(--it-faint)]">
              {flow("signinAgreement")}{" "}
              <Link href={publicContentUrl("terms", locale)} className="text-slate-500 transition-colors hover:text-slate-300">{flow("terms")}</Link>
              {" "}{flow("and")}{" "}
              <Link href={publicContentUrl("privacy", locale)} className="text-slate-500 transition-colors hover:text-slate-300">{flow("privacyPolicy")}</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
