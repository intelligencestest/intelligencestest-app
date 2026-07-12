import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import type { EnterpriseReportData } from "@/lib/pdf/core/types";
import { enterpriseReportFilename } from "@/lib/pdf/render/filename";
import { renderEnterpriseReportToBuffer } from "@/lib/pdf/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function defaultLogoDataUri(): string | undefined {
  const logoPath = path.join(process.cwd(), "public", "intelligencestest-email-logo.png");
  if (!fs.existsSync(logoPath)) return undefined;
  return `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
}

function isReportData(value: unknown): value is EnterpriseReportData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<EnterpriseReportData>;
  return Boolean(data.candidate?.name && data.company?.name && Array.isArray(data.assessments));
}

function withBrandDefaults(data: EnterpriseReportData): EnterpriseReportData {
  const logoUrl = data.theme?.logoUrl ?? defaultLogoDataUri();

  return {
    ...data,
    theme: {
      mode: "light",
      brandName: "IntelligencesTest",
      footerBrandName: "Powered by IntelligencesTest",
      primaryColor: "#1D4ED8",
      accentColor: "#2563EB",
      ...data.theme,
      logoUrl,
      coverLogoUrl: data.theme?.coverLogoUrl ?? logoUrl,
    },
  };
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  if (!isReportData(payload)) {
    return new Response("Invalid report payload", { status: 400 });
  }

  const report = withBrandDefaults(payload);
  const pdf = await renderEnterpriseReportToBuffer(report, { allowLargeBufferRender: true });
  const filename = enterpriseReportFilename(report.candidate, report.company);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/pdf",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
