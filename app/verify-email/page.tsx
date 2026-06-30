"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    const email = new URLSearchParams(window.location.search).get("email");
    if (!email) return;
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    setResent(true);
  };

  return (
    <div className="min-h-screen bg-[#07080F] text-slate-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(29,78,216,0.16),transparent_34%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.055] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-md">
        <div className="premium-card rounded-2xl p-8 text-center shadow-2xl">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1D4ED8]/30 bg-[#1D4ED8]/15">
            <svg className="h-8 w-8 text-[#6B9FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.2 5.47a2.25 2.25 0 0 1-2.5 0L2.25 7.5" />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-white">Check your inbox</h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            We sent a confirmation link to your email address. Click the link to activate your account and access your dashboard.
          </p>

          <div className="mt-6 rounded-xl border border-[#1E2240] bg-[#07080F] p-4 text-left space-y-1.5 text-xs text-slate-500">
            <p className="font-medium text-slate-400">Didn&apos;t receive the email?</p>
            <p>• Check your spam or junk folder</p>
            <p>• Make sure you used your work email</p>
            <p>• Confirmation emails can take up to 5 minutes</p>
          </div>

          {resent ? (
            <p className="mt-5 text-sm text-emerald-400">Confirmation email resent successfully.</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-5 text-sm text-[#6B9FFF] hover:text-[#93B8FF] transition-colors disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend confirmation email"}
            </button>
          )}

          <div className="mt-6 border-t border-[#1E2240] pt-5">
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
