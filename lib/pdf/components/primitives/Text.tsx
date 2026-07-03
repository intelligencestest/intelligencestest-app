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
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.06,
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
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: 0.1,
          lineHeight: 1.25,
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
          fontSize: 7.5,
          fontWeight: 700,
          letterSpacing: 1.2,
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
          fontSize: 9.7,
          lineHeight: 1.48,
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
          fontSize: 7.5,
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
