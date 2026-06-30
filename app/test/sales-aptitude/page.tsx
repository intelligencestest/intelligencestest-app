"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { SA_QUESTIONS, SA_DURATION_SECONDS, scoreSA } from "@/lib/questions/sales-aptitude";

const questions: RunnerQuestion[] = SA_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function SalesAptitudeTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Sales Aptitude Test"
      shortName="Sales Aptitude"
      categoryLabel="Sales"
      categoryClassName="border-green-500/20 bg-green-500/10 text-green-300"
      accentColor="#16a34a"
      durationSeconds={SA_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "35" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each sales scenario and select the most effective response.",
        "Choose the answer that reflects best-practice sales judgment.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your sales aptitude test..."
      scoreAnswers={(answers) => {
        const scored = scoreSA(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
