"use client";

import type { EnterpriseReportData } from "./core/types";
import { enterpriseReportFilename } from "./render/filename";

function filenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

export async function downloadEnterpriseReport(data: EnterpriseReportData): Promise<void> {
  const response = await fetch("/api/reports/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to generate report PDF");
  }

  const blob = await response.blob();
  const filename =
    filenameFromDisposition(response.headers.get("content-disposition")) ??
    enterpriseReportFilename(data.candidate, data.company);
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
}
