"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#07080F] text-slate-100">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(29,78,216,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_28%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.055] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_520px]">
        <section className="hidden lg:flex flex-col justify-between border-r border-[#1E2240] px-10 py-8 xl:px-14">
          <div className="flex items-center gap-3">
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

          <div className="max-w-xl animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020]/70 px-3 py-1 text-xs font-medium text-[#9BB8FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
              Secure assessment operations
            </div>
            <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white xl:text-5xl">
              Hire with clearer signals and cleaner workflows.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              Manage candidates, assessment links, results, and hiring projects from one focused dashboard.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                ["40", "Question tests"],
                ["25m", "Timed sessions"],
                ["CORE", "AQ breakdown"],
              ].map(([value, label]) => (
                <div key={label} className="premium-card rounded-xl p-4">
                  <p className="text-xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="h-px w-10 bg-[#1E2240]" />
Built for assessment-led hiring decisions
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#5B7CFA]/30 bg-[#1D4ED8] shadow-[0_0_30px_rgba(29,78,216,0.34)]">
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

            <div className="premium-card rounded-2xl p-6 shadow-2xl sm:p-8">
              <div className="mb-7">
                <div className="mb-3 inline-flex rounded-full border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 px-3 py-1 text-xs font-medium text-[#9BB8FF]">
                  Admin access
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
                <p className="mt-1 text-sm text-slate-500">Sign in to continue to your dashboard.</p>
              </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email address</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0-8.2 5.47a2.25 2.25 0 0 1-2.5 0L2.25 7.5" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.5 10.5V7.125a4.5 4.5 0 0 0-9 0V10.5m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v5.25a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18v-5.25A2.25 2.25 0 0 1 6.75 10.5Z" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Link href="#" className="text-xs text-slate-500 hover:text-[#6B9FFF] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(29,78,216,0.25)] transition-colors hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

              <div className="mt-6 border-t border-[#1E2240] pt-5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Protected by Supabase Auth</span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-300">Secure</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600">
              By signing in, you agree to our{" "}
              <Link href="#" className="text-slate-500 transition-colors hover:text-slate-300">Terms</Link>
              {" "}and{" "}
              <Link href="#" className="text-slate-500 transition-colors hover:text-slate-300">Privacy Policy</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
