import { View } from "@react-pdf/renderer";
import type { PdfTheme } from "../../core/types";
import { EDITORIAL } from "../../core/theme";
import { scorePercent } from "../../core/layout";

interface RangeDotChartProps {
  theme: PdfTheme;
  candidateScore: number;
  benchmarkScore?: number;
  maxScore?: number;
  width?: number;
}

/**
 * The single chart language used everywhere in the report: a thin scale line,
 * a hollow ring for the benchmark cohort, a solid brass dot for the candidate.
 * Learned once on the Hiring Decision page, read on autopilot everywhere else.
 * No radar chart, no bars, no progress meters — this is the only chart shape.
 */
export function RangeDotChart({ theme, candidateScore, benchmarkScore, maxScore = 100, width = 118 }: RangeDotChartProps) {
  const candidatePercent = scorePercent(candidateScore, maxScore);
  const benchmarkPercent = benchmarkScore === undefined ? undefined : scorePercent(benchmarkScore, maxScore);

  return (
    <View style={{ width, height: 10, position: "relative", justifyContent: "center" }}>
      <View style={{ backgroundColor: EDITORIAL.line, height: 0.9, width: "100%" }} />
      {benchmarkPercent !== undefined ? (
        <View
          style={{
            position: "absolute",
            top: 1.5,
            left: `${benchmarkPercent}%`,
            marginLeft: -3.5,
            width: 7,
            height: 7,
            borderRadius: 3.5,
            borderWidth: 1.1,
            borderColor: EDITORIAL.ink,
            backgroundColor: theme.page.background,
          }}
        />
      ) : null}
      <View
        style={{
          position: "absolute",
          top: 2,
          left: `${candidatePercent}%`,
          marginLeft: -3,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: EDITORIAL.brass,
        }}
      />
    </View>
  );
}
