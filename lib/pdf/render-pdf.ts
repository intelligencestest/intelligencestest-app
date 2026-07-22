import puppeteer from "puppeteer";
import { isAllowedLogoUrl } from "@/lib/security/logo-url";

/**
 * Renders a full HTML document to a PDF buffer via headless Chromium.
 * Used only by the client-brief pipeline (lib/pdf/client-brief-template.ts) —
 * the internal @react-pdf/renderer report pipeline does not use this.
 *
 * Fonts are embedded as data: URLs by the template. The page is loaded from
 * memory, file access is not enabled, and request interception only permits
 * embedded data assets plus explicitly allowlisted HTTPS logo images.
 */
function isAllowedPdfRequestUrl(url: string): boolean {
  return url === "about:blank" || url.startsWith("data:") || url.startsWith("blob:") || isAllowedLogoUrl(url);
}

export async function renderHTMLToPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (isAllowedPdfRequestUrl(request.url())) {
        void request.continue().catch(() => undefined);
      } else {
        void request.abort().catch(() => undefined);
      }
    });

    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    // The agency logo is the one element in this template backed by a real
    // network fetch (everything else is inline SVG or data: URIs). Waiting
    // only on fonts/rAF let the snapshot race the image on a slow or loaded
    // network path — it rendered fine on a fast local connection and came
    // back blank from the production host. Give every <img> up to 5s to
    // finish loading (or fail) before the page is considered ready; a
    // logo that never loads still produces a PDF, just without the image.
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                const done = () => resolve();
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
                setTimeout(done, 5000);
              })
        )
      )
    );
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );

    // The template performs its own post-font, post-chart layout audit and
    // records either a ready flag or a precise error. Waiting for that state
    // prevents fixed-height A4 pages from silently clipping legal/footer
    // content when copy grows beyond the available page box.
    await page.waitForFunction(
      () => {
        const pdfWindow = window as typeof window & {
          __PDF_READY__?: boolean;
          __PDF_READY_ERROR__?: string;
        };
        return pdfWindow.__PDF_READY__ === true || Boolean(pdfWindow.__PDF_READY_ERROR__);
      },
      { timeout: 10_000 }
    );
    const readyError = await page.evaluate(() => {
      const pdfWindow = window as typeof window & { __PDF_READY_ERROR__?: string };
      return pdfWindow.__PDF_READY_ERROR__ ?? null;
    });
    if (readyError) {
      throw new Error(`Client brief render readiness check failed: ${readyError}`);
    }

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
