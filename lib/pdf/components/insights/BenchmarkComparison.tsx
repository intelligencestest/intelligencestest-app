import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { BenchmarkComparisonItem, PdfTheme } from "../../core/types";
import { scorePercent } from "../../core/layout";
import { Section } from "../primitives/Section";

interface BenchmarkComparisonProps {
  items: BenchmarkComparisonItem[];
  theme: PdfTheme;
  messages: PdfMessages;
}

export function BenchmarkComparison({ items, theme, messages }: BenchmarkComparisonProps) {
  return (
    <Section theme={theme} title={messages.benchmarkComparison}>
      {items.map((item) => (
        <View key={item.label} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 9.5, fontWeight: 700 }}>{item.label}</Text>
            <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 8.5 }}>
              {item.benchmarkScore === undefined ? messages.noBenchmark : `${Math.round(item.candidateScore)} / ${Math.round(item.benchmarkScore)}`}
            </Text>
          </View>
          <View style={{ backgroundColor: theme.border.default, borderRadius: 999, height: 7 }}>
            <View style={{ backgroundColor: theme.brand.primary, borderRadius: 999, height: 7, width: `${scorePercent(item.candidateScore)}%` }} />
          </View>
          {item.benchmarkScore !== undefined ? (
            <View style={{ backgroundColor: theme.score.medium, height: 11, marginLeft: `${scorePercent(item.benchmarkScore)}%`, marginTop: -9, width: 2 }} />
          ) : null}
          {item.note ? <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 8, marginTop: 5 }}>{item.note}</Text> : null}
        </View>
      ))}
    </Section>
  );
}
