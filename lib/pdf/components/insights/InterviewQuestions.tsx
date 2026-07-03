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
            borderBottomWidth: index === questions.length - 1 ? 0 : 1,
            paddingBottom: 9,
            paddingTop: index === 0 ? 0 : 9,
          }}
        >
          <Text style={{ color: theme.page.foreground, fontFamily: theme.fontFamily, fontSize: 10.5, fontWeight: 700, lineHeight: 1.35 }}>
            {index + 1}. {question.question}
          </Text>
          {question.reason ? (
            <Text style={{ color: theme.page.subtle, fontFamily: theme.fontFamily, fontSize: 8.5, lineHeight: 1.35, marginTop: 4 }}>
              {question.reason}
            </Text>
          ) : null}
        </View>
      ))}
    </Section>
  );
}
