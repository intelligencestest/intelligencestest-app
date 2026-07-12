import type { PdfTheme, PdfThemeInput, ScoreTone } from "./types";

const DEFAULT_PRIMARY = "#101A2B";
const DEFAULT_ACCENT = "#9C7A2E";
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Editorial design system — locked. See design direction sign-off; these values
 * (ink / paper / brass / slate / line) are the report's entire palette. Brass has
 * exactly two jobs: the cover identity mark and the candidate's dot in every chart.
 * Nothing else in the report is colored.
 */
export const EDITORIAL = {
  ink: "#101A2B",
  paper: "#FAF9F6",
  brass: "#9C7A2E",
  slate: "#56606E",
  line: "#E2DFD6",
  /** Built-in PDF standard fonts — no font file registration required. */
  serif: "Times-Roman",
  serifBold: "Times-Bold",
} as const;

function safeColor(value: string | undefined, fallback: string): string {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

export function createPdfTheme(input: PdfThemeInput = {}): PdfTheme {
  const mode = input.mode ?? "light";
  const isDark = mode === "dark";
  const foreground = safeColor(input.textColor, isDark ? "#F8FAFC" : EDITORIAL.ink);
  const muted = safeColor(input.mutedTextColor, isDark ? "#CBD5E1" : EDITORIAL.slate);
  const primary = safeColor(input.primaryColor, DEFAULT_PRIMARY);
  const accent = safeColor(input.accentColor, DEFAULT_ACCENT);

  return {
    mode,
    direction: input.direction ?? "ltr",
    fontFamily: input.fontFamily ?? "Helvetica",
    brandName: input.brandName ?? "IntelligencesTest",
    footerBrandName: input.footerBrandName ?? input.brandName ?? "IntelligencesTest",
    logoUrl: input.logoUrl,
    coverLogoUrl: input.coverLogoUrl ?? input.logoUrl,
    page: {
      background: safeColor(input.pageBackground, isDark ? "#07080F" : EDITORIAL.paper),
      foreground,
      muted,
      subtle: isDark ? "#94A3B8" : "#8A93A2",
    },
    surface: {
      card: safeColor(input.cardBackground, isDark ? "#0D1020" : "#F8FAFC"),
      cardMuted: isDark ? "#11162A" : "#F1F5F9",
      inverse: isDark ? "#FFFFFF" : "#07080F",
    },
    border: {
      default: isDark ? "#26304D" : EDITORIAL.line,
      strong: isDark ? "#3B4A73" : "#B7C4D8",
    },
    brand: {
      primary,
      accent,
    },
    score: {
      high: "#059669",
      medium: "#D97706",
      low: "#DC2626",
      neutral: isDark ? "#94A3B8" : "#64748B",
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 14,
      lg: 20,
      xl: 40,
      pageX: 54,
      pageTop: 56,
      pageBottom: 56,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  };
}

export function scoreTone(score?: number): ScoreTone {
  if (score === undefined || Number.isNaN(score)) return "neutral";
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function scoreColor(theme: PdfTheme, tone: ScoreTone): string {
  return theme.score[tone] ?? theme.score.neutral;
}
