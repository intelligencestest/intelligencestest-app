import Link from "next/link";
import AdminClient, { type AdminCompanyRow } from "./AdminClient";
import { createAdminClient } from "@/lib/supabase-server";
import { getInternalAdminUser } from "@/lib/internal-admin";

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getInternalAdminUser();
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#07080F] px-5 py-16 text-slate-100">
        <div className="mx-auto max-w-xl rounded-lg border border-[#1E2240] bg-[#0D1020] p-6 text-center">
          <h1 className="text-2xl font-semibold text-white">Admin access required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Sign in with an email listed in INTERNAL_ADMIN_EMAILS or ADMIN_EMAILS to manage workspaces.
          </p>
          <Link href="/login" className="mt-6 inline-flex rounded-lg bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  const admin = createAdminClient();
  const [
    { data: companies, error: companiesError },
    { data: users },
    { data: projects },
    { data: projectAssessments },
  ] = await Promise.all([
    admin
      .from("companies")
      .select("id, name, email, language, industry, logo_url, created_at, status, plan")
      .order("created_at", { ascending: false })
      .returns<CompanyRow[]>(),
    admin.from("users").select("id, company_id"),
    admin.from("hiring_projects").select("id, company_id"),
    admin.from("project_assessments").select("project_id, assessment_id"),
  ]);

  if (companiesError) {
    return (
      <main className="min-h-screen bg-[#07080F] px-5 py-16 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-lg border border-red-500/25 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-100">Admin schema needs attention</h1>
          <p className="mt-3 text-sm leading-6 text-red-200">{companiesError.message}</p>
          <p className="mt-3 text-sm leading-6 text-red-200">
            Apply migration supabase/migrations/020_admin_workspace_fields.sql, then reload this page.
          </p>
        </div>
      </main>
    );
  }

  const userCounts = new Map<string, number>();
  for (const row of users ?? []) {
    if (!row.company_id) continue;
    userCounts.set(row.company_id, (userCounts.get(row.company_id) ?? 0) + 1);
  }

  const projectCounts = new Map<string, number>();
  const projectCompany = new Map<string, string>();
  for (const project of projects ?? []) {
    if (!project.company_id) continue;
    projectCounts.set(project.company_id, (projectCounts.get(project.company_id) ?? 0) + 1);
    projectCompany.set(project.id, project.company_id);
  }

  const assessmentSets = new Map<string, Set<string>>();
  for (const row of projectAssessments ?? []) {
    const companyId = row.project_id ? projectCompany.get(row.project_id) : null;
    if (!companyId || !row.assessment_id) continue;
    if (!assessmentSets.has(companyId)) assessmentSets.set(companyId, new Set());
    assessmentSets.get(companyId)!.add(row.assessment_id);
  }

  const allRows: AdminCompanyRow[] = (companies ?? []).map((company) => ({
    id: company.id,
    name: company.name,
    email: company.email,
    language: company.language ?? "es",
    industry: company.industry,
    logo_url: company.logo_url,
    created_at: company.created_at,
    status: company.status ?? "active",
    plan: company.plan ?? "standard",
    activeUsers: userCounts.get(company.id) ?? 0,
    projects: projectCounts.get(company.id) ?? 0,
    assessmentsUsed: assessmentSets.get(company.id)?.size ?? 0,
  }));

  const rows = q
    ? allRows.filter((row) =>
        [row.name, row.email, row.industry ?? "", row.plan, row.status]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : allRows;

  return (
    <main className="min-h-screen bg-[#07080F] text-slate-100">
      <header className="border-b border-[#1E2240] bg-[#0D1020]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8CB1FF]">Internal Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Workspace management</h1>
            <p className="mt-2 text-sm text-slate-400">Companies, plans, access status, and admin password resets.</p>
          </div>
          <form action="/admin" className="flex w-full gap-2 lg:w-[360px]">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search companies..."
              className="min-w-0 flex-1 rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-3 text-sm text-white outline-none focus:border-[#1D4ED8]"
            />
            <button className="rounded-lg bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white">Search</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <AdminClient rows={rows} />
      </section>
    </main>
  );
}
