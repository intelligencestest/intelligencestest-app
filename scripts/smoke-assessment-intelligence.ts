const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");

const compiledRoot = path.join(__dirname, "..");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request: string, parent: unknown, isMain: boolean, options: unknown) {
  if (request.startsWith("@/")) {
    return originalResolveFilename.call(this, path.join(compiledRoot, request.slice(2)), parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const {
  buildAssessmentIntelligence,
  RECOMMENDATION_ORDER,
  toQueueIntelligenceProjection,
} = require("../lib/assessment-intelligence");
const { toEnterpriseReportData } = require("../lib/report-pdf");
const { AQ_QUESTIONS } = require("../lib/questions/aq");
const { CT_QUESTIONS } = require("../lib/questions/critical-thinking");

const ctPerfectAnswers = CT_QUESTIONS.map((question: { correct: number }) => question.correct);
const aqHighAnswers = AQ_QUESTIONS.map((question: { reversed: boolean }) => (question.reversed ? 1 : 5));
const aqLowAnswers = AQ_QUESTIONS.map((question: { reversed: boolean }) => (question.reversed ? 5 : 1));

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

assert.equal(
  criticalThinkingOnly.evidenceSignals.some((signal: { assessmentKey: string; competencyId: string }) => {
    return signal.assessmentKey === "critical-thinking" && signal.competencyId === "analytical-reasoning";
  }),
  true,
  "Critical Thinking evidence extraction should produce analytical reasoning evidence.",
);

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
  assert.equal(
    aqOnly.evidenceSignals.some((signal: { assessmentKey: string; dimensionId?: string }) => {
      return signal.assessmentKey === "aq" && signal.dimensionId === dimension;
    }),
    true,
    `AQ evidence extraction should include ${dimension}.`,
  );
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

assert.equal(
  mixedEvidence.confidence.score < alignedEvidence.confidence.score,
  true,
  "Mixed evidence should lower confidence.",
);

assert.notEqual(
  criticalThinkingOnly.confidence.level,
  "high",
  "Single-assessment reports cannot produce high confidence.",
);

assert.equal(mixedEvidence.risks.length > 0, true, "Low AQ evidence should produce risks.");
for (const risk of mixedEvidence.risks) {
  assert.equal(
    mixedEvidence.interviewQuestions.some((question: { riskId?: string }) => question.riskId === risk.id),
    true,
    "Every risk should generate an interview validation question.",
  );
}

const queueProjection = toQueueIntelligenceProjection(mixedEvidence);
assert.equal(
  queueProjection.primaryRisk !== null && queueProjection.primaryRisk.evidenceSignalIds.length > 0,
  true,
  "Queue intelligence projection should expose the leading risk with supporting evidence.",
);
assert.equal(
  queueProjection.interviewKitReady && queueProjection.interviewQuestionCount > 0,
  true,
  "Queue intelligence projection should expose interview validation readiness.",
);
assert.equal(
  RECOMMENDATION_ORDER.strong < RECOMMENDATION_ORDER.proceed && RECOMMENDATION_ORDER.proceed < RECOMMENDATION_ORDER.review,
  true,
  "Recommendation sort order should be exported from the intelligence layer.",
);

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

assert.equal(
  JSON.stringify(pdfData).toLowerCase().includes("benchmark"),
  false,
  "Benchmark wording should not appear when benchmark evidence is absent.",
);

console.log("Assessment intelligence smoke checks passed.");
