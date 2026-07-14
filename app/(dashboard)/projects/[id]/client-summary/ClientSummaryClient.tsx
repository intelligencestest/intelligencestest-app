"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, Save } from "lucide-react";
import type { ConfidenceLevel, RecommendationLevel } from "@/lib/assessment-intelligence";

export interface SummaryCandidate {
  candidateId: string;
  name: string;
  recommendation: RecommendationLevel;
  confidence: ConfidenceLevel;
  rationale: string;
  strengths: string[];
  pointsToVerify: string[];
  interviewFocus: string[];
}

type SummaryLang = "es" | "en" | "fr";

const REC_BADGE_STYLE: Record<string, string> = {
  recommend: "border-emerald-500/25 bg-emerald-50 text-[#15803d]",
  review: "border-[var(--it-warning)]/25 bg-[rgba(217,119,6,0.08)] text-[#92400e]",
  lower: "border-[var(--it-hairline)] bg-gray-900/[0.03] text-[var(--it-muted)]",
};

// Deliberately softer than the internal comparison screen's 6-way label —
// this text is meant to leave the agency's own building. No raw scores, no
// severity words, no "hire/reject"/automatic-decision language anywhere here.
function tierFor(level: RecommendationLevel): "recommend" | "review" | "lower" {
  if (level === "strong" || level === "proceed") return "recommend";
  if (level === "review" || level === "caution") return "review";
  return "lower";
}

function copyFor(locale: SummaryLang) {
  if (locale === "es") {
    return {
      title: "Resumen para el cliente",
      subtitle: "Listo para compartir con su cliente.",
      roleSummary: "Resumen del rol",
      client: "Cliente",
      role: "Rol",
      overview: "Resumen de la shortlist",
      overviewText: (total: number, completed: number) =>
        `${total} candidato${total === 1 ? "" : "s"} evaluado${total === 1 ? "" : "s"} · ${completed} evaluación${completed === 1 ? "" : "es"} completada${completed === 1 ? "" : "s"}.`,
      tier: { recommend: "Recomendado al cliente", review: "Revisar antes de avanzar", lower: "Prioridad menor para este rol" } as Record<string, string>,
      why: "Por qué se recomienda",
      strengths: "Fortalezas relevantes para el rol",
      verify: "Puntos a verificar en la entrevista",
      interview: "Foco sugerido para la entrevista",
      humanReviewTitle: "Nota de revisión humana",
      humanReviewBody:
        "Este resumen se basa en evidencia estructurada de evaluaciones. No sustituye el criterio profesional y queda sujeto a revisión en entrevista. La decisión final de contratación corresponde al cliente.",
      agencyNoteTitle: "Nota de la agencia",
      agencyNotePlaceholder: "Añada un comentario o contexto adicional para el cliente antes de compartir este resumen (opcional).",
      save: "Guardar nota",
      saving: "Guardando...",
      saved: "Guardado",
      print: "Imprimir / Exportar PDF",
      empty: "Aún no hay candidatos con evaluaciones completadas para incluir en este resumen.",
      back: "← Volver al proyecto",
    };
  }
  if (locale === "fr") {
    return {
      title: "Résumé client",
      subtitle: "Prêt à partager avec votre client.",
      roleSummary: "Résumé du poste",
      client: "Client",
      role: "Poste",
      overview: "Aperçu de la shortlist",
      overviewText: (total: number, completed: number) =>
        `${total} candidat${total === 1 ? "" : "s"} évalué${total === 1 ? "" : "s"} · ${completed} évaluation${completed === 1 ? "" : "s"} complétée${completed === 1 ? "" : "s"}.`,
      tier: { recommend: "Recommandé au client", review: "À examiner avant de poursuivre", lower: "Priorité plus faible pour ce poste" } as Record<string, string>,
      why: "Pourquoi ce candidat est recommandé",
      strengths: "Forces pertinentes pour le poste",
      verify: "Points à vérifier en entretien",
      interview: "Focus d'entretien suggéré",
      humanReviewTitle: "Note de revue humaine",
      humanReviewBody:
        "Ce résumé s'appuie sur des preuves structurées issues des évaluations. Il ne remplace pas le jugement professionnel et reste soumis à un examen en entretien. La décision finale d'embauche revient au client.",
      agencyNoteTitle: "Note de l'agence",
      agencyNotePlaceholder: "Ajoutez un commentaire ou un contexte pour le client avant de partager ce résumé (facultatif).",
      save: "Enregistrer la note",
      saving: "Enregistrement...",
      saved: "Enregistré",
      print: "Imprimer / Exporter en PDF",
      empty: "Aucun candidat avec des évaluations complétées à inclure dans ce résumé pour le moment.",
      back: "← Retour au projet",
    };
  }
  return {
    title: "Client summary",
    subtitle: "Ready to share with your client.",
    roleSummary: "Role summary",
    client: "Client",
    role: "Role",
    overview: "Shortlist overview",
    overviewText: (total: number, completed: number) =>
      `${total} candidate${total === 1 ? "" : "s"} evaluated · ${completed} assessment${completed === 1 ? "" : "s"} completed.`,
    tier: { recommend: "Recommended to client", review: "Review before proceeding", lower: "Lower priority for this role" } as Record<string, string>,
    why: "Why this candidate is recommended",
    strengths: "Role-relevant strengths",
    verify: "Points to verify in interview",
    interview: "Suggested interview focus",
    humanReviewTitle: "Human review note",
    humanReviewBody:
      "This summary is based on structured assessment evidence. It does not replace professional judgment and remains subject to interview review. The final hiring decision belongs to the client.",
    agencyNoteTitle: "Agency note",
    agencyNotePlaceholder: "Add a comment or extra context for the client before sharing this summary (optional).",
    save: "Save note",
    saving: "Saving...",
    saved: "Saved",
    print: "Print / Export PDF",
    empty: "No candidates with completed assessments to include in this summary yet.",
    back: "← Back to shortlist",
  };
}

export default function ClientSummaryClient({
  projectId,
  projectName,
  clientName,
  roleTitle,
  description,
  candidateCount,
  completedCount,
  candidates,
  initialNote,
  locale,
}: {
  projectId: string;
  projectName: string;
  clientName: string | null;
  roleTitle: string | null;
  description: string | null;
  candidateCount: number;
  completedCount: number;
  candidates: SummaryCandidate[];
  initialNote: string | null;
  locale: SummaryLang;
}) {
  const t = copyFor(locale);
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveNote = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/projects/${projectId}/client-summary-note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // silent — the textarea keeps the unsaved text either way
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-8 print:max-w-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--it-text)]">{t.title}</h1>
          <p className="mt-1 text-sm text-[var(--it-muted)]">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#f3f4f6] bg-[#f8fafc] px-4 py-2.5 text-sm font-medium text-[#4338ca] transition-colors hover:bg-[#f3f4f6]"
        >
          <Printer className="h-4 w-4" strokeWidth={2} />
          {t.print}
        </button>
      </div>

      {/* Role summary + shortlist overview — the printable document header */}
      <div className="enterprise-card rounded-xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--it-faint)]">{t.roleSummary}</p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--it-text)]">{roleTitle ?? projectName}</h2>
        {clientName && <p className="mt-1 text-sm text-[var(--it-muted)]">{t.client}: {clientName}</p>}
        {description && <p className="mt-3 text-sm leading-6 text-[var(--it-muted)]">{description}</p>}
        <div className="mt-4 border-t border-[var(--it-hairline)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--it-faint)]">{t.overview}</p>
          <p className="mt-1 text-sm text-[var(--it-text)]">{t.overviewText(candidateCount, completedCount)}</p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <p className="text-sm text-[var(--it-muted)]">{t.empty}</p>
      ) : (
        <div className="space-y-5">
          {candidates.map((candidate) => {
            const tier = tierFor(candidate.recommendation);
            return (
              <div key={candidate.candidateId} className="enterprise-card break-inside-avoid rounded-xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[var(--it-text)]">{candidate.name}</h3>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${REC_BADGE_STYLE[tier]}`}>
                    {t.tier[tier]}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--it-faint)]">{t.why}</p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--it-text)]">{candidate.rationale}</p>
                </div>

                {candidate.strengths.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--it-faint)]">{t.strengths}</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {candidate.strengths.map((s) => (
                        <li key={s} className="flex gap-2 text-sm leading-6 text-[var(--it-muted)]">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--it-faint)]" aria-hidden="true" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {candidate.pointsToVerify.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--it-faint)]">{t.verify}</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {candidate.pointsToVerify.map((v) => (
                        <li key={v} className="flex gap-2 text-sm leading-6 text-[var(--it-muted)]">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--it-faint)]" aria-hidden="true" />
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {candidate.interviewFocus.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--it-faint)]">{t.interview}</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {candidate.interviewFocus.map((q) => (
                        <li key={q} className="flex gap-2 text-sm leading-6 text-[var(--it-muted)]">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--it-faint)]" aria-hidden="true" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Agency note — editable, persisted, included in print */}
      <div className="enterprise-card rounded-xl p-6 print:break-inside-avoid">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--it-faint)]">{t.agencyNoteTitle}</p>
        <textarea
          value={note}
          onChange={(e) => { setNote(e.target.value); setSaved(false); }}
          placeholder={t.agencyNotePlaceholder}
          rows={4}
          className="mt-2 w-full rounded-lg border border-[var(--it-hairline)] bg-white px-4 py-3 text-sm text-[var(--it-text)] outline-none placeholder:text-[var(--it-faint)] transition-colors focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/20 print:border-none print:p-0"
        />
        <div className="mt-2 flex items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--it-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--it-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={2} />
            {saving ? t.saving : t.save}
          </button>
          {saved && <span className="text-xs text-[#15803d]">{t.saved}</span>}
        </div>
      </div>

      {/* Human review note — always present, never removable from the printed output */}
      <div className="rounded-xl border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-5 print:break-inside-avoid">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--it-faint)]">{t.humanReviewTitle}</p>
        <p className="mt-1.5 text-sm leading-6 text-[var(--it-muted)]">{t.humanReviewBody}</p>
      </div>

      <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--it-muted)] hover:text-[var(--it-text)] print:hidden">
        {t.back}
      </Link>
    </div>
  );
}
