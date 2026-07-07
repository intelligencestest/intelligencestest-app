"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type AdminCompanyRow = {
  id: string;
  name: string;
  email: string;
  language: string;
  industry: string | null;
  logo_url: string | null;
  created_at: string;
  status: string;
  plan: string;
  activeUsers: number;
  projects: number;
  assessmentsUsed: number;
};

type BusyState = { id: string; action: string } | null;

const plans = [
  { value: "trial", label: "Trial" },
  { value: "starter", label: "Starter · €29/mo" },
  { value: "professional", label: "Professional · €79/mo" },
  { value: "enterprise", label: "Enterprise · custom" },
] as const;
const statuses = ["active", "disabled"];
const languages = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

function planLabel(plan: string) {
  return plans.find((item) => item.value === plan)?.label ?? `Legacy · ${plan}`;
}

async function requestJson(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Request failed");
  }

  return response.json();
}

export default function AdminClient({ rows }: { rows: AdminCompanyRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<BusyState>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function withBusy(id: string, action: string, task: () => Promise<void>) {
    setBusy({ id, action });
    setMessage(null);
    try {
      await task();
      setMessage({ type: "success", text: "Action completed." });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Action failed." });
    } finally {
      setBusy(null);
    }
  }

  async function createWorkspace(formData: FormData) {
    await withBusy("new", "create", async () => {
      await requestJson("/api/admin/workspaces", {
        method: "POST",
        body: JSON.stringify({
          company_name: formData.get("company_name"),
          admin_name: formData.get("admin_name"),
          admin_email: formData.get("admin_email"),
          industry: formData.get("industry"),
          plan: formData.get("plan"),
          language: formData.get("language"),
          status: "active",
        }),
      });
    });
  }

  async function updateWorkspace(companyId: string, formData: FormData) {
    await withBusy(companyId, "update", async () => {
      await requestJson("/api/admin/workspaces", {
        method: "PATCH",
        body: JSON.stringify({
          company_id: companyId,
          company_name: formData.get("company_name"),
          email: formData.get("email"),
          industry: formData.get("industry"),
          logo_url: formData.get("logo_url"),
          plan: formData.get("plan"),
          language: formData.get("language"),
          status: formData.get("status"),
        }),
      });
    });
  }

  async function setWorkspaceStatus(companyId: string, status: string) {
    await withBusy(companyId, status, async () => {
      await requestJson("/api/admin/workspaces", {
        method: "PATCH",
        body: JSON.stringify({ company_id: companyId, status }),
      });
    });
  }

  async function resetPassword(companyId: string) {
    await withBusy(companyId, "reset", async () => {
      await requestJson("/api/admin/workspaces/reset-password", {
        method: "POST",
        body: JSON.stringify({ company_id: companyId }),
      });
    });
  }

  async function deleteWorkspace(companyId: string, name: string) {
    if (!window.confirm(`Delete workspace "${name}" and its related data? This cannot be undone.`)) return;

    await withBusy(companyId, "delete", async () => {
      const response = await fetch(`/api/admin/workspaces?company_id=${encodeURIComponent(companyId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Delete failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/25 bg-red-500/10 text-red-200"
          }`}
          role={message.type === "error" ? "alert" : "status"}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-lg border border-[#1E2240] bg-[#0D1020] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Create workspace</h2>
            <p className="mt-1 text-sm text-slate-400">Create a company workspace and send the admin a setup email.</p>
          </div>
        </div>
        <form action={createWorkspace} className="mt-5 grid gap-4 md:grid-cols-3">
          <input name="company_name" required placeholder="Company name" className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]" />
          <input name="admin_name" required placeholder="Admin name" className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]" />
          <input name="admin_email" required type="email" placeholder="Admin email" className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]" />
          <input name="industry" placeholder="Industry" className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]" />
          <select name="plan" defaultValue="trial" className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]">
            {plans.map((plan) => <option key={plan.value} value={plan.value}>{plan.label}</option>)}
          </select>
          <select name="language" defaultValue="es" className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]">
            {languages.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}
          </select>
          <button
            type="submit"
            disabled={busy?.id === "new"}
            className="rounded-lg bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1e40af] disabled:cursor-wait disabled:opacity-70 md:col-span-3"
          >
            {busy?.id === "new" ? "Creating..." : "Create workspace"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-[#1E2240] bg-[#0D1020]">
        <div className="border-b border-[#1E2240] p-5">
          <h2 className="text-xl font-semibold text-white">Companies</h2>
          <p className="mt-1 text-sm text-slate-400">{rows.length} workspaces found.</p>
        </div>
        <div className="divide-y divide-[#1E2240]">
          {rows.map((row) => (
            <details key={row.id} className="group p-5">
              <summary className="grid cursor-pointer list-none gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1fr_auto] lg:items-center">
                <div>
                  <p className="font-semibold text-white">{row.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{row.email}</p>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                  row.status === "disabled"
                    ? "border-red-500/25 bg-red-500/10 text-red-200"
                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                }`}>
                  {row.status}
                </span>
                <span className="text-sm text-slate-300">{planLabel(row.plan)}</span>
                <span className="text-sm text-slate-300">{row.activeUsers} users</span>
                <span className="text-sm text-slate-400">
                  {row.projects} projects · {row.assessmentsUsed} completions 30d
                </span>
                <Link
                  href={`/admin/companies/${row.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-fit rounded-lg border border-[#1E2240] px-3 py-1.5 text-xs font-semibold text-[#a78bfa] transition-colors hover:border-[#8b5cf6]/60"
                >
                  Open →
                </Link>
              </summary>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
                <form action={(formData) => updateWorkspace(row.id, formData)} className="grid gap-4 md:grid-cols-2">
                  <input name="company_name" defaultValue={row.name} className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]" />
                  <input name="email" type="email" defaultValue={row.email} className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]" />
                  <input name="industry" defaultValue={row.industry ?? ""} placeholder="Industry" className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]" />
                  <input name="logo_url" defaultValue={row.logo_url ?? ""} placeholder="Logo URL" className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]" />
                  <select name="plan" defaultValue={row.plan} className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]">
                    {!plans.some((plan) => plan.value === row.plan) && (
                      <option value={row.plan}>{planLabel(row.plan)}</option>
                    )}
                    {plans.map((plan) => <option key={plan.value} value={plan.value}>{plan.label}</option>)}
                  </select>
                  <select name="language" defaultValue={row.language} className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]">
                    {languages.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}
                  </select>
                  <select name="status" defaultValue={row.status} className="rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]">
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <button
                    type="submit"
                    disabled={busy?.id === row.id}
                    className="rounded-lg bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1e40af] disabled:cursor-wait disabled:opacity-70"
                  >
                    {busy?.id === row.id && busy.action === "update" ? "Saving..." : "Save changes"}
                  </button>
                </form>

                <div className="space-y-3 rounded-lg border border-[#1E2240] bg-[#07080F] p-4">
                  <button
                    type="button"
                    onClick={() => setWorkspaceStatus(row.id, row.status === "disabled" ? "active" : "disabled")}
                    disabled={busy?.id === row.id}
                    className="w-full rounded-lg border border-[#1E2240] px-4 py-3 text-sm font-semibold text-slate-100 hover:border-[#1D4ED8]/70 disabled:cursor-wait disabled:opacity-70"
                  >
                    {row.status === "disabled" ? "Enable workspace" : "Disable workspace"}
                  </button>
                  <button
                    type="button"
                    onClick={() => resetPassword(row.id)}
                    disabled={busy?.id === row.id}
                    className="w-full rounded-lg border border-[#1E2240] px-4 py-3 text-sm font-semibold text-slate-100 hover:border-[#1D4ED8]/70 disabled:cursor-wait disabled:opacity-70"
                  >
                    Send admin reset email
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteWorkspace(row.id, row.name)}
                    disabled={busy?.id === row.id}
                    className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/15 disabled:cursor-wait disabled:opacity-70"
                  >
                    Delete workspace
                  </button>
                </div>
              </div>
            </details>
          ))}
          {rows.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">No companies match this search.</div>
          )}
        </div>
      </section>
    </div>
  );
}
