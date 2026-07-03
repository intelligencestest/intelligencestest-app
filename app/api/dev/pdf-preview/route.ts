import { NextRequest } from "next/server";
import { enterpriseReportFilename } from "@/lib/pdf/render/filename";
import { renderEnterpriseReportToBuffer } from "@/lib/pdf/server";
import { buildPdfPreviewReport, parsePdfPreviewOptions } from "@/lib/pdf/dev/sample-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const options = parsePdfPreviewOptions(request.nextUrl.searchParams);
  const report = buildPdfPreviewReport(options);
  const pdf = await renderEnterpriseReportToBuffer(report, { allowLargeBufferRender: true });
  const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
  const filename = enterpriseReportFilename(report.candidate, report.company);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Content-Type": "application/pdf",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
