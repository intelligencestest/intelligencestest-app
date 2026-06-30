"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { VR_QUESTIONS, VR_DURATION_SECONDS, scoreVR } from "@/lib/questions/verbal-reasoning";

const questions: RunnerQuestion[] = VR_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function VerbalReasoningTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Verbal Reasoning Test"
      shortName="Verbal Reasoning"
      categoryLabel="Cognitive"
      categoryClassName="border-violet-500/20 bg-violet-500/10 text-violet-300"
      accentColor="#7c3aed"
      durationSeconds={VR_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Multiple Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Multiple Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Answer questions on analogies, word relationships, and logical deductions.",
        "Read each question carefully before selecting your answer.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your verbal reasoning test..."
      scoreAnswers={(answers) => {
        const scored = scoreVR(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
