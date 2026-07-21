import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInternalAdmin } from "@/lib/internal-admin";

// Dev-only preview page for the new HTML/Puppeteer client-brief pipeline.
// Renders static fixture data (see app/api/dev/client-brief-html-pdf/route.ts)
// — no database connection. Not linked from any nav.
//
// This page is deployed to production, and /dev is not in the proxy's
// PROTECTED list, so without the guard below it is publicly reachable.
// It 404s rather than showing an access screen like /admin does: /admin is
// a destination operators navigate to, whereas this is unlisted tooling
// that should not advertise its own existence.

// Private surface: never indexed (robots.ts is advisory; this is not).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ClientBriefHtmlPreviewPage() {
  const adminCtx = await getInternalAdmin();
  if (!adminCtx) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5", padding: "24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Client Brief (HTML/Puppeteer pipeline) — preview</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          Static fixture data (Atlas Talent Partners / Customer Service Agent). Dev-only route. This is the new
          Chart.js + Puppeteer pipeline, separate from the older static agency-brief template at /dev/pdf-preview.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <a
            href="/api/dev/client-brief-html-pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "#1D4ED8",
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
            href="/api/dev/client-brief-html-pdf?download=1"
            download="client-brief-sample.pdf"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "#fff",
              color: "#1D4ED8",
              border: "1px solid #1D4ED8",
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
          <embed src="/api/dev/client-brief-html-pdf" type="application/pdf" width="100%" height="1100px" />
        </div>
      </div>
    </div>
  );
}
