import { Text, View } from "@react-pdf/renderer";
import type { PdfMessages } from "../../core/i18n";
import type { InterviewQuestion, PdfTheme } from "../../core/types";
import { Section } from "../primitives/Section";

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
  theme: PdfTheme;
  messages: PdfMessages;
}

export function InterviewQuestions({ questions, theme, messages }: InterviewQuestionsProps) {
  return (
    <Section theme={theme} title={messages.interviewQuestions}>
      {questions.map((question, index) => (
        <View
          key={`${question.question}-${index}`}
          style={{
            borderBottomColor: theme.border.default,
            borderBottomWidth: index === questions.length - 1 ? 0 : 0.7,
            paddingBottom: 10,
            paddingTop: index === 0 ? 0 : 10,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: theme.brand.primary, fontFamily: theme.fontFamily, fontSize: 7.2, fontWeight: 700, marginRight: 9, marginTop: 2 }}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={{ color: theme.page.foreground, flex: 1, fontFamily: theme.fontFamily, fontSize: 9.8, fontWeight: 700, lineHeight: 1.35 }}>
              {question.question}
            </Text>
          </View>
          {question.reason ? (
            <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 8, lineHeight: 1.4, marginLeft: 22, marginTop: 5 }}>
              {question.reason}
            </Text>
          ) : null}
        </View>
      ))}
    </Section>
  );
}
