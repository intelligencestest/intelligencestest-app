"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { scoreAQ } from "@/lib/questions/aq";
import { scoreResults } from "@/lib/questions/critical-thinking";
import type { CTPDFData, AQPDFData } from "@/lib/pdf";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Result {
  id: string;
  score: number;
  completed_at: string;
  candidates: { full_name: string; email: string } | null;
  assessments: { name: string } | null;
}

const avatarColors = [
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
];

function DownloadPDFButton({ result }: { result: Result }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results/${result.id}`);
      if (!res.ok) throw new Error("Failed to fetch result");
      const data = await res.json();

      const candidateName = result.candidates?.full_name ?? "Unknown";
      const assessmentName = result.assessments?.name ?? "Assessment";
      const date = new Date(result.completed_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const { downloadCTPDF, downloadAQPDF } = await import("@/lib/pdf");
      const isAQ = assessmentName.toLowerCase().includes("aq") || assessmentName.toLowerCase().includes("adversity");

      if (isAQ) {
        const rawAnswers: (number | null)[] = Array.isArray(data.raw_answers) ? data.raw_answers : [];
        const scored = scoreAQ(rawAnswers);
        const pdfData: AQPDFData = {
          candidateName,
          assessmentName,
          date,
          score: scored.total,
          control: scored.control,
          ownership: scored.ownership,
          reach: scored.reach,
          endurance: scored.endurance,
          interpretation: scored.interpretation,
          description: scored.description,
        };
        downloadAQPDF(pdfData);
      } else {
        const rawAnswers: (number | null)[] = Array.isArray(data.raw_answers) ? data.raw_answers : [];
        const scored = scoreResults(rawAnswers);
        const pdfData: CTPDFData = {
          candidateName,
          assessmentName,
          date,
          score: scored.percentage,
          correct: scored.correct,
          total: scored.total,
          interpretation: scored.interpretation,
        };
        downloadCTPDF(pdfData);
      }
    } catch {
      alert("Could not generate PDF. Please try again.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download PDF report"
      className="flex-shrink-0 cursor-pointer rounded-lg border border-[#1E2240] p-1.5 text-slate-500 transition-colors hover:border-[#1D4ED8]/40 hover:text-[#8CB1FF] disabled:opacity-50"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      )}
    </button>
  );
}

export default function ReportsClient({
  projects,
  initialResults,
  selectedProjectId,
}: {
  projects: Project[];
  initialResults: Result[];
  selectedProjectId: string | null;
}) {
  const router = useRouter();

  const results = initialResults;
  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;
  const topScore = results[0]?.score ?? 0;

  const scoreBands = [
    { label: "90-100", color: "bg-emerald-500" },
    { label: "75-89", color: "bg-blue-500" },
    { label: "60-74", color: "bg-amber-500" },
    { label: "< 60", color: "bg-red-500" },
  ];

  function selectProject(id: string) {
    router.push(`/reports?project=${id}`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Candidate rankings and score breakdowns by project</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-[#0D1020] border border-[#1E2240] rounded-xl">
          <p className="text-slate-500 text-sm">No projects yet. Create a project and invite candidates to see reports.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-4">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">Select Project</label>
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProject(p.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    selectedProjectId === p.id
                      ? "bg-[#1D4ED8] text-white"
                      : "bg-[#07080F] border border-[#1E2240] text-slate-400 hover:text-slate-200 hover:border-[#2d3a70]"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Scored", value: results.length, color: "text-white" },
              { label: "Average Score", value: results.length ? `${avgScore}` : "-", color: "text-blue-400" },
              { label: "Top Score", value: results.length ? `${topScore}` : "-", color: "text-amber-400" },
              { label: "Pass Rate (60+)", value: results.length ? `${Math.round((results.filter(r => r.score >= 60).length / results.length) * 100)}%` : "-", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-[#0D1020] border border-[#1E2240] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1E2240] flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Candidate Rankings</h2>
                <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                  {results.length} scored
                </span>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <svg className="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
                  </svg>
                  <p className="text-sm">No completed assessments for this project yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#1E2240]">
                  {results.map((result, i) => {
                    const candidate = result.candidates;
                    const initials = candidate?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";
                    const scoreColor = result.score >= 80 ? "text-emerald-400" : result.score >= 60 ? "text-amber-400" : "text-red-400";
                    const barColor = result.score >= 80 ? "bg-emerald-500" : result.score >= 60 ? "bg-amber-500" : "bg-red-500";
                    return (
                      <div key={result.id} className="px-6 py-4 hover:bg-[#1E2240]/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            i === 0 ? "bg-amber-400/20 text-amber-400" :
                            i === 1 ? "bg-slate-400/20 text-slate-300" :
                            i === 2 ? "bg-amber-700/20 text-amber-600" :
                            "bg-[#1E2240] text-slate-500"
                          }`}>
                            {i + 1}
                          </div>
                          <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{candidate?.full_name ?? "Unknown"}</p>
                            <p className="text-xs text-slate-500 truncate">{result.assessments?.name ?? "Assessment"}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-xl font-bold ${scoreColor}`}>{result.score}</p>
                            <p className="text-xs text-slate-600">
                              {new Date(result.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <DownloadPDFButton result={result} />
                        </div>
                        <div className="mt-3 ml-[88px]">
                          <div className="w-full h-1.5 bg-[#1E2240] rounded-full overflow-hidden">
                            <div className={`h-1.5 ${barColor} rounded-full`} style={{ width: `${Math.min(result.score, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {results.length > 0 && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-emerald-400">Top Recommendation</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-white font-medium">{results[0].candidates?.full_name ?? "The top candidate"}</span> scored{" "}
                    <span className="text-emerald-400 font-medium">{results[0].score}</span> on the{" "}
                    {results[0].assessments?.name ?? "assessment"}.
                    {results[0].score >= 75
                      ? " We recommend advancing them to the interview stage."
                      : " Review their profile before advancing."}
                  </p>
                </div>
              )}

              <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Score Distribution</h3>
                {results.length === 0 ? (
                  <p className="text-sm text-slate-500">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {scoreBands.map((band) => {
                      const count = results.filter((r) => {
                        if (band.label === "90-100") return r.score >= 90;
                        if (band.label === "75-89") return r.score >= 75 && r.score < 90;
                        if (band.label === "60-74") return r.score >= 60 && r.score < 75;
                        return r.score < 60;
                      }).length;
                      const pct = results.length ? Math.round((count / results.length) * 100) : 0;
                      return (
                        <div key={band.label} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-14">{band.label}</span>
                          <div className="flex-1 h-2 bg-[#1E2240] rounded-full overflow-hidden">
                            <div className={`h-2 ${band.color} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
