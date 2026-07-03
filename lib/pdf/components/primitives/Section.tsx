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
          backgroundColor: theme.surface.card,
          borderColor: theme.border.default,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          marginBottom: theme.spacing.md,
          padding: theme.spacing.md,
        },
        style,
      )}
    >
      {eyebrow ? <Subheading theme={theme} style={{ marginBottom: 4 }}>{eyebrow}</Subheading> : null}
      {title ? <Heading theme={theme} style={{ marginBottom: 10 }}>{title}</Heading> : null}
      {children}
    </View>
  );
}
