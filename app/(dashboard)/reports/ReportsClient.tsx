"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FileText } from "lucide-react";
import { assessmentShort as termShort } from "@/lib/i18n/assessment-terms";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Result {
  id: string;
  score: number;
  completed_at: string;
  raw_answers: unknown;
  assessment_id: string;
  candidate_id: string | null;
  candidates: { full_name: string; email: string } | null;
  assessments: { name: string; category: string | null } | null;
}

function scoreTone(score: number) {
  if (score >= 80) return { text: "text-[#15803d]", bar: "bg-[var(--it-success)]" };
  if (score >= 60) return { text: "text-[#b45309]", bar: "bg-[var(--it-warning)]" };
  return { text: "text-[#b91c1c]", bar: "bg-[var(--it-danger)]" };
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
  const es = useLocale() === "es";
  const copy = es
    ? {
        unknown: "Sin nombre",
        assessment: "Evaluación",
        title: "Informes",
        subtitle: "Ranking de candidatos y desglose de puntuaciones por proyecto",
        noProjects: "Aún no hay proyectos. Cree un proyecto e invite candidatos para ver informes.",
        selectProject: "Seleccionar proyecto",
        stats: {
          totalScored: "Candidatos con resultados",
          averageScore: "Promedio de candidatos",
          topScore: "Mejor puntuación",
          passRate: "Candidatos 60+",
        },
        rankings: "Ranking ejecutivo de candidatos",
        scored: "con informe",
        noCompleted: "Aún no hay evaluaciones completadas para este proyecto",
        topRecommendation: "Recomendación principal",
        topCandidate: "El candidato principal",
        scoredText: "obtuvo",
        onAssessment: "como promedio",
        advance: " Recomendamos avanzar a entrevista.",
        review: " Revise el perfil antes de avanzar.",
        distribution: "Distribución de puntuaciones",
        noData: "Aún no hay datos",
        comprehensive: "Informes completos de candidatos",
        comprehensiveSubtitle: "Abra el informe ejecutivo dentro de la plataforma para revisar evidencia y tomar decisiones",
        candidates: (count: number) => `${count} candidato${count === 1 ? "" : "s"}`,
        assessmentsCompleted: (count: number) => `${count} evaluación${count === 1 ? "" : "es"} completada${count === 1 ? "" : "s"}`,
        noEmail: "Sin correo",
        avgScore: "promedio",
        fullReport: "Abrir informe",
      }
    : {
        unknown: "Unknown",
        assessment: "Assessment",
        title: "Reports",
        subtitle: "Candidate rankings and score breakdowns by project",
        noProjects: "No projects yet. Create a project and invite candidates to see reports.",
        selectProject: "Select Project",
        stats: {
          totalScored: "Candidates scored",
          averageScore: "Candidate average",
          topScore: "Top Score",
          passRate: "Candidates 60+",
        },
        rankings: "Executive candidate ranking",
        scored: "with reports",
        noCompleted: "No completed assessments for this project yet",
        topRecommendation: "Top Recommendation",
        topCandidate: "The top candidate",
        scoredText: "scored",
        onAssessment: "on average",
        advance: " We recommend advancing them to the interview stage.",
        review: " Review their profile before advancing.",
        distribution: "Score Distribution",
        noData: "No data yet",
        comprehensive: "Comprehensive Candidate Reports",
        comprehensiveSubtitle: "Open the executive report inside the platform to review evidence and make decisions",
        candidates: (count: number) => `${count} candidate${count !== 1 ? "s" : ""}`,
        assessmentsCompleted: (count: number) => `${count} completed assessment${count !== 1 ? "s" : ""}`,
        noEmail: "No email",
        avgScore: "avg score",
        fullReport: "Open report",
      };

  const results = initialResults;

  const candidateGroups = useMemo(() => {
    const map = new Map<string, { name: string; email: string; id: string | null; results: Result[] }>();
    results.forEach(r => {
      const key = r.candidate_id ?? r.candidates?.email ?? r.candidates?.full_name ?? "unknown";
      const existing = map.get(key) ?? {
        name: r.candidates?.full_name ?? copy.unknown,
        email: r.candidates?.email ?? "",
        id: r.candidate_id ?? null,
        results: [],
      };
      existing.results.push(r);
      map.set(key, existing);
    });
    return [...map.entries()].sort((a, b) => {
      const avgA = a[1].results.reduce((s, r) => s + r.score, 0) / a[1].results.length;
      const avgB = b[1].results.reduce((s, r) => s + r.score, 0) / b[1].results.length;
      return avgB - avgA;
    });
  }, [results, copy.unknown]);
  const candidateRankings = useMemo(
    () =>
      candidateGroups.map(([candidateKey, group]) => {
        const avg = Math.round(group.results.reduce((sum, result) => sum + result.score, 0) / group.results.length);
        return { candidateKey, group, avg, tone: scoreTone(avg) };
      }),
    [candidateGroups]
  );
  const avgScore = candidateRankings.length
    ? Math.round(candidateRankings.reduce((s, r) => s + r.avg, 0) / candidateRankings.length)
    : 0;
  const topScore = candidateRankings[0]?.avg ?? 0;

  const scoreBands = [
    { label: "90-100", tone: "bg-[var(--it-success)]" },
    { label: "75-89", tone: "bg-[var(--it-info)]" },
    { label: "60-74", tone: "bg-[var(--it-warning)]" },
    { label: "< 60", tone: "bg-[var(--it-danger)]" },
  ];

  function selectProject(id: string) {
    router.push(`/reports?project=${id}`);
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-[var(--it-text)]">{copy.title}</h1>
        <p className="mt-2 text-sm text-[var(--it-muted)]">{copy.subtitle}</p>
      </div>

      {projects.length === 0 ? (
        <p className="border-t border-[var(--it-hairline)] pt-10 text-sm text-[var(--it-muted)]">{copy.noProjects}</p>
      ) : (
        <>
          <div className="border-t border-[var(--it-hairline)] pt-4">
            <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-[var(--it-faint)]">{copy.selectProject}</label>
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProject(p.id)}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedProjectId === p.id
                      ? "enterprise-button"
                      : "border border-[var(--it-hairline)] text-[var(--it-muted)] hover:border-[var(--it-border)] hover:text-slate-200"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 border-t border-[var(--it-hairline)] pt-4">
            {[
              { label: copy.stats.totalScored, value: candidateRankings.length ? String(candidateRankings.length) : "-" },
              { label: copy.stats.averageScore, value: candidateRankings.length ? String(avgScore) : "-" },
              { label: copy.stats.topScore, value: candidateRankings.length ? String(topScore) : "-" },
              {
                label: copy.stats.passRate,
                value: candidateRankings.length ? `${Math.round((candidateRankings.filter(r => r.avg >= 60).length / candidateRankings.length) * 100)}%` : "-",
              },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold tabular-nums text-[var(--it-text)]">{s.value}</p>
                <p className="mt-0.5 text-xs text-[var(--it-faint)]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="enterprise-card xl:col-span-2 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--it-hairline)] px-6 py-4">
                <h2 className="text-base font-semibold text-[var(--it-text)]">{copy.rankings}</h2>
                <span className="rounded-full border border-[var(--it-success)]/25 bg-[rgba(22,163,74,0.1)] px-2.5 py-1 text-xs text-[#15803d]">
                  {candidateRankings.length} {copy.scored}
                </span>
              </div>

              {candidateRankings.length === 0 ? (
                <p className="px-6 py-10 text-sm text-[var(--it-muted)]">{copy.noCompleted}</p>
              ) : (
                <div className="divide-y divide-[var(--it-hairline)]">
                  {candidateRankings.map(({ candidateKey, group, avg, tone }, i) => {
                    const initials = group.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <div key={candidateKey} className="px-6 py-4 transition-colors hover:bg-gray-900/[0.02]">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                            i === 0 ? "bg-[rgba(217,119,6,0.15)] text-[#b45309]" :
                            i === 1 ? "bg-gray-900/[0.06] text-slate-300" :
                            i === 2 ? "bg-[rgba(217,119,6,0.08)] text-[#b45309]" :
                            "bg-gray-900/[0.03] text-[var(--it-faint)]"
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--it-hairline)] bg-[var(--it-bg)] text-xs font-semibold text-[var(--it-text)]">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            {group.id ? (
                              <Link href={`/candidates/${group.id}/report`} className="block truncate text-sm font-medium text-[var(--it-text)] transition-colors hover:text-[var(--it-link)]">
                                {group.name}
                              </Link>
                            ) : (
                              <p className="truncate text-sm font-medium text-[var(--it-text)]">{group.name}</p>
                            )}
                            <p className="truncate text-xs text-[var(--it-muted)]">{group.email || copy.noEmail}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {group.results.map(r => (
                                <span key={r.id} className="rounded bg-gray-900/[0.04] px-2 py-0.5 text-xs text-[var(--it-muted)]">
                                  {r.assessments ? termShort(r.assessments.name, r.assessments.name.replace(" Test", "").replace(" Assessment", ""), es ? "es" : "en") : "?"} · {r.score}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-xl font-semibold ${tone.text}`}>{avg}</p>
                            <p className="text-xs text-[var(--it-faint)]">{copy.avgScore}</p>
                          </div>
                          {group.id ? (
                            <Link
                              href={`/candidates/${group.id}/report`}
                              className="hidden flex-shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--it-primary)]/30 bg-[var(--it-primary-soft)] px-3 py-2 text-xs font-medium text-[var(--it-link)] transition-colors hover:bg-[var(--it-primary)]/25 sm:flex"
                            >
                              <FileText className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                              {copy.fullReport}
                            </Link>
                          ) : null}
                        </div>
                        <div className="mt-3 ml-[88px]">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-900/[0.06]">
                            <div className={`h-1.5 rounded-full ${tone.bar}`} style={{ width: `${Math.min(avg, 100)}%` }} />
                          </div>
                          <p className="mt-2 text-xs text-[var(--it-faint)]">{copy.assessmentsCompleted(group.results.length)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {results.length > 0 && (
                <div className="rounded-xl border border-[var(--it-success)]/20 bg-[rgba(22,163,74,0.05)] p-5">
                  <h3 className="mb-3 text-sm font-semibold text-[#15803d]">{copy.topRecommendation}</h3>
                  <p className="text-sm leading-relaxed text-[var(--it-muted)]">
                    <span className="font-medium text-[var(--it-text)]">{candidateRankings[0]?.group.name ?? copy.topCandidate}</span> {copy.scoredText}{" "}
                    <span className="font-medium text-[#15803d]">{candidateRankings[0]?.avg ?? "-"}</span> {copy.onAssessment}.
                    {(candidateRankings[0]?.avg ?? 0) >= 75
                      ? copy.advance
                      : copy.review}
                  </p>
                </div>
              )}

              <div className="enterprise-card rounded-xl p-5">
                <h3 className="mb-4 text-sm font-semibold text-[var(--it-text)]">{copy.distribution}</h3>
                {results.length === 0 ? (
                  <p className="text-sm text-[var(--it-muted)]">{copy.noData}</p>
                ) : (
                  <div className="space-y-2">
                    {scoreBands.map((band) => {
                      const count = candidateRankings.filter((r) => {
                        if (band.label === "90-100") return r.avg >= 90;
                        if (band.label === "75-89") return r.avg >= 75 && r.avg < 90;
                        if (band.label === "60-74") return r.avg >= 60 && r.avg < 75;
                        return r.avg < 60;
                      }).length;
                      const pct = candidateRankings.length ? Math.round((count / candidateRankings.length) * 100) : 0;
                      return (
                        <div key={band.label} className="flex items-center gap-3">
                          <span className="w-14 text-xs text-[var(--it-faint)]">{band.label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-900/[0.06]">
                            <div className={`h-2 rounded-full ${band.tone}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-4 text-right text-xs text-[var(--it-faint)]">{count}</span>
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
