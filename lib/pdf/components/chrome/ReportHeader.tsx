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
  const accent = theme.mode === "dark" ? "#CA8A04" : "#B45309";

  return (
    <View
      fixed
      style={{
        alignItems: "center",
        borderBottomColor: theme.mode === "dark" ? "#1E293B" : "#E2E8F0",
        borderBottomWidth: 0.7,
        flexDirection: flowDirection(theme),
        justifyContent: "space-between",
        left: theme.spacing.pageX,
        paddingBottom: 11,
        position: "absolute",
        right: theme.spacing.pageX,
        top: 24,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: flowDirection(theme) }}>
        {theme.logoUrl ? <Image src={theme.logoUrl} style={{ height: 20, marginRight: 9, objectFit: "contain", width: 78 }} /> : null}
        <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 9.5, fontWeight: 700 }}>
          {theme.brandName}
        </Text>
        <View style={{ backgroundColor: accent, height: 2, marginLeft: 10, width: 18 }} />
      </View>
      <View>
        <Text
          style={{
            color: theme.page.subtle,
            fontFamily: theme.fontFamily,
            fontSize: 6.8,
            fontWeight: 700,
            letterSpacing: 1.1,
            textAlign: textEnd(theme),
          }}
        >
          {(meta?.confidentialityLabel ?? messages.confidential).toUpperCase()}
        </Text>
        {meta?.id ? (
          <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.8, marginTop: 3, textAlign: textEnd(theme) }}>
            {meta.id}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
