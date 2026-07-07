import { Text as PdfText } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import type { PdfTheme } from "../../core/types";
import { EDITORIAL } from "../../core/theme";
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

/**
 * The three sanctioned breaks from the type scale — candidate name, verdict
 * line, score numeral — all share this one serif treatment at different sizes.
 * No other element in the report uses the serif face.
 */
export function DisplaySerif({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.foreground,
          fontFamily: EDITORIAL.serifBold,
          fontSize: 22,
          lineHeight: 1.05,
          textAlign: textStart(theme),
        },
        style,
      )}
    >
      {children}
    </PdfText>
  );
}

/** Label-column caption — the only place small caps tracking appears. */
export function ZoneLabel({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.muted,
          fontFamily: theme.fontFamily,
          fontSize: 6.5,
          fontWeight: 700,
          letterSpacing: 0.6,
          lineHeight: 1.3,
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

/** Body copy — tightened this pass to 9 / 14. */
export function EditorialBody({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.muted,
          fontFamily: theme.fontFamily,
          fontSize: 9,
          lineHeight: 1.55,
          textAlign: textStart(theme),
        },
        style,
      )}
    >
      {children}
    </PdfText>
  );
}

interface ExhibitCaptionProps {
  theme: PdfTheme;
  index: number;
  children: ReactNode;
  exhibitWord: string;
  style?: Style | Style[];
}

/** McKinsey-style exhibit caption — "Exhibit N — description." beneath every chart/table. */
export function ExhibitCaption({ theme, index, children, exhibitWord, style }: ExhibitCaptionProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.subtle,
          fontFamily: theme.fontFamily,
          fontSize: 7,
          lineHeight: 1.5,
          marginTop: theme.spacing.sm,
          textAlign: textStart(theme),
        },
        style,
      )}
    >
      <PdfText style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 7, fontWeight: 700 }}>
        {exhibitWord} {index} —{" "}
      </PdfText>
      {children}
    </PdfText>
  );
}

/** Running header / centered footer micro-text — whisper-quiet wayfinding only. */
export function RunningText({ children, theme, style }: TextProps) {
  return (
    <PdfText
      style={mergeStyle(
        {
          color: theme.page.subtle,
          fontFamily: theme.fontFamily,
          fontSize: 6.5,
          fontWeight: 700,
          letterSpacing: 0.9,
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
