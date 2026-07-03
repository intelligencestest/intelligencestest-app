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
    <Section theme={theme} title={messages.barChart} wrap={false} style={{ paddingBottom: 10 }}>
      {data.map((item) => {
        const width = `${scorePercent(item.value, item.maxValue ?? 100)}%`;
        return (
          <View key={item.label} style={{ marginBottom: 10 }}>
            <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: theme.page.foreground, flex: 1, fontFamily: theme.fontFamily, fontSize: 8.6, fontWeight: 700, lineHeight: 1.25, paddingRight: 8 }}>
                {item.label}
              </Text>
              <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7.5 }}>{Math.round(item.value)}</Text>
            </View>
            <View style={{ backgroundColor: theme.mode === "dark" ? "#1E293B" : "#E2E8F0", borderRadius: 999, height: 4, overflow: "hidden" }}>
              <View style={{ backgroundColor: item.color ?? theme.brand.primary, borderRadius: 999, height: 4, width }} />
            </View>
          </View>
        );
      })}
    </Section>
  );
}
