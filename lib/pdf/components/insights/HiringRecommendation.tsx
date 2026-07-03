import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { HiringRecommendationContent, PdfTheme } from "../../core/types";
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
  const background = theme.mode === "dark" ? "#0B1220" : "#F8FAFC";
  return (
    <Section theme={theme} title={messages.hiringRecommendation} style={{ borderBottomWidth: 0, marginBottom: 16, paddingBottom: 0 }} wrap={false}>
      <View
        style={{
          backgroundColor: background,
          borderColor: theme.mode === "dark" ? "#1E293B" : "#E2E8F0",
          borderLeftColor: color,
          borderLeftWidth: 5,
          borderRadius: 3,
          borderWidth: 0.8,
          paddingHorizontal: 18,
          paddingVertical: 16,
        }}
      >
        <Text style={{ color, fontFamily: theme.fontFamily, fontSize: 7.2, fontWeight: 700, letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" }}>
          {messages.hiringRecommendation}
        </Text>
        <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 15, fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
          {recommendation.title}
        </Text>
        <BodyText theme={theme} style={{ color: theme.page.muted, fontSize: 9.7, lineHeight: 1.5 }}>{recommendation.rationale}</BodyText>
      </View>
      {recommendation.nextSteps?.length ? (
        <View style={{ marginTop: 12 }}>
          {recommendation.nextSteps.map((step, index) => (
            <Text key={step} style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 8.8, lineHeight: 1.45, marginBottom: 5 }}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      ) : null}
    </Section>
  );
}
