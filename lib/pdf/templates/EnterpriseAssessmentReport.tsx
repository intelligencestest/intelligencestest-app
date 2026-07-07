import { Document } from "@react-pdf/renderer";
import type { EnterpriseReportData } from "../core/types";
import { createPdfTheme } from "../core/theme";
import { getPdfDirection, getPdfMessages } from "../core/i18n";
import { normalizeEnterpriseReportData } from "../core/normalize";
import { completedAssessmentsOnly, getEnabledSections } from "../core/section-registry";
import { CoverPage } from "../components/identity/CoverPage";
import { HiringDecisionPage } from "./HiringDecisionPage";
import { EvidencePage } from "./EvidencePage";

interface EnterpriseAssessmentReportProps {
  data: EnterpriseReportData;
}

/**
 * The official IntelligencesTest Executive Report — locked. Exactly three
 * pages: Cover, Hiring Decision, Evidence & Interview Validation. Do not add
 * a fourth page or a new visual device without a new design sign-off.
 */
export function EnterpriseAssessmentReport({ data }: EnterpriseAssessmentReportProps) {
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

  let exhibitCounter = 0;
  const scoreExhibitIndex = enabled.overallScore ? ++exhibitCounter : undefined;
  const competencyExhibitIndex = enabled.competencies ? ++exhibitCounter : undefined;
  const evidenceExhibitIndex = enabled.benchmarkComparison ? ++exhibitCounter : undefined;

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
        <CoverPage theme={theme} messages={messages} candidate={reportData.candidate} company={reportData.company} meta={reportData.meta} locale={locale} />
      ) : null}

      <HiringDecisionPage
        theme={theme}
        messages={messages}
        data={reportData}
        enabled={enabled}
        scoreExhibitIndex={scoreExhibitIndex}
        competencyExhibitIndex={competencyExhibitIndex}
      />

      <EvidencePage theme={theme} messages={messages} data={reportData} enabled={enabled} evidenceExhibitIndex={evidenceExhibitIndex} />
    </Document>
  );
}
