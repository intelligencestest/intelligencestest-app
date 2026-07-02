"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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

  const primaryBtn =
    "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-50";
  const ghostBtn =
    "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#1E2240] px-3.5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-[#2d3a70] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="sticky bottom-4 z-30">
      <div className="premium-card flex flex-wrap items-center gap-3 rounded-2xl border-[#2d3a70]/60 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
        {/* State / actions */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          {closed ? (
            <>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
                outcome === "rejected"
                  ? "bg-[#d03b3b]/10 text-[#f28b8b] ring-[#d03b3b]/25"
                  : "bg-[#1E2240]/60 text-slate-300 ring-[#1E2240]"
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/25">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("statusHired")}
                </span>
              )}
              {canReview && (
                <button className={primaryBtn} disabled={busy !== null} onClick={() => patch("review", { stage: "reviewed" }, true)} title="R">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d03b3b]/30 px-3.5 py-2.5 text-sm font-medium text-[#f28b8b] transition-colors hover:bg-[#d03b3b]/10 disabled:cursor-not-allowed disabled:opacity-50"
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
                    ⋯
                  </button>
                  {moreOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 overflow-hidden rounded-xl border border-[#1E2240] bg-[#0D1020] shadow-2xl">
                      <button
                        className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-[#1E2240]/50"
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
          {error && <span className="text-[13px] text-[#f28b8b]">{t("decisionError")}</span>}
        </div>

        {/* Queue navigation */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {position !== null && total !== null && (
            <span className="hidden text-[13px] text-slate-400 sm:inline">
              {queueLabel} · {t("queuePosition", { pos: position, total })}
            </span>
          )}
          {prevHref ? (
            <Link href={prevHref} className={ghostBtn} aria-label={t("queuePrev")} title="K">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <span className={`${ghostBtn} pointer-events-none opacity-40`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </span>
          )}
          {nextHref ? (
            <Link href={nextHref} className={ghostBtn} aria-label={t("queueNext")} title="J">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className={`${ghostBtn} pointer-events-none opacity-40`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
