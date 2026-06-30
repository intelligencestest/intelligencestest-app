"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import {
  SJT_DIMENSIONS,
  SJT_DURATION_SECONDS,
  SJT_QUESTIONS,
  scoreSJT,
} from "@/lib/questions/situational-judgment";

const dimensionClassNames = SJT_DIMENSIONS.reduce<Record<string, string>>((acc, dimension) => {
  acc[dimension.label] = dimension.className;
  return acc;
}, {});

const questions: RunnerQuestion[] = SJT_QUESTIONS.map((question) => ({
  id: question.id,
  text: question.text,
  kind: "choice",
  options: question.options.map((option) => option.text),
  groupLabel: question.dimension,
  groupClassName: dimensionClassNames[question.dimension],
}));

export default function SituationalJudgmentTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Situational Judgment Test"
      shortName="Situational Judgment"
      categoryLabel="Workplace Judgment"
      categoryClassName="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
      accentColor="#4f46e5"
      durationSeconds={SJT_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      dimensionSummary={SJT_DIMENSIONS}
      autoAdvanceLikert={false}
      instructions={[
        "Choose the response that shows the best workplace judgment in each scenario.",
        "Some options may be partially reasonable; select the strongest response overall.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your situational judgment test..."
      scoreAnswers={(answers) => {
        const scored = scoreSJT(answers);
        return {
          score: scored.percentage,
          rawAnswers: {
            answers,
            total: scored.total,
            max: scored.max,
            percentage: scored.percentage,
            dimensions: scored.dimensions,
            reviewed: scored.reviewed,
          },
        };
      }}
    />
  );
}
