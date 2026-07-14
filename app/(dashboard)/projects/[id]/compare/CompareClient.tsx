"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ConfidenceLevel, RecommendationLevel, RiskSeverity } from "@/lib/assessment-intelligence";

export interface CompareRow {
  candidateId: string;
  name: string;
  status: string;
  resultsCount: number;
  recommendation: RecommendationLevel | null;
  confidence: ConfidenceLevel | null;
  evidenceStrength: "strong" | "moderate" | "limited" | null;
  topStrength: string | null;
  topRisk: { label: string; severity: RiskSeverity } | null;
  interviewFocus: string | null;
}

type CompareLang = "es" | "en" | "fr";

const STATUS_STYLE: Record<string, string> = {
  invited: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  started: "border-blue-500/25 bg-blue-500/10 text-blue-300",
  completed: "border-emerald-500/25 bg-emerald-50 text-[#15803d]",
};

const RISK_STYLE: Record<RiskSeverity, string> = {
  high: "border-[var(--it-danger)]/25 bg-[rgba(220,38,38,0.08)] text-[#991b1b]",
  medium: "border-[var(--it-warning)]/25 bg-[rgba(217,119,6,0.08)] text-[#92400e]",
  low: "border-[var(--it-hairline)] bg-gray-900/[0.03] text-[var(--it-muted)]",
};

const REC_STYLE: Record<string, string> = {
  strongFit: "border-emerald-500/25 bg-emerald-50 text-[#15803d]",
  recommend: "border-emerald-500/25 bg-emerald-50 text-[#15803d]",
  reviewFirst: "border-[var(--it-warning)]/25 bg-[rgba(217,119,6,0.08)] text-[#92400e]",
  needsVerification: "border-[var(--it-warning)]/25 bg-[rgba(217,119,6,0.08)] text-[#92400e]",
  notEnoughEvidence: "border-[var(--it-hairline)] bg-gray-900/[0.03] text-[var(--it-muted)]",
  lowerPriority: "border-[var(--it-hairline)] bg-gray-900/[0.03] text-[var(--it-muted)]",
};

function copyFor(locale: CompareLang) {
  if (locale === "es") {
    return {
      title: "Comparar candidatos",
      subtitle: (n: number) => `${n} candidato${n === 1 ? "" : "s"} en esta shortlist.`,
      colCandidate: "Candidato",
      colStatus: "Estado",
      colEvidence: "Evidencia",
      colConfidence: "Confianza",
      colStrength: "Fortaleza principal",
      colRisk: "Riesgo a verificar",
      colInterview: "Foco de entrevista",
      colRecommendation: "Recomendación",
      viewReport: "Ver informe completo",
      status: { invited: "Invitado", started: "Iniciado", completed: "Completado" } as Record<string, string>,
      evidence: { strong: "Sólida", moderate: "Moderada", limited: "Limitada" } as Record<string, string>,
      confidence: { high: "Alta", moderate: "Media", low: "Baja" } as Record<string, string>,
      recommendation: {
        strongFit: "Fuerte candidato para entrevista",
        recommend: "Recomendar al cliente",
        reviewFirst: "Revisar primero",
        needsVerification: "Requiere verificación",
        notEnoughEvidence: "Evidencia insuficiente",
        lowerPriority: "Prioridad menor para este rol",
      } as Record<string, string>,
      noResults: "Sin evaluaciones completadas todavía",
      empty: "Aún no hay candidatos en esta shortlist.",
    };
  }
  if (locale === "fr") {
    return {
      title: "Comparer les candidats",
      subtitle: (n: number) => `${n} candidat${n === 1 ? "" : "s"} dans cette shortlist.`,
      colCandidate: "Candidat",
      colStatus: "Statut",
      colEvidence: "Preuves",
      colConfidence: "Confiance",
      colStrength: "Principale force",
      colRisk: "Risque à vérifier",
      colInterview: "Focus d'entretien",
      colRecommendation: "Recommandation",
      viewReport: "Voir le rapport complet",
      status: { invited: "Invité", started: "Commencé", completed: "Terminé" } as Record<string, string>,
      evidence: { strong: "Solides", moderate: "Modérées", limited: "Limitées" } as Record<string, string>,
      confidence: { high: "Élevée", moderate: "Moyenne", low: "Faible" } as Record<string, string>,
      recommendation: {
        strongFit: "Candidat solide pour entretien",
        recommend: "Recommander au client",
        reviewFirst: "À examiner en premier",
        needsVerification: "Nécessite une vérification",
        notEnoughEvidence: "Preuves insuffisantes",
        lowerPriority: "Priorité plus faible pour ce poste",
      } as Record<string, string>,
      noResults: "Aucune évaluation complétée pour le moment",
      empty: "Aucun candidat dans cette shortlist pour l'instant.",
    };
  }
  return {
    title: "Compare candidates",
    subtitle: (n: number) => `${n} candidate${n === 1 ? "" : "s"} in this shortlist.`,
    colCandidate: "Candidate",
    colStatus: "Status",
    colEvidence: "Evidence",
    colConfidence: "Confidence",
    colStrength: "Top strength",
    colRisk: "Risk to verify",
    colInterview: "Interview focus",
    colRecommendation: "Recommendation",
    viewReport: "View full report",
    status: { invited: "Invited", started: "Started", completed: "Completed" } as Record<string, string>,
    evidence: { strong: "Strong", moderate: "Moderate", limited: "Limited" } as Record<string, string>,
    confidence: { high: "High", moderate: "Moderate", low: "Low" } as Record<string, string>,
    recommendation: {
      strongFit: "Strong fit for interview",
      recommend: "Recommend to client",
      reviewFirst: "Review first",
      needsVerification: "Needs verification",
      notEnoughEvidence: "Not enough evidence",
      lowerPriority: "Lower priority for this role",
    } as Record<string, string>,
    noResults: "No completed assessments yet",
    empty: "No candidates in this shortlist yet.",
  };
}

// Agency-safe label — deliberately avoids "Hire"/"Reject"/"Best candidate
// guaranteed"/anything reading as an automatic decision (see agency-pivot brief).
function recommendationKey(level: RecommendationLevel | null, confidence: ConfidenceLevel | null): keyof ReturnType<typeof copyFor>["recommendation"] {
  if (level === null) return "notEnoughEvidence";
  if (level === "strong") return "strongFit";
  if (level === "proceed") return "recommend";
  if (level === "review") return "reviewFirst";
  if (level === "caution") return confidence === "low" ? "notEnoughEvidence" : "needsVerification";
  return confidence === "low" ? "notEnoughEvidence" : "lowerPriority";
}

export default function CompareClient({
  rows,
  projectId,
  projectName,
  clientName,
  locale,
}: {
  rows: CompareRow[];
  projectId: string;
  projectName: string;
  clientName: string | null;
  locale: CompareLang;
}) {
  const t = copyFor(locale);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        {clientName && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--it-faint)]">
            {locale === "es" ? "Cliente" : locale === "fr" ? "Client" : "Client"}: {clientName}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--it-text)]">{t.title}</h1>
        <p className="mt-1 text-sm text-[var(--it-muted)]">{projectName} · {t.subtitle(rows.length)}</p>
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-[var(--it-hairline)] pt-10">
          <p className="text-sm text-[var(--it-muted)]">{t.empty}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--it-hairline)] bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--it-hairline)] text-xs font-medium uppercase tracking-wide text-[var(--it-faint)]">
                <th className="px-4 py-3">{t.colCandidate}</th>
                <th className="px-4 py-3">{t.colStatus}</th>
                <th className="px-4 py-3">{t.colEvidence}</th>
                <th className="px-4 py-3">{t.colConfidence}</th>
                <th className="px-4 py-3">{t.colStrength}</th>
                <th className="px-4 py-3">{t.colRisk}</th>
                <th className="px-4 py-3">{t.colInterview}</th>
                <th className="px-4 py-3">{t.colRecommendation}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--it-hairline)]">
              {rows.map((row) => {
                const hasResults = row.resultsCount > 0;
                const recKey = recommendationKey(row.recommendation, row.confidence);
                return (
                  <tr key={row.candidateId} className="align-top">
                    <td className="px-4 py-3">
                      <span className="font-medium text-[var(--it-text)]">{row.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[row.status] ?? STATUS_STYLE.invited}`}>
                        {t.status[row.status] ?? row.status}
                      </span>
                    </td>
                    {hasResults ? (
                      <>
                        <td className="px-4 py-3 text-[var(--it-text)]">{row.evidenceStrength ? t.evidence[row.evidenceStrength] : "—"}</td>
                        <td className="px-4 py-3 text-[var(--it-text)]">{row.confidence ? t.confidence[row.confidence] : "—"}</td>
                        <td className="px-4 py-3 text-[var(--it-muted)]">{row.topStrength ?? "—"}</td>
                        <td className="px-4 py-3">
                          {row.topRisk ? (
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${RISK_STYLE[row.topRisk.severity]}`}>
                              {row.topRisk.label}
                            </span>
                          ) : (
                            <span className="text-[var(--it-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[var(--it-muted)]">{row.interviewFocus ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${REC_STYLE[recKey]}`}>
                            {t.recommendation[recKey]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/candidates/${row.candidateId}/report`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--it-link)] hover:underline"
                          >
                            {t.viewReport}
                            <ArrowRight className="h-3 w-3" strokeWidth={2} />
                          </Link>
                        </td>
                      </>
                    ) : (
                      <td className="px-4 py-3 text-[var(--it-faint)]" colSpan={6}>{t.noResults}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--it-muted)] hover:text-[var(--it-text)]">
        {locale === "es" ? "← Volver al proyecto" : locale === "fr" ? "← Retour au projet" : "← Back to shortlist"}
      </Link>
    </div>
  );
}
