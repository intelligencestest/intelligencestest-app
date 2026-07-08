import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { getInternalAdmin } from "@/lib/internal-admin";
import { relativeTime } from "@/lib/dashboard/format";
import { EmptyRow, MigrationNotice, Pagination, Section } from "@/components/admin/ui";

const PAGE_SIZE = 40;

type AuditRow = {
  id: string;
  admin_email: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  company_id: string | null;
  reason: string | null;
  payload: unknown;
  occurred_at: string;
};

/**
 * Audit log viewer — every console mutation, filterable, each row linking to
 * its entity. Doubles as the compliance answer ("who changed this tenant?").
 */
export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; admin?: string; page?: string }>;
}) {
  const adminCtx = await getInternalAdmin();
  if (!adminCtx) return null;

  const params = await searchParams;
  const typeFilter = (params.type ?? "").trim();
  const adminFilter = (params.admin ?? "").trim();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const admin = createAdminClient();

  let query = admin
    .from("admin_actions")
    .select("id, admin_email, action_type, entity_type, entity_id, company_id, reason, payload, occurred_at", {
      count: "exact",
    })
    .order("occurred_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (typeFilter) query = query.eq("action_type", typeFilter);
  if (adminFilter) query = query.ilike("admin_email", `%${adminFilter}%`);

  const { data: rows, count, error } = await query.returns<AuditRow[]>();

  // Distinct action types for the filter dropdown (bounded set).
  const { data: typeRows } = await admin.from("admin_actions").select("action_type").limit(1000);
  const types = [...new Set((typeRows ?? []).map((r) => r.action_type))].sort();

  const nowMs = Date.now(); // eslint-disable-line react-hooks/purity -- server component, one render per request; relative-time math needs the real request-time clock.
  const makeHref = (p: number) => {
    const sp = new URLSearchParams();
    if (typeFilter) sp.set("type", typeFilter);
    if (adminFilter) sp.set("admin", adminFilter);
    sp.set("page", String(p));
    return `/admin/audit?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Audit log</h1>
          <p className="mt-1 text-sm text-slate-500">Every console mutation, newest first. Append-only.</p>
        </div>
        <form action="/admin/audit" className="flex w-full flex-wrap gap-2 sm:w-auto">
          <select
            name="type"
            defaultValue={typeFilter}
            className="cursor-pointer rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-[#8b5cf6]"
          >
            <option value="">All actions</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            name="admin"
            defaultValue={adminFilter}
            placeholder="Filter by operator email…"
            className="min-w-0 flex-1 rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2.5 text-sm text-white outline-none focus:border-[#8b5cf6] sm:w-56"
          />
          <button className="rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-sm font-semibold text-white">Filter</button>
        </form>
      </div>

      {error && <MigrationNotice what="The audit log" />}

      <Section title={`Entries${count !== null ? ` (${count})` : ""}`}>
        {error ? (
          <EmptyRow>Apply migration 021 to enable the audit log.</EmptyRow>
        ) : (rows ?? []).length === 0 ? (
          <EmptyRow>No actions match these filters.</EmptyRow>
        ) : (
          <div className="divide-y divide-[var(--it-hairline)]">
            {(rows ?? []).map((row) => (
              <div key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                <code className="rounded bg-[var(--it-bg)] px-2 py-0.5 font-mono text-xs text-[#a78bfa]">{row.action_type}</code>
                <span className="text-sm text-slate-300">{row.admin_email}</span>
                {row.entity_type && (
                  <span className="text-xs text-slate-500">
                    on {row.entity_type}
                    {row.entity_id ? ` ${row.entity_id.slice(0, 8)}…` : ""}
                  </span>
                )}
                {row.reason && <span className="text-xs italic text-slate-400">“{row.reason}”</span>}
                <span className="ml-auto flex items-center gap-4">
                  {row.company_id && (
                    <Link
                      href={`/admin/companies/${row.company_id}`}
                      className="text-xs font-medium text-[#a78bfa] hover:underline"
                    >
                      company →
                    </Link>
                  )}
                  <span
                    className="whitespace-nowrap text-xs tabular-nums text-slate-500"
                    title={new Date(row.occurred_at).toISOString()}
                  >
                    {relativeTime(new Date(row.occurred_at).getTime(), nowMs, "en-US")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} makeHref={makeHref} />
      </Section>
    </div>
  );
}
