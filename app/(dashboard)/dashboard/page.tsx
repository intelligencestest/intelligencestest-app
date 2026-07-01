import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user!.id)
    .single();
  const companyId = profile?.company_id;

  const [
    { count: totalCandidates },
    { count: activeProjects },
    { count: completedAssessments },
    { data: scores },
    { data: recentCandidates },
    { data: recentResults },
  ] = await Promise.all([
    admin.from("candidates").select("*", { count: "exact", head: true }).eq("company_id", companyId),
    admin.from("hiring_projects").select("*", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "active"),
    admin.from("results").select("*", { count: "exact", head: true }).eq("company_id", companyId),
    admin.from("results").select("score").eq("company_id", companyId),
    admin.from("candidates").select("id, full_name, status, created_at, hiring_projects(name)").eq("company_id", companyId).order("created_at", { ascending: false }).limit(4).returns<{ id: string; full_name: string; status: string; created_at: string; hiring_projects: { name: string } | null }[]>(),
    admin.from("results").select("score, completed_at, candidates(full_name), assessments(name)").eq("company_id", companyId).order("completed_at", { ascending: false }).limit(4).returns<{ score: number; completed_at: string; candidates: { full_name: string } | null; assessments: { name: string } | null }[]>(),
  ]);

  const scoreTotal = scores?.length ?? 0;
  const avgScore = scoreTotal && scores
    ? Math.round(scores.reduce((sum: number, result: { score: number }) => sum + result.score, 0) / scoreTotal)
    : 0;
  const completionRate = totalCandidates ? Math.min(100, Math.round(((completedAssessments ?? 0) / totalCandidates) * 100)) : 0;

  const statsCards = [
    { label: "Participants", value: totalCandidates ?? 0, icon: "participants", color: "text-blue-300", bg: "bg-blue-400/10", ring: "ring-blue-400/20", helper: "Total records in workspace" },
    { label: "Active Projects", value: activeProjects ?? 0, icon: "projects", color: "text-violet-300", bg: "bg-violet-400/10", ring: "ring-violet-400/20", helper: "Open workstreams" },
    { label: "Completed", value: completedAssessments ?? 0, icon: "completed", color: "text-emerald-300", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20", helper: "Submitted assessments" },
    { label: "Average Score", value: avgScore ? `${avgScore}%` : "-", icon: "score", color: "text-amber-300", bg: "bg-amber-400/10", ring: "ring-amber-400/20", helper: "Overall benchmark" },
  ];

  type Activity = { key: string; message: string; time: string; type: "completed" | "invited"; timestamp: number };
  const activity: Activity[] = [];

  recentResults?.forEach((result) => {
    const candidate = result.candidates;
    const assessment = result.assessments;
    if (candidate && assessment) {
      activity.push({
        key: `r-${result.completed_at}`,
        message: `${candidate.full_name} completed ${assessment.name} with a score of ${result.score}`,
        time: new Date(result.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        type: "completed",
        timestamp: new Date(result.completed_at).getTime(),
      });
    }
  });

  recentCandidates?.forEach((candidate) => {
    const project = candidate.hiring_projects;
    if (candidate.status === "invited") {
      activity.push({
        key: `c-${candidate.id}`,
        message: `${candidate.full_name} was added to ${project?.name ?? "a project"}`,
        time: new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        type: "invited",
        timestamp: new Date(candidate.created_at).getTime(),
      });
    }
  });
  activity.sort((a, b) => b.timestamp - a.timestamp);

  const scoreGroups = [
    { label: "High", range: "80-100", color: "bg-emerald-500", text: "text-emerald-300", count: scores?.filter((s: { score: number }) => s.score >= 80).length ?? 0 },
    { label: "Medium", range: "60-79", color: "bg-amber-500", text: "text-amber-300", count: scores?.filter((s: { score: number }) => s.score >= 60 && s.score < 80).length ?? 0 },
    { label: "Low", range: "0-59", color: "bg-red-500", text: "text-red-300", count: scores?.filter((s: { score: number }) => s.score < 60).length ?? 0 },
  ];

  const invited = recentCandidates?.filter((candidate) => candidate.status === "invited").length ?? 0;
  const completed = completedAssessments ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="premium-card relative overflow-hidden rounded-2xl p-6 sm:p-7">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(29,78,216,0.24),transparent_42%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#07080F]/70 px-3 py-1 text-xs font-medium text-[#9BB8FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
              Live workspace
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Workspace Overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              A real-time view of projects, participants, results, and assessment activity across your organization.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#1E2240] bg-[#07080F]/70 p-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(#1D4ED8 ${completionRate * 3.6}deg, #1E2240 0deg)` }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0D1020] text-sm font-semibold text-white">
                {completionRate}%
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Completion Signal</p>
              <p className="mt-1 text-sm font-semibold text-white">{completed} completed</p>
              <p className="mt-1 text-xs text-slate-600">{totalCandidates ?? 0} participant records</p>
            </div>
          </div>
        </div>
      </div>

      {(activeProjects ?? 0) === 0 ? (
        <div className="premium-card rounded-2xl p-8">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-white">Get started</h2>
            <p className="mt-2 text-sm text-slate-400">Follow these steps to run your first assessment project.</p>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Create a project", desc: "Organize candidates by role, team, or use case." },
              { step: "2", title: "Select assessments", desc: "Pick from 22 tests in the library and add them to your project." },
              { step: "3", title: "Invite candidates", desc: "Share a secure link — no email required." },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-5">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#1D4ED8]/40 bg-[#1D4ED8]/15 text-xs font-semibold text-[#8CB1FF]">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(29,78,216,0.22)] transition-colors hover:bg-[#1e40af]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first project
            </Link>
          </div>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card, index) => (
          <div
            key={card.label}
            className="premium-card premium-card-hover relative overflow-hidden rounded-xl p-5 animate-fade-up"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className={`absolute inset-x-0 top-0 h-px ${card.bg}`} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{card.value}</p>
                <p className="mt-2 text-xs text-slate-600">{card.helper}</p>
              </div>
              <div className={`${card.bg} ${card.color} ${card.ring} rounded-xl p-2.5 ring-1`}>
                {card.icon === "participants" && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87" /></svg>
                )}
                {card.icon === "projects" && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm0 0V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                )}
                {card.icon === "completed" && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                )}
                {card.icon === "score" && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8-8 8-4-4-6 6" /></svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="premium-card overflow-hidden rounded-xl xl:col-span-2">
          <div className="flex items-center justify-between border-b border-[#1E2240] px-6 py-4">
            <h2 className="text-base font-semibold text-white">Activity Stream</h2>
            <span className="rounded-full border border-[#1E2240] px-2.5 py-1 text-xs text-slate-500">Latest updates</span>
          </div>
          {activity.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-600">
              No activity yet. Add participants or complete an assessment to populate this feed.
            </div>
          ) : (
            <div className="divide-y divide-[#1E2240]">
              {activity.slice(0, 6).map((item) => (
                <div key={item.key} className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-[#1E2240]/30">
                  <div className={`mt-0.5 flex-shrink-0 rounded-xl p-2 ring-1 ${item.type === "completed" ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20" : "bg-blue-400/10 text-blue-300 ring-blue-400/20"}`}>
                    {item.type === "completed" ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9" /></svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-slate-300">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-600">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="premium-card rounded-xl p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Score Bands</h3>
            {scoreTotal === 0 ? (
              <p className="py-4 text-center text-xs text-slate-600">No results yet</p>
            ) : (
              <div className="space-y-4">
                {scoreGroups.map((group) => {
                  const pct = Math.round((group.count / Math.max(scoreTotal, 1)) * 100);
                  return (
                    <div key={group.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className={`font-medium ${group.text}`}>{group.label}</span>
                        <span className="text-slate-500">{group.count} / {scoreTotal}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#1E2240]">
                        <div className={`h-2 rounded-full ${group.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{group.range}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="premium-card rounded-xl p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Project Flow</h3>
            <div className="space-y-3">
              {[
                { label: "Added", count: invited, color: "bg-blue-400" },
                { label: "Completed", count: completed, color: "bg-emerald-500" },
              ].map((stage) => (
                <div key={stage.label} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="flex-1 text-sm text-slate-400">{stage.label}</span>
                  <span className="text-sm font-semibold text-white">{stage.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card rounded-xl p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Top Results</h3>
            {!recentResults || recentResults.length === 0 ? (
              <p className="py-2 text-center text-xs text-slate-600">No results yet</p>
            ) : (
              <div className="space-y-3">
                {recentResults.slice(0, 3).map((result, index) => {
                  const candidate = result.candidates;
                  const initials = candidate?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";
                  const color = result.score >= 80 ? "text-emerald-300" : result.score >= 60 ? "text-amber-300" : "text-red-300";
                  return (
                    <div key={`${result.completed_at}-${index}`} className="flex items-center gap-3">
                      <span className="w-4 text-xs text-slate-600">{index + 1}</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1D4ED8]/30 bg-[#1D4ED8]/20 text-xs font-medium text-[#9BB8FF]">
                        {initials}
                      </div>
                      <span className="flex-1 truncate text-sm text-slate-300">{candidate?.full_name ?? "Unknown"}</span>
                      <span className={`text-sm font-bold ${color}`}>{result.score}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
