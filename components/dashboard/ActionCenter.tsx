"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { relativeTime } from "@/lib/dashboard/format";

export interface AlertCandidate {
  id: string;
  name: string;
  expiresAt: string | null;
}

export type BlockedReason =
  | { kind: "noAssessments" }
  | { kind: "allInvitesExpired"; count: number }
  | { kind: "inactive"; days: number };

export type AttentionAlert =
  | { kind: "expiring"; candidates: AlertCandidate[] }
  | { kind: "expired"; candidates: AlertCandidate[] }
  | { kind: "blocked"; projectId: string; name: string; reason: BlockedReason }
  | { kind: "atRisk"; projectId: string; name: string; pct: number; daysLeft: number | null }
  | { kind: "stalled"; count: number };

const SEVERITY_STYLE = {
  warning: { text: "text-[#fab219]", bg: "bg-[#fab219]/10", ring: "ring-[#fab219]/25" },
  serious: { text: "text-[#ec835a]", bg: "bg-[#ec835a]/10", ring: "ring-[#ec835a]/25" },
  info: { text: "text-[#6da7ec]", bg: "bg-[#3987e5]/10", ring: "ring-[#3987e5]/25" },
} as const;

const ICON_PATHS: Record<string, string> = {
  expiring: "M12 8v4l2.5 2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  expired: "M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  stalled: "M10 9v6m4-6v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  project: "M3 21v-4m0 0V5a2 2 0 0 1 2-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 0 0-2 2Z",
};

const MAX_VISIBLE_ALERTS = 5;
const MAX_INLINE_CANDIDATES = 5;

function AlertIcon({ kind }: { kind: string }) {
  return (
    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON_PATHS[kind]} />
    </svg>
  );
}

/** Per-candidate inline resolution: extend the invite link by 7 days. */
function ExtendButton({ candidateId, onDone }: { candidateId: string; onDone: () => void }) {
  const t = useTranslations("dashboard");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const extend = async () => {
    setState("busy");
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extendInviteDays: 7 }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      onDone();
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  if (state === "done") {
    return (
      <span role="status" className="inline-flex items-center gap-1 text-xs font-medium text-[#3fbf3f]">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {t("attnExtended")}
      </span>
    );
  }
  return (
    <button
      onClick={extend}
      disabled={state === "busy"}
      className="cursor-pointer whitespace-nowrap rounded-lg border border-[#1E2240] px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-[#2d3a70] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {state === "error" ? t("attnErrorRetry") : state === "busy" ? t("attnExtending") : t("attnExtend")}
    </button>
  );
}

function CandidateSubList({ candidates, nowMs }: { candidates: AlertCandidate[]; nowMs: number }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const open = candidates.filter((c) => !resolved.has(c.id));

  return (
    <div className="border-t border-[#1E2240]/60 bg-[#07080F]/40">
      {open.slice(0, MAX_INLINE_CANDIDATES).map((c) => (
        <div key={c.id} className="flex items-center gap-3 py-2 pl-5 pr-5 sm:pl-[72px]">
          <Link
            href={`/candidates/${c.id}`}
            className="min-w-0 truncate text-[13px] font-medium text-slate-300 transition-colors hover:text-white"
          >
            {c.name || t("unknown")}
          </Link>
          {c.expiresAt && (
            <span className="flex-shrink-0 text-xs text-slate-500">
              {t("attnExpires", {
                time: relativeTime(new Date(c.expiresAt).getTime(), nowMs, dateLocale),
              })}
            </span>
          )}
          <span className="ml-auto flex-shrink-0">
            <ExtendButton
              candidateId={c.id}
              onDone={() => {
                setResolved((prev) => new Set(prev).add(c.id));
                router.refresh();
              }}
            />
          </span>
        </div>
      ))}
      {open.length > MAX_INLINE_CANDIDATES && (
        <Link
          href="/candidates?stage=invited"
          className="block py-2 pl-5 pr-5 sm:pl-[72px] text-xs font-medium text-[#8CB1FF] hover:underline"
        >
          {t("attnMore", { count: open.length - MAX_INLINE_CANDIDATES })} →
        </Link>
      )}
    </div>
  );
}

/**
 * Action Center: exceptions only — every row states a consequence and resolves
 * inline or in one click. Routine work lives in the workload tiles and queue.
 */
export default function ActionCenter({ alerts, nowMs }: { alerts: AttentionAlert[]; nowMs: number }) {
  const t = useTranslations("dashboard");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? alerts : alerts.slice(0, MAX_VISIBLE_ALERTS);

  const rowMeta = (alert: AttentionAlert) => {
    switch (alert.kind) {
      case "expiring":
        return {
          severity: "warning" as const,
          icon: "expiring",
          text: t("attnExpiring", { count: alert.candidates.length }),
          hint: t("attnExpiringHint"),
        };
      case "expired":
        return {
          severity: "serious" as const,
          icon: "expired",
          text: t("attnExpired", { count: alert.candidates.length }),
          hint: t("attnExpiredHint"),
        };
      case "blocked": {
        const reason =
          alert.reason.kind === "noAssessments"
            ? t("blockedReasonNoAssessments")
            : alert.reason.kind === "allInvitesExpired"
              ? t("blockedReasonExpired", { count: alert.reason.count })
              : t("blockedReasonInactive", { days: alert.reason.days });
        return {
          severity: "serious" as const,
          icon: "project",
          text: t("attnBlocked", { name: alert.name, reason }),
          hint: "",
        };
      }
      case "atRisk":
        return {
          severity: "serious" as const,
          icon: "project",
          text:
            alert.daysLeft !== null && alert.daysLeft < 0
              ? t("attnProjectOverdue", { name: alert.name, pct: alert.pct })
              : t("attnProjectAtRisk", {
                  name: alert.name,
                  pct: alert.pct,
                  days: Math.max(alert.daysLeft ?? 0, 0),
                }),
          hint: "",
        };
      case "stalled":
        return {
          severity: "info" as const,
          icon: "stalled",
          text: t("attnStalled", { count: alert.count }),
          hint: t("attnStalledHint"),
        };
    }
  };

  const alertKey = (alert: AttentionAlert) =>
    alert.kind === "blocked" || alert.kind === "atRisk" ? `${alert.kind}-${alert.projectId}` : alert.kind;

  return (
    <section id="attention" className="premium-card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-[#1E2240] px-5 py-3.5">
        <h2 className="text-sm font-semibold text-white">{t("needsAttention")}</h2>
        {alerts.length > 0 && (
          <span className="rounded-full border border-[#1E2240] px-2.5 py-0.5 text-xs font-medium tabular-nums text-slate-400">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#0ca30c]/10 ring-1 ring-[#0ca30c]/25">
            <svg className="h-5 w-5 text-[#3fbf3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-200">{t("allClearTitle")}</p>
          <p className="mt-1 text-[13px] text-slate-400">{t("allClearBody")}</p>
        </div>
      ) : (
        <div className="divide-y divide-[#1E2240]">
          {visible.map((alert) => {
            const meta = rowMeta(alert);
            const sev = SEVERITY_STYLE[meta.severity];
            const key = alertKey(alert);
            const expandable = alert.kind === "expiring" || alert.kind === "expired";
            const isOpen = expanded === key;

            const row = (
              <div className="flex items-center gap-4 px-5 py-3.5">
                <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${sev.bg} ${sev.text} ${sev.ring}`}>
                  <AlertIcon kind={meta.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-200">{meta.text}</span>
                  {meta.hint && <span className="mt-0.5 block text-[13px] text-slate-400">{meta.hint}</span>}
                </span>
                {expandable ? (
                  <span className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-[#8CB1FF]">
                    {isOpen ? t("attnHideCandidates") : t("attnShowCandidates")}
                    <svg
                      className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex-shrink-0 whitespace-nowrap text-[13px] font-medium text-[#8CB1FF]">
                    {alert.kind === "stalled" ? t("attnStalledAction") : t("attnProjectAction")} →
                  </span>
                )}
              </div>
            );

            if (expandable) {
              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : key)}
                    className="block w-full cursor-pointer text-left transition-colors hover:bg-[#1E2240]/30 focus-visible:bg-[#1E2240]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1D4ED8]"
                    aria-expanded={isOpen}
                  >
                    {row}
                  </button>
                  {isOpen && <CandidateSubList candidates={alert.candidates} nowMs={nowMs} />}
                </div>
              );
            }
            return (
              <Link
                key={key}
                href={
                  alert.kind === "stalled"
                    ? "/candidates?stage=invited"
                    : `/projects/${alert.projectId}`
                }
                className="block transition-colors hover:bg-[#1E2240]/30 focus-visible:bg-[#1E2240]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1D4ED8]"
              >
                {row}
              </Link>
            );
          })}
          {!showAll && alerts.length > MAX_VISIBLE_ALERTS && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="block w-full cursor-pointer px-5 py-3 text-center text-[13px] font-medium text-[#8CB1FF] transition-colors hover:bg-[#1E2240]/30 focus-visible:bg-[#1E2240]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1D4ED8]"
            >
              {t("attnMore", { count: alerts.length - MAX_VISIBLE_ALERTS })}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
