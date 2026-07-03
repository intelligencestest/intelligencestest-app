import { View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { ExecutiveSummaryContent, PdfTheme } from "../../core/types";
import { Badge } from "../primitives/Badge";
import { BodyText } from "../primitives/Text";
import { Section } from "../primitives/Section";

interface ExecutiveSummaryProps {
  summary: ExecutiveSummaryContent;
  theme: PdfTheme;
  messages: PdfMessages;
}

function confidenceLabel(messages: PdfMessages, confidence?: string) {
  if (confidence === "high") return messages.highConfidence;
  if (confidence === "low") return messages.lowConfidence;
  return messages.moderateConfidence;
}

export function ExecutiveSummary({ summary, theme, messages }: ExecutiveSummaryProps) {
  return (
    <Section theme={theme} title={messages.executiveSummary}>
      <View style={{ marginBottom: 8 }}>
        <Badge theme={theme}>{`${messages.confidence}: ${confidenceLabel(messages, summary.confidence)}`}</Badge>
      </View>
      <BodyText theme={theme} style={{ color: theme.page.foreground, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
        {summary.headline}
      </BodyText>
      <BodyText theme={theme}>{summary.summary}</BodyText>
      {summary.evidence?.map((item) => (
        <BodyText key={item} theme={theme} style={{ marginTop: 6 }}>
          - {item}
        </BodyText>
      ))}
    </Section>
  );
}
