import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { CompetencyScore, PdfTheme } from "../../core/types";
import { flowDirection, scorePercent } from "../../core/layout";
import { scoreColor, scoreTone } from "../../core/theme";
import { ScorePill } from "../primitives/ScorePill";
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
          return (
            <View
              key={competency.id ?? competency.label}
              style={{
                backgroundColor: theme.surface.cardMuted,
                borderColor: theme.border.default,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                marginBottom: 10,
                padding: 12,
                width: "48%",
              }}
            >
              <View style={{ alignItems: "center", flexDirection: flowDirection(theme), justifyContent: "space-between" }}>
                <Text style={{ color: theme.page.foreground, flex: 1, fontFamily: theme.fontFamily, fontSize: 10.5, fontWeight: 700, paddingRight: 8 }}>
                  {competency.label}
                </Text>
                <ScorePill score={competency.score} maxScore={maxScore} theme={theme} tone={tone} />
              </View>
              {competency.description ? (
                <Text style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 8.5, lineHeight: 1.35, marginTop: 8 }}>
                  {competency.description}
                </Text>
              ) : null}
              <View style={{ backgroundColor: theme.border.default, borderRadius: 999, height: 5, marginTop: 10 }}>
                <View style={{ backgroundColor: color, borderRadius: 999, height: 5, width: `${scorePercent(competency.score, maxScore)}%` }} />
              </View>
            </View>
          );
        })}
      </View>
    </Section>
  );
}
