import type { createAdminClient } from "@/lib/supabase-server";

type AdminClient = ReturnType<typeof createAdminClient>;

/** Rollups older than this trigger a refresh on console load. A scheduled
 *  job calling admin_refresh_tenant_stats() nightly replaces this at scale
 *  without any code change here. */
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export interface TenantStats {
  companyId: string;
  recruiters: number;
  candidatesTotal: number;
  invited30d: number;
  completed30d: number;
  activeProjects: number;
  lastActivityAt: string | null;
  computedAt: string;
}

interface StatsRow {
  company_id: string;
  recruiters: number;
  candidates_total: number;
  invited_30d: number;
  completed_30d: number;
  active_projects: number;
  last_activity_at: string | null;
  computed_at: string;
}

/**
 * Reads today's tenant rollups, refreshing them in one SQL pass when stale.
 * Returns null when migration 021 has not been applied — callers render an
 * explicit "apply migration" notice instead of silently showing zeros.
 */
export async function loadTenantStats(
  admin: AdminClient
): Promise<Map<string, TenantStats> | null> {
  const read = () =>
    admin
      .from("tenant_stats_daily")
      .select(
        "company_id, recruiters, candidates_total, invited_30d, completed_30d, active_projects, last_activity_at, computed_at"
      )
      .eq("day", new Date().toISOString().slice(0, 10))
      .returns<StatsRow[]>();

  let { data: rows, error } = await read();
  if (error) return null; // table missing → migration 021 not applied

  const newest = (rows ?? []).reduce<number>(
    (max, r) => Math.max(max, new Date(r.computed_at).getTime()),
    0
  );
  if ((rows ?? []).length === 0 || Date.now() - newest > STALE_AFTER_MS) {
    const { error: rpcError } = await admin.rpc("admin_refresh_tenant_stats");
    if (!rpcError) ({ data: rows } = await read());
  }

  const map = new Map<string, TenantStats>();
  for (const r of rows ?? []) {
    map.set(r.company_id, {
      companyId: r.company_id,
      recruiters: r.recruiters,
      candidatesTotal: r.candidates_total,
      invited30d: r.invited_30d,
      completed30d: r.completed_30d,
      activeProjects: r.active_projects,
      lastActivityAt: r.last_activity_at,
      computedAt: r.computed_at,
    });
  }
  return map;
}
