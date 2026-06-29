import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";

const categoryConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Cognitive: { color: "text-blue-300", bg: "bg-blue-400/10", border: "border-blue-400/20", dot: "bg-blue-400" },
  Resilience: { color: "text-violet-300", bg: "bg-violet-400/10", border: "border-violet-400/20", dot: "bg-violet-400" },
  Personality: { color: "text-pink-300", bg: "bg-pink-400/10", border: "border-pink-400/20", dot: "bg-pink-400" },
  Leadership: { color: "text-amber-300", bg: "bg-amber-400/10", border: "border-amber-400/20", dot: "bg-amber-400" },
};

function getTestPath(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("aq") || normalized.includes("adversity")) return "aq";
  return "critical-thinking";
}

function isAvailableAssessment(name: string, status: string) {
  const normalized = name.toLowerCase();
  const isCriticalThinking = normalized.includes("critical") && normalized.includes("thinking");
  const isAQ = normalized.includes("aq") || normalized.includes("adversity");
  return status === "active" && (isCriticalThinking || isAQ);
}

export default async function AssessmentsPage() {
  const admin = createAdminClient();
  const { data: assessments } = await admin
    .from("assessments")
    .select("*")
    .order("status", { ascending: true })
    .order("name");

  const allAssessments = assessments ?? [];
  const active = allAssessments.filter((assessment) => isAvailableAssessment(assessment.name, assessment.status));
  const comingSoon = allAssessments.filter((assessment) => !isAvailableAssessment(assessment.name, assessment.status));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
            Assessment library
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Assessment Library</h1>
          <p className="text-slate-500 text-sm mt-1">
            {active.length} active and {comingSoon.length} coming soon
          </p>
        </div>
        <div className="rounded-xl border border-[#1E2240] bg-[#0D1020] px-4 py-3">
          <p className="text-xs text-slate-500">Available now</p>
          <p className="mt-1 text-sm font-semibold text-white">Critical Thinking + AQ</p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Available Now</h2>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            Active
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.map((assessment, index) => {
            const cfg = categoryConfig[assessment.category] ?? categoryConfig.Cognitive;
            const testPath = getTestPath(assessment.name);
            return (
              <div
                key={assessment.id}
                className="premium-card premium-card-hover flex flex-col rounded-xl p-5 animate-fade-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className={`${cfg.bg} ${cfg.border} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-medium ${cfg.color}`}>{assessment.category}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#1D4ED8]/30 bg-[#1D4ED8]/10 text-[#8CB1FF]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>

                <h3 className="text-base font-semibold text-white mb-2">{assessment.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{assessment.description}</p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                    <p className="text-xs text-slate-600">Duration</p>
                    <p className="mt-1 text-sm font-semibold text-white">{assessment.duration_minutes} min</p>
                  </div>
                  <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                    <p className="text-xs text-slate-600">Questions</p>
                    <p className="mt-1 text-sm font-semibold text-white">{assessment.question_count}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#1E2240] pt-4">
                  <Link
                    href={`/test/${testPath}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#8CB1FF] transition-colors hover:text-blue-200"
                  >
                    Preview test
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {comingSoon.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Coming Soon</h2>
            <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400">
              Locked
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {comingSoon.map((assessment) => {
              const cfg = categoryConfig[assessment.category] ?? categoryConfig.Cognitive;
              return (
                <div
                  key={assessment.id}
                  className="relative flex flex-col overflow-hidden rounded-xl border border-[#1E2240] bg-[#0D1020]/68 p-5"
                >
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(255,255,255,0.035),transparent_44%)]" />
                  <div className="relative mb-4 flex items-start justify-between gap-3">
                    <div className={`${cfg.bg} ${cfg.border} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 opacity-75`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      <span className={`text-xs font-medium ${cfg.color}`}>{assessment.category}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V7.125a4.5 4.5 0 0 0-9 0V10.5m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v5.25a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18v-5.25A2.25 2.25 0 0 1 6.75 10.5Z" />
                      </svg>
                      Coming Soon
                    </span>
                  </div>

                  <div className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E2240] bg-[#07080F] text-slate-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>

                  <h3 className="relative text-base font-semibold text-slate-300 mb-2">{assessment.name}</h3>
                  <p className="relative text-sm text-slate-600 leading-relaxed flex-1">{assessment.description}</p>

                  <div className="relative mt-5 flex items-center gap-4 border-t border-[#1E2240] pt-4 text-xs text-slate-600">
                    <span>{assessment.duration_minutes} min</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span>{assessment.question_count} questions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
