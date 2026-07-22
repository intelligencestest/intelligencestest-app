"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function VerifyEmailPage() {
  const locale = useLocale();
  const flow = useTranslations("authFlow");
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    const email = new URLSearchParams(window.location.search).get("email");
    setError("");
    if (!email) {
      setError(flow("missingEmailForResend"));
      return;
    }
    setResending(true);
    const res = await fetch("/api/auth/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        language: locale,
      }),
    });
    setResending(false);

    if (!res.ok) {
      await res.json();
      setError(flow("confirmationEmailError"));
      return;
    }

    setResent(true);
  };

  return (
    <div className="min-h-screen bg-[var(--it-bg)] flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(79,70,229,0.06),transparent_34%)]" />

      <div className="relative w-full max-w-md">
        <div className="premium-card rounded-2xl p-8 text-center shadow-xl">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4f46e5]/30 bg-[#4f46e5]/15">
            <svg className="h-8 w-8 text-[#4338ca]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.2 5.47a2.25 2.25 0 0 1-2.5 0L2.25 7.5" />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-[var(--it-text)]">{flow("checkInboxTitle")}</h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            {flow("confirmationSent")}
          </p>

          <div className="mt-6 rounded-xl border border-[#f3f4f6] bg-[#f8fafc] p-4 text-left space-y-1.5 text-xs text-[var(--it-faint)]">
            <p className="font-medium text-slate-400">{flow("didntReceive")}</p>
            <p>• {flow("checkSpam")}</p>
            <p>• {flow("confirmWorkEmail")}</p>
            <p>• {flow("emailDelay")}</p>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-[#b91c1c]">{error}</p>
          )}

          {resent ? (
            <p className="mt-5 text-sm text-[#16a34a]">{flow("confirmationResent")}</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-5 text-sm text-[#4338ca] hover:text-[#3730a3] transition-colors disabled:opacity-50"
            >
              {resending ? flow("resending") : flow("resendConfirmation")}
            </button>
          )}

          <div className="mt-6 border-t border-[#f3f4f6] pt-5">
            <Link href="/login" className="text-xs text-[var(--it-faint)] hover:text-slate-300 transition-colors">
              ← {flow("backToSignIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
