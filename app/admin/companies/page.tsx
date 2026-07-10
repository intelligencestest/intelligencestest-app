import { createAdminClient } from "@/lib/supabase-server";
import { getInternalAdmin } from "@/lib/internal-admin";
import { loadTenantStats } from "@/lib/admin/stats";
import { Pagination } from "@/components/admin/ui";
import AdminClient, { type AdminCompanyRow } from "../AdminClient";

const PAGE_SIZE = 25;

type CompanyRow = {
  id: string;
  name: string;
  email: string;
  language: string | null;
  industry: string | null;
  logo_url: string | null;
  created_at: string;
  status: string | null;
  plan: string | null;
};

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const adminCtx = await getInternalAdmin();
  if (!adminCtx) return null;

  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const statusFilter = params.status === "disabled" || params.status === "active" ? params.status : null;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const admin = createAdminClient();

  let query = admin
    .from("companies")
    .select("id, name, email, language, industry, logo_url, created_at, status, plan", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    query = query.or(`name.ilike.${like},email.ilike.${like}`);
  }
  if (statusFilter) query = query.eq("status", statusFilter);

  const [{ data: companies, count, error }, statsMap] = await Promise.all([
    query.returns<CompanyRow[]>(),
    loadTenantStats(admin),
  ]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-200">
        {error.message} — apply supabase/migrations/020_admin_workspace_fields.sql and reload.
      </div>
    );
  }

  const rows: AdminCompanyRow[] = (companies ?? []).map((company) => {
    const stats = statsMap?.get(company.id);
    return {
      id: company.id,
      name: company.name,
      email: company.email,
      language: company.language ?? "es",
      industry: company.industry,
      logo_url: company.logo_url,
      created_at: company.created_at,
      status: company.status ?? "active",
      plan: company.plan ?? "trial",
      activeUsers: stats?.recruiters ?? 0,
      projects: stats?.activeProjects ?? 0,
      assessmentsUsed: stats?.completed30d ?? 0,
    };
  });

  const makeHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (statusFilter) sp.set("status", statusFilter);
    sp.set("page", String(p));
    return `/admin/companies?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--it-text)]">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tenant lifecycle and workspace management. Counts are 30-day rollups.
          </p>
        </div>
        <form action="/admin/companies" className="flex w-full gap-2 sm:w-105">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="min-w-0 flex-1 rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2.5 text-sm text-[var(--it-text)] outline-none focus:border-[#8b5cf6]"
          />
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="cursor-pointer rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-2 py-2.5 text-sm text-slate-300 outline-none focus:border-[#8b5cf6]"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <button className="rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-sm font-semibold text-[var(--it-text)]">Search</button>
        </form>
      </div>

      <AdminClient rows={rows} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? rows.length} makeHref={makeHref} />
    </div>
  );
}
