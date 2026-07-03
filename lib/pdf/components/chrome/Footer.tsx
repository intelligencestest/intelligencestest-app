import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { PdfTheme } from "../../core/types";
import { PageNumbers } from "./PageNumbers";

interface FooterProps {
  theme: PdfTheme;
  messages: PdfMessages;
}

export function Footer({ theme, messages }: FooterProps) {
  return (
    <>
      <View
        fixed
        style={{
          borderTopColor: theme.border.default,
          borderTopWidth: 1,
          bottom: 36,
          left: theme.spacing.pageX,
          position: "absolute",
          right: theme.spacing.pageX,
        }}
      />
      <Text
        fixed
        style={{
          bottom: 24,
          color: theme.page.subtle,
          fontFamily: theme.fontFamily,
          fontSize: 8,
          left: theme.spacing.pageX,
          position: "absolute",
        }}
      >
        {theme.brandName} - {messages.confidential}
      </Text>
      <PageNumbers theme={theme} messages={messages} />
    </>
  );
}
