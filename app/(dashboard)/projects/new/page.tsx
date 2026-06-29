"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Assessment {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  question_count: number;
  status: string;
}

const categoryColors: Record<string, string> = {
  Cognitive: "text-blue-400",
  Resilience: "text-violet-400",
  Personality: "text-pink-400",
  Leadership: "text-amber-400",
};

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    deadline: "",
  });

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => r.json())
      .then((data) => setAssessments(data.assessments ?? []))
      .catch(() => {});
  }, []);

  const toggleAssessment = (id: string) => {
    setSelectedAssessments((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        deadline: form.deadline || null,
        assessment_ids: selectedAssessments,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create project");
      return;
    }
    router.push("/projects");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-slate-500 hover:text-slate-300 transition-colors">
          Hiring Projects
        </Link>
        <svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white font-medium">New Project</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-white">Create Hiring Project</h1>
        <p className="text-slate-500 text-sm mt-1">Set up a new assessment project for your open role.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-[#1E2240] pb-3">Project Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Senior Frontend Engineer Q3"
                className="w-full px-4 py-3 rounded-lg bg-[#07080F] border border-[#1E2240] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Assessment Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-[#07080F] border border-[#1E2240] text-slate-100 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors text-sm [color-scheme:dark]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the role requirements and what you're looking for in candidates…"
                className="w-full px-4 py-3 rounded-lg bg-[#07080F] border border-[#1E2240] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Assessment selection */}
        <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6">
          <div className="border-b border-[#1E2240] pb-3 mb-5">
            <h2 className="text-base font-semibold text-white">Select Assessments</h2>
            <p className="text-xs text-slate-500 mt-1">Choose the assessments candidates will complete for this role.</p>
          </div>
          {assessments.length === 0 ? (
            <p className="text-slate-500 text-sm">Loading assessments…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assessments.filter((a) => a.status === "active").map((assessment) => {
                const selected = selectedAssessments.includes(assessment.id);
                return (
                  <button
                    key={assessment.id}
                    type="button"
                    onClick={() => toggleAssessment(assessment.id)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selected ? "border-[#1D4ED8] bg-[#1D4ED8]/10" : "border-[#1E2240] bg-[#07080F] hover:border-[#2d3a70]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className={`text-xs font-medium ${categoryColors[assessment.category] ?? "text-slate-400"}`}>
                          {assessment.category}
                        </span>
                        <p className="text-sm font-medium text-white mt-0.5">{assessment.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{assessment.duration_minutes} min · {assessment.question_count} questions</p>
                      </div>
                      <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                        selected ? "bg-[#1D4ED8] border-[#1D4ED8]" : "border-[#1E2240]"
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {selectedAssessments.length > 0 && (
            <p className="text-xs text-slate-500 mt-3">
              {selectedAssessments.length} assessment{selectedAssessments.length > 1 ? "s" : ""} selected ·{" "}
              ~{assessments
                .filter((a) => selectedAssessments.includes(a.id))
                .reduce((sum, a) => sum + (a.duration_minutes ?? 0), 0)}{" "}
              min total
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/projects"
            className="px-5 py-2.5 rounded-lg border border-[#1E2240] text-slate-400 hover:text-slate-200 hover:border-[#2d3a70] text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating…
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
