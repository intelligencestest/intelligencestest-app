import type { ReactNode } from "react";
import { Document, View } from "@react-pdf/renderer";
import type { EnterpriseReportData } from "../core/types";
import { createPdfTheme } from "../core/theme";
import { getPdfDirection, getPdfMessages } from "../core/i18n";
import { normalizeEnterpriseReportData } from "../core/normalize";
import { completedAssessmentsOnly, getEnabledSections } from "../core/section-registry";
import { flowDirection } from "../core/layout";
import { CoverPage } from "../components/identity/CoverPage";
import { PdfReportPage } from "../components/primitives/Page";
import { ReportHeader } from "../components/chrome/ReportHeader";
import { Footer } from "../components/chrome/Footer";
import { CandidateInformation } from "../components/identity/CandidateInformation";
import { CompanyInformation } from "../components/identity/CompanyInformation";
import { ExecutiveSummary } from "../components/insights/ExecutiveSummary";
import { OverallScoreCard } from "../components/insights/OverallScoreCard";
import { CompletedAssessments } from "../components/insights/CompletedAssessments";
import { CompetencyScoreCards } from "../components/insights/CompetencyScoreCards";
import { RadarChart } from "../components/charts/RadarChart";
import { BarChart } from "../components/charts/BarChart";
import { Strengths } from "../components/insights/Strengths";
import { DevelopmentAreas } from "../components/insights/DevelopmentAreas";
import { HiringRecommendation } from "../components/insights/HiringRecommendation";
import { InterviewQuestions } from "../components/insights/InterviewQuestions";
import { BenchmarkComparison } from "../components/insights/BenchmarkComparison";

interface EnterpriseAssessmentReportProps {
  data: EnterpriseReportData;
  children?: ReactNode;
}

export function EnterpriseAssessmentReport({ data, children }: EnterpriseAssessmentReportProps) {
  const reportData = normalizeEnterpriseReportData(data);
  const locale = reportData.locale ?? "es";
  const messages = getPdfMessages(locale);
  const direction = getPdfDirection(locale, reportData.direction);
  const theme = createPdfTheme({
    ...reportData.theme,
    direction,
    logoUrl: reportData.theme?.logoUrl ?? reportData.company.logoUrl,
  });
  const completedAssessments = completedAssessmentsOnly(reportData.assessments);
  const enabled = getEnabledSections(reportData, completedAssessments);

  return (
    <Document
      author={reportData.company.name}
      creator="Intelligences Test"
      keywords={reportData.meta?.keywords?.join(", ")}
      language={locale}
      subject={reportData.meta?.description ?? messages.coverSubtitle}
      title={reportData.meta?.title ?? messages.coverTitle}
    >
      {enabled.cover ? (
        <CoverPage theme={theme} messages={messages} candidate={reportData.candidate} company={reportData.company} meta={reportData.meta} />
      ) : null}

      <PdfReportPage
        theme={theme}
        header={<ReportHeader theme={theme} messages={messages} meta={reportData.meta} />}
        footer={<Footer theme={theme} messages={messages} />}
      >
        <View wrap={false} style={{ flexDirection: flowDirection(theme), gap: 12 }}>
          <View style={{ flex: 1 }}>
            {enabled.candidateInfo ? <CandidateInformation candidate={reportData.candidate} theme={theme} messages={messages} locale={locale} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            {enabled.companyInfo ? <CompanyInformation company={reportData.company} theme={theme} messages={messages} /> : null}
          </View>
        </View>

        {enabled.executiveSummary && reportData.executiveSummary ? (
          <ExecutiveSummary summary={reportData.executiveSummary} theme={theme} messages={messages} />
        ) : null}

        {enabled.overallScore && reportData.overallScore !== undefined ? (
          <OverallScoreCard score={reportData.overallScore} label={reportData.overallScoreLabel} theme={theme} messages={messages} />
        ) : null}

        {enabled.completedAssessments ? (
          <CompletedAssessments assessments={completedAssessments} theme={theme} messages={messages} locale={locale} />
        ) : null}

        {enabled.competencies && reportData.competencies?.length ? (
          <CompetencyScoreCards competencies={reportData.competencies} theme={theme} messages={messages} />
        ) : null}

        {enabled.radarChart || enabled.barChart ? (
          <View wrap={false} style={{ flexDirection: flowDirection(theme), gap: 12 }}>
            <View style={{ flex: 1 }}>
              {enabled.radarChart && reportData.radarChart?.length ? <RadarChart data={reportData.radarChart} theme={theme} messages={messages} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              {enabled.barChart && reportData.barChart?.length ? <BarChart data={reportData.barChart} theme={theme} messages={messages} /> : null}
            </View>
          </View>
        ) : null}

        {enabled.strengths || enabled.developmentAreas ? (
          <View style={{ flexDirection: flowDirection(theme), gap: 12 }}>
            <View style={{ flex: 1 }}>
              {enabled.strengths && reportData.strengths?.length ? <Strengths items={reportData.strengths} theme={theme} messages={messages} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              {enabled.developmentAreas && reportData.developmentAreas?.length ? (
                <DevelopmentAreas items={reportData.developmentAreas} theme={theme} messages={messages} />
              ) : null}
            </View>
          </View>
        ) : null}

        {enabled.hiringRecommendation && reportData.hiringRecommendation ? (
          <HiringRecommendation recommendation={reportData.hiringRecommendation} theme={theme} messages={messages} />
        ) : null}

        {enabled.interviewQuestions && reportData.interviewQuestions?.length ? (
          <InterviewQuestions questions={reportData.interviewQuestions} theme={theme} messages={messages} />
        ) : null}

        {enabled.benchmarkComparison && reportData.benchmarkComparison?.length ? (
          <BenchmarkComparison items={reportData.benchmarkComparison} theme={theme} messages={messages} />
        ) : null}

        {children}
      </PdfReportPage>
    </Document>
  );
}
