"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadEnterpriseReport = downloadEnterpriseReport;
const filename_1 = require("./render/filename");
function filenameFromDisposition(disposition) {
    if (!disposition)
        return null;
    const match = disposition.match(/filename="?([^";]+)"?/i);
    return match?.[1] ?? null;
}
async function downloadEnterpriseReport(data) {
    const response = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to generate report PDF");
    }
    const blob = await response.blob();
    const filename = filenameFromDisposition(response.headers.get("content-disposition")) ??
        (0, filename_1.enterpriseReportFilename)(data.candidate, data.company);
    const url = URL.createObjectURL(blob);
    try {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
    finally {
        URL.revokeObjectURL(url);
    }
}
