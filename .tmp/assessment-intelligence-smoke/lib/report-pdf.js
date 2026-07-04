"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEnterpriseReportData = toEnterpriseReportData;
exports.downloadComprehensiveReport = downloadComprehensiveReport;
const assessment_terms_1 = require("@/lib/i18n/assessment-terms");
const assessment_intelligence_1 = require("@/lib/assessment-intelligence");
const download_1 = require("@/lib/pdf/download");
const CATEGORY_BY_ASSESSMENT = {
    "Critical Thinking Test": "Cognitive",
    "Adversity Quotient (AQ) Test": "Resilience",
    "Emotional Intelligence Test": "Emotional Intelligence",
    "Leadership Styles Test": "Leadership",
    "Numerical Intelligence Test": "Numerical Reasoning",
    "Attention to Detail Test": "Cognitive",
    "Verbal Reasoning Test": "Cognitive",
    "Abstract Reasoning Test": "Cognitive",
    "Mechanical Reasoning Test": "Technical",
    "Communication Skills Test": "Communication",
    "Problem Solving Test": "Cognitive",
    "Work Style Assessment": "Productivity",
    "Sales Aptitude Test": "Sales",
    "Customer Service Skills Test": "Customer Service",
    "Teamwork & Collaboration Test": "Teamwork",
    "Time Management Test": "Productivity",
    "Stress Tolerance Test": "Resilience",
    "Integrity & Ethics Test": "Character",
    "Decision Making Test": "Judgment",
    "Learning Agility Test": "Cognitive",
    "Personality Type Test": "Personality",
    "Situational Judgment Test": "Workplace Judgment",
};
const COPY = {
    es: {
        title: "Informe ejecutivo de evaluacion",
        subtitle: "Documento ejecutivo para decisiones de contratacion",
        overallScore: "Promedio de evaluaciones completadas",
        unknownCompany: "Empresa",
        unknownProject: "Proyecto de evaluacion",
        competencyDescription: (name) => `Evidencia disponible a partir de ${name}.`,
    },
    en: {
        title: "Executive Assessment Report",
        subtitle: "Executive hiring decision document",
        overallScore: "Average of completed assessments",
        unknownCompany: "Company",
        unknownProject: "Assessment Project",
        competencyDescription: (name) => `Available evidence from ${name}.`,
    },
};
function localeOf(data) {
    return data.locale === "en" ? "en" : "es";
}
function clampScore(score) {
    return Math.max(0, Math.min(100, Math.round(score)));
}
function normalizeAssessments(assessments) {
    const seen = new Set();
    return assessments
        .filter((assessment) => assessment.name && Number.isFinite(assessment.score))
        .map((assessment) => ({ ...assessment, score: clampScore(assessment.score) }))
        .filter((assessment) => {
        const key = `${assessment.name}:${assessment.completedAt}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function categoryFor(name, locale) {
    const category = CATEGORY_BY_ASSESSMENT[name] ?? "Cognitive";
    return (0, assessment_terms_1.categoryLabel)(category, locale);
}
function displayName(name, locale) {
    return (0, assessment_terms_1.assessmentName)(name, locale);
}
function shortName(name, locale) {
    return (0, assessment_terms_1.assessmentShort)(name, name.replace(" Test", "").replace(" Assessment", ""), locale);
}
function toEnterpriseReportData(data) {
    const locale = localeOf(data);
    const copy = COPY[locale];
    const assessments = normalizeAssessments(data.assessments);
    const intelligence = (0, assessment_intelligence_1.buildAssessmentIntelligence)({ assessments, locale });
    const average = assessments.length ? clampScore(assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length) : 0;
    const candidateName = data.candidateName.trim() || (locale === "es" ? "Candidato" : "Candidate");
    const companyName = data.companyName.trim() || copy.unknownCompany;
    const projectName = data.projectName.trim() || copy.unknownProject;
    const completedAssessments = assessments.map((assessment) => {
        const sourceId = assessment.assessmentId ?? assessment.id ?? assessment.name;
        const sourceSignals = intelligence.evidenceSignals.filter((signal) => signal.assessmentId === sourceId);
        return {
            id: sourceId,
            name: displayName(assessment.name, locale),
            category: assessment.category ? (0, assessment_terms_1.categoryLabel)(assessment.category, locale) : categoryFor(assessment.name, locale),
            score: assessment.score,
            completedAt: assessment.completedAt,
            confidence: intelligence.confidence.level,
            status: "completed",
            dimensions: sourceSignals
                .filter((signal) => signal.dimensionId)
                .map((signal) => ({
                id: signal.dimensionId,
                label: signal.dimensionLabel ?? signal.competencyLabel,
                score: signal.normalizedScore,
                maxScore: 100,
                description: signal.statement,
            })),
        };
    });
    const competencies = intelligence.competencyEvidence.map((competency) => ({
        id: competency.competencyId,
        label: competency.label,
        score: competency.score,
        category: competency.category,
        description: competency.summary,
        evidence: competency.evidenceSignalIds.join(", "),
        sourceAssessmentIds: competency.evidenceSignalIds,
    }));
    return {
        locale,
        theme: {
            mode: "light",
            brandName: "Intelligences Test",
            footerBrandName: "Powered by Intelligences Test",
            primaryColor: "#1D4ED8",
            accentColor: "#2563EB",
        },
        meta: {
            id: data.reportId,
            title: copy.title,
            subtitle: copy.subtitle,
            generatedAt: new Date().toISOString(),
            confidentialityLabel: locale === "es" ? "Confidencial" : "Confidential",
        },
        candidate: {
            name: candidateName,
            email: data.candidateEmail,
            role: projectName,
            completedAt: assessments.at(-1)?.completedAt,
        },
        company: {
            name: companyName,
        },
        assessments: completedAssessments,
        overallScore: average,
        overallScoreLabel: copy.overallScore,
        executiveSummary: {
            headline: intelligence.executiveSummary.headline,
            summary: intelligence.executiveSummary.summary,
            confidence: intelligence.confidence.level,
            evidence: intelligence.executiveSummary.evidence,
        },
        competencies,
        radarChart: competencies.slice(0, 8).map((competency) => ({
            label: competency.label,
            value: competency.score,
            sourceAssessmentId: competency.sourceAssessmentIds?.[0],
        })),
        barChart: competencies.slice(0, 8).map((competency) => ({
            label: competency.label,
            value: competency.score,
            sourceAssessmentId: competency.sourceAssessmentIds?.[0],
        })),
        strengths: intelligence.strengths.length ? intelligence.strengths : intelligence.executiveSummary.evidence.slice(0, 2),
        developmentAreas: intelligence.developmentAreas.length ? intelligence.developmentAreas : intelligence.methodologyLimitations.slice(0, 3),
        hiringRecommendation: intelligence.recommendation,
        interviewQuestions: intelligence.interviewQuestions,
    };
}
async function downloadComprehensiveReport(data) {
    await (0, download_1.downloadEnterpriseReport)(toEnterpriseReportData(data));
}
