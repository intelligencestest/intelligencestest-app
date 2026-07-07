import { View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { PdfTheme } from "../../core/types";
import { EDITORIAL } from "../../core/theme";

interface HairlineRuleProps {
  theme: PdfTheme;
  style?: Style | Style[];
}

/**
 * The rule budget for the whole report is two of these per interior page:
 * one under the running header, one closing the headline zone. Nothing else
 * in the system draws a border.
 */
export function HairlineRule({ theme, style }: HairlineRuleProps) {
  return (
    <View
      style={[
        { backgroundColor: EDITORIAL.ink, height: 0.75, opacity: 0.35 },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    />
  );
}
