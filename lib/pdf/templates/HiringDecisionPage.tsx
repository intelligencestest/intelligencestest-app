import { Page, Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../core/i18n";
import type { BenchmarkComparisonItem, EnterpriseReportData, PdfTheme } from "../core/types";
import { EDITORIAL } from "../core/theme";
import { A4_SIZE, flowDirection } from "../core/layout";
import { verdictMarkWord } from "../core/verdict";
import type { getEnabledSections } from "../core/section-registry";
import { RunningHeader } from "../components/chrome/RunningHeader";
import { CenteredFooter } from "../components/chrome/CenteredFooter";
import { VerdictMark } from "../components/insights/VerdictMark";
import { RangeDotChart } from "../components/charts/RangeDotChart";
import { Zone } from "../components/primitives/Zone";
import { HairlineRule } from "../components/primitives/HairlineRule";
import { DisplaySerif, EditorialBody, ExhibitCaption, ZoneLabel } from "../components/primitives/EditorialType";

interface HiringDecisionPageProps {
  theme: PdfTheme;
  messages: PdfMessages;
  data: EnterpriseReportData;
  enabled: ReturnType<typeof getEnabledSections>;
  scoreExhibitIndex?: number;
  competencyExhibitIndex?: number;
}

function confidenceLabel(messages: PdfMessages, confidence?: string) {
  if (confidence === "high") return messages.highConfidence;
  if (confidence === "low") return messages.lowConfidence;
  return messages.moderateConfidence;
}

function findOverallBenchmark(items?: BenchmarkComparisonItem[]): BenchmarkComparisonItem | undefined {
  return items?.find((item) => /overall|composite|general|total/i.test(item.label));
}

function findCompetencyBenchmark(label: string, items?: BenchmarkComparisonItem[]): BenchmarkComparisonItem | undefined {
  return items?.find((item) => item.label.toLowerCase() === label.toLowerCase());
}

export function HiringDecisionPage({ theme, messages, data, enabled, scoreExhibitIndex, competencyExhibitIndex }: HiringDecisionPageProps) {
  const recommendation = enabled.hiringRecommendation ? data.hiringRecommendation : undefined;
  const overallScore = enabled.overallScore ? data.overallScore : undefined;
  const overallBenchmark = findOverallBenchmark(data.benchmarkComparison);
  const competencies = enabled.competencies ? (data.competencies ?? []).slice(0, 6) : [];
  const strengths = enabled.strengths ? (data.strengths ?? []).slice(0, 3) : [];
  const developmentAreas = enabled.developmentAreas ? (data.developmentAreas ?? []).slice(0, 2) : [];
  const showWhyWatch = strengths.length > 0 || developmentAreas.length > 0;
  // The Hiring Decision page alone reserves extra top space for the Verdict
  // Mark's band — every other page uses the standard theme.spacing.pageTop.
  const topPadding = recommendation ? theme.spacing.pageTop + 62 : theme.spacing.pageTop;

  return (
    <Page
      size={A4_SIZE}
      style={{
        backgroundColor: EDITORIAL.paper,
        color: EDITORIAL.ink,
        fontFamily: theme.fontFamily,
        paddingBottom: theme.spacing.pageBottom,
        paddingHorizontal: theme.spacing.pageX,
        paddingTop: topPadding,
      }}
    >
      {recommendation ? <VerdictMark word={verdictMarkWord(recommendation.level, messages)} topPadding={topPadding} /> : null}

      <RunningHeader
        theme={theme}
        pageLabel={messages.hiringDecisionPageLabel}
        candidateLine={[data.candidate.name, data.candidate.role].filter(Boolean).join("  —  ")}
      />

      {recommendation ? (
        <>
          <Zone theme={theme} label={messages.recommendationLabel} marginTop={28}>
            <DisplaySerif theme={theme} style={{ fontSize: 21 }}>
              {recommendation.title}
            </DisplaySerif>
            <EditorialBody theme={theme} style={{ marginTop: theme.spacing.sm, maxWidth: "94%" }}>
              {recommendation.rationale}
            </EditorialBody>
            <ZoneLabel theme={theme} style={{ marginTop: theme.spacing.sm, color: theme.page.subtle }}>
              {messages.confidenceLine} — {confidenceLabel(messages, recommendation.confidence)}
            </ZoneLabel>
          </Zone>
          <HairlineRule theme={theme} style={{ marginTop: 16 }} />
        </>
      ) : null}

      {overallScore !== undefined ? (
        <Zone theme={theme} label={messages.scoreLabel} marginTop={24}>
          <View style={{ flexDirection: flowDirection(theme), alignItems: "center", gap: theme.spacing.lg }}>
            <DisplaySerif theme={theme} style={{ fontSize: 48 }}>
              {Math.round(overallScore)}
            </DisplaySerif>
            <RangeDotChart theme={theme} candidateScore={overallScore} benchmarkScore={overallBenchmark?.benchmarkScore} width={140} />
          </View>
          {overallBenchmark ? (
            <ZoneLabel theme={theme} style={{ marginTop: theme.spacing.xs, color: theme.page.subtle, textTransform: "none", fontWeight: 400 }}>
              {overallBenchmark.percentile !== undefined ? `${messages.percentileLabel} ${Math.round(overallBenchmark.percentile)} ` : ""}
              {messages.versusLabel} {overallBenchmark.source ?? messages.benchmarkCohort}
            </ZoneLabel>
          ) : null}
          {scoreExhibitIndex !== undefined ? (
            <ExhibitCaption theme={theme} index={scoreExhibitIndex} exhibitWord={messages.exhibit}>
              {data.overallScoreLabel ?? messages.overallScore}
              {overallBenchmark ? `, ${messages.indexedToBenchmark} ${overallBenchmark.source ?? messages.benchmarkCohort}.` : "."}
            </ExhibitCaption>
          ) : null}
        </Zone>
      ) : null}

      {showWhyWatch ? (
        <Zone theme={theme} marginTop={26}>
          <View style={{ flexDirection: flowDirection(theme), gap: theme.spacing.lg }}>
            {strengths.length > 0 ? (
              <View style={{ flex: 1 }}>
                <ZoneLabel theme={theme} style={{ marginBottom: theme.spacing.sm }}>
                  {messages.whyLabel}
                </ZoneLabel>
                {strengths.map((item) => (
                  <EditorialBody key={item} theme={theme} style={{ marginBottom: theme.spacing.sm }}>
                    {item}
                  </EditorialBody>
                ))}
              </View>
            ) : null}
            {developmentAreas.length > 0 ? (
              <View style={{ flex: 1 }}>
                <ZoneLabel theme={theme} style={{ marginBottom: theme.spacing.sm }}>
                  {messages.watchLabel}
                </ZoneLabel>
                {developmentAreas.map((item) => (
                  <EditorialBody key={item} theme={theme} style={{ marginBottom: theme.spacing.sm }}>
                    {item}
                  </EditorialBody>
                ))}
              </View>
            ) : null}
          </View>
        </Zone>
      ) : null}

      {competencies.length > 0 ? (
        <Zone theme={theme} label={messages.competenciesLabel} marginTop={26}>
          {competencies.map((competency) => {
            const benchmark = findCompetencyBenchmark(competency.label, data.benchmarkComparison);
            return (
              <View
                key={competency.id ?? competency.label}
                style={{
                  flexDirection: flowDirection(theme),
                  alignItems: "center",
                  gap: theme.spacing.sm,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <Text style={{ width: "38%", color: EDITORIAL.ink, fontFamily: theme.fontFamily, fontSize: 9 }}>{competency.label}</Text>
                <RangeDotChart theme={theme} candidateScore={competency.score} benchmarkScore={benchmark?.benchmarkScore} maxScore={competency.maxScore} />
                <Text style={{ width: 22, textAlign: "right", color: EDITORIAL.ink, fontFamily: theme.fontFamily, fontSize: 9, fontWeight: 700 }}>
                  {Math.round(competency.score)}
                </Text>
              </View>
            );
          })}
          {competencyExhibitIndex !== undefined ? (
            <ExhibitCaption theme={theme} index={competencyExhibitIndex} exhibitWord={messages.exhibit}>
              {enabled.benchmarkComparison ? messages.competencyBenchmarkCaption : messages.competencyEvidenceCaption}
            </ExhibitCaption>
          ) : null}
        </Zone>
      ) : null}

      <CenteredFooter theme={theme} reportId={data.meta?.id} confidentialityLabel={data.meta?.confidentialityLabel ?? messages.confidential} />
    </Page>
  );
}
