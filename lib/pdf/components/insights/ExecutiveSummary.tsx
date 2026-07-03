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
    <Section theme={theme} title={messages.executiveSummary} style={{ marginBottom: 18, paddingBottom: 16 }}>
      <View style={{ marginBottom: 10 }}>
        <Badge theme={theme}>{`${messages.confidence}: ${confidenceLabel(messages, summary.confidence)}`}</Badge>
      </View>
      <BodyText theme={theme} style={{ color: theme.page.foreground, fontSize: 15, fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
        {summary.headline}
      </BodyText>
      <BodyText theme={theme} style={{ color: theme.page.muted, fontSize: 10.2, lineHeight: 1.55, maxWidth: 470 }}>{summary.summary}</BodyText>
      {summary.evidence?.map((item) => (
        <View key={item} style={{ flexDirection: "row", marginTop: 7, paddingRight: 18 }}>
          <View style={{ backgroundColor: theme.brand.primary, height: 4, marginRight: 8, marginTop: 6, width: 4 }} />
          <BodyText theme={theme} style={{ color: theme.page.muted, flex: 1, fontSize: 9.2, lineHeight: 1.45 }}>
            {item}
          </BodyText>
        </View>
      ))}
    </Section>
  );
}
