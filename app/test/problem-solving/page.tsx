"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { PS_QUESTIONS, PS_DURATION_SECONDS, scorePS } from "@/lib/questions/problem-solving";

const questions: RunnerQuestion[] = PS_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function ProblemSolvingTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Problem Solving Test"
      shortName="Problem Solving"
      categoryLabel="Judgment"
      categoryClassName="border-teal-500/20 bg-teal-500/10 text-teal-300"
      accentColor="#0d9488"
      durationSeconds={PS_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "25 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each workplace scenario and choose the most effective response.",
        "Select the option that demonstrates the best judgment and approach.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your problem solving test..."
      scoreAnswers={(answers) => {
        const scored = scorePS(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
