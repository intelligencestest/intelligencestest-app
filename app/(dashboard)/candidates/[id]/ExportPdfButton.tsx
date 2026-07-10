"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ComprehensiveReportData } from "@/lib/report-pdf";

interface ExportPdfButtonProps {
  candidateName: string;
  candidateEmail: string;
  companyName: string;
  projectName: string;
  candidateId: string;
  assessments: { id?: string; assessmentId?: string; name: string; score: number; completedAt: string; category?: string; rawAnswers?: unknown }[];
  /**
   * "standalone" (default) — full-width filled button, used on the candidate
   * profile page where it's the only action in its own card.
   * "toolbar" — outlined/muted button for use alongside other actions (e.g.
   * the executive report's header), so the PDF export never reads as more
   * prominent than staying on the in-platform report itself.
   */
  variant?: "standalone" | "toolbar";
}

export default function ExportPdfButton({ variant = "standalone", ...props }: ExportPdfButtonProps) {
  const t = useTranslations("report");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setError(false);
    try {
      const { downloadComprehensiveReport } = await import("@/lib/report-pdf");
      const data: ComprehensiveReportData = {
        candidateName: props.candidateName,
        candidateEmail: props.candidateEmail,
        companyName: props.companyName,
        projectName: props.projectName,
        reportDate: new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        reportId: `RPT-${props.candidateId.slice(0, 8).toUpperCase()}`,
        assessments: props.assessments,
        locale: locale === "en" ? "en" : "es",
      };
      await downloadComprehensiveReport(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const isToolbar = variant === "toolbar";

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading || props.assessments.length === 0}
        className={
          isToolbar
            ? "enterprise-button-secondary inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            : "enterprise-button-secondary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        )}
        {loading ? t("exportingPdf") : t("exportPdf")}
      </button>
      {!isToolbar && <p className="mt-2 text-xs text-[var(--it-muted)]">{t("exportNote")}</p>}
      {error && <p className="mt-2 text-xs text-[#cfa097]">{t("exportError")}</p>}
    </div>
  );
}
