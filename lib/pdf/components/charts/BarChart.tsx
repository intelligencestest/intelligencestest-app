import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { ChartPoint, PdfTheme } from "../../core/types";
import { scorePercent } from "../../core/layout";
import { Section } from "../primitives/Section";

interface BarChartProps {
  data: ChartPoint[];
  theme: PdfTheme;
  messages: PdfMessages;
}

export function BarChart({ data, theme, messages }: BarChartProps) {
  return (
    <Section theme={theme} title={messages.barChart} wrap={false}>
      {data.map((item) => {
        const width = `${scorePercent(item.value, item.maxValue ?? 100)}%`;
        return (
          <View key={item.label} style={{ marginBottom: 9 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 9.5, fontWeight: 700 }}>{item.label}</Text>
              <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 9 }}>{Math.round(item.value)}</Text>
            </View>
            <View style={{ backgroundColor: theme.border.default, borderRadius: 999, height: 8, overflow: "hidden" }}>
              <View style={{ backgroundColor: item.color ?? theme.brand.primary, borderRadius: 999, height: 8, width }} />
            </View>
          </View>
        );
      })}
    </Section>
  );
}
