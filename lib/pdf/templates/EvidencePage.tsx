import { Page, Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../core/i18n";
import type { EnterpriseReportData, PdfTheme } from "../core/types";
import { EDITORIAL } from "../core/theme";
import { A4_SIZE, flowDirection } from "../core/layout";
import { hasBenchmarkEvidence } from "../core/section-registry";
import type { getEnabledSections } from "../core/section-registry";
import { RunningHeader } from "../components/chrome/RunningHeader";
import { CenteredFooter } from "../components/chrome/CenteredFooter";
import { RangeDotChart } from "../components/charts/RangeDotChart";
import { Zone } from "../components/primitives/Zone";
import { EditorialBody, ExhibitCaption } from "../components/primitives/EditorialType";

interface EvidencePageProps {
  theme: PdfTheme;
  messages: PdfMessages;
  data: EnterpriseReportData;
  enabled: ReturnType<typeof getEnabledSections>;
  evidenceExhibitIndex?: number;
}

const COLUMN = { source: "28%", competency: "32%", score: "12%" } as const;

/** Which instrument produced this evidence — joined via competencies.sourceAssessmentIds, not the benchmark's own provenance note. */
function buildAssessmentNameByLabel(data: EnterpriseReportData): Map<string, string> {
  const nameById = new Map(data.assessments.map((assessment) => [assessment.id, assessment.name]));
  const byLabel = new Map<string, string>();
  for (const competency of data.competencies ?? []) {
    const name = competency.sourceAssessmentIds?.map((id) => nameById.get(id)).find(Boolean);
    if (name) byLabel.set(competency.label.toLowerCase(), name);
  }
  return byLabel;
}

export function EvidencePage({ theme, messages, data, enabled, evidenceExhibitIndex }: EvidencePageProps) {
  const evidenceRows = enabled.benchmarkComparison ? (data.benchmarkComparison ?? []).filter(hasBenchmarkEvidence).slice(0, 7) : [];
  const questions = enabled.interviewQuestions ? (data.interviewQuestions ?? []).filter((q) => q.question.trim()).slice(0, 5) : [];
  const assessmentNameByLabel = buildAssessmentNameByLabel(data);

  return (
    <Page
      size={A4_SIZE}
      style={{
        backgroundColor: EDITORIAL.paper,
        color: EDITORIAL.ink,
        fontFamily: theme.fontFamily,
        paddingBottom: theme.spacing.pageBottom,
        paddingHorizontal: theme.spacing.pageX,
        paddingTop: theme.spacing.pageTop,
      }}
    >
      <RunningHeader theme={theme} pageLabel={messages.evidencePageLabel} candidateLine={data.candidate.name} />

      {evidenceRows.length > 0 ? (
        <Zone theme={theme} label={messages.evidenceLabel}>
          <View
            style={{
              flexDirection: flowDirection(theme),
              gap: theme.spacing.sm,
              borderBottomColor: EDITORIAL.ink,
              borderBottomWidth: 0.9,
              paddingBottom: theme.spacing.xs,
            }}
          >
            <Text style={{ width: COLUMN.source, color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.8, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {messages.assessmentColumn}
            </Text>
            <Text style={{ width: COLUMN.competency, color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.8, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {messages.competencyColumn}
            </Text>
            <Text style={{ width: COLUMN.score, color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.8, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {messages.scoreColumn}
            </Text>
            <Text style={{ flex: 1, color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.8, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {messages.vsCohortColumn}
            </Text>
          </View>
          {evidenceRows.map((row) => (
            <View key={row.label} style={{ flexDirection: flowDirection(theme), gap: theme.spacing.sm, alignItems: "center", paddingVertical: theme.spacing.sm }}>
              <Text style={{ width: COLUMN.source, color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 8.5 }}>
                {assessmentNameByLabel.get(row.label.toLowerCase()) ?? row.source ?? "—"}
              </Text>
              <Text style={{ width: COLUMN.competency, color: EDITORIAL.ink, fontFamily: theme.fontFamily, fontSize: 8.5, fontWeight: 700 }}>{row.label}</Text>
              <Text style={{ width: COLUMN.score, color: EDITORIAL.ink, fontFamily: theme.fontFamily, fontSize: 8.5, fontWeight: 700 }}>
                {Math.round(row.candidateScore)}
              </Text>
              <View style={{ flex: 1 }}>
                <RangeDotChart theme={theme} candidateScore={row.candidateScore} benchmarkScore={row.benchmarkScore} width={90} />
              </View>
            </View>
          ))}
          {evidenceExhibitIndex !== undefined ? (
            <ExhibitCaption theme={theme} index={evidenceExhibitIndex} exhibitWord={messages.exhibit}>
              {messages.benchmarkComparison}. {messages.benchmarkSource}: {evidenceRows[0]?.source ?? messages.benchmarkCohort}.
            </ExhibitCaption>
          ) : null}
        </Zone>
      ) : null}

      {questions.length > 0 ? (
        <Zone theme={theme} label={messages.validationLabel}>
          {questions.map((item, index) => (
            <View key={item.question} style={{ marginBottom: index === questions.length - 1 ? 0 : theme.spacing.md }}>
              <Text style={{ color: EDITORIAL.ink, fontFamily: theme.fontFamily, fontSize: 9.5, fontWeight: 700, lineHeight: 1.4 }}>{item.question}</Text>
              {item.reason ? (
                <EditorialBody theme={theme} style={{ color: theme.page.subtle, fontSize: 8, marginTop: 3 }}>
                  {messages.whyWeAsk} — {item.reason}
                </EditorialBody>
              ) : null}
            </View>
          ))}
        </Zone>
      ) : null}

      <CenteredFooter theme={theme} reportId={data.meta?.id} confidentialityLabel={data.meta?.confidentialityLabel ?? messages.confidential} />
    </Page>
  );
}
