"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Assessment {
  id: string;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number;
  question_count: number;
  status: string;
}

// ─── category colours ────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  Cognitive: "text-blue-400",
  Resilience: "text-orange-400",
  Personality: "text-pink-400",
  Leadership: "text-amber-400",
  "Workplace Judgment": "text-indigo-400",
  Communication: "text-cyan-400",
  Mechanical: "text-orange-400",
  "Work Style": "text-purple-400",
  Sales: "text-green-400",
  "Customer Service": "text-sky-400",
  Teamwork: "text-teal-400",
  Productivity: "text-yellow-400",
  Character: "text-violet-400",
};

const categoryBorders: Record<string, string> = {
  Cognitive: "border-blue-500/20 bg-blue-500/10",
  Resilience: "border-orange-500/20 bg-orange-500/10",
  Personality: "border-pink-500/20 bg-pink-500/10",
  Leadership: "border-amber-500/20 bg-amber-500/10",
  "Workplace Judgment": "border-indigo-500/20 bg-indigo-500/10",
  Communication: "border-cyan-500/20 bg-cyan-500/10",
  Mechanical: "border-orange-500/20 bg-orange-500/10",
  "Work Style": "border-purple-500/20 bg-purple-500/10",
  Sales: "border-green-500/20 bg-green-500/10",
  "Customer Service": "border-sky-500/20 bg-sky-500/10",
  Teamwork: "border-teal-500/20 bg-teal-500/10",
  Productivity: "border-yellow-500/20 bg-yellow-500/10",
  Character: "border-violet-500/20 bg-violet-500/10",
};

// ─── role templates ───────────────────────────────────────────────────────────

interface RoleTemplate {
  id: string;
  role: string;
  description: string;
  estimatedMinutes: number;
  accentClass: string;
  borderClass: string;
  dotClass: string;
  keywords: string[];
  icon: React.ReactNode;
}

const iconProps = { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" } as const;

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: "sales-representative",
    role: "Sales Representative",
    description: "Persuasion, critical thinking, communication, and personality fit for sales roles.",
    estimatedMinutes: 48,
    accentClass: "text-green-300",
    borderClass: "border-green-500/30 bg-green-500/8",
    dotClass: "bg-green-400",
    keywords: ["critical thinking", "sales aptitude", "communication skills", "personality type", "emotional intelligence"],
    icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" /></svg>,
  },
  {
    id: "customer-service-agent",
    role: "Customer Service Agent",
    description: "Empathy, problem resolution, stress management, and attention to detail.",
    estimatedMinutes: 45,
    accentClass: "text-sky-300",
    borderClass: "border-sky-500/30 bg-sky-500/8",
    dotClass: "bg-sky-400",
    keywords: ["customer service skills", "communication skills", "stress tolerance", "learning agility", "attention to detail"],
    icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>,
  },
  {
    id: "manager",
    role: "Manager",
    description: "Leadership style, emotional intelligence, critical thinking, and decision quality.",
    estimatedMinutes: 65,
    accentClass: "text-amber-300",
    borderClass: "border-amber-500/30 bg-amber-500/8",
    dotClass: "bg-amber-400",
    keywords: ["leadership styles", "critical thinking", "decision making", "emotional intelligence"],
    icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>,
  },
  {
    id: "software-developer",
    role: "Software Developer",
    description: "Abstract reasoning, problem solving, attention to detail, and learning agility.",
    estimatedMinutes: 50,
    accentClass: "text-blue-300",
    borderClass: "border-blue-500/30 bg-blue-500/8",
    dotClass: "bg-blue-400",
    keywords: ["abstract reasoning", "problem solving", "attention to detail", "learning agility"],
    icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>,
  },
  {
    id: "hr-manager",
    role: "HR Manager",
    description: "Emotional intelligence, leadership style, critical thinking, and communication.",
    estimatedMinutes: 60,
    accentClass: "text-violet-300",
    borderClass: "border-violet-500/30 bg-violet-500/8",
    dotClass: "bg-violet-400",
    keywords: ["emotional intelligence", "leadership styles", "critical thinking", "communication skills", "personality type"],
    icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
  },
  {
    id: "call-center-agent",
    role: "Call Center Agent",
    description: "Customer service, stress tolerance, communication, and time management.",
    estimatedMinutes: 55,
    accentClass: "text-cyan-300",
    borderClass: "border-cyan-500/30 bg-cyan-500/8",
    dotClass: "bg-cyan-400",
    keywords: ["customer service skills", "communication skills", "stress tolerance", "learning agility", "attention to detail", "time management"],
    icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>,
  },
  {
    id: "custom",
    role: "Custom",
    description: "Select assessments manually to build a tailored battery for your specific role.",
    estimatedMinutes: 0,
    accentClass: "text-slate-400",
    borderClass: "border-slate-500/20 bg-transparent",
    dotClass: "bg-slate-500",
    keywords: [],
    icon: <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
  },
];

// ─── component ────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", deadline: "" });

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => r.json())
      .then((data) => {
        const rows: Assessment[] = data.assessments ?? [];
        setAssessments(rows);
        const preselected = new URLSearchParams(window.location.search).get("assessment");
        if (preselected && rows.some((a) => a.id === preselected && a.status === "active")) {
          setSelectedAssessments([preselected]);
          setSelectedTemplate("custom");
        }
      })
      .catch(() => {});
  }, []);

  const activeAssessments = useMemo(
    () => assessments.filter((a) => a.status === "active"),
    [assessments]
  );

  const groupedAssessments = useMemo(() => {
    const groups = new Map<string, Assessment[]>();
    activeAssessments.forEach((a) => {
      groups.set(a.category, [...(groups.get(a.category) ?? []), a]);
    });
    return [...groups.entries()]
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [activeAssessments]);

  function applyTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    const template = ROLE_TEMPLATES.find((t) => t.id === templateId);
    if (!template || template.keywords.length === 0) {
      setSelectedAssessments([]);
      return;
    }
    const matched = activeAssessments
      .filter((a) =>
        template.keywords.some((kw) => a.name.toLowerCase().includes(kw.toLowerCase()))
      )
      .map((a) => a.id);
    setSelectedAssessments(matched);
  }

  const toggleAssessment = (id: string) => {
    setSelectedAssessments((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const selectedMinutes = assessments
    .filter((a) => selectedAssessments.includes(a.id))
    .reduce((sum, a) => sum + (a.duration_minutes ?? 0), 0);

  const activeTemplate = ROLE_TEMPLATES.find((t) => t.id === selectedTemplate);

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
    router.push(`/projects/${data.project_id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-slate-500 hover:text-slate-300 transition-colors">
          Projects
        </Link>
        <svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white font-medium">New Project</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-white">Create Project</h1>
        <p className="text-slate-500 text-sm mt-1">Set up a new assessment project for your open role.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Project Details ─────────────────────────────────────── */}
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
                placeholder="e.g. Senior Sales Executive — Q3 2026"
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
                placeholder="Describe the role requirements and what you're looking for in candidates..."
                className="w-full px-4 py-3 rounded-lg bg-[#07080F] border border-[#1E2240] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] transition-colors text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Role Template ────────────────────────────────────────── */}
        <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6">
          <div className="mb-5 border-b border-[#1E2240] pb-4">
            <h2 className="text-base font-semibold text-white">Choose a Role Template</h2>
            <p className="text-xs text-slate-500 mt-1">
              Start with a recommended assessment battery or build a custom selection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ROLE_TEMPLATES.map((template) => {
              const isSelected = selectedTemplate === template.id;
              const isCustom = template.id === "custom";
              const matchedCount = template.keywords.length === 0
                ? 0
                : activeAssessments.filter((a) =>
                    template.keywords.some((kw) => a.name.toLowerCase().includes(kw.toLowerCase()))
                  ).length;
              const matchedMinutes = template.keywords.length === 0
                ? 0
                : activeAssessments
                    .filter((a) =>
                      template.keywords.some((kw) => a.name.toLowerCase().includes(kw.toLowerCase()))
                    )
                    .reduce((sum, a) => sum + (a.duration_minutes ?? 0), 0);

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template.id)}
                  className={`group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/50 ${
                    isSelected
                      ? "border-[#1D4ED8] bg-[#1D4ED8]/8 ring-1 ring-[#1D4ED8]/30"
                      : isCustom
                      ? "border-dashed border-slate-600/50 bg-[#07080F]/40 hover:border-slate-500/70"
                      : "border-[#1E2240] bg-[#07080F] hover:border-[#2d3a70]"
                  }`}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#1D4ED8]">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}

                  {/* Icon */}
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                    isSelected
                      ? "border-[#1D4ED8]/40 bg-[#1D4ED8]/15 text-blue-300"
                      : `${template.borderClass} ${template.accentClass}`
                  }`}>
                    {template.icon}
                  </span>

                  {/* Name + description */}
                  <div className="min-w-0 flex-1 pr-4">
                    <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-200"}`}>
                      {template.role}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {template.description}
                    </p>
                  </div>

                  {/* Badges */}
                  {!isCustom && (
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#1E2240] bg-[#07080F] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                        </svg>
                        {matchedCount} tests
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#1E2240] bg-[#07080F] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        ~{matchedMinutes} min
                      </span>
                    </div>
                  )}

                  {isCustom && (
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3 w-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span className="text-[10px] font-medium text-slate-600">Manual selection</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active template badge */}
          {activeTemplate && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#1E2240] bg-[#07080F] px-3 py-2">
              <span className={`h-1.5 w-1.5 rounded-full ${activeTemplate.dotClass}`} />
              <p className="text-xs text-slate-400">
                <span className="font-medium text-slate-300">{activeTemplate.role}</span>
                {activeTemplate.id !== "custom"
                  ? " template applied — assessments pre-selected below. Add or remove as needed."
                  : " — choose any combination of assessments below."}
              </p>
            </div>
          )}
        </div>

        {/* ── Assessment Selection ─────────────────────────────────── */}
        <div className="bg-[#0D1020] border border-[#1E2240] rounded-xl p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-[#1E2240] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                {activeTemplate && activeTemplate.id !== "custom"
                  ? `Assessments — ${activeTemplate.role}`
                  : "Select Assessments"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {selectedTemplate
                  ? "Adjust the pre-selected tests or add more from other categories."
                  : "Choose the active tests candidates will complete for this project."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {selectedAssessments.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#1E2240] bg-[#07080F] px-3 py-1 text-xs font-medium text-slate-400">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  ~{selectedMinutes} min
                </span>
              )}
              <span className="inline-flex w-fit items-center rounded-full border border-[#1E2240] bg-[#07080F] px-3 py-1 text-xs font-medium text-slate-400">
                {selectedAssessments.length} selected
              </span>
            </div>
          </div>

          {assessments.length === 0 ? (
            <p className="text-slate-500 text-sm">Loading assessments...</p>
          ) : groupedAssessments.length === 0 ? (
            <p className="text-slate-500 text-sm">No active assessments are available yet.</p>
          ) : (
            <div className="space-y-5">
              {groupedAssessments.map((group) => (
                <section key={group.category} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${categoryBorders[group.category] ?? "border-slate-500/20 bg-slate-500/10"} ${categoryColors[group.category] ?? "text-slate-400"}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {group.category}
                    </div>
                    <span className="text-xs text-slate-600">{group.items.length} tests</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {group.items.map((assessment) => {
                      const selected = selectedAssessments.includes(assessment.id);
                      return (
                        <label
                          key={assessment.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                            selected
                              ? "border-[#1D4ED8] bg-[#1D4ED8]/10"
                              : "border-[#1E2240] bg-[#07080F] hover:border-[#2d3a70]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleAssessment(assessment.id)}
                            className="mt-1 h-4 w-4 cursor-pointer rounded border-[#1E2240] bg-[#0D1020] accent-[#1D4ED8]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-white">{assessment.name}</span>
                            <span className="mt-1 block text-xs text-slate-500">
                              {assessment.duration_minutes} min / {assessment.question_count} questions
                            </span>
                            {assessment.description && (
                              <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-slate-600">
                                {assessment.description}
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* ── Submit ───────────────────────────────────────────────── */}
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
                Creating...
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
