import { Text as PdfText } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import type { PdfTheme } from "../../core/types";
import { textStart } from "../../core/layout";

interface TextProps {
  children?: ReactNode;
  theme: PdfTheme;
  style?: Style | Style[];
}

function mergeStyle(base: Style, style?: Style | Style[]): Style | Style[] {
  if (!style) return base;
  return Array.isArray(style) ? [base, ...style] : [base, style];
}

export function Title({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.foreground,
          fontFamily: theme.fontFamily,
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.12,
          textAlign: textStart(theme),
        },
        style,
      )}
    >
      {children}
    </PdfText>
  );
}

export function Heading({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.foreground,
          fontFamily: theme.fontFamily,
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.2,
          textAlign: textStart(theme),
        },
        style,
      )}
    >
      {children}
    </PdfText>
  );
}

export function Subheading({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.muted,
          fontFamily: theme.fontFamily,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.8,
          lineHeight: 1.2,
          textAlign: textStart(theme),
          textTransform: "uppercase",
        },
        style,
      )}
    >
      {children}
    </PdfText>
  );
}

export function BodyText({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.muted,
          fontFamily: theme.fontFamily,
          fontSize: 10.5,
          lineHeight: 1.45,
          textAlign: textStart(theme),
        },
        style,
      )}
    >
      {children}
    </PdfText>
  );
}

export function SmallText({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.subtle,
          fontFamily: theme.fontFamily,
          fontSize: 8.5,
          lineHeight: 1.35,
          textAlign: textStart(theme),
        },
        style,
      )}
    >
      {children}
    </PdfText>
  );
}
