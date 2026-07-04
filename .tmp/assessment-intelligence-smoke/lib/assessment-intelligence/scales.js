"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampScore = clampScore;
exports.normalizeScore = normalizeScore;
exports.evidenceDirection = evidenceDirection;
exports.evidenceStrength = evidenceStrength;
exports.riskSeverity = riskSeverity;
exports.assessmentKey = assessmentKey;
function clampScore(score, max = 100) {
    if (!Number.isFinite(score))
        return 0;
    return Math.max(0, Math.min(max, Math.round(score)));
}
function normalizeScore(score, maxScore) {
    if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0)
        return 0;
    return clampScore((score / maxScore) * 100);
}
function evidenceDirection(normalizedScore) {
    if (normalizedScore >= 65)
        return "positive";
    if (normalizedScore >= 50)
        return "mixed";
    return "risk";
}
function evidenceStrength(normalizedScore) {
    if (normalizedScore >= 80 || normalizedScore < 40)
        return "strong";
    if (normalizedScore >= 65 || normalizedScore < 50)
        return "moderate";
    return "limited";
}
function riskSeverity(normalizedScore) {
    if (normalizedScore < 40)
        return "high";
    if (normalizedScore < 50)
        return "medium";
    return "low";
}
function assessmentKey(name) {
    const normalized = name.toLowerCase();
    if (normalized.includes("critical thinking"))
        return "critical-thinking";
    if (normalized.includes("adversity quotient") || normalized.includes("(aq)") || normalized === "aq")
        return "aq";
    return "score-only";
}
