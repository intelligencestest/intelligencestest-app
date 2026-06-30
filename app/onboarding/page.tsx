"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INDUSTRIES = [
  "Recruitment Agency",
  "Call Center / BPO",
  "SME / Startup",
  "Consulting Firm",
  "Enterprise HR",
  "Other",
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ company_name: "", industry: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.company_name || !form.industry) {
      setError("Please fill in all fields");
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
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#07080F] text-slate-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(29,78,216,0.16),transparent_34%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.055] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5B7CFA]/30 bg-[#1D4ED8] shadow-[0_0_28px_rgba(29,78,216,0.35)]">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3 4 7.2 12 11.4l8-4.2L12 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4 12.8 8 4.2 8-4.2M4 17.8l8 4.2 8-4.2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Intelligences Test</p>
            <p className="text-xs text-slate-500">Assessment Platform</p>
          </div>
        </div>

        <div className="premium-card rounded-2xl p-8 shadow-2xl">
          {/* Progress indicator */}
          <div className="mb-6 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#1D4ED8]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#1D4ED8]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#1E2240]" />
          </div>

          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 px-2.5 py-1 text-xs font-medium text-[#9BB8FF]">
              Step 2 of 3 — Company setup
            </div>
            <h1 className="text-xl font-semibold text-white">Tell us about your company</h1>
            <p className="mt-1 text-sm text-slate-500">
              This helps us tailor the platform to your hiring context.
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
                Company name <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="Acme Recruitment Ltd"
                className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25 transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Industry <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, industry }))}
                    className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                      form.industry === industry
                        ? "border-[#1D4ED8] bg-[#1D4ED8]/15 text-white"
                        : "border-[#1E2240] bg-[#07080F] text-slate-400 hover:border-[#2d3a70]"
                    }`}
                  >
                    {form.industry === industry && (
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />
                    )}
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.company_name || !form.industry}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(29,78,216,0.25)] transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Continue to dashboard →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
