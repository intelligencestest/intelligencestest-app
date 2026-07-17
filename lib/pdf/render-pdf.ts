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
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
