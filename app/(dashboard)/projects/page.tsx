import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const statusConfig: Record<string, { label: string; class: string; dot: string }> = {
  active: { label: "Active", class: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25", dot: "bg-emerald-400" },
  draft: { label: "Draft", class: "bg-slate-500/10 text-slate-300 border-slate-500/25", dot: "bg-slate-400" },
  archived: { label: "Archived", class: "bg-amber-500/10 text-amber-300 border-amber-500/25", dot: "bg-amber-400" },
};

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const { data: projects } = await admin
    .from("hiring_projects")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  const { data: candidateCounts } = await admin
    .from("candidates")
    .select("project_id, status")
    .eq("company_id", companyId);

  const countsByProject = (candidateCounts ?? []).reduce((acc: Record<string, { total: number; completed: number }>, c) => {
    if (!acc[c.project_id]) acc[c.project_id] = { total: 0, completed: 0 };
    acc[c.project_id].total++;
    if (c.status === "completed") acc[c.project_id].completed++;
    return acc;
  }, {});

  const activeCount = projects?.filter((p) => p.status === "active").length ?? 0;
  const totalCandidates = candidateCounts?.length ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
            Project pipeline
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Hiring Projects</h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeCount} active project{activeCount !== 1 ? "s" : ""} with {totalCandidates} candidate{totalCandidates !== 1 ? "s" : ""} in motion
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(29,78,216,0.22)] transition-colors hover:bg-[#1e40af]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="premium-card rounded-xl py-20 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm0 0V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          <h3 className="text-white font-medium mb-1">No projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first hiring project to get started.</p>
          <Link href="/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project, index) => {
            const counts = countsByProject[project.id] ?? { total: 0, completed: 0 };
            const progress = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
            const cfg = statusConfig[project.status] ?? statusConfig.draft;
            return (
              <div
                key={project.id}
                className="premium-card premium-card-hover group rounded-xl p-5 animate-fade-up"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-white group-hover:text-[#8CB1FF] transition-colors truncate">
                        {project.name}
                      </h3>
                      <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.class}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Created {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {project.description ?? "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">Candidates</p>
                      <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87" />
                      </svg>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">{counts.total}</p>
                  </div>
                  <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">Completed</p>
                      <svg className="h-4 w-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">{counts.completed}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                    <span>Completion</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E2240] rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-[#1D4ED8] rounded-full shadow-[0_0_16px_rgba(29,78,216,0.45)] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#1E2240] pt-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <span>{project.deadline ? `Deadline ${new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "No deadline set"}</span>
                  <Link href={`/reports?project=${project.id}`} className="inline-flex items-center gap-1 font-medium text-[#8CB1FF] transition-colors hover:text-blue-200">
                    View report
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
