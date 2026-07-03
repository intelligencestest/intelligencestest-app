import { Image, Page, Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { CompanyInfo, CandidateInfo, PdfTheme, ReportMeta } from "../../core/types";
import { A4_SIZE, formatDate, textStart } from "../../core/layout";
import { Badge } from "../primitives/Badge";

interface CoverPageProps {
  theme: PdfTheme;
  messages: PdfMessages;
  candidate: CandidateInfo;
  company: CompanyInfo;
  meta?: ReportMeta;
}

export function CoverPage({ theme, messages, candidate, company, meta }: CoverPageProps) {
  const logoUrl = company.logoUrl ?? theme.coverLogoUrl ?? theme.logoUrl;

  return (
    <Page
      size={A4_SIZE}
      style={{
        backgroundColor: theme.page.background,
        color: theme.page.foreground,
        fontFamily: theme.fontFamily,
        padding: 52,
      }}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
            {logoUrl ? <Image src={logoUrl} style={{ height: 34, objectFit: "contain", width: 130 }} /> : null}
            <Badge theme={theme}>{meta?.confidentialityLabel ?? messages.confidential}</Badge>
          </View>

          <View
            style={{
              backgroundColor: theme.brand.primary,
              borderRadius: theme.radius.lg,
              height: 6,
              marginTop: 44,
              width: 86,
            }}
          />

          <Text
            style={{
              color: theme.page.foreground,
              fontFamily: theme.fontFamily,
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1.08,
              marginTop: 26,
              maxWidth: 420,
              textAlign: textStart(theme),
            }}
          >
            {meta?.title ?? messages.coverTitle}
          </Text>

          <Text
            style={{
              color: theme.page.muted,
              fontFamily: theme.fontFamily,
              fontSize: 14,
              lineHeight: 1.35,
              marginTop: 14,
              maxWidth: 360,
              textAlign: textStart(theme),
            }}
          >
            {meta?.subtitle ?? messages.coverSubtitle}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.surface.card,
            borderColor: theme.border.default,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            padding: 22,
          }}
        >
          <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>
            {messages.candidate}
          </Text>
          <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 20, fontWeight: 700, marginTop: 6 }}>
            {candidate.name}
          </Text>
          {candidate.role ? (
            <Text style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 11, marginTop: 4 }}>{candidate.role}</Text>
          ) : null}
          <View style={{ borderTopColor: theme.border.default, borderTopWidth: 1, marginVertical: 16 }} />
          <Text style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 10 }}>{company.name}</Text>
          <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 9, marginTop: 4 }}>
            {messages.generated}: {formatDate(meta?.generatedAt ?? new Date().toISOString())}
          </Text>
        </View>
      </View>
    </Page>
  );
}
