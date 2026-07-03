import { Document, View } from "@react-pdf/renderer";
import type { EnterpriseReportData } from "../core/types";
import { createPdfTheme } from "../core/theme";
import { getPdfDirection, getPdfMessages } from "../core/i18n";
import { registerEnterprisePdfFonts } from "../core/fonts";
import { completedAssessmentsOnly, getEnabledSections } from "../core/section-registry";
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
}

export function EnterpriseAssessmentReport({ data }: EnterpriseAssessmentReportProps) {
  const locale = data.locale ?? "es";
  const messages = getPdfMessages(locale);
  const direction = getPdfDirection(locale, data.direction);
  const theme = createPdfTheme({
    ...data.theme,
    direction,
    logoUrl: data.theme?.logoUrl ?? data.company.logoUrl,
  });
  const completedAssessments = completedAssessmentsOnly(data.assessments);
  const enabled = getEnabledSections(data, completedAssessments);

  registerEnterprisePdfFonts(data.fonts);

  return (
    <Document
      author={data.company.name}
      creator="Intelligences Test"
      language={locale}
      subject={messages.coverSubtitle}
      title={data.meta?.title ?? messages.coverTitle}
    >
      {enabled.cover ? (
        <CoverPage theme={theme} messages={messages} candidate={data.candidate} company={data.company} meta={data.meta} />
      ) : null}

      <PdfReportPage
        theme={theme}
        header={<ReportHeader theme={theme} messages={messages} meta={data.meta} />}
        footer={<Footer theme={theme} messages={messages} />}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            {enabled.candidateInfo ? <CandidateInformation candidate={data.candidate} theme={theme} messages={messages} locale={locale} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            {enabled.companyInfo ? <CompanyInformation company={data.company} theme={theme} messages={messages} /> : null}
          </View>
        </View>

        {enabled.executiveSummary && data.executiveSummary ? (
          <ExecutiveSummary summary={data.executiveSummary} theme={theme} messages={messages} />
        ) : null}

        {enabled.overallScore && data.overallScore !== undefined ? (
          <OverallScoreCard score={data.overallScore} label={data.overallScoreLabel} theme={theme} messages={messages} />
        ) : null}

        {enabled.completedAssessments ? (
          <CompletedAssessments assessments={completedAssessments} theme={theme} messages={messages} locale={locale} />
        ) : null}

        {enabled.competencies && data.competencies?.length ? (
          <CompetencyScoreCards competencies={data.competencies} theme={theme} messages={messages} />
        ) : null}

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            {enabled.radarChart && data.radarChart?.length ? <RadarChart data={data.radarChart} theme={theme} messages={messages} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            {enabled.barChart && data.barChart?.length ? <BarChart data={data.barChart} theme={theme} messages={messages} /> : null}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            {enabled.strengths && data.strengths?.length ? <Strengths items={data.strengths} theme={theme} messages={messages} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            {enabled.developmentAreas && data.developmentAreas?.length ? (
              <DevelopmentAreas items={data.developmentAreas} theme={theme} messages={messages} />
            ) : null}
          </View>
        </View>

        {enabled.hiringRecommendation && data.hiringRecommendation ? (
          <HiringRecommendation recommendation={data.hiringRecommendation} theme={theme} messages={messages} />
        ) : null}

        {enabled.interviewQuestions && data.interviewQuestions?.length ? (
          <InterviewQuestions questions={data.interviewQuestions} theme={theme} messages={messages} />
        ) : null}

        {enabled.benchmarkComparison && data.benchmarkComparison?.length ? (
          <BenchmarkComparison items={data.benchmarkComparison} theme={theme} messages={messages} />
        ) : null}

        {data.children}
      </PdfReportPage>
    </Document>
  );
}
