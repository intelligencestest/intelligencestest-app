import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInternalAdmin } from "@/lib/internal-admin";

// Dev-only preview page for the Client Shortlist Brief PDF template.
// Renders static fake data (see lib/pdf/agency-brief/fakeData.ts) — no
// database connection. Not linked from any nav.
//
// Guarded for the same reason as /dev/client-brief-html-preview: /dev is
// not in the proxy's PROTECTED list, so this would otherwise be publicly
// reachable in production. 404s rather than showing an access screen —
// unlisted tooling should not advertise its own existence.

// Private surface: never indexed (robots.ts is advisory; this is not).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PdfPreviewPage() {
  const adminCtx = await getInternalAdmin();
  if (!adminCtx) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5", padding: "24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Client Shortlist Brief — template preview</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          Static fake data (Atlas Talent Partners / Customer Service Agent). Dev-only route.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <a
            href="/api/dev/client-brief-pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "#14213D",
              color: "#fff",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Open PDF in new tab
          </a>
          <a
            href="/api/dev/client-brief-pdf?download=1"
            download="client-shortlist-brief-sample.pdf"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "#fff",
              color: "#14213D",
              border: "1px solid #14213D",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Download PDF
          </a>
        </div>
        <div style={{ border: "1px solid #e4e4e7", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          <embed src="/api/dev/client-brief-pdf" type="application/pdf" width="100%" height="1100px" />
        </div>
      </div>
    </div>
  );
}
