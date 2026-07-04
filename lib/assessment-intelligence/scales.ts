import type { EvidenceDirection, EvidenceStrength, RiskSeverity } from "./types";

export function clampScore(score: number, max = 100): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(max, Math.round(score)));
}

export function normalizeScore(score: number, maxScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) return 0;
  return clampScore((score / maxScore) * 100);
}

export function evidenceDirection(normalizedScore: number): EvidenceDirection {
  if (normalizedScore >= 65) return "positive";
  if (normalizedScore >= 50) return "mixed";
  return "risk";
}

export function evidenceStrength(normalizedScore: number): EvidenceStrength {
  if (normalizedScore >= 80 || normalizedScore < 40) return "strong";
  if (normalizedScore >= 65 || normalizedScore < 50) return "moderate";
  return "limited";
}

export function riskSeverity(normalizedScore: number): RiskSeverity {
  if (normalizedScore < 40) return "high";
  if (normalizedScore < 50) return "medium";
  return "low";
}

export function assessmentKey(name: string): "critical-thinking" | "aq" | "score-only" {
  const normalized = name.toLowerCase();
  if (normalized.includes("critical thinking")) return "critical-thinking";
  if (normalized.includes("adversity quotient") || normalized.includes("(aq)") || normalized === "aq") return "aq";
  return "score-only";
}
