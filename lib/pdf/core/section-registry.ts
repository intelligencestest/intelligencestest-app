import type { CompletedAssessmentResult, EnterpriseReportData, ReportSectionVisibility } from "./types";

export type EnterpriseSectionKey = keyof Required<ReportSectionVisibility>;

export function completedAssessmentsOnly(assessments: CompletedAssessmentResult[]): CompletedAssessmentResult[] {
  return assessments.filter((assessment) => assessment.status === undefined || assessment.status === "completed");
}

export function isSectionEnabled(
  sections: ReportSectionVisibility | undefined,
  key: EnterpriseSectionKey,
  hasData: boolean,
): boolean {
  if (!hasData) return false;
  return sections?.[key] !== false;
}

export function getEnabledSections(data: EnterpriseReportData, completedAssessments: CompletedAssessmentResult[]) {
  return {
    cover: data.sections?.cover !== false,
    candidateInfo: isSectionEnabled(data.sections, "candidateInfo", Boolean(data.candidate)),
    companyInfo: isSectionEnabled(data.sections, "companyInfo", Boolean(data.company)),
    executiveSummary: isSectionEnabled(data.sections, "executiveSummary", Boolean(data.executiveSummary)),
    overallScore: isSectionEnabled(data.sections, "overallScore", data.overallScore !== undefined),
    competencies: isSectionEnabled(data.sections, "competencies", Boolean(data.competencies?.length)),
    radarChart: isSectionEnabled(data.sections, "radarChart", Boolean(data.radarChart?.length)),
    barChart: isSectionEnabled(data.sections, "barChart", Boolean(data.barChart?.length)),
    strengths: isSectionEnabled(data.sections, "strengths", Boolean(data.strengths?.length)),
    developmentAreas: isSectionEnabled(data.sections, "developmentAreas", Boolean(data.developmentAreas?.length)),
    hiringRecommendation: isSectionEnabled(data.sections, "hiringRecommendation", Boolean(data.hiringRecommendation)),
    interviewQuestions: isSectionEnabled(data.sections, "interviewQuestions", Boolean(data.interviewQuestions?.length)),
    benchmarkComparison: isSectionEnabled(data.sections, "benchmarkComparison", Boolean(data.benchmarkComparison?.length)),
    completedAssessments: completedAssessments.length > 0,
  };
}
