"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ActionState = "idle" | "busy" | "done" | "error";

const btnCls =
  "cursor-pointer rounded-lg border border-[#f3f4f6] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-[#8b5cf6]/60 hover:text-[var(--it-text)] disabled:cursor-not-allowed disabled:opacity-50";

function useAction(run: (arg?: string | null) => Promise<Response>) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fire = async (arg?: string | null) => {
    setState("busy");
    setError(null);
    try {
      const res = await run(arg);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Action failed");
      }
      setState("done");
      router.refresh();
      setTimeout(() => setState("idle"), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
      setState("error");
      setTimeout(() => setState("idle"), 4000);
    }
  };

  return { state, error, fire };
}

/** Audited cross-tenant invite extension (support role). */
export function ExtendInviteButton({ candidateId }: { candidateId: string }) {
  const { state, error, fire } = useAction((reason) =>
    fetch(`/api/admin/candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extendInviteDays: 7, reason }),
    })
  );

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => {
          // Reason is optional but encouraged: it lands in the audit row.
          const input = window.prompt("Reason (goes to the audit log, optional):", "");
          if (input === null) return;
          void fire(input.trim() || null);
        }}
        className={btnCls}
      >
        {state === "busy" ? "Extending…" : state === "done" ? "Extended ✓" : "Extend invite 7 days"}
      </button>
      {state === "error" && <span className="text-xs text-[#f28b8b]" role="alert">{error}</span>}
    </span>
  );
}

/** Extends a company's trial by N days and marks it 'extended' (ops role). */
export function ExtendTrialButton({ companyId }: { companyId: string }) {
  const { state, error, fire } = useAction((days) =>
    fetch("/api/admin/workspaces", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, extend_trial_days: Number(days) }),
    })
  );

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => {
          const input = window.prompt("Extend trial by how many days?", "7");
          if (input === null) return;
          const days = Number(input.trim());
          if (!Number.isFinite(days) || days <= 0) return;
          void fire(String(days));
        }}
        className={btnCls}
      >
        {state === "busy" ? "Extending…" : state === "done" ? "Trial extended ✓" : "Extend trial"}
      </button>
      {state === "error" && <span className="text-xs text-[#f28b8b]" role="alert">{error}</span>}
    </span>
  );
}

/** Changes a company's plan (ops role). */
export function ChangePlanButton({ companyId }: { companyId: string }) {
  const { state, error, fire } = useAction((plan) =>
    fetch("/api/admin/workspaces", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, plan }),
    })
  );

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => {
          const input = window.prompt("New plan (trial / starter / professional / enterprise):", "");
          const plan = input?.trim().toLowerCase();
          if (!plan || !["trial", "starter", "professional", "enterprise"].includes(plan)) return;
          void fire(plan);
        }}
        className={btnCls}
      >
        {state === "busy" ? "Updating…" : state === "done" ? "Plan updated ✓" : "Change plan"}
      </button>
      {state === "error" && <span className="text-xs text-[#f28b8b]" role="alert">{error}</span>}
    </span>
  );
}

/** Marks a company's subscription status (manual / pending_payment / active / past_due / cancelled) — ops role. */
export function SetSubscriptionStatusButton({ companyId }: { companyId: string }) {
  const { state, error, fire } = useAction((subscription_status) =>
    fetch("/api/admin/workspaces", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, subscription_status }),
    })
  );

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => {
          const input = window.prompt(
            "Subscription status (manual / pending_payment / active / past_due / cancelled):",
            "manual"
          );
          const value = input?.trim().toLowerCase();
          if (!value || !["manual", "pending_payment", "active", "past_due", "cancelled"].includes(value)) return;
          void fire(value);
        }}
        className={btnCls}
      >
        {state === "busy" ? "Updating…" : state === "done" ? "Status updated ✓" : "Set subscription status"}
      </button>
      {state === "error" && <span className="text-xs text-[#f28b8b]" role="alert">{error}</span>}
    </span>
  );
}

/** Sets custom candidate/project/recruiter caps (e.g. for a negotiated Enterprise deal) — ops role. Empty input = unlimited. */
export function SetCustomLimitsButton({ companyId }: { companyId: string }) {
  const { state, error, fire } = useAction((payload) =>
    fetch("/api/admin/workspaces", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: payload as string,
    })
  );

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => {
          const parse = (raw: string | null) => {
            if (raw === null) return undefined;
            const trimmed = raw.trim();
            if (trimmed === "") return null; // unlimited
            const n = Number(trimmed);
            return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
          };
          const candidates = parse(window.prompt("Candidate limit per month (blank = unlimited):", ""));
          const projects = parse(window.prompt("Active project limit (blank = unlimited):", ""));
          const recruiters = parse(window.prompt("Recruiter limit (blank = unlimited):", ""));
          void fire(
            JSON.stringify({
              company_id: companyId,
              candidate_limit: candidates,
              project_limit: projects,
              recruiter_limit: recruiters,
            })
          );
        }}
        className={btnCls}
      >
        {state === "busy" ? "Updating…" : state === "done" ? "Limits updated ✓" : "Set custom limits"}
      </button>
      {state === "error" && <span className="text-xs text-[#f28b8b]" role="alert">{error}</span>}
    </span>
  );
}

const TRIAL_EMAIL_KINDS = ["trial_started", "trial_day1", "trial_day2", "trial_ending", "trial_expired"] as const;

/** Manually sends a trial-lifecycle email (support role) — the entry point until a scheduler exists. */
export function SendTrialEmailButton({ companyId }: { companyId: string }) {
  const { state, error, fire } = useAction((kind) =>
    fetch("/api/admin/trial-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, kind }),
    })
  );

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => {
          const input = window.prompt(`Send which trial email? (${TRIAL_EMAIL_KINDS.join(" / ")})`, "trial_started");
          const kind = input?.trim();
          if (!kind || !(TRIAL_EMAIL_KINDS as readonly string[]).includes(kind)) return;
          void fire(kind);
        }}
        className={btnCls}
      >
        {state === "busy" ? "Sending…" : state === "done" ? "Email sent ✓" : "Send trial email"}
      </button>
      {state === "error" && <span className="text-xs text-[#f28b8b]" role="alert">{error}</span>}
    </span>
  );
}

/** Sends the workspace admin a password-reset email (support role). */
export function ResetPasswordButton({ companyId, email }: { companyId: string; email?: string }) {
  const { state, error, fire } = useAction(() =>
    fetch("/api/admin/workspaces/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: companyId, email }),
    })
  );

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" disabled={state === "busy"} onClick={() => void fire()} className={btnCls}>
        {state === "busy" ? "Sending…" : state === "done" ? "Email sent ✓" : "Send password reset"}
      </button>
      {state === "error" && <span className="text-xs text-[#f28b8b]" role="alert">{error}</span>}
    </span>
  );
}
