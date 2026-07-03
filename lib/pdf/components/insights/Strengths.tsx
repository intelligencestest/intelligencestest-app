import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { PdfTheme } from "../../core/types";
import { Section } from "../primitives/Section";

interface StrengthsProps {
  items: string[];
  theme: PdfTheme;
  messages: PdfMessages;
}

export function Strengths({ items, theme, messages }: StrengthsProps) {
  return (
    <Section theme={theme} title={messages.strengths}>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: "row", marginBottom: 7 }}>
          <Text style={{ color: theme.score.high, fontFamily: theme.fontFamily, fontSize: 10, marginRight: 7 }}>•</Text>
          <Text style={{ color: theme.page.muted, flex: 1, fontFamily: theme.fontFamily, fontSize: 10, lineHeight: 1.35 }}>{item}</Text>
        </View>
      ))}
    </Section>
  );
}
