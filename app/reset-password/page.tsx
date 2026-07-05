"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localePath, toAppLocale } from "@/lib/i18n/locales";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const locale = toAppLocale(useLocale());
  const flow = useTranslations("authFlow");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function prepareRecoverySession() {
      setStatus("checking");
      setError("");

      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = url.searchParams.get("code");

      let sessionError: string | null = null;

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        sessionError = setSessionError?.message ?? null;
      } else if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        sessionError = exchangeError?.message ?? null;
      }

      if (url.search || url.hash) {
        window.history.replaceState(null, "", localePath("/reset-password", locale));
      }

      if (!mounted) return;

      if (sessionError) {
        setError(flow("resetSessionError"));
        setStatus("invalid");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setError(flow("resetLinkInvalid"));
        setStatus("invalid");
        return;
      }

      setStatus("ready");
    }

    void prepareRecoverySession();

    return () => {
      mounted = false;
    };
  }, [flow, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError(flow("passwordsDoNotMatch"));
      return;
    }
    if (password.length < 8) {
      setError(flow("passwordTooShort"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || flow("passwordUpdateError"));
      return;
    }

    router.push(localePath("/dashboard", locale));
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#07080F] text-slate-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(29,78,216,0.16),transparent_34%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.055] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-sm">
        <div className="premium-card rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white">{flow("setNewPasswordTitle")}</h1>
            <p className="mt-1 text-sm text-slate-500">{flow("setNewPasswordDescription")}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {status === "checking" && (
            <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-4 text-sm text-slate-300">
              {flow("preparingPasswordReset")}
            </div>
          )}

          {status === "invalid" && (
            <button
              type="button"
              onClick={() => router.push(localePath("/forgot-password", locale))}
              className="flex w-full items-center justify-center rounded-xl bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
            >
              {flow("requestNewResetLink")}
            </button>
          )}

          {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">{flow("newPassword")}</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={flow("passwordMinPlaceholder")}
                className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25 transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">{flow("confirmNewPassword")}</label>
              <input
                required
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={flow("passwordRepeatPlaceholder")}
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
                  {flow("updating")}
                </>
              ) : (
                flow("updatePassword")
              )}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
