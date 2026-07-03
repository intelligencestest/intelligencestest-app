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

  return (
    <Section theme={theme} title={label ?? messages.overallScore} wrap={false}>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 18 }}>
          <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 8, fontWeight: 700, textTransform: "uppercase" }}>
            {messages.score}
          </Text>
          <View style={{ backgroundColor: theme.border.default, borderRadius: 999, height: 10, marginTop: 8, overflow: "hidden" }}>
            <View style={{ backgroundColor: color, borderRadius: 999, height: 10, width }} />
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color, fontFamily: theme.fontFamily, fontSize: 32, fontWeight: 700 }}>{Math.round(clampScore(score, maxScore))}</Text>
          <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 9 }}>/ {maxScore}</Text>
        </View>
      </View>
    </Section>
  );
}
