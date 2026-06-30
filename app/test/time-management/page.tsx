"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { TM_QUESTIONS, TM_DURATION_SECONDS, scoreTM } from "@/lib/questions/time-management";

const questions: RunnerQuestion[] = TM_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function TimeManagementTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Time Management Test"
      shortName="Time Management"
      categoryLabel="Productivity"
      categoryClassName="border-amber-500/20 bg-amber-500/10 text-amber-300"
      accentColor="#d97706"
      durationSeconds={TM_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each workplace scenario and select the most effective response.",
        "Choose the answer that reflects best-practice time and priority management.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your time management test..."
      scoreAnswers={(answers) => {
        const scored = scoreTM(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
