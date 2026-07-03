import { Font } from "@react-pdf/renderer";
import type { PdfFontSource } from "./types";

let registeredFontKeys = new Set<string>();
let hyphenationRegistered = false;

function fontKey(font: PdfFontSource): string {
  return [font.family, font.regular, font.medium, font.semibold, font.bold].filter(Boolean).join("|");
}

export function registerEnterprisePdfFonts(fonts: PdfFontSource[] = []): void {
  for (const font of fonts) {
    const key = fontKey(font);
    if (!font.family || !key || registeredFontKeys.has(key)) continue;

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

    registeredFontKeys = new Set([...registeredFontKeys, key]);
  }

  if (!hyphenationRegistered) {
    Font.registerHyphenationCallback((word) => [word]);
    hyphenationRegistered = true;
  }
}
