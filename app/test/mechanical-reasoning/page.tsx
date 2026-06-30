"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { MR_QUESTIONS, MR_DURATION_SECONDS, scoreMR } from "@/lib/questions/mechanical-reasoning";

const questions: RunnerQuestion[] = MR_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function MechanicalReasoningTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Mechanical Reasoning Test"
      shortName="Mechanical Reasoning"
      categoryLabel="Technical"
      categoryClassName="border-orange-500/20 bg-orange-500/10 text-orange-300"
      accentColor="#ea580c"
      durationSeconds={MR_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Multiple Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "25 min" },
        { label: "Question Type", value: "Multiple Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Answer questions on gears, levers, forces, circuits, and physical principles.",
        "Use scratch paper for calculations if needed.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your mechanical reasoning test..."
      scoreAnswers={(answers) => {
        const scored = scoreMR(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
