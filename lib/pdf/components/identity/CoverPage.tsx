import { Image, Page, Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { CompanyInfo, CandidateInfo, PdfTheme, ReportMeta } from "../../core/types";
import { A4_SIZE, formatDate, textStart } from "../../core/layout";

interface CoverPageProps {
  theme: PdfTheme;
  messages: PdfMessages;
  candidate: CandidateInfo;
  company: CompanyInfo;
  meta?: ReportMeta;
}

export function CoverPage({ theme, messages, candidate, company, meta }: CoverPageProps) {
  const logoUrl = company.logoUrl ?? theme.coverLogoUrl ?? theme.logoUrl;
  const navy = theme.mode === "dark" ? "#050816" : "#0F172A";
  const gold = "#CA8A04";
  const coverBackground = theme.mode === "dark" ? "#07080F" : "#F8FAFC";
  const sheetBackground = theme.mode === "dark" ? "#0D1020" : "#FFFFFF";
  const generated = formatDate(meta?.generatedAt ?? new Date().toISOString());
  const metadata = [
    { label: messages.candidate, value: candidate.name },
    { label: messages.role, value: candidate.role },
    { label: messages.company, value: company.name },
    { label: messages.email, value: candidate.email },
    { label: messages.recruiter, value: company.recruiterName },
    { label: messages.generated, value: generated },
  ].filter((item) => item.value);

  return (
    <Page
      size={A4_SIZE}
      style={{
        backgroundColor: coverBackground,
        color: theme.page.foreground,
        fontFamily: theme.fontFamily,
        padding: 0,
      }}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View
          style={{
            backgroundColor: navy,
            justifyContent: "space-between",
            paddingHorizontal: 34,
            paddingVertical: 42,
            width: 178,
          }}
        >
          <View>
            {logoUrl ? <Image src={logoUrl} style={{ height: 34, objectFit: "contain", width: 112 }} /> : null}
            {!logoUrl ? (
              <Text style={{ color: "#FFFFFF", fontFamily: theme.fontFamily, fontSize: 11, fontWeight: 700 }}>
                {theme.brandName}
              </Text>
            ) : null}
            <View style={{ backgroundColor: gold, height: 3, marginTop: 28, width: 46 }} />
          </View>

          <View>
            <Text style={{ color: "#CBD5E1", fontFamily: theme.fontFamily, fontSize: 7, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {meta?.confidentialityLabel ?? messages.confidential}
            </Text>
            {meta?.id ? (
              <Text style={{ color: "#94A3B8", fontFamily: theme.fontFamily, fontSize: 7, marginTop: 7 }}>
                ID {meta.id}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: "space-between", paddingHorizontal: 44, paddingVertical: 48 }}>
          <View>
            <Text style={{ color: gold, fontFamily: theme.fontFamily, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" }}>
              {theme.brandName}
            </Text>
            <Text
              style={{
                color: theme.page.foreground,
                fontFamily: theme.fontFamily,
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1.05,
                marginTop: 28,
                maxWidth: 330,
                textAlign: textStart(theme),
              }}
            >
              {meta?.title ?? messages.coverTitle}
            </Text>
            <Text
              style={{
                color: theme.page.muted,
                fontFamily: theme.fontFamily,
                fontSize: 11,
                lineHeight: 1.45,
                marginTop: 16,
                maxWidth: 320,
                textAlign: textStart(theme),
              }}
            >
              {meta?.subtitle ?? messages.coverSubtitle}
            </Text>
          </View>

          <View>
            <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {messages.candidate}
            </Text>
            <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 27, fontWeight: 700, lineHeight: 1.1, marginTop: 8 }}>
              {candidate.name}
            </Text>
            {candidate.role ? (
              <Text style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 10.5, marginTop: 6 }}>{candidate.role}</Text>
            ) : null}

            <View
              style={{
                backgroundColor: sheetBackground,
                borderColor: theme.border.default,
                borderRadius: 2,
                borderWidth: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 28,
                paddingHorizontal: 18,
                paddingTop: 14,
              }}
            >
              {metadata.map((item) => (
                <View key={item.label} style={{ marginBottom: 14, paddingRight: 12, width: "50%" }}>
                  <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 6.8, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
                    {item.label}
                  </Text>
                  <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 9, lineHeight: 1.3, marginTop: 4 }}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
}
