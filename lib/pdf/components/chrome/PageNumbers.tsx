import { Text } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { PdfTheme } from "../../core/types";

interface PageNumbersProps {
  theme: PdfTheme;
  messages: PdfMessages;
}

export function PageNumbers({ theme, messages }: PageNumbersProps) {
  return (
    <Text
      fixed
      render={({ pageNumber, totalPages }) => `${messages.page} ${pageNumber} ${messages.of} ${totalPages}`}
      style={{
        bottom: 24,
        color: theme.page.subtle,
        fontFamily: theme.fontFamily,
        fontSize: 8,
        position: "absolute",
        right: theme.spacing.pageX,
      }}
    />
  );
}
