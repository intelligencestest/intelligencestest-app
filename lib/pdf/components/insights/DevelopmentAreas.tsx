import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { PdfTheme } from "../../core/types";
import { Section } from "../primitives/Section";

interface DevelopmentAreasProps {
  items: string[];
  theme: PdfTheme;
  messages: PdfMessages;
}

export function DevelopmentAreas({ items, theme, messages }: DevelopmentAreasProps) {
  return (
    <Section theme={theme} title={messages.developmentAreas}>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: "row", marginBottom: 7 }}>
          <Text style={{ color: theme.score.medium, fontFamily: theme.fontFamily, fontSize: 10, marginRight: 7 }}>•</Text>
          <Text style={{ color: theme.page.muted, flex: 1, fontFamily: theme.fontFamily, fontSize: 10, lineHeight: 1.35 }}>{item}</Text>
        </View>
      ))}
    </Section>
  );
}
