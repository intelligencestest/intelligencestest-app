import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { PdfTheme, ScoreTone } from "../../core/types";
import { clampScore, scorePercent } from "../../core/layout";
import { scoreColor, scoreTone } from "../../core/theme";
import { Section } from "../primitives/Section";

interface OverallScoreCardProps {
  score: number;
  maxScore?: number;
  label?: string;
  theme: PdfTheme;
  messages: PdfMessages;
}

export function OverallScoreCard({ score, maxScore = 100, label, theme, messages }: OverallScoreCardProps) {
  const tone: ScoreTone = scoreTone(scorePercent(score, maxScore));
  const color = scoreColor(theme, tone);
  const width = `${scorePercent(score, maxScore)}%`;
  const heroBackground = theme.mode === "dark" ? "#0B1220" : "#0F172A";
  const mutedText = theme.mode === "dark" ? "#CBD5E1" : "#CBD5E1";

  return (
    <Section theme={theme} title={label ?? messages.overallScore} wrap={false} style={{ borderBottomWidth: 0, marginBottom: 18, paddingBottom: 0 }}>
      <View
        style={{
          backgroundColor: heroBackground,
          borderRadius: 3,
          flexDirection: "row",
          minHeight: 126,
          overflow: "hidden",
        }}
      >
        <View style={{ backgroundColor: color, width: 5 }} />
        <View style={{ flex: 1, justifyContent: "space-between", paddingHorizontal: 22, paddingVertical: 20 }}>
          <View>
            <Text style={{ color: "#F8FAFC", fontFamily: theme.fontFamily, fontSize: 8, fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase" }}>
              {messages.score}
            </Text>
            <Text style={{ color: mutedText, fontFamily: theme.fontFamily, fontSize: 9.5, lineHeight: 1.4, marginTop: 8, maxWidth: 270 }}>
              {label ?? messages.overallScore}
            </Text>
          </View>
          <View style={{ backgroundColor: "#334155", borderRadius: 999, height: 5, overflow: "hidden", width: "100%" }}>
            <View style={{ backgroundColor: color, borderRadius: 999, height: 5, width }} />
          </View>
        </View>
        <View style={{ alignItems: "flex-end", justifyContent: "center", paddingRight: 24, width: 150 }}>
          <Text style={{ color: "#FFFFFF", fontFamily: theme.fontFamily, fontSize: 54, fontWeight: 700, lineHeight: 1 }}>
            {Math.round(clampScore(score, maxScore))}
          </Text>
          <Text style={{ color: mutedText, fontFamily: theme.fontFamily, fontSize: 10, marginTop: 4 }}>/ {maxScore}</Text>
        </View>
      </View>
    </Section>
  );
}
