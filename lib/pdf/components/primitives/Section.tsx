import { View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import type { PdfTheme } from "../../core/types";
import { Heading, Subheading } from "./Text";

interface SectionProps {
  children: ReactNode;
  theme: PdfTheme;
  title?: string;
  eyebrow?: string;
  breakBefore?: boolean;
  wrap?: boolean;
  minPresenceAhead?: number;
  style?: Style | Style[];
}

function mergeStyle(base: Style, style?: Style | Style[]): Style | Style[] {
  if (!style) return base;
  return Array.isArray(style) ? [base, ...style] : [base, style];
}

export function Section({
  children,
  theme,
  title,
  eyebrow,
  breakBefore = false,
  wrap = true,
  minPresenceAhead = 72,
  style,
}: SectionProps) {
  return (
    <View
      break={breakBefore}
      minPresenceAhead={minPresenceAhead}
      wrap={wrap}
      style={mergeStyle(
        {
          backgroundColor: "transparent",
          borderBottomColor: theme.border.default,
          borderBottomWidth: 1,
          marginBottom: 15,
          paddingBottom: 12,
        },
        style,
      )}
    >
      {eyebrow ? <Subheading theme={theme} style={{ marginBottom: 5 }}>{eyebrow}</Subheading> : null}
      {title ? <Heading theme={theme} style={{ marginBottom: 10 }}>{title}</Heading> : null}
      {children}
    </View>
  );
}
