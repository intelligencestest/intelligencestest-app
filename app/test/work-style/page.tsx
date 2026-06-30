"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { WS_QUESTIONS, WS_DURATION_SECONDS, WS_DIMENSIONS, scoreWS } from "@/lib/questions/work-style";

const dimensionClassNames = WS_DIMENSIONS.reduce<Record<string, string>>((acc, d) => {
  acc[d.label] = d.className;
  return acc;
}, {});

const questions: RunnerQuestion[] = WS_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "likert",
  groupLabel: q.dimension,
  groupClassName: dimensionClassNames[q.dimension],
}));

export default function WorkStyleTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Work Style Assessment"
      shortName="Work Style"
      categoryLabel="Behavioural"
      categoryClassName="border-rose-500/20 bg-rose-500/10 text-rose-300"
      accentColor="#e11d48"
      durationSeconds={WS_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Likert Scale"
      details={[
        { label: "Questions", value: "40" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Likert Scale" },
      ]}
      dimensionSummary={WS_DIMENSIONS}
      instructions={[
        "Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).",
        "Answer based on your typical work behaviour, not your ideal behaviour.",
        "Your results are not shown after completion; they are reviewed by the hiring team.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Saving your work style profile..."
      scoreAnswers={(answers) => {
        const scored = scoreWS(answers);
        return {
          score: scored.percentage,
          rawAnswers: {
            answers,
            total: scored.total,
            percentage: scored.percentage,
            dimensions: scored.dimensions,
            strongestDimension: scored.strongestDimension,
          },
        };
      }}
    />
  );
}
