"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import {
  LEADERSHIP_DURATION_SECONDS,
  LEADERSHIP_QUESTIONS,
  LEADERSHIP_STYLES,
  scoreLeadership,
} from "@/lib/questions/leadership-styles";

const questions: RunnerQuestion[] = LEADERSHIP_QUESTIONS.map((question) => ({
  id: question.id,
  text: question.text,
  kind: "choice",
  options: question.options.map((option) => option.text),
}));

export default function LeadershipStylesTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Leadership Styles Test"
      shortName="Leadership Styles"
      categoryLabel="Leadership"
      categoryClassName="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      accentColor="#10b981"
      durationSeconds={LEADERSHIP_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Multiple Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "15 min" },
        { label: "Question Type", value: "Multiple Choice" },
      ]}
      dimensionSummary={LEADERSHIP_STYLES}
      autoAdvanceLikert={false}
      instructions={[
        "Choose the response that feels most natural to you in each situation.",
        "There are no right or wrong answers; each answer maps to a leadership style.",
        "Your dominant style is shown after completion and saved with the result.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Calculating your leadership style..."
      scoreAnswers={(answers) => {
        const scored = scoreLeadership(answers);
        return {
          score: scored.score,
          rawAnswers: {
            answers,
            dominant_style: scored.dominantStyle,
            style_counts: scored.counts,
            selections: scored.selections,
          },
          completionMetric: {
            label: "Dominant style",
            value: scored.dominantStyle,
            colorClassName: "text-emerald-300",
          },
        };
      }}
    />
  );
}
