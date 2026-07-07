import { Text } from "@react-pdf/renderer";
import type { PdfTheme } from "../../core/types";

interface CenteredFooterProps {
  theme: PdfTheme;
  reportId?: string;
  confidentialityLabel: string;
}

/**
 * A single centered line — classification code, confidentiality, bare folio
 * number — modeled on a share certificate rather than a corporate slide's
 * split corners. No rule above it; the page's own bottom margin separates it.
 */
export function CenteredFooter({ theme, reportId, confidentialityLabel }: CenteredFooterProps) {
  const parts = [reportId, confidentialityLabel.toUpperCase()].filter(Boolean).join("   ·   ");

  return (
    <Text
      fixed
      render={({ pageNumber }) => `${parts}   ·   ${pageNumber}`}
      style={{
        position: "absolute",
        bottom: theme.spacing.pageBottom / 2,
        left: theme.spacing.pageX,
        right: theme.spacing.pageX,
        color: theme.page.subtle,
        fontFamily: theme.fontFamily,
        fontSize: 6.5,
        letterSpacing: 0.3,
        textAlign: "center",
      }}
    />
  );
}
