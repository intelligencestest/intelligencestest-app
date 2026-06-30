"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { AD_QUESTIONS, AD_DURATION_SECONDS, scoreAD } from "@/lib/questions/attention-detail";

const questions: RunnerQuestion[] = AD_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function AttentionDetailTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Attention to Detail Test"
      shortName="Attention to Detail"
      categoryLabel="Cognitive"
      categoryClassName="border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
      accentColor="#eab308"
      durationSeconds={AD_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Error Detection"
      details={[
        { label: "Questions", value: "40" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Error Detection" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each question carefully — small differences matter.",
        "Look for spelling errors, data inconsistencies, and mismatched references.",
        "Choose the most accurate answer from the four options.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your attention to detail test..."
      scoreAnswers={(answers) => {
        const scored = scoreAD(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
