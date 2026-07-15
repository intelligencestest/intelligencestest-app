"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

interface GenerateClientBriefButtonProps {
  projectId: string;
  projectName: string;
}

function filenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

// Client-facing brief download — same fetch+blob pattern as
// lib/pdf/download.ts (internal report), calling the separate
// app/api/reports/client-brief pipeline instead.
export default function GenerateClientBriefButton({ projectId, projectName }: GenerateClientBriefButtonProps) {
  const es = useLocale() === "es";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reports/client-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          data?.error ??
            (es ? "No se pudo generar el documento del cliente." : "Failed to generate the client brief.")
        );
        return;
      }

      const blob = await response.blob();
      const filename =
        filenameFromDisposition(response.headers.get("content-disposition")) ??
        `client-brief-${projectName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      const url = URL.createObjectURL(blob);
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setError(es ? "No se pudo generar el documento del cliente." : "Failed to generate the client brief.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--it-primary)]/25 bg-[var(--it-primary-soft)] px-4 py-2.5 text-sm font-medium text-[var(--it-primary)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0-3-3m3 3 3-3M9 3h6l4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          </svg>
        )}
        {loading ? (es ? "Generando..." : "Generating...") : es ? "Generar PDF para el cliente" : "Generate client PDF"}
      </button>
      {error && (
        <p className="absolute right-0 top-full mt-1.5 w-64 text-right text-xs text-[#b91c1c]">{error}</p>
      )}
    </div>
  );
}
