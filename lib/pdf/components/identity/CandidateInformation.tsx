import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { CandidateInfo, PdfTheme } from "../../core/types";
import { formatDate, flowDirection } from "../../core/layout";
import { Section } from "../primitives/Section";

interface CandidateInformationProps {
  candidate: CandidateInfo;
  theme: PdfTheme;
  messages: PdfMessages;
  locale?: string;
}

function Field({ label, value, theme }: { label: string; value?: string; theme: PdfTheme }) {
  if (!value) return null;
  return (
    <View style={{ marginBottom: 8, width: "48%" }}>
      <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 7.5, fontWeight: 700, textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 10, marginTop: 3 }}>{value}</Text>
    </View>
  );
}

export function CandidateInformation({ candidate, theme, messages, locale = "es" }: CandidateInformationProps) {
  return (
    <Section theme={theme} title={messages.candidate} wrap={false}>
      <View style={{ flexDirection: flowDirection(theme), flexWrap: "wrap", justifyContent: "space-between" }}>
        <Field label={messages.candidate} value={candidate.name} theme={theme} />
        <Field label={messages.email} value={candidate.email} theme={theme} />
        <Field label={messages.role} value={candidate.role} theme={theme} />
        <Field label={messages.completed} value={formatDate(candidate.completedAt, locale)} theme={theme} />
      </View>
    </Section>
  );
}
