import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { EnterpriseReportData } from "@/lib/pdf/core/types";
import { enterpriseReportFilename } from "@/lib/pdf/render/filename";
import { renderEnterpriseReportToBuffer } from "@/lib/pdf/server";
import { sanitizeLogoUrl } from "@/lib/security/logo-url";

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
  const payloadThemeLogo = sanitizeLogoUrl(data.theme?.logoUrl);
  const payloadCoverLogo = sanitizeLogoUrl(data.theme?.coverLogoUrl);
  const payloadCompanyLogo = sanitizeLogoUrl(data.company.logoUrl);
  const logoUrl = payloadThemeLogo ?? payloadCompanyLogo ?? defaultLogoDataUri();

  return {
    ...data,
    company: {
      ...data.company,
      logoUrl: payloadCompanyLogo ?? undefined,
    },
    theme: {
      mode: "light",
      brandName: "IntelligencesTest",
      footerBrandName: "Powered by IntelligencesTest",
      primaryColor: "#1D4ED8",
      accentColor: "#2563EB",
      ...data.theme,
      logoUrl,
      coverLogoUrl: payloadCoverLogo ?? logoUrl,
    },
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

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
