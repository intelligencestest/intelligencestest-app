"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface DecisionBarProps {
  candidateId: string;
  stage: string;
  outcome: string;
  prevHref: string | null;
  nextHref: string | null;
  position: number | null;
  total: number | null;
  queueLabel: string;
  /** Where "complete review" advances to (next unreviewed candidate), if anywhere. */
  advanceHref: string | null;
}

type Action = "review" | "interview" | "hire" | "reject" | "withdraw" | "reopen";

export default function DecisionBar({
  candidateId,
  stage,
  outcome,
  prevHref,
  nextHref,
  position,
  total,
  queueLabel,
  advanceHref,
}: DecisionBarProps) {
  const t = useTranslations("report");
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const patch = useCallback(
    async (action: Action, payload: { stage?: string; outcome?: string }, goNext = false) => {
      setBusy(action);
      setError(false);
      try {
        const res = await fetch(`/api/candidates/${candidateId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        setMoreOpen(false);
        if (goNext && advanceHref) {
          router.push(advanceHref);
        } else {
          router.refresh();
        }
      } catch {
        setError(true);
      } finally {
        setBusy(null);
      }
    },
    [candidateId, advanceHref, router]
  );

  const closed = outcome !== "pending";
  const canReview = !closed && stage === "completed";
  const canInterview = !closed && stage === "reviewed";
  const canHire = !closed && stage === "interview";
  const canReject = !closed && stage !== "hired";

  // Keyboard: J/K navigate, R review, I interview, X reject.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "j" && nextHref) router.push(nextHref);
      else if (key === "k" && prevHref) router.push(prevHref);
      else if (key === "r" && canReview && !busy) patch("review", { stage: "reviewed" }, true);
      else if (key === "i" && canInterview && !busy) patch("interview", { stage: "interview" });
      else if (key === "x" && canReject && !busy) patch("reject", { outcome: "rejected" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nextHref, prevHref, canReview, canInterview, canReject, busy, patch, router]);

  const primaryBtn = "enterprise-button inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50";
  const ghostBtn = "enterprise-button-secondary inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="sticky bottom-4 z-30">
      <div className="enterprise-card flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
        {/* State / actions */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          {closed ? (
            <>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
                outcome === "rejected"
                  ? "bg-[rgba(166,91,80,0.1)] text-[#cfa097] ring-[rgba(166,91,80,0.25)]"
                  : "bg-white/[0.04] text-slate-300 ring-[var(--it-hairline)]"
              }`}>
                {outcome === "rejected" ? t("outcomeRejected") : outcome === "withdrawn" ? t("outcomeWithdrawn") : t("outcomeExpired")}
              </span>
              <button className={ghostBtn} disabled={busy !== null} onClick={() => patch("reopen", { outcome: "pending" })}>
                {t("decisionReopen")}
              </button>
            </>
          ) : (
            <>
              {stage === "hired" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(79,132,103,0.1)] px-3 py-1.5 text-xs font-medium text-[#a9c8b4] ring-1 ring-[rgba(79,132,103,0.25)]">
                  <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                  {t("statusHired")}
                </span>
              )}
              {canReview && (
                <button className={primaryBtn} disabled={busy !== null} onClick={() => patch("review", { stage: "reviewed" }, true)} title="R">
                  <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  {busy === "review" ? t("decisionSaving") : t("decisionCompleteReview")}
                </button>
              )}
              {canInterview && (
                <button className={primaryBtn} disabled={busy !== null} onClick={() => patch("interview", { stage: "interview" })} title="I">
                  {busy === "interview" ? t("decisionSaving") : t("decisionInterview")}
                </button>
              )}
              {canHire && (
                <button className={primaryBtn} disabled={busy !== null} onClick={() => patch("hire", { stage: "hired" })}>
                  {busy === "hire" ? t("decisionSaving") : t("decisionHire")}
                </button>
              )}
              {canReject && (
                <button
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--it-danger)]/30 px-3.5 py-2.5 text-sm font-medium text-[#cfa097] transition-colors hover:bg-[rgba(166,91,80,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={busy !== null}
                  onClick={() => patch("reject", { outcome: "rejected" })}
                  title="X"
                >
                  {busy === "reject" ? t("decisionSaving") : t("decisionReject")}
                </button>
              )}
              {!closed && stage !== "hired" && (
                <div className="relative">
                  <button className={ghostBtn} onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} aria-haspopup="true">
                    <MoreHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </button>
                  {moreOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 overflow-hidden rounded-xl border border-[var(--it-hairline)] bg-[var(--it-surface-raised)] shadow-2xl">
                      <button
                        className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.05]"
                        disabled={busy !== null}
                        onClick={() => patch("withdraw", { outcome: "withdrawn" })}
                      >
                        {t("decisionWithdraw")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {error && <span className="text-[13px] text-[#cfa097]">{t("decisionError")}</span>}
        </div>

        {/* Queue navigation */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {position !== null && total !== null && (
            <span className="hidden text-[13px] text-[var(--it-muted)] sm:inline">
              {queueLabel} · {t("queuePosition", { pos: position, total })}
            </span>
          )}
          {prevHref ? (
            <Link href={prevHref} className={ghostBtn} aria-label={t("queuePrev")} title="K">
              <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          ) : (
            <span className={`${ghostBtn} pointer-events-none opacity-40`}>
              <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
          )}
          {nextHref ? (
            <Link href={nextHref} className={ghostBtn} aria-label={t("queueNext")} title="J">
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          ) : (
            <span className={`${ghostBtn} pointer-events-none opacity-40`}>
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
