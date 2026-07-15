import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

/**
 * Renders a full HTML document to a PDF buffer via headless Chromium.
 * Used only by the client-brief pipeline (lib/pdf/client-brief-template.ts) —
 * the internal @react-pdf/renderer report pipeline does not use this.
 *
 * The HTML embeds fonts via file:// @font-face src URLs. Chromium blocks
 * file:// subresource loads from a page loaded via setContent (origin
 * about:blank), even with --allow-file-access-from-files — that flag only
 * covers file:// pages loading other file:// resources. So this writes the
 * HTML to a temp file and navigates to it with page.goto('file://...'),
 * which gives the page a real file:// origin the fonts can load under.
 */
export async function renderHTMLToPDF(html: string): Promise<Buffer> {
  const tmpPath = path.join(os.tmpdir(), `client-brief-${randomUUID()}.html`);
  fs.writeFileSync(tmpPath, html);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(tmpPath).href, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
    fs.rmSync(tmpPath, { force: true });
  }
}
