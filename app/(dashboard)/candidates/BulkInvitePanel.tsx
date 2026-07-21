"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { AlertTriangle, CheckCircle2, ChevronDown, FileSpreadsheet, Loader2, Upload, XCircle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface FailedRow {
  id: string;
  row_number: number;
  candidate_name: string;
  candidate_email: string;
  error_message: string | null;
}

type InviteBatchStatus = "pending" | "processing" | "completed" | "completed_with_failures" | "failed";

interface InviteBatch {
  id: string;
  project_id: string;
  test_type: string;
  source_filename: string | null;
  status: InviteBatchStatus;
  total_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  hiring_projects: { name: string; role_title: string | null } | { name: string; role_title: string | null }[] | null;
  failed_rows: FailedRow[];
}

interface Props {
  projects: Project[];
  projectAssessments: Record<string, { name: string; route: string; label: string }[]>;
}

function projectName(batch: InviteBatch) {
  const project = Array.isArray(batch.hiring_projects) ? batch.hiring_projects[0] : batch.hiring_projects;
  return project?.name ?? "—";
}

export default function BulkInvitePanel({ projects, projectAssessments }: Props) {
  const locale = useLocale();
  const es = locale === "es";
  const dateLocale = es ? "es-ES" : "en-US";
  const copy = es
    ? {
        title: "Invitación masiva por CSV",
        description: "Cargue hasta 200 candidatos. Los correos se enviarán en segundo plano.",
        open: "Subir CSV",
        close: "Cerrar",
        project: "Proyecto",
        assessment: "Evaluación inicial",
        file: "Archivo CSV",
        choose: "Seleccione un archivo .csv",
        hint: "Columnas obligatorias: name, email. Opcionales: role, test_type.",
        template: "Descargar plantilla",
        queue: "Poner invitaciones en cola",
        queuing: "Validando y creando lote...",
        queued: "Lote creado. El envío comenzará en segundo plano.",
        recent: "Lotes recientes",
        loading: "Cargando lotes...",
        empty: "Todavía no hay cargas CSV.",
        sent: "enviados al proveedor",
        failed: "fallidos",
        processed: "procesados",
        deliveryNote:
          "\"Enviados al proveedor\" significa que el proveedor de correo aceptó la invitación. La entrega final al buzón del candidato (incluidos los rebotes por direcciones inválidas) todavía no se rastrea aquí.",
        failures: "Ver errores",
        row: "Fila",
        available: (slots: number, total: number) =>
          `Su plan tiene ${slots} plaza${slots === 1 ? "" : "s"} disponible${slots === 1 ? "" : "s"} para ${total} filas. Las filas que superen el límite fallarán si no se libera capacidad antes de procesarlas.`,
        status: {
          pending: "En cola",
          processing: "Enviando",
          completed: "Procesado",
          completed_with_failures: "Procesado con errores",
          failed: "Fallido",
        } as Record<InviteBatchStatus, string>,
      }
    : {
        title: "Bulk invite by CSV",
        description: "Upload up to 200 candidates. Invite emails are sent in the background.",
        open: "Upload CSV",
        close: "Close",
        project: "Project",
        assessment: "Starting assessment",
        file: "CSV file",
        choose: "Choose a .csv file",
        hint: "Required columns: name, email. Optional: role, test_type.",
        template: "Download template",
        queue: "Queue invitations",
        queuing: "Validating and creating batch...",
        queued: "Batch created. Sending will begin in the background.",
        recent: "Recent batches",
        loading: "Loading batches...",
        empty: "No CSV uploads yet.",
        sent: "submitted",
        failed: "failed",
        processed: "processed",
        deliveryNote:
          "\"Submitted\" means the email provider accepted the invitation. Final delivery to the candidate's inbox (including bounces from invalid addresses) is not tracked here yet.",
        failures: "View failures",
        row: "Row",
        available: (slots: number, total: number) =>
          `Your plan currently has ${slots} candidate slot${slots === 1 ? "" : "s"} available for ${total} rows. Rows over the limit will fail unless capacity becomes available before processing.`,
        status: {
          pending: "Queued",
          processing: "Sending",
          completed: "Processed",
          completed_with_failures: "Processed with failures",
          failed: "Failed",
        } as Record<InviteBatchStatus, string>,
      };

  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [testType, setTestType] = useState(projectAssessments[projects[0]?.id ?? ""]?.[0]?.name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [batches, setBatches] = useState<InviteBatch[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadBatches = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/candidates/batches", { cache: "no-store" });
      const payload = (await response.json()) as { batches?: InviteBatch[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Failed to load batches");
      setBatches(payload.batches ?? []);
    } catch (loadError) {
      if (!silent) setError(loadError instanceof Error ? loadError.message : "Failed to load batches");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    if (!batches.some((batch) => batch.status === "pending" || batch.status === "processing")) return;
    const timer = window.setTimeout(() => void loadBatches(true), 5000);
    return () => window.clearTimeout(timer);
  }, [batches, loadBatches]);

  useEffect(() => {
    const assessments = projectAssessments[projectId] ?? [];
    if (!assessments.some((assessment) => assessment.name === testType)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTestType(assessments[0]?.name ?? "");
    }
  }, [projectAssessments, projectId, testType]);

  async function submitBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !projectId || !testType) return;

    setUploading(true);
    setError("");
    setNotice("");
    const body = new FormData();
    body.set("file", file);
    body.set("project_id", projectId);
    body.set("test_type", testType);

    try {
      const response = await fetch("/api/candidates/batches", { method: "POST", body });
      const payload = (await response.json()) as {
        error?: string;
        errors?: string[];
        batch?: { total_count: number };
        remaining_slots?: number | null;
      };
      if (!response.ok) {
        const details = payload.errors?.length ? ` ${payload.errors.join(" ")}` : "";
        throw new Error(`${payload.error ?? "CSV upload failed."}${details}`);
      }

      const total = payload.batch?.total_count ?? 0;
      setNotice(
        payload.remaining_slots !== null && payload.remaining_slots !== undefined && payload.remaining_slots < total
          ? `${copy.queued} ${copy.available(payload.remaining_slots, total)}`
          : copy.queued,
      );
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await loadBatches(true);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "CSV upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const assessments = projectAssessments[projectId] ?? [];

  return (
    <section className="enterprise-card overflow-hidden rounded-xl">
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] text-[var(--it-link)]">
            <FileSpreadsheet className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[var(--it-text)]">{copy.title}</h2>
            <p className="mt-1 text-sm text-[var(--it-muted)]">{copy.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--it-hairline)] px-3.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-[var(--it-surface-muted)]"
        >
          <Upload className="h-4 w-4" strokeWidth={2} />
          {open ? copy.close : copy.open}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
        </button>
      </div>

      {open && (
        <form onSubmit={submitBatch} className="border-t enterprise-divider bg-[var(--it-surface-muted)]/45 px-5 py-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-[var(--it-faint)]">
              {copy.project}
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-200 outline-none focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
              >
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-[var(--it-faint)]">
              {copy.assessment}
              <select
                value={testType}
                onChange={(event) => setTestType(event.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-200 outline-none focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
              >
                {assessments.map((assessment) => <option key={assessment.name} value={assessment.name}>{assessment.label}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-[var(--it-faint)]">
              {copy.file}
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                required
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="mt-2 block w-full cursor-pointer rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-300 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--it-primary-soft)] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[var(--it-link)]"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[var(--it-muted)]">
              {copy.hint}{" "}
              <a
                href="data:text/csv;charset=utf-8,name%2Cemail%0AJane%20Doe%2Cjane%40example.com%0AJohn%20Smith%2Cjohn%40example.com"
                download="candidate-invite-template.csv"
                className="font-medium text-[var(--it-link)] hover:underline"
              >
                {copy.template}
              </a>
            </p>
            <button
              type="submit"
              disabled={uploading || !file || !projectId || !testType}
              className="enterprise-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? copy.queuing : copy.queue}
            </button>
          </div>
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </form>
      )}

      <div className="border-t enterprise-divider px-5 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--it-faint)]">{copy.recent}</h3>
        {loading ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-[var(--it-muted)]"><Loader2 className="h-4 w-4 animate-spin" />{copy.loading}</p>
        ) : batches.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--it-muted)]">{copy.empty}</p>
        ) : (
          <div className="mt-3 space-y-3">
            {batches.map((batch) => {
              const processed = batch.sent_count + batch.failed_count;
              const percent = batch.total_count > 0 ? Math.round((processed / batch.total_count) * 100) : 0;
              const active = batch.status === "pending" || batch.status === "processing";
              return (
                <div key={batch.id} className="rounded-lg border border-[var(--it-hairline)] bg-[var(--it-bg)] px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">{batch.source_filename ?? "CSV"}</p>
                      <p className="mt-0.5 truncate text-xs text-[var(--it-muted)]">
                        {projectName(batch)} · {batch.test_type} · {new Date(batch.created_at).toLocaleString(dateLocale, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-medium ${
                      active
                        ? "bg-blue-500/10 text-blue-300"
                        : batch.failed_count > 0
                          ? "bg-amber-500/10 text-amber-300"
                          : "bg-emerald-500/10 text-emerald-300"
                    }`}>
                      {active && <Loader2 className="h-3 w-3 animate-spin" />}
                      {copy.status[batch.status]}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--it-surface-muted)]">
                    <div className="h-full rounded-full bg-[var(--it-primary)] transition-[width]" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-[var(--it-muted)]">
                    <span>{processed}/{batch.total_count} {copy.processed}</span>
                    <span className="text-emerald-300">{batch.sent_count} {copy.sent}</span>
                    {batch.failed_count > 0 && <span className="text-amber-300">{batch.failed_count} {copy.failed}</span>}
                  </div>
                  {batch.failed_rows.length > 0 && (
                    <details className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {copy.failures} ({batch.failed_rows.length})
                      </summary>
                      <div className="mt-2 space-y-2 border-t border-amber-500/15 pt-2">
                        {batch.failed_rows.map((row) => (
                          <p key={row.id} className="text-xs leading-5 text-slate-300">
                            <span className="font-medium">{copy.row} {row.row_number}: {row.candidate_name}</span>
                            <span className="text-[var(--it-muted)]"> ({row.candidate_email}) — {row.error_message ?? copy.failed}</span>
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
            <p className="pt-1 text-[11px] leading-4 text-[var(--it-faint)]">{copy.deliveryNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}
