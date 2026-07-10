"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { BrandLockup } from "@/components/brand/BrandLogo";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import { createClient } from "@/lib/supabase";

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Logo = ({ subtitle }: { subtitle: string }) => (
  <BrandLockup subtitle={subtitle} />
);

export default function SignupPage() {
  const router = useRouter();
  // The entry URL decides the workspace language: /es/signup -> es, /signup -> en.
  // The proxy forces this locale for the request, so it is authoritative here.
  const language = toAppLocale(useLocale());
  const auth = useTranslations("auth");
  const onboarding = useTranslations("onboarding");
  const flow = useTranslations("authFlow");
  const [form, setForm] = useState({
    company_name: "",
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const signupErrorMessage = (message?: string) => {
    if (!message) return flow("failedCreateAccount");
    const normalized = message.toLowerCase();
    if (normalized.includes("already exists")) return flow("accountExists");
    if (normalized.includes("confirmation email")) return flow("confirmationEmailError");
    return flow("failedCreateAccount");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError(flow("passwordsDoNotMatch"));
      return;
    }
    if (form.password.length < 8) {
      setError(flow("passwordTooShort"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        company_name: form.company_name,
        language,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(signupErrorMessage(data.error));
      return;
    }

    router.push(
      localePath(`/verify-email?email=${encodeURIComponent(form.email)}&lang=${language}`, language)
    );
  };

  const handleGoogle = async () => {
    setOauthLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?lang=${language}`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-100">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(79,70,229,0.06),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_28%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.055] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_540px]">
        {/* Left panel */}
        <section className="hidden lg:flex flex-col justify-between border-r border-[#f3f4f6] px-10 py-8 xl:px-14">
          <Logo subtitle={flow("brandSubtitle")} />
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f3f4f6] bg-[#ffffff]/70 px-3 py-1 text-xs font-medium text-[#9BB8FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {flow("signupBadge")}
            </div>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-[var(--it-text)] xl:text-5xl">
              {flow("signupHeroTitle")}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              {flow("signupHeroBody")}
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[["22+", flow("assessmentsStat")], ["5 min", flow("candidateSetupStat")], ["100%", flow("dataIsolatedStat")]].map(([v, l]) => (
                <div key={l} className="premium-card rounded-xl p-4">
                  <p className="text-xl font-semibold text-[var(--it-text)]">{v}</p>
                  <p className="mt-1 text-xs text-slate-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="h-px w-10 bg-[#f3f4f6]" />
            {flow("builtFor")}
          </div>
        </section>

        {/* Right panel — signup form */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <Logo subtitle={flow("brandSubtitle")} />
            </div>

            <div className="premium-card rounded-2xl p-6 shadow-xl sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--it-text)]">{auth("createAccount")}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {auth("alreadyHaveAccount")}{" "}
                  <Link href={localePath("/login", language)} className="text-[#4338ca] hover:text-[#93B8FF] transition-colors">
                    {auth("signIn")}
                  </Link>
                </p>
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={oauthLoading}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#f3f4f6] bg-[#f8fafc] px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-[#d1d5db] hover:bg-[#ffffff] disabled:cursor-not-allowed disabled:opacity-60"
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
                <span className="text-xs text-slate-600">{auth("orSignUpWithEmail")}</span>
                <span className="h-px flex-1 bg-[#f3f4f6]" />
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">{onboarding("companyName")} <span className="text-red-400">*</span></label>
                    <input
                      required
                      placeholder={flow("companyPlaceholder")}
                      {...field("company_name")}
                      className="w-full rounded-xl border border-[#f3f4f6] bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/25 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">{auth("fullName")} <span className="text-red-400">*</span></label>
                    <input
                      required
                      placeholder={flow("fullNamePlaceholder")}
                      {...field("full_name")}
                      className="w-full rounded-xl border border-[#f3f4f6] bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/25 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">{auth("workEmail")} <span className="text-red-400">*</span></label>
                  <input
                    required
                    type="email"
                    placeholder={flow("workEmailPlaceholder")}
                    {...field("email")}
                    className="w-full rounded-xl border border-[#f3f4f6] bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/25 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">{auth("password")} <span className="text-red-400">*</span></label>
                    <input
                      required
                      type="password"
                      placeholder={flow("passwordMinPlaceholder")}
                      {...field("password")}
                      className="w-full rounded-xl border border-[#f3f4f6] bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/25 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-400">{auth("confirmPassword")} <span className="text-red-400">*</span></label>
                    <input
                      required
                      type="password"
                      placeholder={flow("passwordRepeatPlaceholder")}
                      {...field("confirm_password")}
                      className="w-full rounded-xl border border-[#f3f4f6] bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/25 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/45 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {auth("creatingAccount")}
                    </>
                  ) : (
                    auth("createAccount")
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-slate-600">
                {flow("signupAgreement")}{" "}
                <Link href="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">{flow("terms")}</Link>
                {" "}{flow("and")}{" "}
                <Link href="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">{flow("privacyPolicy")}</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
