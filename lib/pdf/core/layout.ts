import type { PdfTheme } from "./types";

export const A4_SIZE = "A4" as const;

/** Editorial grid — locked. Narrow label column beside one wide reading column. */
export const LABEL_COLUMN_WIDTH = 112;
export const CONTENT_COLUMN_GAP = 10;

export function flowDirection(theme: PdfTheme): "row" | "row-reverse" {
  return theme.direction === "rtl" ? "row-reverse" : "row";
}

export function textStart(theme: PdfTheme): "left" | "right" {
  return theme.direction === "rtl" ? "right" : "left";
}

export function textEnd(theme: PdfTheme): "left" | "right" {
  return theme.direction === "rtl" ? "left" : "right";
}

export function clampScore(score: number, maxScore = 100): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(score, maxScore));
}

export function scorePercent(score: number, maxScore = 100): number {
  if (!maxScore) return 0;
  return Math.round((clampScore(score, maxScore) / maxScore) * 100);
}

export function formatDate(value?: string, locale = "es"): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dateLocale = locale === "en" ? "en-US" : locale === "fr" ? "fr-FR" : "es-ES";
  return new Intl.DateTimeFormat(dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
