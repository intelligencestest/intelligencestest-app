import { NextRequest } from "next/server";
import { renderClientShortlistBriefToBuffer } from "@/lib/pdf/agency-brief/render";
import { FAKE_AGENCY_BRIEF } from "@/lib/pdf/agency-brief/fakeData";

// Dev-only preview endpoint for the Client Shortlist Brief template.
// Static fake data only — no database connection, no real candidate data.
// Not linked from any nav; reachable directly for template development.
// ?download=1 forces a Save-As instead of the inline in-browser viewer.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const download = request.nextUrl.searchParams.get("download") === "1";
  const pdf = await renderClientShortlistBriefToBuffer(FAKE_AGENCY_BRIEF);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="client-shortlist-brief-sample.pdf"`,
      "Content-Type": "application/pdf",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
