import { Page as ReactPdfPage, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PdfTheme } from "../../core/types";
import { A4_SIZE } from "../../core/layout";

interface PdfReportPageProps {
  children: ReactNode;
  theme: PdfTheme;
  header?: ReactNode;
  footer?: ReactNode;
}

export function PdfReportPage({ children, theme, header, footer }: PdfReportPageProps) {
  return (
    <ReactPdfPage
      size={A4_SIZE}
      wrap
      style={{
        backgroundColor: theme.page.background,
        color: theme.page.foreground,
        fontFamily: theme.fontFamily,
        paddingBottom: theme.spacing.pageBottom,
        paddingHorizontal: theme.spacing.pageX,
        paddingTop: theme.spacing.pageTop,
      }}
    >
      {header}
      <View>{children}</View>
      {footer}
    </ReactPdfPage>
  );
}
