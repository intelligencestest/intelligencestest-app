import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { CompletedAssessmentResult, PdfTheme } from "../../core/types";
import { formatDate, scorePercent } from "../../core/layout";
import { scoreColor, scoreTone } from "../../core/theme";
import { Section } from "../primitives/Section";

interface CompletedAssessmentsProps {
  assessments: CompletedAssessmentResult[];
  theme: PdfTheme;
  messages: PdfMessages;
  locale?: string;
}

export function CompletedAssessments({ assessments, theme, messages, locale = "es" }: CompletedAssessmentsProps) {
  return (
    <Section theme={theme} title={messages.completedAssessments}>
      {assessments.map((assessment) => {
        const maxScore = assessment.maxScore ?? 100;
        const percent = scorePercent(assessment.score, maxScore);
        const color = scoreColor(theme, scoreTone(percent));
        return (
          <View
            key={assessment.id ?? assessment.name}
            style={{
              borderBottomColor: theme.border.default,
              borderBottomWidth: 0.7,
              marginBottom: 9,
              paddingBottom: 9,
            }}
          >
            <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 9.8, fontWeight: 700, lineHeight: 1.25 }}>
                  {assessment.name}
                </Text>
                <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7.4, marginTop: 3 }}>
                  {[assessment.category, formatDate(assessment.completedAt, locale)].filter(Boolean).join(" - ")}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", width: 56 }}>
                <Text style={{ color, fontFamily: theme.fontFamily, fontSize: 15, fontWeight: 700, lineHeight: 1 }}>
                  {Math.round(assessment.score)}
                </Text>
                <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.8, marginTop: 2 }}>/ {maxScore}</Text>
              </View>
            </View>
            <View style={{ backgroundColor: theme.mode === "dark" ? "#1E293B" : "#E2E8F0", borderRadius: 999, height: 3, marginTop: 7 }}>
              <View style={{ backgroundColor: color, borderRadius: 999, height: 3, width: `${percent}%` }} />
            </View>
          </View>
        );
      })}
    </Section>
  );
}
