import { View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import type { PdfTheme } from "../../core/types";
import { CONTENT_COLUMN_GAP, LABEL_COLUMN_WIDTH, flowDirection } from "../../core/layout";
import { ZoneLabel } from "./EditorialType";

interface ZoneProps {
  theme: PdfTheme;
  label?: string;
  children: ReactNode;
  marginTop?: number;
  wrap?: boolean;
  style?: Style | Style[];
}

/**
 * The one grid idea, expressed on pages 2–3: a narrow label column beside one
 * wide content column. The label carries the zone's name so content never
 * needs its own on-page heading.
 */
export function Zone({ theme, label, children, marginTop, wrap = true, style }: ZoneProps) {
  return (
    <View
      minPresenceAhead={70}
      wrap={wrap}
      style={[
        {
          flexDirection: flowDirection(theme),
          gap: CONTENT_COLUMN_GAP,
          marginTop: marginTop ?? theme.spacing.xl,
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    >
      <View style={{ width: LABEL_COLUMN_WIDTH, paddingTop: 2 }}>{label ? <ZoneLabel theme={theme}>{label}</ZoneLabel> : null}</View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
