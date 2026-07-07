import { Image, Page, Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { CompanyInfo, CandidateInfo, PdfTheme, ReportMeta } from "../../core/types";
import { EDITORIAL } from "../../core/theme";
import { A4_SIZE, formatDate, textStart } from "../../core/layout";
import { DisplaySerif } from "../primitives/EditorialType";

interface CoverPageProps {
  theme: PdfTheme;
  messages: PdfMessages;
  candidate: CandidateInfo;
  company: CompanyInfo;
  meta?: ReportMeta;
  locale?: string;
}

/**
 * One grid idea at its first scale: a full-bleed dark spine (identity,
 * confidentiality) beside a wide field where the candidate's name — not the
 * report title — is the headline. Brass appears exactly once here: the rule
 * beneath the wordmark, the cover's identity mark.
 */
export function CoverPage({ theme, messages, candidate, company, meta, locale = "es" }: CoverPageProps) {
  const logoUrl = company.logoUrl ?? theme.coverLogoUrl ?? theme.logoUrl;
  const generated = formatDate(meta?.generatedAt ?? new Date().toISOString(), locale);
  const metaLine = [company.name, company.recruiterName ? `${messages.recruiter}: ${company.recruiterName}` : undefined, generated]
    .filter(Boolean)
    .join("   ·   ");

  return (
    <Page
      size={A4_SIZE}
      style={{
        backgroundColor: EDITORIAL.paper,
        color: EDITORIAL.ink,
        fontFamily: theme.fontFamily,
        padding: 0,
      }}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View
          style={{
            backgroundColor: EDITORIAL.ink,
            justifyContent: "space-between",
            paddingHorizontal: 34,
            paddingVertical: 42,
            width: 178,
          }}
        >
          <View>
            {logoUrl ? (
              <Image src={logoUrl} style={{ height: 34, objectFit: "contain", width: 112 }} />
            ) : (
              <Text style={{ color: "#FFFFFF", fontFamily: theme.fontFamily, fontSize: 8.5, fontWeight: 700, letterSpacing: 1 }}>
                {theme.brandName.toUpperCase()}
              </Text>
            )}
            <View style={{ backgroundColor: EDITORIAL.brass, height: 2, marginTop: 14, width: 26 }} />
          </View>

          <View>
            <Text style={{ color: "#B9C0CC", fontFamily: theme.fontFamily, fontSize: 7, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase" }}>
              {meta?.confidentialityLabel ?? messages.confidential}
            </Text>
            {meta?.id ? (
              <Text style={{ color: "#7A8394", fontFamily: theme.fontFamily, fontSize: 7, marginTop: 5 }}>{meta.id}</Text>
            ) : null}
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: "space-between", paddingHorizontal: 44, paddingVertical: 48 }}>
          <View>
            <Text
              style={{
                color: theme.page.muted,
                fontFamily: theme.fontFamily,
                fontSize: 7,
                fontWeight: 700,
                letterSpacing: 1.3,
                textTransform: "uppercase",
              }}
            >
              {meta?.title ?? messages.coverTitle}
            </Text>
            <DisplaySerif theme={theme} style={{ fontSize: 46, lineHeight: 1.02, marginTop: 20, maxWidth: 340, textAlign: textStart(theme) }}>
              {candidate.name}
            </DisplaySerif>
            {candidate.role ? (
              <Text style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 10.5, marginTop: 10 }}>{candidate.role}</Text>
            ) : null}
          </View>

          <View>
            <View style={{ backgroundColor: EDITORIAL.line, height: 0.9, width: 34, marginBottom: 12 }} />
            {metaLine ? (
              <Text style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 8.5, lineHeight: 1.4 }}>{metaLine}</Text>
            ) : null}
            <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7.2, lineHeight: 1.5, marginTop: 10, maxWidth: 320 }}>
              {meta?.subtitle ?? messages.coverSubtitle}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}
