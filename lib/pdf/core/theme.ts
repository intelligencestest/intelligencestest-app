import type { PdfTheme, PdfThemeInput, ScoreTone } from "./types";

const DEFAULT_PRIMARY = "#1D4ED8";
const DEFAULT_ACCENT = "#2563EB";
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function safeColor(value: string | undefined, fallback: string): string {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

export function createPdfTheme(input: PdfThemeInput = {}): PdfTheme {
  const mode = input.mode ?? "light";
  const isDark = mode === "dark";
  const foreground = safeColor(input.textColor, isDark ? "#F8FAFC" : "#111827");
  const muted = safeColor(input.mutedTextColor, isDark ? "#CBD5E1" : "#475569");
  const primary = safeColor(input.primaryColor, DEFAULT_PRIMARY);
  const accent = safeColor(input.accentColor, DEFAULT_ACCENT);

  return {
    mode,
    direction: input.direction ?? "ltr",
    fontFamily: input.fontFamily ?? "Helvetica",
    brandName: input.brandName ?? "Intelligences Test",
    footerBrandName: input.footerBrandName ?? input.brandName ?? "Intelligences Test",
    logoUrl: input.logoUrl,
    coverLogoUrl: input.coverLogoUrl ?? input.logoUrl,
    page: {
      background: safeColor(input.pageBackground, isDark ? "#07080F" : "#FFFFFF"),
      foreground,
      muted,
      subtle: isDark ? "#94A3B8" : "#64748B",
    },
    surface: {
      card: safeColor(input.cardBackground, isDark ? "#0D1020" : "#F8FAFC"),
      cardMuted: isDark ? "#11162A" : "#F1F5F9",
      inverse: isDark ? "#FFFFFF" : "#07080F",
    },
    border: {
      default: isDark ? "#26304D" : "#D9E2F1",
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
      lg: 22,
      xl: 34,
      pageX: 42,
      pageTop: 58,
      pageBottom: 48,
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
