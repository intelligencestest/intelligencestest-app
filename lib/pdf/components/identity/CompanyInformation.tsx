import { Image, Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { CompanyInfo, PdfTheme } from "../../core/types";
import { flowDirection } from "../../core/layout";
import { Section } from "../primitives/Section";

interface CompanyInformationProps {
  company: CompanyInfo;
  theme: PdfTheme;
  messages: PdfMessages;
}

export function CompanyInformation({ company, theme, messages }: CompanyInformationProps) {
  return (
    <Section theme={theme} title={messages.company}>
      <View style={{ alignItems: "center", flexDirection: flowDirection(theme) }}>
        {company.logoUrl ? <Image src={company.logoUrl} style={{ height: 34, marginRight: 12, objectFit: "contain", width: 86 }} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 13, fontWeight: 700 }}>{company.name}</Text>
          {company.industry ? <Text style={{ color: theme.page.muted, fontFamily: theme.fontFamily, fontSize: 9, marginTop: 3 }}>{company.industry}</Text> : null}
          {company.recruiterName ? (
            <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 8.5, marginTop: 6 }}>
              {messages.recruiter}: {company.recruiterName}
              {company.recruiterEmail ? ` - ${company.recruiterEmail}` : ""}
            </Text>
          ) : null}
        </View>
      </View>
    </Section>
  );
}
