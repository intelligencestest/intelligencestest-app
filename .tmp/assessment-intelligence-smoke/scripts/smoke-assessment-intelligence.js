"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const compiledRoot = path.join(__dirname, "..");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
    if (request.startsWith("@/")) {
        return originalResolveFilename.call(this, path.join(compiledRoot, request.slice(2)), parent, isMain, options);
    }
    return originalResolveFilename.call(this, request, parent, isMain, options);
};
const { buildAssessmentIntelligence } = require("../lib/assessment-intelligence");
const { toEnterpriseReportData } = require("../lib/report-pdf");
const { AQ_QUESTIONS } = require("../lib/questions/aq");
const { CT_QUESTIONS } = require("../lib/questions/critical-thinking");
const ctPerfectAnswers = CT_QUESTIONS.map((question) => question.correct);
const aqHighAnswers = AQ_QUESTIONS.map((question) => (question.reversed ? 1 : 5));
const aqLowAnswers = AQ_QUESTIONS.map((question) => (question.reversed ? 5 : 1));
const criticalThinkingOnly = buildAssessmentIntelligence({
    locale: "en",
    assessments: [
        {
            name: "Critical Thinking Test",
            score: 100,
            completedAt: "2026-07-04T00:00:00.000Z",
            rawAnswers: ctPerfectAnswers,
        },
    ],
});
assert.equal(criticalThinkingOnly.evidenceSignals.some((signal) => {
    return signal.assessmentKey === "critical-thinking" && signal.competencyId === "analytical-reasoning";
}), true, "Critical Thinking evidence extraction should produce analytical reasoning evidence.");
const aqOnly = buildAssessmentIntelligence({
    locale: "en",
    assessments: [
        {
            name: "Adversity Quotient (AQ) Test",
            score: 100,
            completedAt: "2026-07-04T00:00:00.000Z",
            rawAnswers: aqHighAnswers,
        },
    ],
});
for (const dimension of ["control", "ownership", "reach", "endurance"]) {
    assert.equal(aqOnly.evidenceSignals.some((signal) => {
        return signal.assessmentKey === "aq" && signal.dimensionId === dimension;
    }), true, `AQ evidence extraction should include ${dimension}.`);
}
const alignedEvidence = buildAssessmentIntelligence({
    locale: "en",
    assessments: [
        { name: "Critical Thinking Test", score: 100, completedAt: "2026-07-04T00:00:00.000Z", rawAnswers: ctPerfectAnswers },
        { name: "Adversity Quotient (AQ) Test", score: 100, completedAt: "2026-07-04T00:00:00.000Z", rawAnswers: aqHighAnswers },
    ],
});
const mixedEvidence = buildAssessmentIntelligence({
    locale: "en",
    assessments: [
        { name: "Critical Thinking Test", score: 100, completedAt: "2026-07-04T00:00:00.000Z", rawAnswers: ctPerfectAnswers },
        { name: "Adversity Quotient (AQ) Test", score: 20, completedAt: "2026-07-04T00:00:00.000Z", rawAnswers: aqLowAnswers },
    ],
});
assert.equal(mixedEvidence.confidence.score < alignedEvidence.confidence.score, true, "Mixed evidence should lower confidence.");
assert.notEqual(criticalThinkingOnly.confidence.level, "high", "Single-assessment reports cannot produce high confidence.");
assert.equal(mixedEvidence.risks.length > 0, true, "Low AQ evidence should produce risks.");
for (const risk of mixedEvidence.risks) {
    assert.equal(mixedEvidence.interviewQuestions.some((question) => question.riskId === risk.id), true, "Every risk should generate an interview validation question.");
}
const pdfData = toEnterpriseReportData({
    candidateName: "Test Candidate",
    candidateEmail: "candidate@example.com",
    companyName: "Example Company",
    projectName: "Customer Support",
    reportDate: "July 4, 2026",
    reportId: "RPT-SMOKE",
    locale: "en",
    assessments: [
        { name: "Critical Thinking Test", score: 100, completedAt: "2026-07-04T00:00:00.000Z", rawAnswers: ctPerfectAnswers },
    ],
});
assert.equal(JSON.stringify(pdfData).toLowerCase().includes("benchmark"), false, "Benchmark wording should not appear when benchmark evidence is absent.");
console.log("Assessment intelligence smoke checks passed.");
