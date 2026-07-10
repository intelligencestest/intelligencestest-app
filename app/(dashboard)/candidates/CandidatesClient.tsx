"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Link2, Loader2, Mail, Search, UserPlus, X } from "lucide-react";
import { PIPELINE_STAGES, STATUS_CHIP_STYLE } from "@/lib/dashboard/stages";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  status: string;
  pipeline_stage: string;
  outcome: string;
  created_at: string;
  token: string | null;
  hiring_projects: { id: string; name: string } | null;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Props {
  initialCandidates: Candidate[];
  projects: Project[];
  companyId: string;
  projectAssessments: Record<string, { name: string; route: string; label: string }[]>;
}

type LoadingMode = "link" | "email" | null;
type InviteSuccess = { type: "link"; url: string } | { type: "email"; to: string };

function CopyButton({ text }: { text: string }) {
  const es = useLocale() === "es";
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      aria-label={es ? "Copiar enlace" : "Copy link"}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--it-primary)]/40 px-3 py-1.5 text-xs font-medium text-[var(--it-link)] transition-colors hover:bg-[var(--it-primary-soft)]"
    >
      <Copy className="h-3.5 w-3.5" strokeWidth={2} />
      {copied ? (es ? "Copiado" : "Copied!") : (es ? "Copiar" : "Copy")}
    </button>
  );
}

export default function CandidatesClient({ initialCandidates, projects, projectAssessments }: Props) {
  const es = useLocale() === "es";
  const dateLocale = es ? "es-ES" : "en-US";
  const copy = es
    ? {
        title: "Candidatos",
        across: (count: number) => `${count} candidato${count === 1 ? "" : "s"} en todos los proyectos`,
        inviteCandidate: "Invitar candidato",
        status: {
          invited: "Invitado",
          started: "Iniciado",
          completed: "Completado",
          reviewed: "Revisado",
          interview: "Entrevista",
          hired: "Contratado",
          rejected: "Rechazado",
          withdrawn: "Retirado",
          expired: "Expirado",
        } as Record<string, string>,
        search: "Buscar por nombre o correo...",
        allStatuses: "Todos los estados",
        allProjects: "Todos los proyectos",
        candidate: "Candidato",
        project: "Proyecto",
        statusHeader: "Estado",
        invitedAt: "Invitado",
        noCandidates: "Aún no hay candidatos. Haga clic en Invitar candidato para comenzar.",
        noMatches: "Ningún candidato coincide con los filtros.",
        anonymous: "Sin nombre",
        unassigned: "Sin asignar",
        showing: (shown: number, total: number) => `Mostrando ${shown} de ${total} candidatos`,
        nextHeader: "Siguiente",
        next: {
          invited: "Esperando",
          started: "En curso",
          completed: "Revisar",
          reviewed: "Decisión",
          interview: "Entrevista",
          hired: "Contratado",
          closed: "—",
        } as Record<string, string>,
        modalTitle: "Invitar candidato",
        modalDescription: "Genere un enlace seguro de evaluación válido por 7 días.",
        validEmail: "Se requiere un correo electrónico válido para enviar la invitación.",
        selectProject: "Seleccione un proyecto primero.",
        noLinked: "No hay evaluaciones vinculadas a este proyecto.",
        failed: "No se pudo generar la invitación",
        network: "Error de red. Intente de nuevo.",
        copied: "Enlace copiado al portapapeles",
        validShare: "Válido por 7 días, compártalo con el candidato",
        inviteLink: "Enlace de invitación",
        emailSent: "Correo enviado",
        inviteAnother: "Invitar a otro",
        candidateName: "Nombre del candidato",
        optional: "opcional",
        emailAddress: "Correo electrónico",
        requiredEmail: "requerido para enviar correo",
        noProjects: "Aún no hay proyectos",
        createFirst: "crear uno primero",
        assessment: "Evaluación",
        selectProjectFirst: "Seleccione un proyecto primero",
        copying: "Copiando...",
        copyLink: "Copiar enlace",
        sending: "Enviando...",
        sendEmail: "Enviar correo",
      }
    : {
        title: "Candidates",
        across: (count: number) => `${count} candidate${count !== 1 ? "s" : ""} across all projects`,
        inviteCandidate: "Invite Candidate",
        status: {
          invited: "Invited",
          started: "Started",
          completed: "Completed",
          reviewed: "Reviewed",
          interview: "Interview",
          hired: "Hired",
          rejected: "Rejected",
          withdrawn: "Withdrawn",
          expired: "Expired",
        } as Record<string, string>,
        search: "Search by name or email...",
        allStatuses: "All Statuses",
        allProjects: "All Projects",
        candidate: "Candidate",
        project: "Project",
        statusHeader: "Status",
        invitedAt: "Invited",
        noCandidates: "No candidates yet. Click Invite Candidate to get started.",
        noMatches: "No candidates match your filters.",
        anonymous: "Anonymous",
        unassigned: "Unassigned",
        showing: (shown: number, total: number) => `Showing ${shown} of ${total} candidates`,
        nextHeader: "Next",
        next: {
          invited: "Awaiting",
          started: "In progress",
          completed: "Review",
          reviewed: "Decision",
          interview: "Interview",
          hired: "Hired",
          closed: "—",
        } as Record<string, string>,
        modalTitle: "Invite Candidate",
        modalDescription: "Generate a secure, 7-day assessment link.",
        validEmail: "A valid email address is required to send an invite.",
        selectProject: "Select a project first.",
        noLinked: "No assessments are linked to this project.",
        failed: "Failed to generate invite",
        network: "Network error. Please try again.",
        copied: "Link copied to clipboard",
        validShare: "Valid for 7 days, share with your candidate",
        inviteLink: "Invite link",
        emailSent: "Email sent",
        inviteAnother: "Invite another",
        candidateName: "Candidate name",
        optional: "optional",
        emailAddress: "Email address",
        requiredEmail: "required for Send Email",
        noProjects: "No projects yet",
        createFirst: "create one first",
        assessment: "Assessment",
        selectProjectFirst: "Select a project first",
        copying: "Copying...",
        copyLink: "Copy Link",
        sending: "Sending...",
        sendEmail: "Send Email",
      };
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    project_id: projects[0]?.id ?? "",
    assessment_type: "",
  });
  const [loadingMode, setLoadingMode] = useState<LoadingMode>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<InviteSuccess | null>(null);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSuccess(null);
    setError("");
    setLoadingMode(null);
    const firstProject = projects[0]?.id ?? "";
    const firstAssessment = (projectAssessments[firstProject] ?? [])[0]?.name ?? "";
    setForm({ full_name: "", email: "", project_id: firstProject, assessment_type: firstAssessment });
  }, [projects, projectAssessments, setForm]);

  // Sync first assessment when project changes
  useEffect(() => {
    const opts = projectAssessments[form.project_id] ?? [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((f) => ({ ...f, assessment_type: opts[0]?.name ?? "" }));
  }, [form.project_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key closes modal
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showModal, closeModal]);

  // Deep links from the dashboard: ?stage= (six-stage pipeline), legacy
  // ?status=, ?project=, ?invite=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stage = params.get("stage") ?? params.get("status");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stage && (PIPELINE_STAGES as readonly string[]).includes(stage)) setStatusFilter(stage);
    const project = params.get("project");
    if (project) setProjectFilter(project);
    if (params.get("invite") === "1") {
      if (project) setForm((f) => ({ ...f, project_id: project }));
      setShowModal(true);
    }
  }, []);

  const currentAssessments = projectAssessments[form.project_id] ?? [];

  const resetForm = () => {
    setSuccess(null);
    setError("");
    const firstAssessment = (projectAssessments[form.project_id] ?? [])[0]?.name ?? "";
    setForm((f) => ({ ...f, full_name: "", email: "", assessment_type: firstAssessment }));
  };

  const handleInvite = async (mode: "link" | "email") => {
    setError("");

    if (mode === "email") {
      if (!form.email || !form.email.includes("@")) {
        setError(copy.validEmail);
        return;
      }
    }

    if (!form.project_id) { setError(copy.selectProject); return; }
    if (!form.assessment_type) { setError(copy.noLinked); return; }

    setLoadingMode(mode);
    try {
      const res = await fetch("/api/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          project_id: form.project_id,
          assessment_type: form.assessment_type,
          delivery_method: mode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? copy.failed);
      } else {
        const project = projects.find((p) => p.id === form.project_id) ?? null;
        setCandidates((prev) => [
          {
            id: data.candidate_id,
            full_name: form.full_name || copy.anonymous,
            email: form.email || "",
            status: "invited",
            pipeline_stage: "invited",
            outcome: "pending",
            created_at: new Date().toISOString(),
            token: null,
            hiring_projects: project,
          },
          ...prev,
        ]);

        if (mode === "link") {
          const url = `${window.location.origin}${data.test_url}`;
          await navigator.clipboard.writeText(url).catch(() => {});
          setSuccess({ type: "link", url });
        } else {
          setSuccess({ type: "email", to: form.email });
        }
      }
    } catch {
      setError(copy.network);
    }
    setLoadingMode(null);
  };

  const filtered = candidates.filter((c) => {
    const matchSearch =
      !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.pipeline_stage === statusFilter;
    const matchProject = projectFilter === "all" || c.hiring_projects?.id === projectFilter;
    return matchSearch && matchStatus && matchProject;
  });

  const counts = {
    invited: candidates.filter((c) => c.pipeline_stage === "invited").length,
    started: candidates.filter((c) => c.pipeline_stage === "started").length,
    completed: candidates.filter((c) => c.pipeline_stage === "completed").length,
  };

  const inputClass = "w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-[var(--it-faint)] focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25";
  const selectClass = "w-full cursor-pointer rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25";

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-[var(--it-text)]">{copy.title}</h1>
          <p className="mt-2 text-sm text-[var(--it-muted)]">
            {copy.across(candidates.length)}
            <span className="mx-2 text-[var(--it-faint)]">·</span>
            <span className="tabular-nums text-[var(--it-faint)]">
              {counts.invited} {copy.status.invited} · {counts.started} {copy.status.started} · {counts.completed} {copy.status.completed}
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="enterprise-button inline-flex cursor-pointer items-center gap-2 self-start rounded-lg px-4 py-2.5 text-sm font-semibold sm:self-auto"
        >
          <UserPlus className="h-4 w-4" strokeWidth={2} />
          {copy.inviteCandidate}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--it-faint)]" strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.search}
            className="w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] py-2.5 pl-9 pr-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-[var(--it-faint)] focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="cursor-pointer rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
        >
          <option value="all">{copy.allStatuses}</option>
          {PIPELINE_STAGES.map((stage) => (
            <option key={stage} value={stage}>{copy.status[stage]}</option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="cursor-pointer rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
        >
          <option value="all">{copy.allProjects}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Candidate table */}
      <div className="enterprise-card overflow-hidden rounded-xl">
        <div className="hidden grid-cols-12 gap-4 border-b enterprise-divider px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--it-faint)] md:grid">
          <div className="col-span-5">{copy.candidate}</div>
          <div className="col-span-3">{copy.project}</div>
          <div className="col-span-2">{copy.statusHeader}</div>
          <div className="col-span-2 text-right">{copy.nextHeader}</div>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[var(--it-muted)]">
            {candidates.length === 0 ? copy.noCandidates : copy.noMatches}
          </p>
        ) : (
          <div className="divide-y divide-[var(--it-hairline)]">
            {filtered.map((candidate) => {
              // A closed outcome (rejected / withdrawn / expired) overrides the stage chip.
              const closed = candidate.outcome !== "pending" ? candidate.outcome : null;
              const chipKey = closed ?? candidate.pipeline_stage;
              const style = STATUS_CHIP_STYLE[chipKey] ?? STATUS_CHIP_STYLE.invited;
              const name = candidate.full_name?.trim() || copy.anonymous;
              const initials = name === copy.anonymous ? "?" : name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              // Next action derived from the open pipeline stage; a completed &
              // still-pending candidate is the one actually waiting on the recruiter.
              const nextKey = closed ? "closed" : candidate.pipeline_stage in copy.next ? candidate.pipeline_stage : "closed";
              const nextActionable = !closed && candidate.pipeline_stage === "completed";
              const invitedShort = new Date(candidate.created_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric" });
              return (
                <Link href={`/candidates/${candidate.id}`} key={candidate.id} className="group grid gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-gray-900/[0.025] md:grid-cols-12 md:items-center md:px-6">
                  <div className="flex min-w-0 items-center gap-3 md:col-span-5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] text-[11px] font-semibold text-slate-200">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--it-text)] transition-colors group-hover:text-slate-200">{name}</p>
                      <p className="truncate text-xs text-[var(--it-muted)]">{candidate.email || "—"}</p>
                    </div>
                  </div>
                  <div className="min-w-0 md:col-span-3">
                    <p className="truncate text-sm text-slate-300">{candidate.hiring_projects?.name ?? copy.unassigned}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--it-faint)]">{copy.invitedAt} {invitedShort}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="inline-flex items-center gap-2 text-[13px] text-slate-300">
                      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                      {copy.status[chipKey] ?? chipKey}
                    </span>
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <span className={nextActionable ? "text-sm font-medium text-[var(--it-text)]" : "text-sm text-[var(--it-muted)]"}>
                      {copy.next[nextKey]}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="border-t enterprise-divider px-6 py-3 text-xs text-[var(--it-faint)]">
          {copy.showing(filtered.length, candidates.length)}
        </div>
      </div>

      {/* Invite modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="enterprise-card w-full max-w-md rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--it-text)]">{copy.modalTitle}</h3>
                <p className="mt-0.5 text-xs text-[var(--it-muted)]">{copy.modalDescription}</p>
              </div>
              <button
                onClick={closeModal}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--it-muted)] transition-colors hover:bg-gray-900/[0.05] hover:text-[var(--it-text)]"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div className="space-y-4">
                {success.type === "link" ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--it-success)]/25 bg-[rgba(22,163,74,0.08)] p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(22,163,74,0.15)]">
                        <Check className="h-4 w-4 text-[#15803d]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#15803d]">{copy.copied}</p>
                        <p className="text-xs text-[var(--it-muted)]">{copy.validShare}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[var(--it-hairline)] bg-[var(--it-bg)] p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--it-faint)]">{copy.inviteLink}</p>
                      <div className="flex items-center gap-2">
                        <p className="flex-1 break-all font-mono text-xs text-[var(--it-link)]">{success.url}</p>
                        <CopyButton text={success.url} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--it-success)]/25 bg-[rgba(22,163,74,0.08)] p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(22,163,74,0.15)]">
                      <Mail className="h-4 w-4 text-[#15803d]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#15803d]">{copy.emailSent}</p>
                      <p className="truncate text-xs text-[var(--it-muted)]">{success.to}</p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full cursor-pointer rounded-xl border border-[var(--it-hairline)] py-2.5 text-sm font-medium text-[var(--it-muted)] transition-colors hover:text-[var(--it-text)]"
                >
                  {copy.inviteAnother}
                </button>
              </div>
            ) : (
              /* Form state */
              <div className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-[var(--it-danger)]/25 bg-[rgba(220,38,38,0.1)] p-3 text-sm text-[#b91c1c]">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    {copy.candidateName}
                    <span className="ml-1.5 text-xs font-normal text-[var(--it-faint)]">({copy.optional})</span>
                  </label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder={es ? "María García" : "Jane Smith"}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    {copy.emailAddress}
                    <span className="ml-1.5 text-xs font-normal text-[var(--it-faint)]">({copy.requiredEmail})</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder={es ? "maria@ejemplo.com" : "jane@example.com"}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">{copy.project}</label>
                  {projects.length === 0 ? (
                    <p className="rounded-xl border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-2.5 text-sm text-[var(--it-muted)]">
                      {copy.noProjects} — <Link href="/projects/new" className="text-[var(--it-link)] hover:underline">{copy.createFirst}</Link>
                    </p>
                  ) : (
                    <select
                      value={form.project_id}
                      onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
                      className={selectClass}
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">{copy.assessment}</label>
                  {currentAssessments.length === 0 ? (
                    <p className="rounded-xl border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-2.5 text-sm text-[var(--it-muted)]">
                      {form.project_id ? copy.noLinked : copy.selectProjectFirst}
                    </p>
                  ) : (
                    <select
                      value={form.assessment_type}
                      onChange={(e) => setForm((f) => ({ ...f, assessment_type: e.target.value }))}
                      className={selectClass}
                    >
                      {currentAssessments.map((a) => (
                        <option key={a.name} value={a.name}>{a.label}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={loadingMode !== null || projects.length === 0 || currentAssessments.length === 0}
                    onClick={() => handleInvite("link")}
                    className="enterprise-button-secondary flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMode === "link" ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <Link2 className="h-4 w-4" strokeWidth={2} />
                    )}
                    {loadingMode === "link" ? copy.copying : copy.copyLink}
                  </button>
                  <button
                    type="button"
                    disabled={loadingMode !== null || projects.length === 0 || currentAssessments.length === 0}
                    onClick={() => handleInvite("email")}
                    className="enterprise-button flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMode === "email" ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <Mail className="h-4 w-4" strokeWidth={2} />
                    )}
                    {loadingMode === "email" ? copy.sending : copy.sendEmail}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
