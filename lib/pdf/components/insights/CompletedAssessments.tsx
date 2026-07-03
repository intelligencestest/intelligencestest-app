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
              borderBottomWidth: 1,
              marginBottom: 10,
              paddingBottom: 10,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 10.5, fontWeight: 700 }}>
                  {assessment.name}
                </Text>
                <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 8, marginTop: 2 }}>
                  {[assessment.category, formatDate(assessment.completedAt, locale)].filter(Boolean).join(" - ")}
                </Text>
              </View>
              <Text style={{ color, fontFamily: theme.fontFamily, fontSize: 14, fontWeight: 700 }}>
                {Math.round(assessment.score)}
              </Text>
            </View>
            <View style={{ backgroundColor: theme.border.default, borderRadius: 999, height: 5 }}>
              <View style={{ backgroundColor: color, borderRadius: 999, height: 5, width: `${percent}%` }} />
            </View>
          </View>
        );
      })}
    </Section>
  );
}
