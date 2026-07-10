import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { getInternalAdmin } from "@/lib/internal-admin";
import { loadTenantStats } from "@/lib/admin/stats";
import { computeCompanyHealth } from "@/lib/admin/health";
import { relativeTime, DAY } from "@/lib/dashboard/format";
import { Chip, EmptyRow, MigrationNotice, Section, StatCard } from "@/components/admin/ui";

const QUIET_AFTER_DAYS = 14;

/**
 * Home is a triage screen, not statistics: what needs an operator's
 * attention, platform pulse, and what the team did recently.
 */
export default async function AdminHomePage() {
  const adminCtx = await getInternalAdmin();
  if (!adminCtx) return null; // layout renders the access screen

  const admin = createAdminClient();
  const nowMs = Date.now(); // eslint-disable-line react-hooks/purity -- server component, one render per request; the "quiet tenant"/recency math needs the real request-time clock.
  const dayAgo = new Date(nowMs - DAY).toISOString();
  const weekAgo = new Date(nowMs - 7 * DAY).toISOString();

  const [
    { count: companiesTotal },
    { count: companiesActive },
    { count: completed24h },
    { count: completed7d },
    { count: invited7d },
    statsMap,
    { data: recentActions, error: actionsError },
  ] = await Promise.all([
    admin.from("companies").select("id", { count: "exact", head: true }),
    admin.from("companies").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("results").select("id", { count: "exact", head: true }).gte("completed_at", dayAgo),
    admin.from("results").select("id", { count: "exact", head: true }).gte("completed_at", weekAgo),
    admin.from("candidates").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    loadTenantStats(admin),
    admin
      .from("admin_actions")
      .select("id, admin_email, action_type, entity_type, entity_id, company_id, reason, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(8),
  ]);

  // Attention list from rollups: quiet tenants and tenants with no operators.
  type Attention = { companyId: string; label: string; detail: string };
  const attention: Attention[] = [];
  const companyNames = new Map<string, string>();
  if (statsMap && statsMap.size > 0) {
    const { data: companies } = await admin
      .from("companies")
      .select("id, name, status")
      .eq("status", "active");
    for (const c of companies ?? []) companyNames.set(c.id, c.name);

    for (const [companyId, stats] of statsMap) {
      const name = companyNames.get(companyId);
      if (!name) continue; // disabled or deleted
      const daysSince = stats.lastActivityAt
        ? Math.floor((nowMs - new Date(stats.lastActivityAt).getTime()) / DAY)
        : null;

      // Health-score extension point: once implemented, classification
      // replaces these two hand-rolled rules.
      const health = computeCompanyHealth({ stats, daysSinceActivity: daysSince });
      if (health) continue; // future: push based on health.level/reasons

      if (stats.candidatesTotal > 0 && daysSince !== null && daysSince >= QUIET_AFTER_DAYS) {
        attention.push({
          companyId,
          label: `${name} has gone quiet`,
          detail: `No activity for ${daysSince} days · ${stats.candidatesTotal} candidates total`,
        });
      } else if (stats.recruiters === 0) {
        attention.push({
          companyId,
          label: `${name} has no recruiters`,
          detail: "Workspace exists but nobody can sign in",
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--it-text)]">Operations home</h1>
        <p className="mt-1 text-sm text-slate-500">
          Triage first, then browse. <kbd className="rounded border border-[var(--it-hairline)] bg-[var(--it-surface)] px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> finds anything.
        </p>
      </div>

      {statsMap === null && <MigrationNotice what="Tenant rollups and the attention list" />}

      {/* Platform pulse */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Companies" value={`${companiesActive ?? 0}`} sub={`of ${companiesTotal ?? 0} total`} href="/admin/companies" />
        <StatCard label="Completions · 24h" value={`${completed24h ?? 0}`} sub={`${completed7d ?? 0} in 7 days`} />
        <StatCard label="Invites · 7d" value={`${invited7d ?? 0}`} />
        <StatCard
          label="Attention items"
          value={`${attention.length}`}
          sub={statsMap === null ? "needs migration 021" : "from tenant rollups"}
        />
        <StatCard label="Your role" value={adminCtx.role} sub={adminCtx.breakGlass ? "break-glass session" : "internal_admins"} />
      </div>

      {/* Needs attention */}
      <Section title="Needs attention">
        {attention.length === 0 ? (
          <EmptyRow>{statsMap === null ? "Unavailable until migration 021 is applied." : "All tenants look active."}</EmptyRow>
        ) : (
          <div className="divide-y divide-[var(--it-hairline)]">
            {attention.slice(0, 8).map((item) => (
              <Link
                key={item.companyId}
                href={`/admin/companies/${item.companyId}`}
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-gray-900/[0.03]"
              >
                <Chip tone="warn">attention</Chip>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-200">{item.label}</span>
                  <span className="block truncate text-xs text-slate-500">{item.detail}</span>
                </span>
                <span className="text-xs font-medium text-[#4338ca]">Open →</span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Recent admin actions — the team's shared short-term memory */}
      <Section
        title="Recent admin actions"
        action={
          <Link href="/admin/audit" className="text-xs font-medium text-[#4338ca] hover:underline">
            Full audit log →
          </Link>
        }
      >
        {actionsError ? (
          <EmptyRow>Audit log unavailable — apply migration 021.</EmptyRow>
        ) : (recentActions ?? []).length === 0 ? (
          <EmptyRow>No console actions recorded yet.</EmptyRow>
        ) : (
          <div className="divide-y divide-[var(--it-hairline)]">
            {(recentActions ?? []).map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                <code className="rounded bg-[var(--it-bg)] px-2 py-0.5 font-mono text-xs text-[#4338ca]">{a.action_type}</code>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
                  {a.admin_email}
                  {a.reason ? <span className="text-slate-500"> — {a.reason}</span> : null}
                </span>
                {a.company_id && (
                  <Link href={`/admin/companies/${a.company_id}`} className="text-xs font-medium text-[#4338ca] hover:underline">
                    company →
                  </Link>
                )}
                <span className="whitespace-nowrap text-xs tabular-nums text-slate-500">
                  {relativeTime(new Date(a.occurred_at).getTime(), nowMs, "en-US")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
