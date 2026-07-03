import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { CompetencyScore, PdfTheme } from "../../core/types";
import { flowDirection, scorePercent } from "../../core/layout";
import { scoreColor, scoreTone } from "../../core/theme";
import { Section } from "../primitives/Section";

interface CompetencyScoreCardsProps {
  competencies: CompetencyScore[];
  theme: PdfTheme;
  messages: PdfMessages;
}

export function CompetencyScoreCards({ competencies, theme, messages }: CompetencyScoreCardsProps) {
  return (
    <Section theme={theme} title={messages.competencyScores}>
      <View style={{ flexDirection: flowDirection(theme), flexWrap: "wrap", justifyContent: "space-between" }}>
        {competencies.map((competency) => {
          const maxScore = competency.maxScore ?? 100;
          const tone = competency.tone ?? scoreTone(scorePercent(competency.score, maxScore));
          const color = scoreColor(theme, tone);
          const percent = scorePercent(competency.score, maxScore);
          return (
            <View
              key={competency.id ?? competency.label}
              style={{
                borderBottomColor: theme.border.default,
                borderBottomWidth: 0.7,
                marginBottom: 11,
                paddingBottom: 10,
                width: "48%",
              }}
            >
              <View style={{ alignItems: "flex-start", flexDirection: flowDirection(theme), justifyContent: "space-between" }}>
                <Text style={{ color: theme.page.foreground, flex: 1, fontFamily: theme.fontFamily, fontSize: 9.6, fontWeight: 700, lineHeight: 1.25, paddingRight: 8 }}>
                  {competency.label}
                </Text>
                <View style={{ alignItems: "flex-end", width: 42 }}>
                  <Text style={{ color, fontFamily: theme.fontFamily, fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{Math.round(competency.score)}</Text>
                  <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.5, marginTop: 2 }}>/ {maxScore}</Text>
                </View>
              </View>
              {competency.description ? (
                <Text style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 7.8, lineHeight: 1.45, marginTop: 6 }}>
                  {competency.description}
                </Text>
              ) : null}
              <View style={{ backgroundColor: theme.mode === "dark" ? "#1E293B" : "#E2E8F0", borderRadius: 999, height: 3, marginTop: 9 }}>
                <View style={{ backgroundColor: color, borderRadius: 999, height: 3, width: `${percent}%` }} />
              </View>
            </View>
          );
        })}
      </View>
    </Section>
  );
}
