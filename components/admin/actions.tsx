"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ActionState = "idle" | "busy" | "done" | "error";

const btnCls =
  "cursor-pointer rounded-lg border border-[#1E2240] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-[#8b5cf6]/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

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
