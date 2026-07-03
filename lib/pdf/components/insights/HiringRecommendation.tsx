import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { HiringRecommendationContent, PdfTheme } from "../../core/types";
import { Badge } from "../primitives/Badge";
import { BodyText } from "../primitives/Text";
import { Section } from "../primitives/Section";

interface HiringRecommendationProps {
  recommendation: HiringRecommendationContent;
  theme: PdfTheme;
  messages: PdfMessages;
}

function colorForLevel(theme: PdfTheme, level: HiringRecommendationContent["level"]) {
  if (level === "strong" || level === "proceed") return theme.score.high;
  if (level === "review" || level === "caution") return theme.score.medium;
  return theme.score.low;
}

export function HiringRecommendation({ recommendation, theme, messages }: HiringRecommendationProps) {
  const color = colorForLevel(theme, recommendation.level);
  return (
    <Section theme={theme} title={messages.hiringRecommendation}>
      <View style={{ marginBottom: 8 }}>
        <Badge theme={theme} color={color}>{recommendation.title}</Badge>
      </View>
      <BodyText theme={theme}>{recommendation.rationale}</BodyText>
      {recommendation.nextSteps?.length ? (
        <View style={{ marginTop: 10 }}>
          {recommendation.nextSteps.map((step) => (
            <Text key={step} style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 9.5, lineHeight: 1.35, marginBottom: 5 }}>
              - {step}
            </Text>
          ))}
        </View>
      ) : null}
    </Section>
  );
}
