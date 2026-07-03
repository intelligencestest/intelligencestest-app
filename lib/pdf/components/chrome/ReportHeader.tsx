import { Image, Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { PdfTheme, ReportMeta } from "../../core/types";
import { flowDirection, textEnd } from "../../core/layout";

interface ReportHeaderProps {
  theme: PdfTheme;
  messages: PdfMessages;
  meta?: ReportMeta;
}

export function ReportHeader({ theme, messages, meta }: ReportHeaderProps) {
  return (
    <View
      fixed
      style={{
        alignItems: "center",
        borderBottomColor: theme.border.default,
        borderBottomWidth: 1,
        flexDirection: flowDirection(theme),
        justifyContent: "space-between",
        left: theme.spacing.pageX,
        paddingBottom: 10,
        position: "absolute",
        right: theme.spacing.pageX,
        top: 24,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: flowDirection(theme) }}>
        {theme.logoUrl ? <Image src={theme.logoUrl} style={{ height: 22, marginRight: 8, objectFit: "contain", width: 80 }} /> : null}
        <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 10, fontWeight: 700 }}>
          {theme.brandName}
        </Text>
      </View>
      <View>
        <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 8, textAlign: textEnd(theme) }}>
          {(meta?.confidentialityLabel ?? messages.confidential).toUpperCase()}
        </Text>
        {meta?.id ? (
          <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7, marginTop: 2, textAlign: textEnd(theme) }}>
            {meta.id}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
