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
        <View key={item.label} style={{ marginBottom: 11 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
            <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 9.2, fontWeight: 700 }}>{item.label}</Text>
            <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7.8 }}>
              {item.benchmarkScore === undefined ? messages.noBenchmark : `${Math.round(item.candidateScore)} / ${Math.round(item.benchmarkScore)}`}
            </Text>
          </View>
          <View style={{ backgroundColor: theme.mode === "dark" ? "#1E293B" : "#E2E8F0", borderRadius: 999, height: 4 }}>
            <View style={{ backgroundColor: theme.brand.primary, borderRadius: 999, height: 4, width: `${scorePercent(item.candidateScore)}%` }} />
          </View>
          {item.benchmarkScore !== undefined ? (
            <View style={{ backgroundColor: theme.score.medium, height: 10, marginLeft: `${scorePercent(item.benchmarkScore)}%`, marginTop: -7, width: 1.4 }} />
          ) : null}
          {item.note ? <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7.6, lineHeight: 1.35, marginTop: 5 }}>{item.note}</Text> : null}
          {item.source ? (
            <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.8, marginTop: 3 }}>
              {messages.benchmarkSource}: {item.source}
            </Text>
          ) : null}
        </View>
      ))}
    </Section>
  );
}
