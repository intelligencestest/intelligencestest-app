"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Briefcase, Check, ChevronDown, Clock, Hourglass, XCircle, type LucideIcon } from "lucide-react";
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
  warning: { text: "text-[#cdb584]", bg: "bg-[rgba(168,135,61,0.08)]", ring: "ring-[rgba(168,135,61,0.28)]" },
  serious: { text: "text-[#cfa097]", bg: "bg-[rgba(166,91,80,0.08)]", ring: "ring-[rgba(166,91,80,0.28)]" },
  info: { text: "text-[#a9b8c9]", bg: "bg-[rgba(110,127,148,0.08)]", ring: "ring-[rgba(110,127,148,0.28)]" },
} as const;

const ALERT_ICONS: Record<string, LucideIcon> = {
  expiring: Clock,
  expired: XCircle,
  stalled: Hourglass,
  project: Briefcase,
};

const MAX_VISIBLE_ALERTS = 5;
const MAX_INLINE_CANDIDATES = 5;

function AlertIcon({ kind }: { kind: string }) {
  const Icon = ALERT_ICONS[kind];
  return <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />;
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
      <span role="status" className="inline-flex items-center gap-1 text-xs font-medium text-[#a9c8b4]">
        <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        {t("attnExtended")}
      </span>
    );
  }
  return (
    <button
      onClick={extend}
      disabled={state === "busy"}
      className="enterprise-button-secondary cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="border-t enterprise-divider bg-black/10">
      {open.slice(0, MAX_INLINE_CANDIDATES).map((c) => (
        <div key={c.id} className="flex items-center gap-3 py-2 pl-5 pr-5 sm:pl-[72px]">
          <Link
            href={`/candidates/${c.id}`}
            className="min-w-0 truncate text-[13px] font-medium text-slate-300 transition-colors hover:text-white"
          >
            {c.name || t("unknown")}
          </Link>
          {c.expiresAt && (
            <span className="flex-shrink-0 text-xs text-[var(--it-faint)]">
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
          className="enterprise-link block py-2 pl-5 pr-5 sm:pl-[72px] text-xs font-medium"
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
    <section id="attention" className="enterprise-card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b enterprise-divider px-5 py-3.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--it-muted)]">{t("needsAttention")}</h2>
        {alerts.length > 0 && (
          <span className="enterprise-chip rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <div className="enterprise-chip-success mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full">
            <Check className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-200">{t("allClearTitle")}</p>
          <p className="mt-1 text-[13px] text-[var(--it-muted)]">{t("allClearBody")}</p>
        </div>
      ) : (
        <div>
          {visible.map((alert) => {
            const meta = rowMeta(alert);
            const sev = SEVERITY_STYLE[meta.severity];
            const key = alertKey(alert);
            const expandable = alert.kind === "expiring" || alert.kind === "expired";
            const isOpen = expanded === key;

            const row = (
              <div className="enterprise-table-row flex items-center gap-4 px-5 py-3.5">
                <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${sev.bg} ${sev.text} ${sev.ring}`}>
                  <AlertIcon kind={meta.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-200">{meta.text}</span>
                  {meta.hint && <span className="mt-0.5 block text-[13px] text-[var(--it-muted)]">{meta.hint}</span>}
                </span>
                {expandable ? (
                  <span className="enterprise-link flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-medium">
                    {isOpen ? t("attnHideCandidates") : t("attnShowCandidates")}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                ) : (
                  <span className="enterprise-link flex-shrink-0 whitespace-nowrap text-[13px] font-medium">
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
                    className="block w-full cursor-pointer text-left transition-colors hover:bg-white/[0.025] focus-visible:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--it-primary)]"
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
                className="block transition-colors hover:bg-white/[0.025] focus-visible:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--it-primary)]"
              >
                {row}
              </Link>
            );
          })}
          {!showAll && alerts.length > MAX_VISIBLE_ALERTS && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="enterprise-link block w-full cursor-pointer px-5 py-3 text-center text-[13px] font-medium transition-colors hover:bg-white/[0.025] focus-visible:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--it-primary)]"
            >
              {t("attnMore", { count: alerts.length - MAX_VISIBLE_ALERTS })}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
