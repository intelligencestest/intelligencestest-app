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
      {items.map((item, index) => (
        <View key={item} style={{ flexDirection: "row", marginBottom: 8 }}>
          <Text style={{ color: theme.score.medium, fontFamily: theme.fontFamily, fontSize: 7.2, fontWeight: 700, marginRight: 9, marginTop: 2 }}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <Text style={{ color: theme.page.muted, flex: 1, fontFamily: theme.fontFamily, fontSize: 9.1, lineHeight: 1.45 }}>{item}</Text>
        </View>
      ))}
    </Section>
  );
}
