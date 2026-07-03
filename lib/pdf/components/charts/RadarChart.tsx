import { Circle, Line, Polygon, Polyline, Svg, Text, View } from "@react-pdf/renderer";
import type { ChartPoint, PdfTheme } from "../../core/types";
import { scorePercent } from "../../core/layout";
import { Section } from "../primitives/Section";
import type { PdfMessages } from "../../core/i18n";

interface RadarChartProps {
  data: ChartPoint[];
  theme: PdfTheme;
  messages: PdfMessages;
}

export function RadarChart({ data, theme, messages }: RadarChartProps) {
  const size = 184;
  const center = size / 2;
  const radius = 62;
  const points = data.slice(0, 8);
  const polygon = points
    .map((point, index) => {
      const angle = (Math.PI * 2 * index) / points.length - Math.PI / 2;
      const pct = scorePercent(point.value, point.maxValue ?? 100) / 100;
      const x = center + Math.cos(angle) * radius * pct;
      const y = center + Math.sin(angle) * radius * pct;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Section theme={theme} title={messages.radarChart} wrap={false} style={{ paddingBottom: 10 }}>
      <View style={{ alignItems: "center", paddingTop: 2 }}>
        {points.length >= 3 ? (
          <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
            {[0.25, 0.5, 0.75, 1].map((level) => (
              <Circle key={level} cx={center} cy={center} r={radius * level} stroke={theme.mode === "dark" ? "#26304D" : "#D8E0EC"} strokeWidth={0.7} fill="none" />
            ))}
            {points.map((point, index) => {
              const angle = (Math.PI * 2 * index) / points.length - Math.PI / 2;
              const x = center + Math.cos(angle) * radius;
              const y = center + Math.sin(angle) * radius;
              return <Line key={point.label} x1={center} y1={center} x2={x} y2={y} stroke={theme.mode === "dark" ? "#26304D" : "#D8E0EC"} strokeWidth={0.7} />;
            })}
            <Polygon points={polygon} fill={`${theme.brand.primary}18`} stroke={theme.brand.primary} strokeWidth={1.6} />
            <Polyline points={polygon} fill="none" stroke={theme.brand.accent} strokeWidth={0.8} />
          </Svg>
        ) : (
          <View style={{ width: "100%" }}>
            {points.map((point) => (
              <View key={point.label} style={{ marginBottom: 8 }}>
                <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 8, marginBottom: 3 }}>{point.label}</Text>
                <View style={{ backgroundColor: theme.mode === "dark" ? "#1E293B" : "#E2E8F0", borderRadius: 999, height: 4 }}>
                  <View style={{ backgroundColor: point.color ?? theme.brand.primary, borderRadius: 999, height: 4, width: `${scorePercent(point.value, point.maxValue)}%` }} />
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
          {points.map((point) => (
            <Text key={point.label} style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.6, marginHorizontal: 4, marginTop: 2 }}>
              {point.label.slice(0, 18)}
            </Text>
          ))}
        </View>
      </View>
    </Section>
  );
}
