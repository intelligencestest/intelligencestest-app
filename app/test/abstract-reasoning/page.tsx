"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { AR_QUESTIONS, AR_DURATION_SECONDS, scoreAR } from "@/lib/questions/abstract-reasoning";

const questions: RunnerQuestion[] = AR_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function AbstractReasoningTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Abstract Reasoning Test"
      shortName="Abstract Reasoning"
      categoryLabel="Cognitive"
      categoryClassName="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
      accentColor="#4f46e5"
      durationSeconds={AR_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Pattern Recognition"
      details={[
        { label: "Questions", value: "25" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Pattern Recognition" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Identify patterns, sequences, and relationships in each question.",
        "Select the option that best completes or continues each pattern.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your abstract reasoning test..."
      scoreAnswers={(answers) => {
        const scored = scoreAR(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
