import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { BrandLockup } from "@/components/brand/BrandLogo";
import PrintButton from "./PrintButton";

function scoreTone(score: number) {
  if (score >= 80) return { label: "High", color: "#059669", bg: "#D1FAE5" };
  if (score >= 60) return { label: "Medium", color: "#B45309", bg: "#FEF3C7" };
  return { label: "Low", color: "#DC2626", bg: "#FEE2E2" };
}

export default async function PrintReportPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user!.id).single();
  const companyId = profile?.company_id;

  const { data: projects } = await admin
    .from("hiring_projects")
    .select("id, name, status, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  const selectedProjectId = params.project ?? projects?.[0]?.id ?? null;
  const selectedProject = projects?.find((project) => project.id === selectedProjectId) ?? projects?.[0] ?? null;

  let results: {
    id: string;
    score: number;
    completed_at: string;
    candidates: { full_name: string; email: string } | null;
    assessments: { name: string } | null;
  }[] = [];

  if (selectedProjectId) {
    const { data } = await admin
      .from("results")
      .select("id, score, completed_at, candidates(full_name, email), assessments(name)")
      .eq("company_id", companyId)
      .eq("project_id", selectedProjectId)
      .order("score", { ascending: false })
      .returns<typeof results>();
    results = data ?? [];
  }

  const avgScore = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  const topScore = results[0]?.score ?? 0;
  const highCount = results.filter((result) => result.score >= 80).length;
  const mediumCount = results.filter((result) => result.score >= 60 && result.score < 80).length;
  const lowCount = results.filter((result) => result.score < 60).length;
  const generatedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="min-h-screen bg-[var(--it-bg)] px-4 py-8 text-[#0f172a] print:bg-white print:p-0">
      <style>{`
        @page { size: A4; margin: 14mm; }
        @media print {
          .no-print { display: none !important; }
          .report-sheet { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="no-print mx-auto mb-5 flex max-w-4xl items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">PDF Report Preview</p>
          <p className="text-xs text-[#64748b]">Use your browser print dialog and choose Save as PDF.</p>
        </div>
        <PrintButton />
      </div>

      <section className="report-sheet mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#1E2240] bg-white shadow-2xl">
        <header className="bg-[#07080F] px-10 py-9 text-white">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-3">
                <BrandLockup
                  subtitle="Assessment report"
                  markClassName="h-10 w-10"
                  subtitleClassName="text-[#94a3b8]"
                />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Project Results Report</h1>
              <p className="mt-2 text-sm text-[#cbd5e1]">{selectedProject?.name ?? "No project selected"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wider text-[#94a3b8]">Generated</p>
              <p className="mt-1 text-sm font-semibold">{generatedAt}</p>
            </div>
          </div>
        </header>

        <div className="px-10 py-8">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Results", value: results.length },
              { label: "Average", value: results.length ? avgScore : "-" },
              { label: "Top Score", value: results.length ? topScore : "-" },
              { label: "High Band", value: highCount },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#07080F]">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "High", count: highCount, color: "#059669", bg: "#D1FAE5" },
              { label: "Medium", count: mediumCount, color: "#B45309", bg: "#FEF3C7" },
              { label: "Low", count: lowCount, color: "#DC2626", bg: "#FEE2E2" },
            ].map((band) => (
              <div key={band.label} className="rounded-xl border border-[#e2e8f0] p-4" style={{ backgroundColor: band.bg }}>
                <p className="text-sm font-semibold" style={{ color: band.color }}>{band.label}</p>
                <p className="mt-1 text-xs text-[#475569]">{band.count} result{band.count === 1 ? "" : "s"}</p>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h2 className="text-lg font-semibold text-[#07080F]">Candidate Ranking</h2>
              <p className="text-xs text-[#64748b]">Sorted by score, highest first</p>
            </div>

            {results.length === 0 ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-8 text-center text-sm text-[#64748b]">
                No completed assessments are available for this project yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#e2e8f0]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#f1f5f9] text-xs uppercase tracking-wider text-[#64748b]">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Assessment</th>
                      <th className="px-4 py-3 text-right">Score</th>
                      <th className="px-4 py-3 text-right">Band</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {results.map((result, index) => {
                      const tone = scoreTone(result.score);
                      return (
                        <tr key={result.id}>
                          <td className="px-4 py-3 font-semibold text-[#334155]">#{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#07080F]">{result.candidates?.full_name ?? "Unknown"}</p>
                            <p className="text-xs text-[#64748b]">{result.candidates?.email ?? ""}</p>
                          </td>
                          <td className="px-4 py-3 text-[#475569]">{result.assessments?.name ?? "Assessment"}</td>
                          <td className="px-4 py-3 text-right text-lg font-semibold" style={{ color: tone.color }}>{result.score}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: tone.color, backgroundColor: tone.bg }}>
                              {tone.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="mt-10 border-t border-[#e2e8f0] pt-5 text-xs text-[#64748b]">
            <p>This report is generated from workspace assessment results in IntelligencesTest.</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
