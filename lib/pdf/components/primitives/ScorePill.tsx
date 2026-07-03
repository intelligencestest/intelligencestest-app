import { Text, View } from "@react-pdf/renderer";
import type { PdfTheme, ScoreTone } from "../../core/types";
import { scoreColor } from "../../core/theme";

interface ScorePillProps {
  score: number;
  maxScore?: number;
  theme: PdfTheme;
  tone?: ScoreTone;
}

export function ScorePill({ score, maxScore = 100, theme, tone = "neutral" }: ScorePillProps) {
  const color = scoreColor(theme, tone);

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: `${color}14`,
        borderColor: `${color}55`,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        minWidth: 54,
        paddingHorizontal: 8,
        paddingVertical: 6,
      }}
    >
      <Text style={{ color, fontFamily: theme.fontFamily, fontSize: 18, fontWeight: 700 }}>
        {Math.round(score)}
      </Text>
      <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7 }}>
        / {maxScore}
      </Text>
    </View>
  );
}
