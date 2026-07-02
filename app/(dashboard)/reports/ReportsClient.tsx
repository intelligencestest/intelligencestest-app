"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { scoreAQ } from "@/lib/questions/aq";
import { scoreResults } from "@/lib/questions/critical-thinking";
import type { CTPDFData, AQPDFData } from "@/lib/pdf";
import type { ComprehensiveReportData } from "@/lib/report-pdf";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Result {
  id: string;
  score: number;
  completed_at: string;
  candidate_id: string | null;
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
  const es = useLocale() === "es";
  const dateLocale = es ? "es-ES" : "en-GB";
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results/${result.id}`);
      if (!res.ok) throw new Error("Failed to fetch result");
      const data = await res.json();

      const candidateName = result.candidates?.full_name ?? (es ? "Sin nombre" : "Unknown");
      const assessmentName = result.assessments?.name ?? (es ? "Evaluación" : "Assessment");
      const date = new Date(result.completed_at).toLocaleDateString(dateLocale, {
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
          candidateName, assessmentName, date,
          score: scored.total, control: scored.control, ownership: scored.ownership,
          reach: scored.reach, endurance: scored.endurance,
          interpretation: scored.interpretation, description: scored.description,
        };
        downloadAQPDF(pdfData);
      } else {
        const rawAnswers: (number | null)[] = Array.isArray(data.raw_answers) ? data.raw_answers : [];
        const scored = scoreResults(rawAnswers);
        const pdfData: CTPDFData = {
          candidateName, assessmentName, date,
          score: scored.percentage, correct: scored.correct, total: scored.total,
          interpretation: scored.interpretation,
        };
        downloadCTPDF(pdfData);
      }
    } catch {
      alert(es ? "No se pudo generar el PDF. Intente de nuevo." : "Could not generate PDF. Please try again.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title={es ? "Descargar PDF de evaluación individual" : "Download single-assessment PDF"}
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
  companyName,
}: {
  projects: Project[];
  initialResults: Result[];
  selectedProjectId: string | null;
  companyName: string;
}) {
  const router = useRouter();
  const es = useLocale() === "es";
  const dateLocale = es ? "es-ES" : "en-US";
  const copy = es
    ? {
        unknown: "Sin nombre",
        assessment: "Evaluación",
        projectFallback: "Proyecto de evaluación",
        pdfError: "No se pudo generar el informe completo. Intente de nuevo.",
        title: "Informes",
        subtitle: "Ranking de candidatos y desglose de puntuaciones por proyecto",
        noProjects: "Aún no hay proyectos. Cree un proyecto e invite candidatos para ver informes.",
        selectProject: "Seleccionar proyecto",
        stats: {
          totalScored: "Total puntuados",
          averageScore: "Puntuación promedio",
          topScore: "Mejor puntuación",
          passRate: "Tasa 60+",
        },
        rankings: "Ranking de candidatos",
        scored: "puntuados",
        noCompleted: "Aún no hay evaluaciones completadas para este proyecto",
        topRecommendation: "Recomendación principal",
        topCandidate: "El candidato principal",
        scoredText: "obtuvo",
        onAssessment: "en",
        advance: " Recomendamos avanzar a entrevista.",
        review: " Revise el perfil antes de avanzar.",
        distribution: "Distribución de puntuaciones",
        noData: "Aún no hay datos",
        comprehensive: "Informes completos de candidatos",
        comprehensiveSubtitle: "Informe PDF de 15 páginas por candidato con todas sus evaluaciones completadas",
        candidates: (count: number) => `${count} candidato${count === 1 ? "" : "s"}`,
        noEmail: "Sin correo",
        avgScore: "promedio",
        generating: "Generando...",
        fullReport: "Informe completo",
      }
    : {
        unknown: "Unknown",
        assessment: "Assessment",
        projectFallback: "Assessment Project",
        pdfError: "Could not generate the comprehensive report. Please try again.",
        title: "Reports",
        subtitle: "Candidate rankings and score breakdowns by project",
        noProjects: "No projects yet. Create a project and invite candidates to see reports.",
        selectProject: "Select Project",
        stats: {
          totalScored: "Total Scored",
          averageScore: "Average Score",
          topScore: "Top Score",
          passRate: "Pass Rate (60+)",
        },
        rankings: "Candidate Rankings",
        scored: "scored",
        noCompleted: "No completed assessments for this project yet",
        topRecommendation: "Top Recommendation",
        topCandidate: "The top candidate",
        scoredText: "scored",
        onAssessment: "on",
        advance: " We recommend advancing them to the interview stage.",
        review: " Review their profile before advancing.",
        distribution: "Score Distribution",
        noData: "No data yet",
        comprehensive: "Comprehensive Candidate Reports",
        comprehensiveSubtitle: "15-page PDF report per candidate across all their completed assessments",
        candidates: (count: number) => `${count} candidate${count !== 1 ? "s" : ""}`,
        noEmail: "No email",
        avgScore: "avg score",
        generating: "Generating...",
        fullReport: "Full Report",
      };
  const [fullReportLoading, setFullReportLoading] = useState<string | null>(null);

  const results = initialResults;
  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;
  const topScore = results[0]?.score ?? 0;

  // Group results by candidate for the Full Report feature
  const candidateGroups = useMemo(() => {
    const map = new Map<string, { name: string; email: string; results: Result[] }>();
    results.forEach(r => {
      const key = r.candidate_id ?? r.candidates?.email ?? r.candidates?.full_name ?? "unknown";
      const existing = map.get(key) ?? {
        name: r.candidates?.full_name ?? copy.unknown,
        email: r.candidates?.email ?? "",
        results: [],
      };
      existing.results.push(r);
      map.set(key, existing);
    });
    // Sort by avg score descending
    return [...map.entries()].sort((a, b) => {
      const avgA = a[1].results.reduce((s, r) => s + r.score, 0) / a[1].results.length;
      const avgB = b[1].results.reduce((s, r) => s + r.score, 0) / b[1].results.length;
      return avgB - avgA;
    });
  }, [results]);

  const scoreBands = [
    { label: "90-100", color: "bg-emerald-500" },
    { label: "75-89", color: "bg-blue-500" },
    { label: "60-74", color: "bg-amber-500" },
    { label: "< 60", color: "bg-red-500" },
  ];

  function selectProject(id: string) {
    router.push(`/reports?project=${id}`);
  }

  async function handleFullReport(candidateKey: string) {
    setFullReportLoading(candidateKey);
    try {
      const group = candidateGroups.find(([k]) => k === candidateKey)?.[1];
      if (!group) return;

      const selectedProject = projects.find(p => p.id === selectedProjectId);
      const { downloadComprehensiveReport } = await import("@/lib/report-pdf");

      const reportData: ComprehensiveReportData = {
        candidateName: group.name,
        candidateEmail: group.email,
        companyName,
        projectName: selectedProject?.name ?? copy.projectFallback,
        reportDate: new Date().toLocaleDateString(dateLocale, { month: "long", day: "numeric", year: "numeric" }),
        reportId: `RPT-${candidateKey.slice(0, 8).toUpperCase()}`,
        assessments: group.results.map(r => ({
          name: r.assessments?.name ?? copy.assessment,
          score: r.score,
          completedAt: r.completed_at,
        })),
      };

      downloadComprehensiveReport(reportData);
    } catch {
      alert(copy.pdfError);
    } finally {
      setFullReportLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{copy.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{copy.subtitle}</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-[#0D1020] border border-[#1E2240] rounded-xl">
          <p className="text-slate-500 text-sm">{copy.noProjects}</p>
        </div>
      ) : (
        <>
          <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-4">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">{copy.selectProject}</label>
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
              { label: copy.stats.totalScored, value: results.length, color: "text-white" },
              { label: copy.stats.averageScore, value: results.length ? `${avgScore}` : "-", color: "text-blue-400" },
              { label: copy.stats.topScore, value: results.length ? `${topScore}` : "-", color: "text-amber-400" },
              { label: copy.stats.passRate, value: results.length ? `${Math.round((results.filter(r => r.score >= 60).length / results.length) * 100)}%` : "-", color: "text-emerald-400" },
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
                <h2 className="text-base font-semibold text-white">{copy.rankings}</h2>
                <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                  {results.length} {copy.scored}
                </span>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <svg className="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
                  </svg>
                  <p className="text-sm">{copy.noCompleted}</p>
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
                            <p className="text-sm font-medium text-white truncate">{candidate?.full_name ?? copy.unknown}</p>
                            <p className="text-xs text-slate-500 truncate">{result.assessments?.name ?? copy.assessment}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-xl font-bold ${scoreColor}`}>{result.score}</p>
                            <p className="text-xs text-slate-600">
                              {new Date(result.completed_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
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
                    <h3 className="text-sm font-semibold text-emerald-400">{copy.topRecommendation}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-white font-medium">{results[0].candidates?.full_name ?? copy.topCandidate}</span> {copy.scoredText}{" "}
                    <span className="text-emerald-400 font-medium">{results[0].score}</span> {copy.onAssessment}{" "}
                    {results[0].assessments?.name ?? copy.assessment}.
                    {results[0].score >= 75
                      ? copy.advance
                      : copy.review}
                  </p>
                </div>
              )}

              <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">{copy.distribution}</h3>
                {results.length === 0 ? (
                  <p className="text-sm text-slate-500">{copy.noData}</p>
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

          {/* Per-Candidate Full Reports */}
          {candidateGroups.length > 0 && (
            <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1E2240] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">{copy.comprehensive}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{copy.comprehensiveSubtitle}</p>
                </div>
                <span className="text-xs bg-blue-400/10 text-blue-400 border border-blue-400/20 px-2.5 py-1 rounded-full">
                  {copy.candidates(candidateGroups.length)}
                </span>
              </div>
              <div className="divide-y divide-[#1E2240]">
                {candidateGroups.map(([candidateKey, group]) => {
                  const groupAvg = Math.round(group.results.reduce((s, r) => s + r.score, 0) / group.results.length);
                  const avgColor = groupAvg >= 80 ? "text-emerald-400" : groupAvg >= 60 ? "text-amber-400" : "text-red-400";
                  const initials = group.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  const isLoading = fullReportLoading === candidateKey;
                  return (
                    <div key={candidateKey} className="px-6 py-4 hover:bg-[#1E2240]/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1D4ED8]/20 border border-[#1D4ED8]/30 flex items-center justify-center text-sm font-semibold text-blue-400 flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{group.name}</p>
                          <p className="text-xs text-slate-500 truncate">{group.email || copy.noEmail}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {group.results.map(r => (
                              <span key={r.id} className="text-xs bg-[#1E2240] text-slate-400 px-2 py-0.5 rounded">
                                {r.assessments?.name?.replace(" Test", "").replace(" Assessment", "") ?? "?"} · {r.score}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 mr-4">
                          <p className={`text-2xl font-bold ${avgColor}`}>{groupAvg}</p>
                          <p className="text-xs text-slate-500">{copy.avgScore}</p>
                        </div>
                        <button
                          onClick={() => handleFullReport(candidateKey)}
                          disabled={isLoading}
                          className="flex-shrink-0 flex items-center gap-2 cursor-pointer rounded-lg bg-[#1D4ED8]/10 border border-[#1D4ED8]/30 px-3 py-2 text-xs font-medium text-[#8CB1FF] transition-colors hover:bg-[#1D4ED8]/20 hover:border-[#1D4ED8]/50 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                              </svg>
                              {copy.generating}
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {copy.fullReport}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
