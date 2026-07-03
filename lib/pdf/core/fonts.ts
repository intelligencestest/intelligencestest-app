import { Font } from "@react-pdf/renderer";
import type { PdfFontSource } from "./types";

let registeredFamilies = new Set<string>();

export function registerEnterprisePdfFonts(fonts: PdfFontSource[] = []): void {
  for (const font of fonts) {
    if (!font.family || registeredFamilies.has(font.family)) continue;

    const src = font.regular ?? font.medium ?? font.semibold ?? font.bold;
    if (!src) continue;

    Font.register({
      family: font.family,
      fonts: [
        font.regular ? { src: font.regular, fontWeight: 400 } : undefined,
        font.medium ? { src: font.medium, fontWeight: 500 } : undefined,
        font.semibold ? { src: font.semibold, fontWeight: 600 } : undefined,
        font.bold ? { src: font.bold, fontWeight: 700 } : undefined,
      ].filter(Boolean) as Array<{ src: string; fontWeight: number }>,
    });

    registeredFamilies = new Set([...registeredFamilies, font.family]);
  }

  Font.registerHyphenationCallback((word) => [word]);
}
